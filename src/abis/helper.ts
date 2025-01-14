export default [
  {
    inputs: [
      { internalType: 'contract IStopLimitOrder', name: '_stopLimitOrder', type: 'address' },
      { internalType: 'contract ICoffinBox', name: '_coffinBox', type: 'address' },
      { internalType: 'address', name: '_factory', type: 'address' },
      { internalType: 'bytes32', name: '_pairCodeHash', type: 'bytes32' },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [],
    name: 'coffinBox',
    outputs: [{ internalType: 'contract ICoffinBox', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'factory',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address[]', name: 'users', type: 'address[]' },
      { internalType: 'bytes32[]', name: 'digests', type: 'bytes32[]' },
    ],
    name: 'getOrderInfo',
    outputs: [
      {
        components: [
          { internalType: 'uint256', name: 'filledAmount', type: 'uint256' },
          { internalType: 'bool', name: 'cancelled', type: 'bool' },
        ],
        internalType: 'struct Helper.OrderInfo[]',
        name: '',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address[]', name: 'users', type: 'address[]' },
      { internalType: 'contract IERC20[]', name: 'tokens', type: 'address[]' },
      { internalType: 'bytes32[]', name: 'digests', type: 'bytes32[]' },
    ],
    name: 'getOrderUserInfo',
    outputs: [
      {
        components: [
          { internalType: 'uint256', name: 'filledAmount', type: 'uint256' },
          { internalType: 'bool', name: 'cancelled', type: 'bool' },
          { internalType: 'uint256', name: 'makersCoffinBalance', type: 'uint256' },
          { internalType: 'bool', name: 'approvedMasterContract', type: 'bool' },
        ],
        internalType: 'struct Helper.OrderUserInfo[]',
        name: '',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'contract IERC20[]', name: 'tokensA', type: 'address[]' },
      { internalType: 'contract IERC20[]', name: 'tokensB', type: 'address[]' },
    ],
    name: 'getPoolInfo',
    outputs: [
      {
        components: [
          { internalType: 'uint256', name: 'tokenAPoolBalance', type: 'uint256' },
          { internalType: 'uint256', name: 'tokenBPoolBalance', type: 'uint256' },
        ],
        internalType: 'struct Helper.PoolInfo[]',
        name: '',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'pairCodeHash',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'stopLimitOrder',
    outputs: [{ internalType: 'contract IStopLimitOrder', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
]
