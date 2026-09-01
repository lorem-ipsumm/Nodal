Poisson is a process used to model the random arrival of events over time
- Market makers use poisson distributions to model the flow of buy and sell orders
- Because orders from independent participants hit exchanges at random intervals, they are best described by "point proccesses" rather than continuous flows
- The model helps market makers manage risk:
  - Order arrival: Estimating the frequency of hits to the bid or ask
  - Fill Probability: Calculating the likelihood that a limit order at a specific price distance will be executed
  - Intensity(λ): MMs model λ as a function of the distance from the mid-price. The further from mid, the lower λ is
  - Time-to-fill: Use of the Exponential Distribution to model the time between consecutive trades