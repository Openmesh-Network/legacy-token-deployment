import { task } from "hardhat/config";

task("ens", "Register ENS Reverse Registrar deployed on a certain network")
  .addPositionalParam("address")
  .setAction(async (taskArgs, hre) => {
    const exampleUsage = " Example usage: npx hardhat ens 0xA0a1AbcDAe1a2a4A2EF8e9113Ff0e02DD81DC0C6 --network sepolia";

    const address = taskArgs.address;
    if (!address) {
      throw new Error("Address not provided. You can find the address at https://docs.ens.domains/ens-deployments ." + exampleUsage);
    }
    if (!hre.ethers.utils.isAddress(address)) {
      throw new Error("Provided address is incorrect." + exampleUsage);
    }
    await hre.deployments.save("ens", { address: address, abi: [] });
  });
