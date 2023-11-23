import { task } from "hardhat/config";

task("multisig", "Register Openmesh multisig deployed on a certain network")
  .addPositionalParam("address")
  .setAction(async (taskArgs, hre) => {
    const exampleUsage = " Example usage: npx hardhat multisig 0x44DbB18208bBFd976c3351Db1Fa4C6871d503c0E --network sepolia";

    const address = taskArgs.address;
    if (!address) {
      throw new Error("Address not provided." + exampleUsage);
    }
    if (!hre.ethers.utils.isAddress(address)) {
      throw new Error("Provided address is incorrect." + exampleUsage);
    }
    await hre.deployments.save("multisig", { address: address, abi: [] });
  });
