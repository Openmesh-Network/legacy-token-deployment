import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Ether, Gwei, ether, gwei } from "../utils/ethersUnits";
import { BigNumber } from "@ethersproject/bignumber";
import { UTCBlockchainDate } from "../utils/timeUnits";
import { ethers } from "hardhat";
import axios from "axios";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getUnnamedAccounts, network } = hre;
  const accounts = await getUnnamedAccounts();
  const deployer = accounts[0];

  if (!network.live) {
    // On the hardhat network
    await deployments.save("multisig", { address: deployer, abi: [] });
  }

  const openmeshMultisig = (await deployments.get("multisig")).address;
  const openmeshWithdrawSignerAddress = "0x8B4a225774EDdAF9C33f6b961Db832228c770b21";
  const gasPrice = BigNumber.from(Gwei(35)); // For some reason hardhat-deploy still uses BigNumber
  const priorityGas = BigNumber.from(gwei / BigInt(10));
  let nonce = 17;

  const openTokenName = "Openmesh";
  const openTokenTicker = "OPEN";
  const maxSupply = Ether(1_000_000_000);

  const validatorPassName = "Genesis Validator Pass";
  const validatorPassTicker = "GVP";
  const validatorPassUri = "https://erc721.openmesh.network/metadata/gvp.json";

  const fundraiserExchangeRates = [BigInt(30_000), BigInt(27_500), BigInt(25_000)];
  const fundraisingStart = UTCBlockchainDate(2023, 12, 5); // 5/12/2023
  const fundraisingPeriodEnds = [
    UTCBlockchainDate(2023, 12, 12), // 12/12/2023
    UTCBlockchainDate(2023, 12, 19), // 19/12/2023
    UTCBlockchainDate(2024, 1, 2), // 2/1/2024
  ];
  const fundraiserMinContribution = ether / BigInt(2);
  const fundraiserMaxContribution = Ether(2);

  const verifiedContributorName = "Openmesh Verified Contributor";
  const verifiedContributorTicker = "OVC";
  const verifiedContributorUri = "https://erc721.openmesh.network/metadata/ovc.json";

  const verifiedContributorStakingTokensPerSecond = Gwei(3858024); // ~10_000 OPEN every 30 days (9999.998208)

  const minNonce = await ethers.provider.getTransactionCount(deployer);
  const defaultParams = async () => {
    while (true) {
      // To prevent "ProviderError: err: max fee per gas less than block base fee"
      const gasInfo = await axios.request({
        url: "https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=" + process.env.X_ETHERSCAN_API_KEY ?? "",
      });
      if (!gasInfo?.data?.result?.suggestBaseFee) {
        console.error("Got response", gasInfo);
      }
      if (gasInfo.data.result.suggestBaseFee < gasPrice.div(BigNumber.from(10).pow(9))) {
        console.log("Lets go", gasInfo.data.result.suggestBaseFee);
        break;
      }
      console.log("Waiting...", gasInfo.data.result.suggestBaseFee);
      await new Promise((promise) => setTimeout(promise, 10_000));
    }

    return {
      nonce: Math.max(nonce++, minNonce),
      maxFeePerGas: gasPrice,
      maxPriorityFeePerGas: priorityGas,
      from: deployer,
      skipIfAlreadyDeployed: true,
    } as const;
  };

  const OPEN = await deployments.deploy("OPEN", {
    ...(await defaultParams()),
    args: [openTokenName, openTokenTicker, maxSupply, openmeshMultisig],
  });

  const ValidatorPass = await deployments.deploy("ValidatorPass", {
    ...(await defaultParams()),
    // maxPriorityFeePerGas: BigNumber.from(gwei / BigInt(2)), if replace transaction
    args: [validatorPassName, validatorPassTicker, validatorPassUri, openmeshMultisig],
  });

  const Fundraiser = await deployments.deploy("Fundraiser", {
    ...(await defaultParams()),
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

  const OpenWithdrawing = await deployments.deploy("OpenWithdrawing", {
    ...(await defaultParams()),
    args: [OPEN.address, openmeshWithdrawSignerAddress],
  });

  const VerifiedContributor = await deployments.deploy("VerifiedContributor", {
    ...(await defaultParams()),
    args: [verifiedContributorName, verifiedContributorTicker, verifiedContributorUri, openmeshMultisig],
  });

  const VerifiedContributorStaking = await deployments.deploy("VerifiedContributorStaking", {
    ...(await defaultParams()),
    args: [OPEN.address, VerifiedContributor.address, verifiedContributorStakingTokensPerSecond, openmeshMultisig],
  });
};
export default func;
