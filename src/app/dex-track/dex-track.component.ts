import { Component, OnInit, OnDestroy, NgZone, ViewChild, ElementRef } from '@angular/core';
import { DecimalPipe } from '@angular/common';
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
  public AirSwapFilledEvent = '0xe59c5e56d85b2124f5e7f82cb5fcc6d28a4a241a9bdd732704ac9d3b6bfc98ab';
    
  public etherscan_token = '8FWC8GZWSE8SJKY7NBSE77XER4KQ8NXK1Z';

  public first_block: number;
  public latest_block: number;


  public numTokens = 0;

  public tokenAddresses: Array<string> = [];
  public tokenAddressesPair: Array<any> = [];

  public tokenProperties = {};
  public tokenPairStatistics = {};
  public combinedMarkets = {};

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
    this.initDexList();
    this.init_timer();
  }

  ngOnDestroy() {
    if(this.timer) this.timer.unsubscribe();
  }

  init_timer(): void {
    this.timer = TimerObservable.create(0, this.refresh_time)
    .subscribe( () => this.updateDexLists())
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

  timeChart() {
    let all_tx = this.tokenPairStatistics[this.selectedMakerToken.address][this.selectedTakerToken.address];
    let opposite_tx = this.tokenPairStatistics[this.selectedTakerToken.address][this.selectedMakerToken.address];
    let buySymbol = this.tokenProperties[this.selectedMakerToken.address].symbol;
    let sellSymbol = this.tokenProperties[this.selectedTakerToken.address].symbol;
    let x_data = [];
    let y_data = [];
    for (let tx of all_tx) {
      let price = tx.price;
      let time = new Date(tx.timestamp*1000);
      x_data.push(time);
      y_data.push(price);
    }

    let x_opp_data = [];
    let y_opp_data = [];
    for (let tx of opposite_tx) {
      let price = tx.price;
      let time = new Date(tx.timestamp*1000);
      x_opp_data.push(time);
      y_opp_data.push(1/price);
    }

    const data = [{
      x: x_data,
      y: y_data,
      name: 'Taker buys ' + buySymbol
    },
    {
      x: x_opp_data,
      y: y_opp_data,
      name: 'Taker buys ' + sellSymbol
    }]

    const element = this.el.nativeElement;
    const style = {
      margin: { t: 0 },
      title: buySymbol + '/' + sellSymbol,
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
            {
              count: 7,
              label: '7d',
              step: 'day',
              stepmode: 'backward'
            },
            {step: 'all'}
          ]},
        rangeslider: {range: [Math.min(...x_data), Math.max(...x_data)]},
        type: 'date',
        title: 'Time'
      },
      yaxis: {
        title: buySymbol + '/' + sellSymbol
      }
    }
    Plotly.newPlot( element, data, style )
  }

  get tokens(): any {
    return ERC20_tokens;
  }

  http_get(request: string): Observable<any> {
    return this.http.get(request);
  }

  initDexList(): void {

    // get blocknumber
    this.http_get('https://api.etherscan.io/api?module=proxy&action=eth_blockNumber&apikey='+
                  this.etherscan_token
    ).toPromise()
    .then((blocknumber) => {
      blocknumber = parseInt(blocknumber.result, 16);
      this.first_block = blocknumber - 5838 *7; // 24h for 14.8s block time
      this.latest_block = blocknumber;

      //get all filled events in time frame
      return this.http_get(
      'https://api.etherscan.io/api?module=logs&action=getLogs'+
      '&address='+this.AirSwapDEX+
      '&fromBlock='+this.first_block+
      '&toBlock='+this.latest_block+
      '&topic0='+this.AirSwapFilledEvent+
      '&apikey='+this.etherscan_token
      ).toPromise()
    }).then(DEXtxs => {
      this.tokenAddresses = [];
      this.tokenAddressesPair = [];
      this.tokenPairStatistics = {};
      this.dropdownTokens = [];

      this.evalAirSwapDEX(DEXtxs.result); // go through results of API call and fill arrays
      this.dropdownTokens = this.dropdownTokens.sort((obj1, obj2) => {
        if(obj1.label > obj2.label) return 1;
        if(obj1.label < obj2.label) return -1;
        return 0
      })
      for(let i in this.dropdownTokens) {
        let token = this.dropdownTokens[i];
        token.value.id = i;
      }
      this.combineMarkets();
      this.selectedMakerToken = this.dropdownTokens[0].value;
      this.dropdownUpdated();
      this.tokenInfoLoaded = true;
      this.timeChart();
    }).catch(error => {
      console.log('Http Request failed. Retrying in ' + this.refresh_time/1e3);
    })
  }

  updateDexLists(): void {
    this.http_get('https://api.etherscan.io/api?module=proxy&action=eth_blockNumber&apikey='+
                  this.etherscan_token
    ).toPromise()
    .then((blocknumber) => {
      blocknumber = parseInt(blocknumber.result, 16);
      let new_first_block = this.latest_block + 1;
      this.latest_block = blocknumber;
      if (this.latest_block > new_first_block) {
        return this.http_get(
        'https://api.etherscan.io/api?module=logs&action=getLogs'+
        '&address='+this.AirSwapDEX+
        '&fromBlock='+new_first_block+
        '&toBlock='+this.latest_block+
        '&topic0='+this.AirSwapFilledEvent+
        '&apikey='+this.etherscan_token
        ).toPromise()
        .then(DEXtxs => {
          if(DEXtxs.status == 1) {
            this.evalAirSwapDEX(DEXtxs.result);
            this.combineMarkets();
            this.timeChart();
          }
        }).catch(error => {
          console.log('Http Request failed. Retrying in ' + this.refresh_time/1e3);
        })
      }
    })
  }

  evalAirSwapDEX(DEXtxs): void {
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

      let makerProps = this.tokenProperties[makerToken];
      let takerProps = this.tokenProperties[takerToken];

      let idx_makerToken = this.tokenAddresses.indexOf(makerToken);
      if (idx_makerToken === -1) {
        this.tokenAddresses.push(makerToken);
        this.tokenAddressesPair.push([takerToken]);
        this.tokenPairStatistics[makerToken] = {}

        this.dropdownTokens.push({label: makerProps.name,
                                  value:{
                                    id:this.dropdownTokens.length,
                                    symbol: makerProps.symbol,
                                    address: makerToken
                                  },
                                  logo: makerProps.logo});

        idx_makerToken = this.numTokens;
        this.numTokens++;
      }

      let idx_takerToken = this.tokenAddresses.indexOf(takerToken);
      if (idx_takerToken === -1) {
        this.tokenAddresses.push(takerToken);
        this.tokenAddressesPair.push([makerToken]);
        this.tokenPairStatistics[takerToken] = {}

        this.dropdownTokens.push({label: takerProps.name,
                                  value:{
                                    id:this.dropdownTokens.length,
                                    symbol:  takerProps.symbol,
                                    address: takerToken
                                  },
                                  logo: takerProps.logo});

        idx_takerToken = this.numTokens;
        this.numTokens++;
      }

      if(this.tokenPairStatistics[makerToken][takerToken] === undefined) {
        this.tokenPairStatistics[makerToken][takerToken] = [];
      }

      this.tokenPairStatistics[makerToken][takerToken].push({
        'buyAmount': makerAmount / makerProps.decimal,
        'buySymbol': makerProps.symbol,
        'sellAmount': takerAmount / takerProps.decimal,
        'sellSymbol': takerProps.symbol,
        'price': takerAmount / takerProps.decimal / (makerAmount / makerProps.decimal),
        'gasPrice': gasPrice,
        'gasUsed': gasUsed,
        'gasCost': gasCost,
        'timestamp': timestamp,
        'makerAddress': makerAddress,
        'takerAddress': takerAdress
      })
    }
  }

  combineMarkets(): void {
    this.combinedMarkets = {}
    for(let makerToken in this.tokenPairStatistics) {
      this.combinedMarkets[makerToken] = {};
      for(let takerToken in this.tokenPairStatistics[makerToken]) {
        let stats = this.tokenPairStatistics[makerToken][takerToken];
        let opposite_market = this.tokenPairStatistics[takerToken][makerToken];
        if (opposite_market !== undefined && opposite_market.length > 0){
          let copy_opposite_market = opposite_market.map(x => Object.assign({}, x));
          for(let tx of copy_opposite_market) {
            tx.price = 1/tx.price;
          }
          stats = stats.concat(copy_opposite_market)
        }
        let sorted_stats = stats.sort((obj1, obj2) => {
          if(obj1.timestamp > obj2.timestamp) return 1;
          if(obj1.timestamp < obj2.timestamp) return -1;
          return 0;
        })
        this.combinedMarkets[makerToken][takerToken] = sorted_stats;
      }
    }
  }

  dropdownUpdated(): void {
    let previousTaker = this.selectedTakerToken;
    this.dropdownTakerTokens = this.dropdownTokens.map(x => Object.assign({}, x));
    this.dropdownTakerTokens.splice(this.selectedMakerToken.id, 1);

    if(previousTaker == undefined || previousTaker.id == this.selectedMakerToken.id) 
      this.selectedTakerToken = this.dropdownTakerTokens[0].value;
    else 
      this.selectedTakerToken = this.dropdownTokens[previousTaker.id].value;
    this.timeChart();
  }

  get_tokenPairs(token): any {
    return this.tokenPairStatistics[token]
  }

  get_pairStatistic(token, tokenPair): Array<any> {
    let stats = this.combinedMarkets[token][tokenPair];
    return stats;
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
