# OptimusFoxToken

### *install Node JS*

### *install Ganache GUI*

## Truffle is a development framework for Ethereum which allows you to deploy and test smart contracts quickly.
```
npm install -g truffle
truffle init
```
### As we will be using OpenZeppelin’s implementation of ERC20 we need to install with npm (initialising this first):
```
npm init -y
npm install @openzeppelin/contracts
```
### install other dependencies
```
cd client
npm install ethers react-bootstrap bootstrap
npm audit fix
```
### With everything built we are going to deploy the smart contract. At the terminal we change directory back to the one containing our contract and deploy
```
cd ..
truffle deploy

const contractAddress ='0xa8dC92bEeF9E5D20B21A5CC01bf8b6a5E0a51888';
```
Copy deployed contract address from cmd and paste in app.js in the client>src folder

### Approve the transacting account
``` truffle console ```
### Your prompt should now change to truffle(ganache)> or similar. Enter:
```
token = await OptimusFoxToken.deployed() 
```
### If successful this should return undefined. We can now increase the allowance:
```
token.increaseAllowance(accounts[1], 1000, {from: accounts[0]})
```
### This code should output a transaction log to the console. The command states that accounts[0] (e.g. the Ganache account at Index 0 - defined as the owner within the smart contract) authorises accounts[1] (e.g. Index 1) to hold up to 1000 tokens.

### Start React
Time to fire up React:

```
cd client
npm start
```
