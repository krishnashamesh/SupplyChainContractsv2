# Supply Chain Contracts Simulation

#### **Video Demo:** https://youtu.be/iHsFoRAUwDE
#### **Description:**

Simulations are dynamic tools created through platforms to provide a scenario-based environment for students to solve real-world situations and problems collaboratively.

The proposed project intends to implement simulation models on various supply chain contracts.

Supply Chain Contracts are agreements between buyer and supplier on pricing and volume discounts, Minimum and maximum purchase quantities, Delivery lead times, product or material quality, and Product return policies.

Supply chain contracts include wholesale-price contracts, revenue sharing contracts, return contracts, two-part tariff contracts, service commitment contracts, quantity flexibility contracts, etc. (Cachon 2003; Tsay and Agrawal 2004).

As part of this project, I intend to simulate supply chain contract models for Long Term, Spot Price, and Options  contracts.

The goal of the project would be to:
- Create a teaching aid that helps model supply chain contracts via simulations
- Help visualize the theoretical concepts of contracts and demonstrate the effects of various contracts independently and as a combination of contracts.
- Simulate supply chain contract models for (individually and as a combination)
    - Long Term Contracts
    - Spot Price Contracts
    - Options Contracts
- Help the facilitator better engage with participants with simulation data to demonstrate the optimum solution and the solution provided by the participant.
- Login and register functionality is added for further extension of scope.

**Simulation Details:**

**Long Term Contract:** Profit or Loss in a Long Term Contract is a function of the wholesale price negotiated, retail price at which the goods are sold, salvage price at which the goods are salvaged, and the order quantity ordered.

**Spot Contract:** Profit or Loss in a Spot Contract is dependent on the spot price available in the market.

**Long Term with Spot Contract:** Profit or Loss in a Long Term with Spot Contract is a function of the wholesale price negotiated, retail price at which the goods are sold, salvage price at which the goods are salvaged, spot price, and the order quantity ordered.

**Options Contract:** Profit or Loss in an Options Contract is a function of the option price, option exercise price, order quantity ordered, and the retail price the goods are sold.

**Long Term with Options Contract:** Profit or Loss in a Long Term with Options Contract is a function of the option price, option exercise price, the wholesale price at which long term contract is signed, salvage price at which the goods are salvaged, retail price of the goods sold, order quantity of the long term contract and the number of the options brought at the beginning of the iteration.


**Details of the files:**
- app.py contains the logic around the simulation. numpy library is used to generate demand which is modeled around a normal distribution.
- simulation.js has the code for all the rendering and handling the xhr requests between backend and frontend.
- Sessions are maintained in the filesystem and can be moved to DB in subsequent releases.
- CanvasJS open-source library is used to render the charts. It is also shown by the watermarks in the charts rendered.
