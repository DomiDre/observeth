import { Component, OnInit, OnDestroy, NgZone, ViewChild, ElementRef } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs'
import { ERC20_tokens } from '../shared/erc20';
import { TimerObservable } from 'rxjs/observable/TimerObservable';

import * as d3 from 'd3';

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
  public numberOfBlock = 5838 * 14 // 14 days
  @ViewChild('chart') el: ElementRef;

  public test_tokens: any;

  public dropdownTokens: Array<any>;
  public dropdownMakerTokens: Array<any>;
  public dropdownTakerTokens: Array<any>;

  public isPlotOHLC: boolean = true;

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

  updateData() {
    // do something that the table updates
    this.plot();
  }

  plot() {
    if (this.isPlotOHLC) this.plotOHLC();
    else this.timeChart();
  }

  timeChart() {
    let all_tx = this.tokenPairStatistics[this.selectedMakerToken.address][this.selectedTakerToken.address];
    let opposite_tx = this.tokenPairStatistics[this.selectedTakerToken.address][this.selectedMakerToken.address];
    let buySymbol = this.tokenProperties[this.selectedMakerToken.address].symbol;
    let sellSymbol = this.tokenProperties[this.selectedTakerToken.address].symbol;
    
    let increasingColor = '#008837';
    let decreasingColor = '#ca0020';

    let x_data = [];
    let y_data = [];

    let x_volume = [];
    let y_volume = [];
    let y_volprice = [];
    for (let tx of all_tx) {
      let price = tx.price;
      let time = new Date(tx.timestamp*1000);
      x_data.push(time);
      y_data.push(price);

      y_volprice.push(price);
      x_volume.push(time);
      y_volume.push(tx.buyAmount);

    }

    let x_opp_data = [];
    let y_opp_data = [];
    for (let tx of opposite_tx) {
      let price = 1/tx.price;
      let time = new Date(tx.timestamp*1000);
      x_opp_data.push(time);
      y_opp_data.push(price);

      x_volume.push(time);
      y_volume.push(tx.sellAmount);
      y_volprice.push(price);
    }
    
    let volumeColors = [];
    for(let i in y_volprice) {
      if(+i > 0) {
          if(y_volprice[+i] > y_volprice[+i-1]){
            volumeColors.push(increasingColor);
          } else {
            volumeColors.push(decreasingColor)
          }
      } else {
        volumeColors.push(decreasingColor)
      }
    }

    let traceBuy = {
      x: x_data,
      y: y_data,
      xaxis:'x',
      yaxis:'y2',
      name: 'Taker buys ' + buySymbol,
      line: {color: increasingColor}
    }
    let traceSell = {
      x: x_opp_data,
      y: y_opp_data,
      xaxis:'x',
      yaxis:'y2',
      name: 'Taker buys ' + sellSymbol,
      line: {color: decreasingColor}
    }
    let volumeTrace = {
      x: x_volume,
      y: y_volume,                         
      marker: {color: volumeColors},
      type: 'bar',
      xaxis:'x',
      yaxis:'y',
      name:'Volume'
    }


    let data = [traceBuy, traceSell, volumeTrace]
    let element = this.el.nativeElement;
    let style = {
      showlegend: false, 
      title: buySymbol + '/' + sellSymbol,
      xaxis: {
        autorange: true,
        // range: [Math.min(...x_data), Math.max(...x_data)],
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
          {
            count: 14,
            label: '14d',
            step: 'day',
            stepmode: 'backward'
          },
            {step: 'all'}
        ]},
        rangeslider: {
           visible: false
        },
        // rangeslider: {range: [Math.min(...x_data), Math.max(...x_data)]},
        type: 'date',
        title: 'Time'
      }, 
      yaxis: {
        autorange: true,
        domain: [0., 0.2],
        // showticklabels: false,
      },
      yaxis2: {
        type: 'linear',
        autorange: true, 
        title: buySymbol + '/' + sellSymbol,
        domain: [0.25, 1]
      }
      // yaxis: {
      //   title: buySymbol + '/' + sellSymbol
      // }
    }
    Plotly.newPlot( element, data, style )
    window.onresize = () => {
      Plotly.Plots.resize(element);
    }
  }

  convertToOHLC(data) { 
    // from https://stackoverflow.com/questions/42064703/convert-data-to-ohlc-open-high-low-close-in-javascript
    data.sort((a, b) => d3.ascending(a.timestamp, b.timestamp));
    let result = [];
    let format = d3.timeFormat("%Y-%m-%d");
    data.forEach(d => d.timestamp = format(new Date(d.timestamp * 1000)));
    let allDates = [...Array.from(new Set(data.map(d => d.timestamp)))];
    allDates.forEach(d => {
        let tempObject = {};
        let filteredData = data.filter(e => e.timestamp === d);

        tempObject['timestamp'] = d;
        tempObject['volume'] = d3.sum(filteredData, e=> e.volume);
        tempObject['open'] = filteredData[0].price;
        tempObject['close'] = filteredData[filteredData.length - 1].price;
        tempObject['high'] = d3.max(filteredData, e => e.price);
        tempObject['low'] = d3.min(filteredData, e => e.price);
        result.push(tempObject);
    });
    return result;
  };

  plotOHLC(): void { 
    let all_tx = this.tokenPairStatistics[this.selectedMakerToken.address][this.selectedTakerToken.address];
    let opposite_tx = this.tokenPairStatistics[this.selectedTakerToken.address][this.selectedMakerToken.address];
    let buySymbol = this.tokenProperties[this.selectedMakerToken.address].symbol;
    let sellSymbol = this.tokenProperties[this.selectedTakerToken.address].symbol;
      
    let increasingColor = '#008837';
    let decreasingColor = '#ca0020';

    let tx_data = [];
    for (let tx of all_tx) {
      tx_data.push({'timestamp': tx.timestamp,
                 'price': tx.price,
                 'volume': tx.buyAmount});
    }
    for (let tx of opposite_tx) {
      tx_data.push({'timestamp': tx.timestamp,
                 'price': 1/tx.price,
                 'volume': tx.sellAmount});
    }
    let ohlc_data = this.convertToOHLC(tx_data);

    let date = [];
    let close = [];
    let open = [];
    let high = [];
    let low = [];
    let volume = [];
    for(let data of ohlc_data) {
      date.push(data.timestamp);
      close.push(data.close);
      open.push(data.open);
      high.push(data.high);
      low.push(data.low);
      volume.push(data.volume);
    }

    let trace = {
      x: date,
      close: close,
      open: open,
      high: high,
      low: low,
      increasing: {line: {color: increasingColor},
                   name: ''}, 
      decreasing: {line: {color: decreasingColor},
                   name: ''},
      line: {color: 'rgba(31,119,180,1)'}, 
      type: 'candlestick',
      name: '',
      xaxis: 'x', 
      yaxis: 'y2'
    }

    let volumeColors = [];
    for(let i in close) {
      if(+i > 0) {
          if(close[+i] > close[+i-1]){
            volumeColors.push(increasingColor);
          } else {
            volumeColors.push(decreasingColor)
          }
      } else {
        volumeColors.push(decreasingColor)
      }
    }
    let volumeTrace = {
      x: date,
      y: volume,                         
      marker: {color: volumeColors},
      type: 'bar',
      yaxis:'y',
      name:''
    }

    let element = this.el.nativeElement;
    let data = [trace, volumeTrace];
    let layout = {
      dragmode: 'zoom',
      title: buySymbol + '/' + sellSymbol,
      showlegend: false,
      xaxis: {
        autorange: true,
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
          {
            count: 14,
            label: '14d',
            step: 'day',
            stepmode: 'backward'
          },
          {step: 'all'}
        ]},
        title: 'Time', 
        type: 'date',
        rangeslider: {
           visible: false
        },
      }, 
      yaxis: {
        domain: [0., 0.2],
        autorange: true
      },
      yaxis2: {
        type: 'linear',
        autorange: true, 
        title: buySymbol + '/' + sellSymbol,
        domain: [0.25, 1]
      }

    };

    Plotly.newPlot(element, data, layout);
    window.onresize = () => {
      Plotly.Plots.resize(element);
    }
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
      this.first_block = blocknumber - this.numberOfBlock; // 24h for 14.8s block time
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
      // this.plot();
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
          console.log(DEXtxs);
          if(DEXtxs.status == 1) {
            console.log('Got new data.');
            this.evalAirSwapDEX(DEXtxs.result);
            this.combineMarkets();
            this.updateData();
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
    this.updateData();
  }

  get_tokenPairs(token): any {
    return this.tokenPairStatistics[token]
  }

  get_pairStatistic(token, tokenPair): Array<any> {
    return this.combinedMarkets[token][tokenPair];
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
