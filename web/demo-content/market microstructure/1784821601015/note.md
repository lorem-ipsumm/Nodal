Toxic Flow
- Order flow the consistently trades against a market maker, causing *adverse selection* losses. It comes from informed traders who have an edge, better information, faster signals, or superior latency.
- These traders systematically pick off stale quotes
- This leads to market makers losing on every trade, even though they're capturing the spread
- Market makers defend against this by:
  - Widen spreads when toxicity is detected
  - Skew quotes based on inventory and flow signals
  - Use ML models to classify flow as informed vs uninformed in real-time
  - Reduce size or pull quotes during high-toxicity regimes
- Toxic flow is arguably the central problem in market making