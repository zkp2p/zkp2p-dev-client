import { ethers } from "ethers";

const abiCoder = new ethers.utils.AbiCoder();

export const keccak256 = (inputString: string): string => {
  return ethers.utils.solidityKeccak256(["string"], [inputString]);
};

export const currencyKeccak256 = (inputString: string): string => {
  const bytes = ethers.utils.toUtf8Bytes(inputString);
  return ethers.utils.keccak256(bytes);
};

export const sha256 = (inputString: string): string => {
  return ethers.utils.soliditySha256(["string"], [inputString]);
};
