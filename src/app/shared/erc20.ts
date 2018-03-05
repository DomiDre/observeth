export var ERC20_tokens: any = [
  {
    "name": '0x',
    "symbol": "ZRX",
    "address": '0xe41d2489571d322189246dafa5ebde1f4699f498',
    "logo": "0x.png"
  },
  {
    "name": 'AirSwap',
    "symbol": "AST",
    "address": '0x27054b13b1b798b345b591a4d22e6562d47ea75a',
    "logo": "airswap.png"
  },
  {
    "name": 'Augur',
    "symbol": "REP",
    "address": '0xe94327d07fc17907b4db788e5adf2ed424addff6',
    "logo": "augur.png"
  },
  {
    "name": 'Basic Attention Token',
    "symbol": "BAT",
    "address": '0x0d8775f648430679a709e98d2b0cb6250d2887ef',
    "logo": "bat.png"
  },
  {
    "name": 'Binance',
    "symbol": "BNB",
    "address": '0xb8c77482e45f1f44de1745f52c74426c631bdd52',
    "logo": "binance.png"
  },
  {
    "name": 'Bloom',
    "symbol": "BLT",
    "address": '0x107c4504cd79c5d2696ea0030a8dd4e92601b82e',
    "logo": "bloom.png"
  },
  {
    "name": 'Chainlink',
    "symbol": "LINK",
    "address": '0x514910771af9ca656af840dff83e8264ecf986ca',
    "logo": "chainlink.png"
  },
  {
    "name": 'Civic',
    "symbol": "CVC",
    "address": '0x41e5560054824ea6b0732e656e3ad64e20e94e45',
    "logo": "civic.png"
  },
  {
    "name": 'FunFair',
    "symbol": "FUN",
    "address": '0x419d0d8bdd9af5e606ae2232ed285aff190e711b',
    "logo": "funfair.png"
  },
  {
    "name": 'Golem',
    "symbol": "GNT",
    "address": '0xa74476443119A942dE498590Fe1f2454d7D4aC0d',
    "logo": "golem.png"
  },
  {
    "name": 'KyberNetwork',
    "symbol": "KNC",
    "address": '0xdd974d5c2e2928dea5f71b9825b8b646686bd200',
    "logo": "kyber.png"
  },
  {
    "name": 'Leverj',
    "symbol": "LEV",
    "address": '0x0f4ca92660efad97a9a70cb0fe969c755439772c',
    "logo": "leverj.png"
  },
  {
    "name": 'OmiseGo',
    "symbol": "OMG",
    "address": '0xd26114cd6ee289accf82350c8d8487fedb8a0c07',
    "logo": "omisego.png"
  },
  {
    "name": 'Qtum',
    "symbol": "QTUM",
    "address": '0x9a642d6b3368ddc662ca244badf32cda716005bc',
    "logo": "qtum.png"
  },
  {
    "name": 'Raiden',
    "symbol": "RDN",
    "address": '0x255aa6df07540cb5d3d297f0d0d4d84cb52bc8e6',
    "logo": "raiden.png"
  },
  {
    "name": 'Request Network',
    "symbol": "REQ",
    "address": '0x8f8221afbb33998d8584a2b05749ba73c37a938a',
    "logo": "request.png"
  },
  {
    "name": 'Ripio Credit Network',
    "symbol": "RCN",
    "address": '0xf970b8e36e23f7fc3fd752eea86f8be8d83375a6',
    "logo": "ripio.png"
  },
  {
    "name": 'Rivet',
    "symbol": "RVT",
    "address": '0x3d1ba9be9f66b8ee101911bc36d3fb562eac2244',
    "logo": "rivet.png"
  },
  {
    "name": 'Santiment',
    "symbol": "SAN",
    "address": '0x7c5a0ce9267ed19b22f8cae653f198e3e8daf098',
    "logo": "santiment.png"
  },
  {
    "name": 'StatusNetwork',
    "symbol": "SNT",
    "address": '0x744d70fdbe2ba4cf95131626614a1763df805b9e',
    "logo": "status.png"
  },
  {
    "name": 'Swarm City',
    "symbol": "SWT",
    "address": '0xb9e7f8568e08d5659f5d29c4997173d84cdf2607',
    "logo": "swarmcity.png"
  },
  {
    "name": 'TenXPay',
    "symbol": "PAY",
    "address": '0xb97048628db6b661d4c2aa833e95dbe1a905b280',
    "logo": "tenx.png"
  },
  {
    "name": 'Wrapped Ether',
    "symbol": "WETH",
    "address": '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    "logo": "weth.png"
  },

  
]

export var ERC20_abi:any = [
  {
    "constant": true,
    "inputs": [],
    "name": "name",
    "outputs": [
      {
        "name": "",
        "type": "string"
      }
    ],
    "payable": false,
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_spender",
        "type": "address"
      },
      {
        "name": "_value",
        "type": "uint256"
      }
    ],
    "name": "approve",
    "outputs": [
      {
        "name": "success",
        "type": "bool"
      }
    ],
    "payable": false,
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "totalSupply",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_from",
        "type": "address"
      },
      {
        "name": "_to",
        "type": "address"
      },
      {
        "name": "_value",
        "type": "uint256"
      }
    ],
    "name": "transferFrom",
    "outputs": [
      {
        "name": "success",
        "type": "bool"
      }
    ],
    "payable": false,
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "decimals",
    "outputs": [
      {
        "name": "",
        "type": "uint8"
      }
    ],
    "payable": false,
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "version",
    "outputs": [
      {
        "name": "",
        "type": "string"
      }
    ],
    "payable": false,
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "_owner",
        "type": "address"
      }
    ],
    "name": "balanceOf",
    "outputs": [
      {
        "name": "balance",
        "type": "uint256"
      }
    ],
    "payable": false,
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "symbol",
    "outputs": [
      {
        "name": "",
        "type": "string"
      }
    ],
    "payable": false,
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_to",
        "type": "address"
      },
      {
        "name": "_value",
        "type": "uint256"
      }
    ],
    "name": "transfer",
    "outputs": [
      {
        "name": "success",
        "type": "bool"
      }
    ],
    "payable": false,
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_spender",
        "type": "address"
      },
      {
        "name": "_value",
        "type": "uint256"
      },
      {
        "name": "_extraData",
        "type": "bytes"
      }
    ],
    "name": "approveAndCall",
    "outputs": [
      {
        "name": "success",
        "type": "bool"
      }
    ],
    "payable": false,
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "_owner",
        "type": "address"
      },
      {
        "name": "_spender",
        "type": "address"
      }
    ],
    "name": "allowance",
    "outputs": [
      {
        "name": "remaining",
        "type": "uint256"
      }
    ],
    "payable": false,
    "type": "function"
  },
  {
    "inputs": [
      {
        "name": "_initialAmount",
        "type": "uint256"
      },
      {
        "name": "_tokenName",
        "type": "string"
      },
      {
        "name": "_decimalUnits",
        "type": "uint8"
      },
      {
        "name": "_tokenSymbol",
        "type": "string"
      }
    ],
    "type": "constructor"
  },
  {
    "payable": false,
    "type": "fallback"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "name": "_from",
        "type": "address"
      },
      {
        "indexed": true,
        "name": "_to",
        "type": "address"
      },
      {
        "indexed": false,
        "name": "_value",
        "type": "uint256"
      }
    ],
    "name": "Transfer",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "name": "_owner",
        "type": "address"
      },
      {
        "indexed": true,
        "name": "_spender",
        "type": "address"
      },
      {
        "indexed": false,
        "name": "_value",
        "type": "uint256"
      }
    ],
    "name": "Approval",
    "type": "event"
  },
]