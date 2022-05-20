import React, { useEffect } from 'react';
import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';

// Constants
const TWITTER_HANDLE = '_buildspace';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const App = () => {
	
	const checkIfWalletIsConnected = () => {
		// window.ethereum 은 메타마스크를 호출
		const { ethereum } = window;

		if (!ethereum) {
			console.log("메타마스크가 없어요")
			return;
		}

		console.log("메타마스크 ethereum object 에요", ethereum);
		return;
	}

	// 메타마스크가 연결되어 있지 않을 때 render 하는 container 에요
	const renderNotConnectedContainer = () => (
		<div className="connect-wallet-container">
		  <img src="https://media.giphy.com/media/3ohhwytHcusSCXXOUg/giphy.gif" alt="Ninja gif" />
		  <button className="cta-button connect-wallet-button">
			Connect Wallet
		  </button>
		</div>
		);
	
	  // useEffect 라서 페이지가 로딩될 때 아래 함수가 자동으로 실행되어요
	  useEffect(() => {
		checkIfWalletIsConnected();
	  }, [])

  return (
		<div className="App">
			<div className="container">

				<div className="header-container">
					<header>
            <div className="left">
              <p className="title">🐱‍👤 Ninja Name Service</p>
              <p className="subtitle">Your immortal API on the blockchain!</p>
            </div>
					</header>
				</div>

				{renderNotConnectedContainer()}

        <div className="footer-container">
					<img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
					<a
						className="footer-text"
						href={TWITTER_LINK}
						target="_blank"
						rel="noreferrer"
					>{`built with @${TWITTER_HANDLE}`}</a>
				</div>
			</div>
		</div>
	);
}

export default App;
