'use server';
/**
 * @fileOverview A Genkit flow to identify recent significant support levels from historical price data.
 *
 * - identifyHistoricalSupport - A function that handles the identification of support levels.
 * - IdentifyHistoricalSupportInput - The input type for the identifyHistoricalSupport function.
 * - IdentifyHistoricalSupportOutput - The return type for the identifyHistoricalSupport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Input schema for the identifyHistoricalSupport flow
const IdentifyHistoricalSupportInputSchema = z.object({
  historicalData: z.string().describe(
    "Historical candlestick data for a financial instrument, typically 1-hour timeframe, provided as a newline-separated string. Each line represents a candle and should contain 'time,open,high,low,close' data. Example: '2023-01-01 00:00:00,100,105,98,103\n2023-01-01 01:00:00,103,107,101,106'."
  ),
  symbol: z.string().describe("The trading pair symbol (e.g., 'BTCUSDT')."),
});
export type IdentifyHistoricalSupportInput = z.infer<
  typeof IdentifyHistoricalSupportInputSchema
>;

// Output schema for the identifyHistoricalSupport flow
const IdentifyHistoricalSupportOutputSchema = z.object({
  supportLevels: z
    .array(z.number().describe('A significant price level acting as support.'))
    .describe(
      'An array of recent, significant price levels identified as support based on the historical data.'
    ),
  analysis: z.string().describe('A brief explanation of the identified support levels.'),
});
export type IdentifyHistoricalSupportOutput = z.infer<
  typeof IdentifyHistoricalSupportOutputSchema
>;

// Wrapper function to call the Genkit flow
export async function identifyHistoricalSupport(
  input: IdentifyHistoricalSupportInput
): Promise<IdentifyHistoricalSupportOutput> {
  return identifyHistoricalSupportFlow(input);
}

// Define the prompt for the AI model
const identifyHistoricalSupportPrompt = ai.definePrompt({
  name: 'identifyHistoricalSupportPrompt',
  input: {schema: IdentifyHistoricalSupportInputSchema},
  output: {schema: IdentifyHistoricalSupportOutputSchema},
  prompt: `You are an expert technical analyst specializing in cryptocurrency trading.
Your task is to analyze the provided historical 1-hour candlestick data for the trading pair "{{{symbol}}}" and identify recent significant support levels.
Focus on identifying horizontal support levels where the price has bounced multiple times or found strong buying interest.
Only identify levels that are genuinely significant and have shown to hold.
Output the identified support levels as a JSON array of numbers, and provide a brief analysis of how these levels were determined.

Historical 1-hour Candlestick Data for {{{symbol}}}:
{{{historicalData}}}`,
});

// Define the Genkit flow
const identifyHistoricalSupportFlow = ai.defineFlow(
  {
    name: 'identifyHistoricalSupportFlow',
    inputSchema: IdentifyHistoricalSupportInputSchema,
    outputSchema: IdentifyHistoricalSupportOutputSchema,
  },
  async input => {
    const {output} = await identifyHistoricalSupportPrompt(input);
    return output!;
  }
);
