import React, { useEffect, useState } from 'react'
import './styles/App.css'
import twitterLogo from './assets/twitter-logo.svg'
import { ethers } from 'ethers'
import { networks } from './utils/networks'
import contractAbi from './utils/Domains.json'
import polygonLogo from './assets/polygonlogo.png'
import ethLogo from './assets/ethlogo.png'

// Constants
const TWITTER_HANDLE = 'dsrvlabs'
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`
const tld = '.ninja'
const CONTRACT_ADDRESS = '0x58eA6DFf258248E5B7A6F48bB11c063FA1723DF5'

const App = () => {
  const [network, setNetwork] = useState('')
  const [currentAccount, setCurrentAccount] = useState('')
  const [domain, setDomain] = useState('')
  const [record, setRecord] = useState('')

  const connectWallet = async () => {
    try {
      const { ethereum } = window

      if (!ethereum) {
        alert('메타마스크를 설치하세요.')
        return
      }
      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      })

      console.log('새로운 계정을 가져왔어요. ', accounts[0])
      setCurrentAccount(accounts[0])
    } catch (error) {
      console.log(error)
    }
  }

  const checkIfWalletIsConnected = async () => {
    // window.ethereum 은 메타마스크를 호출
    const { ethereum } = window

    if (!ethereum) {
      console.log('메타마스크가 없어요')
      return
    }

    console.log('메타마스크 ethereum object 에요', ethereum)

    // eth_accounts API를 통해 계정을 가져온다
    const accounts = await ethereum.request({
      method: 'eth_accounts',
    })

    if (accounts.length !== 0) {
      // 첫 번째 계정을 가져온다
      const account = accounts[0]
      console.log('첫 번째 계정을 찾았어요: ', account)
      // 첫 번째 계정을 setAccount 한다
      setCurrentAccount(account)
    } else {
      console.log('계정이 없네요...')
    }

    // 네트워크의 연결
    const chainId = await ethereum.request({ method: 'eth_chainId' })
    console.log('>>>>> setting network ', networks[chainId])
    setNetwork(networks[chainId])

    ethereum.on('chainChanged', handleChainChanged)

    // Reload the page when they change networks
    function handleChainChanged(_chainId) {
      window.location.reload()
    }

    return
  }

  const mintDomain = async () => {
    if (!domain) {
      return
    }
    if (domain.length < 3) {
      alert('도메인이 너무 짧은데.. 3글자는 넘겨주세요..')
      return
    }
    const price =
      domain.length === 3 ? '0.5' : domain.length === 4 ? '0.3' : '0.1'
    console.log('Minting domain: ', domain, 'with price ', price)

    try {
      const { ethereum } = window
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          contractAbi.abi,
          signer,
        )

        console.log('메타마스크 월렛을 띄울 거고, 가스비를 지불할 겁니다')
        let tx = await contract.register(domain, {
          value: ethers.utils.parseEther(price),
        })
      }
    } catch (error) {
      console.log(error)
    }
  }

  // 메타마스크가 연결되어 있지 않을 때 render 하는 container 에요
  const renderNotConnectedContainer = () => (
    <div className="connect-wallet-container">
      <img
        src="https://media.giphy.com/media/3ohhwytHcusSCXXOUg/giphy.gif"
        alt="Ninja gif"
      />
      <button
        onClick={connectWallet}
        className="cta-button connect-wallet-button"
      >
        Connect Wallet
      </button>
    </div>
  )

  // 도메인 이름과 데이터를 입력하는 폼
  const renderInputForm = () => {
    if (network !== 'Kovan') {
      return (
        <div className="connect-wallet-container">
          <p>Please connect to the Kovan Testnet</p>
        </div>
      )
    }
    return (
      <div className="form-container">
        <div className="first-row">
          <input
            type="text"
            value={domain}
            placeholder="domain"
            onChange={(e) => setDomain(e.target.value)}
          />
          <p className="tld"> {tld} </p>
        </div>

        <input
          type="text"
          value={record}
          placeholder="whats ur ninja power"
          onChange={(e) => setRecord(e.target.value)}
        />

        <div className="button-container">
          <button
            className="cta-button mint-button"
            disabled={null}
            onClick={mintDomain}
          >
            Mint
          </button>
        </div>
      </div>
    )
  }

  // useEffect 라서 페이지가 로딩될 때 아래 함수가 자동으로 실행되어요
  useEffect(() => {
    checkIfWalletIsConnected()
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
            <div className="right">
              <img
                alt="Network logo"
                className="logo"
                src={network.includes('kovan') ? ethLogo : polygonLogo}
              />
              {currentAccount ? (
                <p>
                  {' '}
                  Wallet: {currentAccount.slice(0, 6)}...
                  {currentAccount.slice(-4)}{' '}
                </p>
              ) : (
                <p> Not connected </p>
              )}
            </div>
          </header>
        </div>

        {/* 지금 연결되어 있는 계정이 있다면 Connect Wallet 버튼을 숨겨요 */}
        {!currentAccount && renderNotConnectedContainer()}

        {/* 지금 연결되어 있는 계정이 있다면 renderInputForm을 실행해요 */}
        {currentAccount && renderInputForm()}

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
  )
}

export default App
