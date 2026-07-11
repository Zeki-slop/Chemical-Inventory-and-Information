const hre = require('hardhat');
const fs = require('fs');
const path = require('path');

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log('Deploying ChemAwareRegistry with account:', deployer.address);

  const Registry = await hre.ethers.getContractFactory('ChemAwareRegistry');
  const registry = await Registry.deploy();
  await registry.waitForDeployment();

  const address = await registry.getAddress();
  console.log('ChemAwareRegistry deployed to:', address);

  // Write the address + ABI to src/contracts so the frontend can pick it up
  const artifact = await hre.artifacts.readArtifact('ChemAwareRegistry');
  const outPath = path.join(__dirname, '..', 'src', 'contracts', 'ChemAwareRegistry.json');
  fs.writeFileSync(
    outPath,
    JSON.stringify({ contractName: 'ChemAwareRegistry', address, abi: artifact.abi }, null, 2)
  );
  console.log('Wrote ABI + address to', outPath);
  console.log('\nSet this in your .env file:');
  console.log(`VITE_CONTRACT_ADDRESS=${address}`);

  // Optional: verify on Etherscan if deploying to a live testnet
  if (hre.network.name === 'sepolia' && process.env.ETHERSCAN_API_KEY) {
    console.log('Waiting for block confirmations before verification...');
    await registry.deploymentTransaction().wait(5);
    try {
      await hre.run('verify:verify', { address, constructorArguments: [] });
    } catch (err) {
      console.warn('Verification failed (often fine on first attempt):', err.message);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
