export var ERC20_tokens: any = [
  {
    "name": '0x',
    "symbol": "ZRX",
    "address": '0xe41d2489571d322189246dafa5ebde1f4699f498',
    "logo": "0x.png"
  },
  {
    "name": 'Augur',
    "symbol": "REP",
    "address": '0xe94327d07fc17907b4db788e5adf2ed424addff6',
    "logo": "augur.png"
  },
  {
    "name": 'AirSwap',
    "symbol": "AST",
    "address": '0x27054b13b1b798b345b591a4d22e6562d47ea75a',
    "logo": "airswap.png"
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
    "address": '0xd26114cd6EE289AccF82350c8d8487fedB8A0C07',
    "logo": "omisego.png"
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
    "name": 'StatusNetwork',
    "symbol": "SNT",
    "address": '0x744d70fdbe2ba4cf95131626614a1763df805b9e',
    "logo": "status.png"
  },
  {
    "name": 'TenXPay',
    "symbol": "PAY",
    "address": '0xB97048628DB6B661D4C2aA833e95Dbe1A905B280',
    "logo": "tenx.png"
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