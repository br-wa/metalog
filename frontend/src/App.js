import logo from './logo.svg';
import './App.css';
import Web3 from 'web3';
import React, { useState } from 'react';

const LT = "login:token";

let web3: Web3 | undefined = undefined;

const App = () => {
	const [isLogged, setLogged] = useState(localStorage.getItem(LT));
	const loginClick = async() => {
		if (!window.ethereum) {
			window.alert('MetaMask not found');
			return;
		}
	
		if (!web3) {
			try {
				await window.ethereum.enable();
				web3 = new Web3(window.ethereum);
			}
			catch {
				window.alert('Connect to MetaMask please (see extension)');
				return;
			}
		}

		const coinbase = await web3.eth.getCoinbase();
		if (!coinbase) {
			window.alert('MetaMask account not found');
			return;
		}

		const publicAddress = coinbase.toLowerCase();	
	
		try {
			const response = await fetch(`${process.env.REACT_APP_API_URL}/login`, {method: 'GET'});
			const data = await response.json();
			var server_time = data.server_time;
			var server_time_as_string = "logging_in_at_time_" + data.server_time.toString();
			console.log(server_time_as_string);
		}
		catch {
			window.alert('Could not contact server');
			return;
		}

		try {
			var signature = await web3.eth.personal.sign(
				server_time_as_string,
				publicAddress,
				''
			);
		}
		catch {
			window.alert('Sign the given message');
			return;
		}

		try {
			const post_body = JSON.stringify({
				'login_time': server_time,
				'address': publicAddress,
				'signature': signature,
			});
			const post_head = {
				'Content-Type': 'application/json',
			};
			const response = await fetch(`${process.env.REACT_APP_API_URL}/login`, {
				body: post_body,
				headers: post_head,
				method: 'POST',
			});
			const data = await response.json();
			var server_token = data.token;
		}
		catch {
			window.alert('Login failed');
			return;
		}
	
		var login_time_in_hex = ("00000000" + server_time.toString(16)).substr(-8);
		var entire_token = login_time_in_hex + publicAddress.substr(2) + signature.substr(2) + server_token;
		
		localStorage.setItem(LT, entire_token);
		setLogged(1);
	}

  	return (
    	<div className="App">
      		<header className="App-header">
        		<img src={logo} className="App-logo" alt="logo" />
        		<p>
	    			{`You are${isLogged?' ':' not '}logged in.`}
	  			</p>
				<button className="button" onClick={loginClick}>
	    			{`${isLogged?'Re-l':'L'}ogin with MetaMask`}
	  			</button>
      		</header>
    	</div>
  	);
}

export default App;
