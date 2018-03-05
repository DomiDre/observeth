import { Component, OnInit, OnDestroy } from '@angular/core';
import { Web3ConnectService } from '../shared/web3-connect.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs'

@Component({
  selector: 'app-dex-track',
  templateUrl: './dex-track.component.html',
  styleUrls: ['./dex-track.component.css']
})
export class DexTrackComponent implements OnInit, OnDestroy {

  public AirSwapTokenAddress = '0x27054b13b1b798b345b591a4d22e6562d47ea75a';
  public AirSwapDEX = '0x8fd3121013a07c57f0d69646e86e7a4880b467b7';
  public etherscan_token = '8FWC8GZWSE8SJKY7NBSE77XER4KQ8NXK1Z'

  public numTokens = 0;

  public tokenAddresses: Array<string> = [];
  public tokenAddressesPair: Array<any> = [];

  public tokenProperties = {};
  public tokenPairStatistics = {};

  public tokenInfoLoaded: boolean = false;
  
  objectKeys = Object.keys;

  constructor(public web3service: Web3ConnectService,
              private http: HttpClient) { }

  ngOnInit() {
    console.log('Dex Tracker connecting ... ')
    this.web3service.isConnected()
    .then((isConnected) => {
      if(!isConnected) {
        console.log('No connection...')
      } else {
        this.readDex()
      }
    });

  }

  ngOnDestroy() {

  }

  http_get(request: string): Observable<any> {
    return this.http.get(request);
  }

  readDex() {
    let AirSwapMaker = '0x0000000000000000000000003940fd53e5a76ac724e217a4113298920e51dbc8';
    let AirSwapFilledEvent = '0xe59c5e56d85b2124f5e7f82cb5fcc6d28a4a241a9bdd732704ac9d3b6bfc98ab';

    this.web3service.getBlockNumber()
    .then((blocknumber) => {
      let firstBlockNumber = blocknumber - 5838 *7; // 24h for 14.8s block time
      let latestBlockNumber = blocknumber;

      return this.http_get(
      'https://api.etherscan.io/api?module=logs&action=getLogs'+
      '&address='+this.AirSwapDEX+
      '&fromBlock='+firstBlockNumber+
      '&toBlock='+latestBlockNumber+
      '&topic0='+AirSwapFilledEvent+
      '&apikey='+this.etherscan_token
      ).toPromise()
    }).then(DEXtxs => {
      return this.evalAirSwapDEX(DEXtxs.result);
    }).then(result => {
      for (let token in this.tokenPairStatistics) {
        let token_decimal = this.tokenProperties[token].decimal;
        let token_symbol = this.tokenProperties[token].symbol;
        for(let tokenPair in this.tokenPairStatistics[token]) {
          let tokenPair_decimal = this.tokenProperties[tokenPair].decimal;
          let tokenPair_symbol = this.tokenProperties[tokenPair].symbol;
          for(let transaction of this.tokenPairStatistics[token][tokenPair]) {
            transaction.buyAmount = transaction.buyAmount / token_decimal;
            transaction.buySymbol = token_symbol;
            transaction.sellAmount = transaction.sellAmount / tokenPair_decimal;
            transaction.sellSymbol = tokenPair_symbol;
            
          }
        }
      }
      this.tokenInfoLoaded = true;
    })
  }

  evalAirSwapDEX(DEXtxs): Promise<any> {
    let tokenDetailsPromise: Array<any> = [];
    for(let txData of DEXtxs) {
      //event Filled(address indexed makerAddress, uint makerAmount, address indexed makerToken, address takerAddress, uint takerAmount, address indexed takerToken, uint256 expiration, uint256 nonce);
      let makerAddress = this.removeLeadingZeros0_20(txData.topics['1']);
      let makerToken = this.removeLeadingZeros0_20(txData.topics['2']);
      let takerToken = this.removeLeadingZeros0_20(txData.topics['3']);
      
      let gasUsed = this.web3service.toDecimal(txData.gasUsed);
      let gasPrice = this.web3service.toDecimal(txData.gasPrice);
      let gasCost = gasPrice * gasUsed / 1e18;
      let data = txData.data;
      let timestamp = this.web3service.toDecimal(txData.timeStamp);
      let makerAmount = this.web3service.toDecimal(data.slice(0,2+64*1));
      let takerAdress = this.removeLeadingZeros0_20('0x'+data.slice(2+64*1,2+64*2));
      let takerAmount = this.web3service.toDecimal('0x'+data.slice(2+64*2,2+64*3));
      let expiration = '0x'+data.slice(2+64*3,2+64*4);
      let nonce = '0x'+data.slice(2+64*4,2+64*5);


      let idx_makerToken = this.tokenAddresses.indexOf(makerToken);
      if (idx_makerToken === -1) {
        this.tokenAddresses.push(makerToken);
        this.tokenAddressesPair.push([takerToken]);
        this.tokenPairStatistics[makerToken] = {}

        idx_makerToken = this.numTokens;
        this.numTokens++;
        tokenDetailsPromise.push(
          this.web3service.getERC20details(this.web3service.getERC20Contract(makerToken))
          .then(data => {
            let current_address = makerToken;
            this.tokenProperties[current_address] = {
              'decimal': 10**this.web3service.toDecimal(data[0]),
              'symbol': data[1],
              'totalSupply': this.web3service.toDecimal(data[2])
            }
          })
        )
      }

      let idx_takerToken = this.tokenAddresses.indexOf(takerToken);
      if (idx_takerToken === -1) {
        this.tokenAddresses.push(takerToken);
        this.tokenAddressesPair.push([makerToken]);
        this.tokenPairStatistics[takerToken] = {}

        idx_takerToken = this.numTokens;
        this.numTokens++;
        tokenDetailsPromise.push(
          this.web3service.getERC20details(this.web3service.getERC20Contract(takerToken))
          .then(data => {
            let current_address = takerToken;
            this.tokenProperties[current_address] = {
              'decimal': 10**this.web3service.toDecimal(data[0]),
              'symbol': data[1],
              'totalSupply': this.web3service.toDecimal(data[2])
            }
          })
        )
      }

      if(this.tokenPairStatistics[makerToken][takerToken] === undefined) {
        this.tokenPairStatistics[makerToken][takerToken] = [];
      }

      this.tokenPairStatistics[makerToken][takerToken].push({
        'buyAmount': makerAmount,
        'sellAmount': takerAmount,
        'gasPrice': gasPrice,
        'gasUsed': gasUsed,
        'gasCost': gasCost,
        'timestamp': timestamp,
        'makerAddress': makerAddress,
        'takerAddress': takerAdress
      })

      // if(this.tokenPairStatistics[takerToken][makerToken] === undefined) {
      //   this.tokenPairStatistics[takerToken][makerToken] = [];
      // }
      // this.tokenPairStatistics[takerToken][makerToken].push({
      //   'buyAmount': takerAmount,
      //   'sellAmount': makerAmount,
      //   'gasPrice': gasPrice,
      //   'gasUsed': gasUsed,
      //   'gasCost': gasCost,
      //   'timestamp': timestamp
      // })
    }
    return Promise.all(tokenDetailsPromise);
  }

  get_tokenPairs(token): any {
    return this.tokenPairStatistics[token]
  }

  get_pairStatistic(token, tokenPair): Array<any> {
    return this.tokenPairStatistics[token][tokenPair]
  }

  get_tokenDecimal(token): number {
    return this.tokenProperties[token].decimal;
  }

  get_tokenSymbol(token): string {
    return this.tokenProperties[token].symbol;
  }

  get_addressSlice(address: string): string {
    return address.slice(0,8);
  }

  removeLeadingZeros0_20(data): string {
    let cleaned_string = data.replace(/0x0*/,'0x');
    while(cleaned_string.length < 42) cleaned_string = cleaned_string.replace('0x', '0x0')
    return cleaned_string;
  }
}
