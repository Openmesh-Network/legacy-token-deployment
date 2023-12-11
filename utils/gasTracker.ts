import axios from "axios";
import { network } from "hardhat";

export async function waitForGasPrice(gasPrice: bigint) {
  if (network.name === "mainnet") {
    // On networks other than mainnet, no need to wait for lower gas fee (or add a service that provides an API for it to this function)
    while (true) {
      // To prevent "ProviderError: err: max fee per gas less than block base fee"
      const gasInfo = await axios.request({
        url: "https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=" + process.env.X_ETHERSCAN_API_KEY ?? "",
      });
      if (!gasInfo?.data?.result?.suggestBaseFee) {
        console.error("Got response", gasInfo);
      }
      if (gasInfo.data.result.suggestBaseFee < gasPrice / BigInt(10) ** BigInt(9)) {
        // Gas price returned in gwei
        console.log("Lets go", gasInfo.data.result.suggestBaseFee);
        break;
      }
      console.log("Waiting...", gasInfo.data.result.suggestBaseFee);
      await new Promise((promise) => setTimeout(promise, 10_000));
    }
  }
}
