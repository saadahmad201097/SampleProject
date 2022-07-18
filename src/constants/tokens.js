import { blockChainConfig } from "../constants/config";
const selectedBlockChain =
  blockChainConfig[
    sessionStorage.getItem("selectedBlockChain")
      ? sessionStorage.getItem("selectedBlockChain")
      : 0
  ];

const {
  ethTokenConConfig: { add: EthTokenConAdd },
  ethTokenConConfig: { abi: EthTokenConAbi },
} = selectedBlockChain;

export const tokens = [
  {
    value: "ETH",
    imageSrc: "img/eth-input-ic.svg",
    key: "ETH",
    address: EthTokenConAdd,
    abi: EthTokenConAbi,
  }
];
