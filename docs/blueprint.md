# **App Name**: Binance Sniper Scanner

## Core Features:

- Data Acquisition: Fetch top 10 USDT volume coins data from Binance using the python-binance library.
- Multi-Timeframe Analysis: Analyze hourly (1h) trend using SMA (20 periods) and 15-minute (15m) RSI to identify potential entry points.
- Dynamic Risk Management: Calculate stop-loss (1.5-2% loss of total balance), take-profit (3-4%), and implement trailing profit (1%) logic based on user's balance input. Display stop-loss and take-profit to two decimal places.
- Trade Signal Generation: Generate and output trade signals, including coin symbol, entry price, stop-loss price, and take-profit price, based on the multi-timeframe analysis and risk management calculations.
- Support Level Detection (AI): Use a generative AI tool to identify recent significant support levels from historical price data on the 1H chart, helping to refine entry points.

## Style Guidelines:

- Primary color: Deep sky blue (#43c6db), echoing market dynamics and real-time changes.
- Background color: Off-white (#f5f5f5), ensuring readability and focus during critical market analysis.
- Accent color: Sea green (#2ec4b6) to highlight significant data points, aligning with market trend opportunities.
- Body and headline font: 'Inter', sans-serif, to provide clarity and immediacy, for presenting essential data for trades.
- Code font: 'Source Code Pro' for displaying the output of the scanner in the terminal.
- Minimalist icons representing trend direction and risk level.
- Clean, tabular layout for displaying coin symbols, prices, and risk metrics.