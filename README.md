# DNS project로 배우는 NFT 민팅 방법 (Frontend)

## 브랜치 설명 및 구현 요구사항
* [step1] : Contract
* [step2] : frontend
  * 메타마스크 지갑이 연결되어 있는 지 체크하는 메소드를 만든다.
* [step3] : frontend
  * 메타마스크 지갑을 연결하는 메소드를 만든다.
* [step4] : frontend
  * 메타마스크 지갑이 연결되었을 때, 도메인 NFT를 민팅하는 메소드를 구현한다.
* [step5] : frontend
  * Rinkeby Network에 연결되지 않았을 때, 연결하는 메소드를 구현한다.
* [step6] : frontend
  * 도메인 NFT를 민팅하는 트랜잭션이 성공적으로 실행되었을 때, record를 설정하는 트랜잭션을 실행한다.
  * 민팅이 완료되면, 자동으로 새로고침한다. 새로 민팅한 NFT가 페이지에 뜬다.
* [step7] : frontend
  * 도메인 NFT를 민팅한 주인이라면, record를 변경할 수 있다.

## 참고할 문서
* https://docs.metamask.io/guide/rpc-api.html#unrestricted-methods
* https://docs.allthatnode.com/tutorials/minting-a-simple-erc721-nft#deploy-to-rinkeby-testnet-network
* https://docs.ethers.io/v5/api/contract/contract/
* https://eth.wiki/json-rpc/API#eth_accounts
* https://buildspace.so/p/build-polygon-ens