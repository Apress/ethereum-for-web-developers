# Errata for *Ethereum for Web Developers by Santiago Palladino (Apress, 2019).*

On **Location 1156 (Kindle) - Chapter 3. Section "External Accounts vs Smart Contracts"** 

[Missing **"no"** statement in signing feature for Smart Contracts]:
 
The phrase *"Smart contracts cannot initiate new transactions, so there is need for them to sign any operation."* should instead be *"Smart contracts cannot initiate new transactions, so there is **NO** need for them to sign any operation."*

***

On **Location 1450 (Kindle) - Chapter 3. "Section "Custom Modifiers"** 

[Wrong value used in **require** statement - OwnerDepositable contract]:
 
In the sample code provided for the **OwnerDepositable** contract, within the modifier `minDeposit` the required statement should be `require(msg.value > value);` instead of `require(msg.value > 0);`. The current code validates for deposits greater than zero but it is not using the **Minimum Deposit** parameter as specified in the code explanation.

***

On **page xx** [Summary of error]:
 
Details of error here. Highlight key pieces in **bold**.

***
