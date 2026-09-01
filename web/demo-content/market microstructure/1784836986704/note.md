# Variables and Greeks

- S: The mid price at time t 
- δ: (Delta) The distance or "Offset "from the mid-price where the MM places their orders
- ψ (or w): The bid-ask spread. The difference between best bid and best offer
- q: Inventory position. q > 0 meanse long, q < 0 means short. Most MM models aim to keep q near zero
- λ (Lambda): The order arrival intesity. The frequency at which the MM's orders are hit or filled
- κ (Kappa): Order book liquidity/decay. Represents how quickly the probability of a fill drops as you move further away from the mid price.
- α (Alpha): Your short-term prediction of price directions
- σ (Sigma): Volatility. Used to determinee how wide the spread should be to compensate for risk
- γ (Gamma - Alternative Use): Often represents the Risk Aversion coeeficient of a trader
- ϕ (Phi): Often used for the inventory risk penalty in a cost function