Avellaneda-Stoikov
- A market making framework that gives market makers a closed-form solution for optimal bid/ask quotes based on inventory risk and time horizon.
- The core idea is that instead of quoting symmetrically around the mid price, the MM adjusts quotes based on two factors:
  - Reservation price
    - This shifts the quote center away from mid based on inventory. If you're long (q > 0), your reservation price drops below mid - you want to sell, so you lower both quotes.
  - Optimal spread
    - The spread widens when volatility is high, risk aversion is high, and time remaining is large
- The model balances spread capture (earn money from uninformed flow) against inventory risk (holding a position that moves against you)