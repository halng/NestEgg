import type { GlossaryTerm } from "./types"

export const GLOSSARY_TERMS: Record<string, GlossaryTerm> = {
  "P/E Ratio": {
    term: "P/E Ratio",
    definition:
      "Price-to-Earnings Ratio measures a company's current stock price relative to its earnings per share. A high P/E may indicate high growth expectations, while a low P/E could suggest undervaluation or declining earnings.",
    example: "If a stock trades at $100 and has EPS of $5, its P/E ratio is 20.",
    learnMoreUrl: "https://www.investopedia.com/terms/p/price-earningsratio.asp",
  },
  ROI: {
    term: "ROI",
    definition:
      "Return on Investment is a performance metric used to evaluate the efficiency of an investment. It measures the gain or loss generated relative to the amount invested.",
    example: "If you invest $1,000 and it grows to $1,200, your ROI is 20%.",
    learnMoreUrl: "https://www.investopedia.com/terms/r/returnoninvestment.asp",
  },
  "Market Cap": {
    term: "Market Cap",
    definition:
      "Market Capitalization is the total market value of a company's outstanding shares. It's calculated by multiplying the current stock price by the total number of shares outstanding.",
    example:
      "A company with 1 million shares at $50 each has a market cap of $50 million.",
    learnMoreUrl:
      "https://www.investopedia.com/terms/m/marketcapitalization.asp",
  },
  "Stop-Loss": {
    term: "Stop-Loss",
    definition:
      "A stop-loss order is designed to limit an investor's loss on a position. When the stock reaches the stop price, it triggers a market order to sell the shares.",
    example:
      "If you buy a stock at $100, you might set a stop-loss at $90 to limit your potential loss to 10%.",
    learnMoreUrl: "https://www.investopedia.com/terms/s/stop-lossorder.asp",
  },
  "Limit Order": {
    term: "Limit Order",
    definition:
      "A limit order is an instruction to buy or sell a stock at a specific price or better. Buy limit orders execute at the limit price or lower; sell limit orders execute at the limit price or higher.",
    example:
      "A buy limit order at $50 will only execute if the stock price drops to $50 or below.",
    learnMoreUrl: "https://www.investopedia.com/terms/l/limitorder.asp",
  },
  "Market Order": {
    term: "Market Order",
    definition:
      "A market order is an instruction to buy or sell a stock immediately at the best available current price. It guarantees execution but not price.",
    example:
      "If you place a market order to buy 100 shares, you'll get them at whatever the current asking price is.",
    learnMoreUrl: "https://www.investopedia.com/terms/m/marketorder.asp",
  },
  Volume: {
    term: "Volume",
    definition:
      "Volume is the number of shares or contracts traded in a security or market during a given period. High volume indicates high interest and liquidity.",
    example:
      "A stock that trades 1 million shares daily has higher volume than one trading 100,000 shares.",
    learnMoreUrl: "https://www.investopedia.com/terms/v/volume.asp",
  },
  Dividend: {
    term: "Dividend",
    definition:
      "A dividend is a distribution of a portion of a company's earnings to its shareholders. Companies may pay dividends in cash or additional stock.",
    example:
      "A company paying a $1 quarterly dividend means shareholders receive $4 per share annually.",
    learnMoreUrl: "https://www.investopedia.com/terms/d/dividend.asp",
  },
  Volatility: {
    term: "Volatility",
    definition:
      "Volatility measures how much a stock's price fluctuates over time. Higher volatility means larger price swings and typically higher risk.",
    example:
      "A stock moving between $90-$110 is more volatile than one moving between $98-$102.",
    learnMoreUrl: "https://www.investopedia.com/terms/v/volatility.asp",
  },
  Portfolio: {
    term: "Portfolio",
    definition:
      "A portfolio is a collection of financial investments like stocks, bonds, cash, and other assets held by an investor. Diversification across different assets reduces risk.",
    example:
      "An investor might hold 60% stocks, 30% bonds, and 10% cash in their portfolio.",
    learnMoreUrl: "https://www.investopedia.com/terms/p/portfolio.asp",
  },
  "Sharpe Ratio": {
    term: "Sharpe Ratio",
    definition:
      "The Sharpe Ratio measures risk-adjusted return by comparing excess return to volatility. A higher Sharpe Ratio indicates better risk-adjusted performance.",
    example:
      "A portfolio with Sharpe Ratio of 1.5 offers better risk-adjusted returns than one with 0.8.",
    learnMoreUrl: "https://www.investopedia.com/terms/s/sharperatio.asp",
  },
  Drawdown: {
    term: "Drawdown",
    definition:
      "Drawdown measures the peak-to-trough decline in portfolio value before a new peak is reached. It helps assess the downside risk of an investment.",
    example:
      "If your portfolio drops from $100,000 to $80,000, you've experienced a 20% drawdown.",
    learnMoreUrl: "https://www.investopedia.com/terms/d/drawdown.asp",
  },
}

export const GLOSSARY_TERM_LIST = Object.values(GLOSSARY_TERMS)

export function getGlossaryTerm(term: string): GlossaryTerm | undefined {
  return GLOSSARY_TERMS[term]
}

export function searchGlossaryTerms(query: string): GlossaryTerm[] {
  const lowerQuery = query.toLowerCase()
  return GLOSSARY_TERM_LIST.filter(
    (item) =>
      item.term.toLowerCase().includes(lowerQuery) ||
      item.definition.toLowerCase().includes(lowerQuery)
  )
}
