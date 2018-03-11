import { Component, OnInit, OnDestroy, NgZone, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs'
import { ERC20_tokens } from '../shared/erc20';
import { TimerObservable } from 'rxjs/observable/TimerObservable';


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
  
  public timer: any;

  public refresh_time = 10000; // ms
  @ViewChild('chart') el: ElementRef;

  public test_tokens: any;

  public dropdownTokens: Array<any>;
  public dropdownMakerTokens: Array<any>;
  public dropdownTakerTokens: Array<any>;
  selectedMakerToken: any;
  selectedTakerToken: any;

  objectKeys = Object.keys;

  constructor(private http: HttpClient,
              private zone: NgZone) { }

  ngOnInit() {
    // this.dropdownTokens = [
    //       {label:'AirSwap', value:{id:0, name: 'AirSwap', code: 'AST'}, logo:'airswap.png'},
    //       {label:'Wrapped Ether', value:{id:1, name: 'Wrapped Ether', code: 'WETH'}, logo:'weth.png'},
    //   ];

    this.load_tokens();
    this.readDex();
    this.init_timer();
  }

  ngOnDestroy() {
    if(this.timer) this.timer.unsubscribe();
  }

  init_timer(): void {
    this.timer = TimerObservable.create(0, this.refresh_time)
    .subscribe( () => this.readDex())
  }

  load_tokens(): void {
    for(let token of ERC20_tokens) {
      this.tokenProperties[token.address] = {
         'name': token.name,
         'symbol': token.symbol,
         'decimal': 10**token.decimal,
         'logo': token.logo
      }
    }
  }

  basicChart() {
    let all_tx = this.tokenPairStatistics[this.selectedMakerToken.address][this.selectedTakerToken.address];
    let x_data = [];
    let y_data = [];
    for (let tx of all_tx) {
      let buy = tx.buyAmount;
      let sell = tx.sellAmount;
      let price = sell/buy;
      let time = new Date(tx.timestamp*1000);
      x_data.push(time);
      y_data.push(price);
    }
    const data = [{
      x: x_data,
      y: y_data
    }]


    const element = this.el.nativeElement;
    const style = {
      margin: { t: 0 },
      xaxis: {
        autorange: true,
        range: [Math.min(...x_data), Math.max(...x_data)],
        rangeselector: {buttons: [
            {
              count: 1,
              label: '1h',
              step: 'hour',
              stepmode: 'backward'
            },
            {
              count: 24,
              label: '24h',
              step: 'hour',
              stepmode: 'backward'
            },
            {step: 'all'}
          ]},
        rangeslider: {range: [Math.min(...x_data), Math.max(...x_data)]},
        type: 'date'
      },
    }
    Plotly.newPlot( element, data, style )
  }

  get tokens(): any {
    return ERC20_tokens;
  }

  http_get(request: string): Observable<any> {
    return this.http.get(request);
  }

  readDex(): void {
    let AirSwapMaker = '0x0000000000000000000000003940fd53e5a76ac724e217a4113298920e51dbc8';
    let AirSwapFilledEvent = '0xe59c5e56d85b2124f5e7f82cb5fcc6d28a4a241a9bdd732704ac9d3b6bfc98ab';
    
    this.http_get('https://api.etherscan.io/api?module=proxy&action=eth_blockNumber&apikey='+
                  this.etherscan_token
    ).toPromise()
    .then((blocknumber) => {
      blocknumber = parseInt(blocknumber.result, 16);
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
      this.tokenAddresses = [];
      this.tokenAddressesPair = [];
      this.tokenPairStatistics = {};
      this.dropdownTokens = [];

      this.evalAirSwapDEX(DEXtxs.result); // go through results of API call and fill arrays
      
      // scale to decimals and get symbols
      for (let token in this.tokenPairStatistics) {
        let token_props = this.tokenProperties[token]
        let token_name = token_props.name;
        let token_decimal = token_props.decimal;
        let token_symbol = token_props.symbol;
        let token_logo = token_props.logo;

        this.dropdownTokens.push({label:token_name,
                                  value:{
                                    id:this.dropdownTokens.length,
                                    symbol: token_symbol,
                                    address: token
                                  },
                                  logo:token_logo});

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

      if (this.selectedMakerToken == undefined) {
        this.selectedMakerToken = this.dropdownTokens[0].value;
        this.dropdownUpdated();
      }
      this.tokenInfoLoaded = true;
      this.basicChart();
    }).catch(error => {
      console.log('Http Request failed. Retrying in ' + this.refresh_time/1e3);
    })
  }

  evalAirSwapDEX(DEXtxs): void {
    let tokenDetailsPromise: Array<any> = [];
    for(let txData of DEXtxs) {
      //event Filled(address indexed makerAddress, uint makerAmount, address indexed makerToken, address takerAddress, uint takerAmount, address indexed takerToken, uint256 expiration, uint256 nonce);
      let makerAddress = this.removeLeadingZeros0_20(txData.topics['1']);
      let makerToken = this.removeLeadingZeros0_20(txData.topics['2']);
      let takerToken = this.removeLeadingZeros0_20(txData.topics['3']);
      
      let gasUsed = parseInt(txData.gasUsed, 16);
      let gasPrice = parseInt(txData.gasPrice, 16);
      let gasCost = gasPrice * gasUsed / 1e18;
      let data = txData.data;
      let timestamp = parseInt(txData.timeStamp, 16);
      let makerAmount = parseInt(data.slice(0,2+64*1), 16);
      let takerAdress = this.removeLeadingZeros0_20('0x'+data.slice(2+64*1,2+64*2));
      let takerAmount = parseInt('0x'+data.slice(2+64*2,2+64*3), 16);
      let expiration = '0x'+data.slice(2+64*3,2+64*4);
      let nonce = '0x'+data.slice(2+64*4,2+64*5);


      let idx_makerToken = this.tokenAddresses.indexOf(makerToken);
      if (idx_makerToken === -1) {
        this.tokenAddresses.push(makerToken);
        this.tokenAddressesPair.push([takerToken]);
        this.tokenPairStatistics[makerToken] = {}

        idx_makerToken = this.numTokens;
        this.numTokens++;
      }

      let idx_takerToken = this.tokenAddresses.indexOf(takerToken);
      if (idx_takerToken === -1) {
        this.tokenAddresses.push(takerToken);
        this.tokenAddressesPair.push([makerToken]);
        this.tokenPairStatistics[takerToken] = {}

        idx_takerToken = this.numTokens;
        this.numTokens++;
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
    }
  }

  
  dropdownUpdated(): void {
    let previousTaker = this.selectedTakerToken;
    this.dropdownTakerTokens = this.dropdownTokens.slice(0);
    this.dropdownTakerTokens.splice(this.selectedMakerToken.id, 1);

    if(previousTaker == undefined || previousTaker.id == this.selectedMakerToken.id) 
      this.selectedTakerToken = this.dropdownTakerTokens[0].value;
    else 
      this.selectedTakerToken = this.dropdownTokens[previousTaker.id].value;
    this.basicChart();
  }

  get_tokenPairs(token): any {
    return this.tokenPairStatistics[token]
  }

  get_pairStatistic(token, tokenPair): Array<any> {
    return this.tokenPairStatistics[token][tokenPair];
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
