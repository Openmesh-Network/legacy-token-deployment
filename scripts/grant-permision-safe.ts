import { deployments, ethers, network } from "hardhat";
import Safe, { EthersAdapter } from "@safe-global/protocol-kit";
import { MetaTransactionData } from "@safe-global/safe-core-sdk-types";
import { Ether, Gwei, gwei } from "../utils/ethersUnits";
import axios from "axios";
import { waitForGasPrice } from "../utils/gasTracker";

export async function main() {
  const [owner] = await ethers.getSigners();
  const safeAddress = (await deployments.get("multisig")).address;
  const verifiedContributors = ["0x519ce4C129a981B2CBB4C3990B1391dA24E8EbF3"]; // These addresses will be minted a Verified Contributor.

  const OPEN = await ethers.getContractAt("OPEN", (await deployments.get("OPEN")).address);
  const ValidatorPass = await ethers.getContractAt("ValidatorPass", (await deployments.get("ValidatorPass")).address);
  const Fundraiser = await ethers.getContractAt("Fundraiser", (await deployments.get("Fundraiser")).address);
  const OpenWithdrawing = await ethers.getContractAt("OpenWithdrawing", (await deployments.get("OpenWithdrawing")).address);
  const VerifiedContributor = await ethers.getContractAt("VerifiedContributor", (await deployments.get("VerifiedContributor")).address);
  const VerifiedContributorStaking = await ethers.getContractAt("VerifiedContributorStaking", (await deployments.get("VerifiedContributorStaking")).address);

  const ethAdapter = new EthersAdapter({
    ethers,
    signerOrProvider: owner,
  });
  const safeSdk: Safe = await Safe.create({ ethAdapter: ethAdapter, safeAddress });

  const transactions: MetaTransactionData[] = [
    // Validator Pass minting rights are granted to the fundraiser contract
    {
      to: ValidatorPass.address,
      value: "0",
      data: ValidatorPass.interface.encodeFunctionData("grantRole", [ethers.utils.keccak256(ethers.utils.toUtf8Bytes("MINT")), Fundraiser.address]),
    },
    // OPEN token minting rights are granted to the multisig
    {
      to: OPEN.address,
      value: "0",
      data: OPEN.interface.encodeFunctionData("grantRole", [ethers.utils.keccak256(ethers.utils.toUtf8Bytes("MINT")), safeAddress]),
    },
    // Fundraiser gets x OPEN tokens freshly minted
    {
      to: OPEN.address,
      value: "0",
      data: OPEN.interface.encodeFunctionData("mint", [Fundraiser.address, Ether(80_000_000)]),
    },
    // OPEN token minting rights are granted to the OPEN staking
    {
      to: OPEN.address,
      value: "0",
      data: OPEN.interface.encodeFunctionData("grantRole", [ethers.utils.keccak256(ethers.utils.toUtf8Bytes("MINT")), OpenWithdrawing.address]),
    },
    // OPEN token minting rights are granted to the Verified Contributor Staking
    {
      to: OPEN.address,
      value: "0",
      data: OPEN.interface.encodeFunctionData("grantRole", [ethers.utils.keccak256(ethers.utils.toUtf8Bytes("MINT")), VerifiedContributorStaking.address]),
    },
    // Verified Contributor minting rights are granted to the multisig
    {
      to: VerifiedContributor.address,
      value: "0",
      data: VerifiedContributor.interface.encodeFunctionData("grantRole", [ethers.utils.keccak256(ethers.utils.toUtf8Bytes("MINT")), safeAddress]),
    },
    // Verified Contributors are minted for the Openmesh internal team
    ...verifiedContributors.map((v, i) => {
      return {
        to: VerifiedContributor.address,
        value: "0",
        data: VerifiedContributor.interface.encodeFunctionData("mint", [v, i]),
      };
    }),
  ];
  const safeTransaction = await safeSdk.createTransaction({ safeTransactionData: transactions });

  const gasPrice = Gwei(25);
  await waitForGasPrice(gasPrice);

  const executeTxResponse = await safeSdk.executeTransaction(safeTransaction, {
    maxFeePerGas: gasPrice.toString(),
    maxPriorityFeePerGas: (gwei / BigInt(10)).toString(),
  });
  await executeTxResponse.transactionResponse?.wait();
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
