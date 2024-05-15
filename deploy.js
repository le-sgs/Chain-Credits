async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Address of the deployed ChainCreditsToken contract
  const chainCreditsTokenAddress = "0xD1713779BC63d59698E363Eebcb59Be8bfD4C44A";

  // Deploy CarbonCreditsTrading with ChainCreditsToken contract address as an argument
  const CarbonCreditsTrading = await ethers.getContractFactory("CarbonCreditsTrading");
  const carbonCreditsTrading = await CarbonCreditsTrading.deploy(chainCreditsTokenAddress);

  await carbonCreditsTrading.waitForDeployment();
  console.log("CarbonCreditsTrading deployed to:", await carbonCreditsTrading.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
