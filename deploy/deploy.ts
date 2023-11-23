import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Ether, Gwei, ether, gwei } from "../utils/ethersUnits";
import { BigNumber } from "@ethersproject/bignumber";
import { ToBlockchainDate } from "../utils/timeUnits";
import { ethers } from "hardhat";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getUnnamedAccounts, network } = hre;
  const accounts = await getUnnamedAccounts();
  const deployer = accounts[0];

  if (!network.live) {
    // On the hardhat network
    await deployments.save("multisig", { address: deployer, abi: [] });
  }

  const openmeshMultisig = (await deployments.get("multisig")).address;
  const openmeshWithdrawSignerAddress = "0xaF7E68bCb2Fc7295492A00177f14F59B92814e70";
  const gasPrice = BigNumber.from(Gwei(25)); // For some reason hardhat-deploy still uses BigNumber
  const priorityGas = BigNumber.from(gwei / BigInt(10));
  let nonce = 0;

  const openTokenName = "Openmesh";
  const openTokenTicker = "OPEN";
  const maxSupply = Ether(1_000_000_000);

  const validatorPassName = "Genisis Validator Pass";
  const validatorPassTicker = "GVP";
  const validatorPassUri = "https://avatars.githubusercontent.com/u/45976616";

  const fundraiserExchangeRates = [BigInt(30_000), BigInt(27_500), BigInt(25_000)];
  const fundraisingStart = ToBlockchainDate(new Date(2023, 11 - 1, 28)); // 28/11/2023
  const fundraisingPeriodEnds = [
    ToBlockchainDate(new Date(2023, 12 - 1, 5)), // 5/12/2023
    ToBlockchainDate(new Date(2023, 12 - 1, 12)), // 12/12/2023
    ToBlockchainDate(new Date(2023, 12 - 1, 26)), // 26/12/2023
  ];
  const fundraiserMinContribution = ether / BigInt(2);
  const fundraiserMaxContribution = Ether(2);

  const verifiedContributorName = "Verified Contributor";
  const verifiedContributorTicker = "VeCo";
  const verifiedContributorUri = "https://avatars.githubusercontent.com/u/45976616";

  const verifiedContributorStakingTokensPerSecond = Gwei(3858024); // ~10_000 OPEN every 30 days (9999.998208)

  const minNonce = await ethers.provider.getTransactionCount(deployer);
  const defaultParams = () => {
    return {
      nonce: Math.max(nonce++, minNonce),
      maxFeePerGas: gasPrice,
      maxPriorityFeePerGas: priorityGas,
      from: deployer,
      skipIfAlreadyDeployed: true,
    } as const;
  };

  const OPEN = await deployments.deploy("OPEN", {
    ...defaultParams(),
    args: [openTokenName, openTokenTicker, maxSupply, openmeshMultisig],
  });

  const ValidatorPass = await deployments.deploy("ValidatorPass", {
    ...defaultParams(),
    args: [validatorPassName, validatorPassTicker, validatorPassUri, openmeshMultisig],
  });

  const Fundraiser = await deployments.deploy("Fundraiser", {
    ...defaultParams(),
    args: [
      fundraiserExchangeRates,
      OPEN.address,
      ValidatorPass.address,
      openmeshMultisig,
      fundraisingStart,
      fundraisingPeriodEnds,
      fundraiserMinContribution,
      fundraiserMaxContribution,
    ],
  });

  const OpenStaking = await deployments.deploy("OpenStaking", {
    ...defaultParams(),
    args: [OPEN.address, openmeshWithdrawSignerAddress],
  });

  const VerifiedContributor = await deployments.deploy("VerifiedContributor", {
    ...defaultParams(),
    args: [verifiedContributorName, verifiedContributorTicker, verifiedContributorUri, openmeshMultisig],
  });

  const VerifiedContributorStaking = await deployments.deploy("VerifiedContributorStaking", {
    ...defaultParams(),
    args: [OPEN.address, VerifiedContributor.address, verifiedContributorStakingTokensPerSecond, openmeshMultisig],
  });
};
export default func;
