const main = async () => {
  const [owner, superCoder, notSuperCoder] = await hre.ethers.getSigners();
  const domainContractFactory = await hre.ethers.getContractFactory('Domains');
  const domainContract = await domainContractFactory.deploy("ninja");
  await domainContract.deployed();

  console.log("Contract owner:", owner.address);

  let ownerBalance = await hre.ethers.provider.getBalance(owner.address);
  let superCoderBalance = await hre.ethers.provider.getBalance(superCoder.address);
  console.log("Balance of owner before registrant:", hre.ethers.utils.formatEther(ownerBalance));

  // Let's be extra generous with our payment (we're paying more than required)
  let txn = await domainContract.connect(superCoder).register("a16zaaaaaa",  {value: hre.ethers.utils.parseEther('0.3')});
  await txn.wait();

  console.log("Balance of owner after registrant:", hre.ethers.utils.formatEther(ownerBalance));

  // How much money is in here?
  const balance = await hre.ethers.provider.getBalance(domainContract.address);
  console.log("Contract balance:", hre.ethers.utils.formatEther(balance));

  // Quick! Grab the funds from the contract! (as superCoder)
  try {
    txn = await domainContract.connect(notSuperCoder).withdraw();ß
    await txn.wait();
  } catch(error){
    console.log("Could not rob contract");
  }

  // Let's look in their wallet so we can compare later

  // Oops, looks like the owner is saving their money!
  txn = await domainContract.connect(owner).withdraw();
  await txn.wait();
  
  // Fetch balance of contract & owner
  const contractBalance = await hre.ethers.provider.getBalance(domainContract.address);
  ownerBalance = await hre.ethers.provider.getBalance(owner.address);

  console.log("Contract balance after withdrawal:", hre.ethers.utils.formatEther(contractBalance));
  console.log("Balance of owner after withdrawal:", hre.ethers.utils.formatEther(ownerBalance));
  console.log("Balance of superCoder after withdrawal:", hre.ethers.utils.formatEther(superCoderBalance));
}

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

runMain();