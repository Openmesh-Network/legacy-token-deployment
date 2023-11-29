# Token Deployment

This repository has all the token contracts and a simple deployment script, to minimize user error.

```shell
npx hardhat multisig 0x44DbB18208bBFd976c3351Db1Fa4C6871d503c0E --network sepolia
SET NONCE TO DESIRED NONCE IN deploy.ts
npx hardhat deploy --network sepolia
npx hardhat etherscan-verify --network sepolia
npx hardhat sourcify --network sepolia
npx hardhat run ./scripts/grant-permision-safe.ts --network sepolia
npx hardhat export --export export.ts --network sepolia
```
