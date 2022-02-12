import { JSBI } from "@sushiswap/core-sdk";

export declare const LAMBDA_URL = "https://9epjsvomc4.execute-api.us-east-1.amazonaws.com/dev"
export declare const SOCKET_URL = "wss://hfimt374ge.execute-api.us-east-1.amazonaws.com/dev";

export const MaxUint256 = JSBI.BigInt(
  '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
)

export declare type BigintIsh = JSBI | number | string;

export declare enum Rounding {
  ROUND_DOWN = 0,
  ROUND_HALF_UP = 1,
  ROUND_UP = 3
}

export declare enum ChainId {
    ETHEREUM = 1,
    MATIC = 137,
    FANTOM = 250
}

export declare type AddressMap = {
    [chainId: number]: string;
};

export const WETH9_ADDRESS: AddressMap = {
  [ChainId.ETHEREUM]: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  [ChainId.FANTOM]: '0x74b23882a30290451A17c44f4F05243b6b58C76d',
}

export const WNATIVE_ADDRESS: AddressMap = {
  [ChainId.ETHEREUM]: WETH9_ADDRESS[ChainId.ETHEREUM],
  [ChainId.FANTOM]: '0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83',
}

export const DEFAULT_RECEIVER_ADDRESS: AddressMap = {
    //   [ChainId.AVALANCHE]: '0x042c99C84b00f11A08a07AA9752E083261083A57',
      [ChainId.FANTOM]: '0x612D3c387c2A483084D68061c753Ce1AD4e88bb6', // FEB22
      [ChainId.ETHEREUM]: '0xf4943f2dEc7E4914067CdF4120E8A322bc8f5a36',
}
    
  export const ADVANCED_RECEIVER_ADDRESS: AddressMap = {
    //   [ChainId.AVALANCHE]: '0x50995361A1104B2E34d81771B2cf19BA55051C7c',
      [ChainId.FANTOM]: '0xd6AF3AAe2Aef4f1Acff9dD66f542ea863fBe9ae7', // FEB22
      [ChainId.ETHEREUM]: '0xA32e906C31093aDbe581B913e549f70fD2fD7969',
}

