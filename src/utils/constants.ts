import JSBI from "jsbi";

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

export declare type AddressMap = {
    [chainId: number]: string;
};

export const WETH9_ADDRESS = '0x74b23882a30290451A17c44f4F05243b6b58C76d'

export const WNATIVE_ADDRESS = '0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83'

export const DEFAULT_RECEIVER_ADDRESS = '0x612D3c387c2A483084D68061c753Ce1AD4e88bb6'

  export const ADVANCED_RECEIVER_ADDRESS = '0xd6AF3AAe2Aef4f1Acff9dD66f542ea863fBe9ae7'

