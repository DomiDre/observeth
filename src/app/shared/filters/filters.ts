export const Filters = {
  '': {
    title: '',
    defaultValue: undefined,
    value: undefined,
    set: false
  },
  'MinTxVol': {
    title: 'Minimum transaction volume',
    defaultValue: 0,
    value: 0,
    set: false,
    tokenFilter: false
  },
  'MinEthBalanceFrom': {
    title: 'Minimum node balance of transaction sender',
    defaultValue: 0,
    value: 0,
    set: false,
    tokenFilter: false
  },
  'MinEthBalanceTo': {
    title: 'Minimum node balance of transaction receiver',
    defaultValue: 0,
    value: 0,
    set: false,
    tokenFilter: false
  },
  'MinEthBalance': {
    title: 'Minimum ether balance of nodes',
    defaultValue: 0,
    value: 0,
    set: false,
    tokenFilter: false
  },
  'MinTokBalanceFrom': {
    title: 'Minimum token balance of transaction sender',
    defaultValue: 0,
    value: 0,
    set: false,
    tokenFilter: true
  },
  'MinTokBalanceTo': {
    title: 'Minimum token balance of transaction receiver',
    defaultValue: 0,
    value: 0,
    set: false,
    tokenFilter: true
  },
  'MinTokBalance': {
    title: 'Minimum token balance of nodes',
    defaultValue: 0,
    value: 0,
    set: false,
    tokenFilter: true
  }
}
