'use server';
/**
 * @fileOverview A Genkit flow for interactive trading advice using the latest Gemini engine.
 *
 * - tradingChat - Function to handle the chat interaction.
 * - TradingChatInput - Input schema including market context.
 * - TradingChatOutput - Output message from the AI.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const MarketSignalSchema = z.object({
  symbol: z.string(),
  entryPrice: z.number(),
  rsi: z.number(),
  adx: z.number(),
  status: z.string(),
  reason: z.string().optional(),
});

const TradingChatInputSchema = z.object({
  message: z.string().describe('The user message.'),
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
  })).optional(),
  activeBalance: z.number().describe('The user current capital.'),
  signals: z.array(MarketSignalSchema).describe('Current market data on screen.'),
  // Añadido al esquema para que la IA pueda leerlo sin errores de validación
  riskAmount: z.number().optional().describe('2% risk amount.'),
});
export type TradingChatInput = z.infer<typeof TradingChatInputSchema>;

const TradingChatOutputSchema = z.object({
  reply: z.string().describe('The AI response message.'),
});
export type TradingChatOutput = z.infer<typeof TradingChatOutputSchema>;

export async function tradingChat(input: TradingChatInput): Promise<TradingChatOutput> {
  return tradingChatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'tradingChatPrompt',
  input: { schema: TradingChatInputSchema },
  output: { schema: TradingChatOutputSchema },
  config: {
    temperature: 0.1,
  },
  prompt: `Actúa como un Trader Profesional de alta frecuencia utilizando el motor Gemini 3.0 (v2.0 Flash). Tu objetivo es encontrar el punto exacto de entrada usando el Protocolo Sniper.

CONTEXTO ACTUAL DEL TERMINAL:
- Capital Gestionado: \${{{activeBalance}}} USD
- Cantidad de Riesgo permitida (2%): \${{{riskAmount}}} USD
- Activos en Pantalla:
{{#each signals}}
  * {{{symbol}}}: Precio \${{{entryPrice}}}, RSI: {{{rsi}}}, ADX: {{{adx}}}, Estado: {{{status}}}
{{/each}}

REGLAS DE GESTIÓN (ESTRICTAS):
1. El Stop Loss SIEMPRE debe ser el 2% del capital.
2. Proporciona siempre el precio exacto de Stop Loss y Take Profit para el activo consultado basándote en los datos de pantalla.
3. Si los datos no son claros o el ADX es bajo, advierte: "Socio, el mercado está lateral, mejor esperar".

HISTORIAL DE CONVERSACIÓN:
{{#each history}}
- {{{role}}}: {{{content}}}
{{/each}}

Mensaje actual del usuario: {{{message}}}`,
});

const tradingChatFlow = ai.defineFlow(
  {
    name: 'tradingChatFlow',
    inputSchema: TradingChatInputSchema,
    outputSchema: TradingChatOutputSchema,
  },
  async (input) => {
    try {
      // Calculamos el riesgo aquí para pasarlo limpiamente al prompt
      const riskVal = parseFloat((input.activeBalance * 0.02).toFixed(2));
      
      const { output } = await prompt({
        ...input,
        riskAmount: riskVal,
        history: input.history || []
      });
      
      if (!output) {
        throw new Error('No output from AI');
      }
      
      return output;
    } catch (error) {
      console.error('Genkit Flow Error:', error);
      return {
        reply: "Socio, el enlace con el motor Gemini ha tenido un hipo. He reiniciado la conexión. Por favor, repite tu pregunta sobre XRP u otra moneda."
      };
    }
  }
);
