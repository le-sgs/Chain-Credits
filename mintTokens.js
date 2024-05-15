async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Minting tokens with the account:", deployer.address);
  
    // Address of the deployed ChainCreditsToken contract
    const chainCreditsTokenAddress = "0xD1713779BC63d59698E363Eebcb59Be8bfD4C44A";
  
    // Getting the contract factory and attaching the deployed contract
    const ChainCreditsToken = await ethers.getContractFactory("ChainCreditsToken");
    const chainCreditsToken = await ChainCreditsToken.attach(chainCreditsTokenAddress);
  
    // The address of the account you want to mint tokens to
    const recipientAddress = "0xace24900e57A7746FA11538083e970080704eE3A"; // Replace with the actual account address from Ganache
    // The amount of CCT tokens you want to mint to the account
    const amount = ethers.parseEther("100"); // Adjust the amount as necessary
  
    // Minting CCT tokens to the specified account
    const tx = await chainCreditsToken.mint(recipientAddress, amount);
    await tx.wait();
  
    console.log(`Minted ${amount.toString()} CCT tokens to ${recipientAddress}`);
  }
  
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
  