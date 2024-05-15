async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);
  
  
  
    // Deploy CarbonCreditsTrading
    const ChainCreditsToken = await ethers.getContractFactory("ChainCreditsToken");
    const chainCreditsToken = await ChainCreditsToken.deploy();
    await chainCreditsToken.waitForDeployment();
    console.log("ChainCreditsToken deployed to:", await chainCreditsToken.getAddress());

   
}
  
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
  