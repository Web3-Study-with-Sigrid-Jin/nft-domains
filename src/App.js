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
const CONTRACT_ADDRESS = '0x39D3AaE03c7B4Ae7515C951CF3c3CB414Ad34B65'

const App = () => {
  const [network, setNetwork] = useState('')
  const [currentAccount, setCurrentAccount] = useState('')
  const [domain, setDomain] = useState('')
  const [record, setRecord] = useState('')
  const [mints, setMints] = useState([])
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)

  const fetchMints = async () => {
    try {
      const { ethereum } = window
      if (ethereum) {
        // You know all this
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          contractAbi.abi,
          signer,
        )

        // Get all the domain names from our contract
        const names = await contract.getAllNames()

        // For each name, get the record and the address
        const mintRecords = await Promise.all(
          names.map(async (name) => {
            const mintRecord = await contract.records(name)
            const owner = await contract.domains(name)
            return {
              id: names.indexOf(name),
              name: name,
              record: mintRecord,
              owner: owner,
            }
          }),
        )

        console.log('MINTS FETCHED ', mintRecords)
        setMints(mintRecords)
      }
    } catch (error) {
      console.log(error)
    }
  }

  // This will run any time currentAccount or network are changed
  useEffect(() => {
    if (network === 'Rinkeby') {
      fetchMints()
    }
  }, [currentAccount, network])

  const updateDomain = async () => {
    if (!record || !domain) {
      return
    }
    setLoading(true)
    console.log('Updating domain', domain, 'with record', record)
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

        let tx = await contract.setRecord(domain, record)
        await tx.wait()
        console.log('Record set https://rinkeby.etherscan.io/tx/' + tx.hash)

        fetchMints()
        setRecord('')
        setDomain('')
      }
    } catch (error) {
      console.log(error)
    }
    setLoading(false)
  }

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

        const receipt = await tx.wait()

        // 값이 1이면 receipt의 status가 통과된 것임
        if (receipt.status === 1) {
          console.log(
            '도메인 생성됨! 트젝 확인하셈! https://rinkeby.etherscan.io/tx/' +
              tx.hash,
          )

          // 도메인 레코드를 세팅한다.
          tx = await contract.setRecord(domain, record)
          await tx.wait()

          console.log(
            '레코드 세팅됨! 트젝 확인하셈! https://rinkeby.etherscan.io/tx/' +
              tx.hash,
          )

          // 2초 뒤에 fetchMints를 실행한다.
          setTimeout(() => {
            fetchMints()
          }, 2000)

          setRecord('')
          setDomain('')
        } else {
          alert('문제가 있다! 오류다!')
        }
      }
    } catch (error) {
      console.log(error)
    }
  }

  // Minting된 NFT 도메인을 렌더링한다
  const renderMints = () => {
    if (currentAccount && mints.length > 0) {
      return (
        <div className="mint-container">
          <p className="subtitle"> Recently minted domains!</p>
          <div className="mint-list">
            {mints.map((mint, index) => {
              return (
                <div className="mint-item" key={index}>
                  <div className="mint-row">
                    <a
                      className="link"
                      href={`https://testnets.opensea.io/assets/rinkeby/${CONTRACT_ADDRESS}/${mint.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <p className="underlined">
                        {' '}
                        {mint.name}
                        {tld}{' '}
                      </p>
                    </a>
                    {/* 도메인 주인이라면 mint 버튼이 보이게 코딩함 */}
                    {mint.owner.toLowerCase() ===
                    currentAccount.toLowerCase() ? (
                      <button
                        className="edit-button"
                        onClick={() => editRecord(mint.name)}
                      >
                        <img
                          className="edit-icon"
                          src="https://img.icons8.com/metro/26/000000/pencil.png"
                          alt="Edit button"
                        />
                      </button>
                    ) : null}
                  </div>
                  <p> {mint.record} </p>
                </div>
              )
            })}
          </div>
        </div>
      )
    }
  }

  // edit 모드가 가능하게 해줌
  const editRecord = (name) => {
    console.log('Editing record for', name)
    setEditing(true)
    setDomain(name)
  }

  const switchNetwork = async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x4' }], // networks.js 확인해서 ID 가져올 것
        })
      } catch (error) {
        // 메타마스크에 네트워크 추가가 안되어 있으면 나타나는 오류
        if (error.code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: '0x2a',
                  chainName: 'Ethereum Rinkeby Testnet',
                  rpcUrls: ['https://ethereum-rinkeby-rpc.allthatnode.com/'],
                  nativeCurrency: {
                    name: 'Rinkeby Ether',
                    symbol: 'ETH',
                    decimals: 18,
                  },
                  blockExplorerUrls: ['https://rinkeby.etherscan.io/'],
                },
              ],
            })
          } catch (error) {
            console.log(error)
          }
        }
        console.log(error)
      }
    } else {
      alert(
        'MetaMask is not installed. Please install it to use this app: https://metamask.io/download.html',
      )
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
    if (network !== 'Rinkeby') {
      return (
        <div className="connect-wallet-container">
          <p>Please connect to the Rinkeby Testnet</p>
          <button className="cta-button mint-button" onClick={switchNetwork}>
            Click here to switch
          </button>
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
                src={network.includes('Rinkeby') ? ethLogo : polygonLogo}
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

		{/* 민팅되어 있는 도메인이 있다면 Render 한다 */}
		{mints && renderMints()}

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
