import React, { useState } from 'react';
import './App.css';
import { ethers } from "ethers";
import OptimusFoxToken from "./contracts/OptimusFoxToken.json";
import { Button, Alert } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

// Needs to change to reflect current OptimusFoxToken address
const contractAddress ='0x4C0928bd90d517b3172A52710301C71270D8E63e';
let provider;
let signer;
let erc20;
let noProviderAbort = true;

// Ensures metamask or similar installed
if (typeof window.ethereum !== 'undefined' || (typeof window.web3 !== 'undefined')) {
	try{
		// Ethers.js set up, gets data from MetaMask and blockchain
		window.ethereum.enable().then(
			provider = new ethers.providers.Web3Provider(window.ethereum)
		);
		signer = provider.getSigner();
		erc20 = new ethers.Contract(contractAddress, OptimusFoxToken.abi, signer);
		noProviderAbort = false;
	} catch(e) {
		noProviderAbort = true;
	}
}

function App() {
	const [walAddress, setWalAddress] = useState('0x00');
	const [foxBal, setFoxBal] = useState(0);
	const [ethBal, setEthBal] = useState(0);
	const [coinSymbol, setCoinSymbol] = useState("Nil");
	const [transAmount, setTransAmount] = useState('0');
	const [pendingFrom, setPendingFrom] = useState('0x00');
	const [pendingTo, setPendingTo] = useState('0x00');
	const [pendingAmount, setPendingAmount] = useState('0');
	const [isPending, setIsPending] = useState(false);
	const [errMsg, setErrMsg] = useState("Transaction failed!");
	const [isError, setIsError] = useState(false);

	// Aborts app if metamask etc not present
	if (noProviderAbort) {
		return (
			<div>
			<h1>Error</h1>
			<p><a href="https://metamask.io">Metamask</a> or equivalent required to access this page.</p>
			</div>
		);
	}

	// Notification to user that transaction sent to blockchain
	const PendingAlert = () => {
		if (!isPending) return null;
		return (
			<Alert key="pending" variant="info" 
			style={{position: 'absolute', top: 0}}>
			Blockchain event notification: transaction of {pendingAmount} 
			&#x39e; from <br />
			{pendingFrom} <br /> to <br /> {pendingTo}.
			</Alert>
		);
	};

	// Notification to user of blockchain error
	const ErrorAlert = () => {
		if (!isError) return null;
		return (
			<Alert key="error" variant="danger" 
			style={{position: 'absolute', top: 0}}>
			{errMsg}
			</Alert>
		);
	};

	// Sets current balance of FOX for user
	signer.getAddress().then(response => {
		setWalAddress(response);
		return erc20.balanceOf(response);
	}).then(balance => {
		setFoxBal(balance.toString())
		
	});

	// Sets current balance of Eth for user
	signer.getAddress().then(response => {
		return provider.getBalance(response);
	}).then(balance => {
		let formattedBalance = ethers.utils.formatUnits(balance, 18);
		setEthBal(formattedBalance.toString())
	});

	// Sets symbol of ERC20 token (i.e. FOX)
	async function getSymbol() {
		let symbol = await erc20.symbol();
		return symbol;
	}
	let symbol = getSymbol();
	symbol.then(x => setCoinSymbol(x.toString()));

	// Interacts with smart contract to buy FOX
	async function buyFOX() {
		// Converts integer as Eth to Wei,
		let amount = await ethers.utils.parseEther(transAmount.toString());
		try {
			await erc20.buyToken(transAmount, {value: amount});
			// Listens for event on blockchain
			await erc20.on("FOXBuyEvent", (from, to, amount) => {
				setPendingFrom(from.toString());
				setPendingTo(to.toString());
				setPendingAmount(amount.toString());
				setIsPending(true);
			})
		} catch(err) {
			if(typeof err.data !== 'undefined') {
				setErrMsg("Error: "+ err.data.message);
			} 
			setIsError(true);
		} 	
	}

	// Interacts with smart contract to sell FOX
	async function sellFOX() {
		try {
			await erc20.sellToken(transAmount);
			// Listens for event on blockchain
			await erc20.on("FOXSellEvent", (from, to, amount) => {
				setPendingFrom(from.toString());
				setPendingTo(to.toString());
				setPendingAmount(amount.toString());
				setIsPending(true);
			})
		} catch(err) {
			if(typeof err.data !== 'undefined') {
				setErrMsg("Error: "+ err.data.message);
			} 
			setIsError(true);
		} 
	}

	// Sets state for value to be transacted
	// Clears extant alerts
	function valueChange(value) {
		setTransAmount(value);
		setIsPending(false);
		setIsError(false);
	}

	// Handles user buy form submit
	const handleBuySubmit = (e: React.FormEvent) => {
		e.preventDefault();
		valueChange(e.target.buyfox.value);
		buyFOX();
	};

	// Handles user sell form submit
	const handleSellSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		valueChange(e.target.sellfox.value);
		sellFOX();
	};

	return (
		<div className="App">
		<header className="App-header">

		<ErrorAlert />
		<PendingAlert />

		{/* <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Ethereum-icon-purple.svg/512px-Ethereum-icon-purple.svg.png" className="App-logo" alt="Ethereum logo" /> */}

		<h2>{coinSymbol}</h2>

		<p>
		User Wallet address: {walAddress}<br/>
		Eth held: {ethBal}<br />
		FOX held: {foxBal}<br />
		</p>

		<form onSubmit={handleBuySubmit}>
		<p>
		<label htmlFor="buyfox">Fox to buy:</label>
		<input type="number" step="1" min="0" id="buyfox" 
		name="buyfox" onChange={e => valueChange(e.target.value)} required 
		style={{margin:'12px'}}/>	
		<Button type="submit" >Buy FOX</Button>
		</p>
		</form>

		<form onSubmit={handleSellSubmit}>
		<p>
		<label htmlFor="sellfox">Fox to sell:</label>
		<input type="number" step="1" min="0" id="sellfox" 
		name="sellfox" onChange={e => valueChange(e.target.value)} required 
		style={{margin:'12px'}}/>	
		<Button type="submit" >Sell FOX</Button>
		</p>
		</form>

		{/* <a  title="GitR0n1n / CC BY-SA (https://creativecommons.org/licenses/by-sa/4.0)" href="https://commons.wikimedia.org/wiki/File:Ethereum-icon-purple.svg">
		<span style={{fontSize:'12px',color:'grey'}}>
		Ethereum logo by GitRon1n
		</span></a> */}
		</header>
		</div>
	);
}

export default App;
