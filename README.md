# Token Deployment

This repository has all the token contracts and a simple deployment script, to minimize user error.

```shell
npx hardhat multisig 0xd098Aff583b8fe1DE818Db1E40f68FD0B83e93d4 --network mainnet
npx hardhat ens 0xa58E81fe9b61B5c3fE2AFD33CF304c454AbFc7Cb --network mainnet
npx hardhat deploy --network mainnet && npx hardhat run ./scripts/grant-permision-safe.ts --network mainnet
npx hardhat etherscan-verify --network mainnet
npx hardhat sourcify --network mainnet
npx hardhat export --export export.ts --network mainnet
```
