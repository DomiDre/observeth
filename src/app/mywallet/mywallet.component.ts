import { Component, OnInit, NgZone } from '@angular/core';
import { Web3ConnectService } from '../shared/web3-connect.service';
import { TxTreaterService } from '../shared/tx-treater.service';
import { Mindmap } from '../shared/mindmap';
import { Subscription } from 'rxjs/Subscription';
import { TXData } from '../shared/txData';

import { MywalletOptionsComponent } from './mywallet-options/mywallet-options.component';
import { MywalletOptionsService } from './mywallet-options.service';

import { FiltersComponent } from '../shared/filters/filters.component';
import { FiltersService } from '../shared/filters/filters.service';

import { StatisticsComponent } from '../shared/statistics/statistics.component';
import { StatisticsService } from '../shared/statistics/statistics.service';

import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs'

@Component({
  selector: 'app-mywallet',
  templateUrl: './mywallet.component.html',
  styleUrls: ['./mywallet.component.css'],
  providers: [ MywalletOptionsService, FiltersService, StatisticsService]
})
export class MywalletComponent implements OnInit {

  private subscription_options: Subscription;
  private subscription_filter: Subscription;
  private subscription_statistics: Subscription;
  public mindmap: Mindmap;

  public etherscan_token = '8FWC8GZWSE8SJKY7NBSE77XER4KQ8NXK1Z'

  public accountAddress: string;
  public firstBlockNumber: number;
  public latestBlockNumber: number;
  public tree_depth: number;
  public transactionList: Array<TXData>;
  public raw_txdata: any;

  public filtered_nodeId: Array<any>;
  public filtered_adjacencyList: Array<any>;

  public max_reached_depth: number = 0;

  constructor(private zone: NgZone,
              private web3service: Web3ConnectService,
              private txtreaterService: TxTreaterService,
              
              private optionService: MywalletOptionsService,
              private filtersService: FiltersService,
              private statisticsService: StatisticsService,
              private http: HttpClient
              ) { }


  ngOnInit() {
    this.accountAddress = '0x465fA41ce86e23d808a402e82D2b87eD19eeB282'.toLowerCase();
    this.firstBlockNumber = 0//4700000
    this.latestBlockNumber= 99999999
    this.http_get('https://api.etherscan.io/api?module=stats&action=ethsupply&apikey='+this.etherscan_token)
    .toPromise().then(res => {this.txtreaterService.coin_supply = res.result;})
    this.tree_depth = 2;

    this.subscription_options = this.optionService.connectObservable()
                        .subscribe((data) => {
                          this.firstBlockNumber = data.from;
                          this.latestBlockNumber = data.to;
                          this.updateData();
                        });

    this.subscription_filter = this.filtersService.connectObservable()
    .subscribe(() => {
      if (this.transactionList !== undefined) {
        this.updatePlot()
      }
    })

    this.subscription_statistics = this.statisticsService.connectObservable()
    .subscribe(() => {})
    
    this.txtreaterService.disableTokenSetup();
    this.filtersService.setTokenMode(false);
    this.mindmap = new Mindmap(this.zone, this.txtreaterService);

    this.updateData();
  }

  updateData(): void {
    this.mindmap.in_loading_status = true;
    
    this.txtreaterService.reset_lists();
    this.mindmap.status = 'Reading address ' + this.accountAddress;
    this.transactionList = new Array<any>();
    
    //get tx of your account as start point
    this.http_get('http://api.etherscan.io/api?module=account&action=txlist'+
              '&address='+this.accountAddress+
              '&startblock='+this.firstBlockNumber+
              '&endblock='+this.latestBlockNumber+
              '&sort=desc'+
              '&apikey='+this.etherscan_token+
              '&page=1'+
              '&offset=100')
    .toPromise()
    .then(res => {
      let tx_list = res.result;
      this.mindmap.status = 'Reading & Sorting transactions...';
      this.recursive_eval_tx_list(tx_list, this.accountAddress, 0, 0)
      .then(() => {
        console.log('All done. Max reached depth: ' + this.max_reached_depth)
        return this.txtreaterService.readTxList(this.transactionList)
      }).then(() => this.updatePlot())
    })
  }

  http_get(request: string): Observable<any> {
    return this.http.get(request);
  }

  add_tx_to_txList(tx_element: TXData) {
    let txEntry = new TXData();
    txEntry.from = tx_element.from;
    txEntry.hash = tx_element.hash;
    txEntry.value = this.web3service.toDecimal(tx_element.value);
    txEntry.to = tx_element.to || tx_element.from;
    txEntry.gas = tx_element.gas;
    txEntry.gasPrice = tx_element.gasPrice;
    txEntry.blockNumber = tx_element.blockNumber;
    txEntry.timeStamp = tx_element.timeStamp*1000;

    this.transactionList.push(txEntry);
  }

  recursive_eval_tx_list(tx_list, node_address: string, depth:number, direction: number): Promise<any> {
    if (depth > this.max_reached_depth) {
      this.max_reached_depth = depth;
      this.mindmap.status = 'Reading & Sorting transactions... Depth level reached: '+depth;
    }
    console.log('Depth: ', depth);

    let outgoing_tx: boolean;
    let added_inc_addresses = [];
    let added_out_addresses = [];

    let PromiseList = [];

    for(let i=0; i<tx_list.length; i++) {
      let from = tx_list[i].from;
      let to = tx_list[i].to;

      outgoing_tx = (from == node_address);
      // check if its multiple tx with another node
      if (outgoing_tx) {
        if (added_out_addresses.indexOf(to) > -1) continue; // already in list
        else added_out_addresses.push(to);
      } else {
        if (added_inc_addresses.indexOf(from) > -1) continue; // already in list
        else added_inc_addresses.push(from);
      }

      if (from == to) { // contract creation
        this.add_tx_to_txList(tx_list[i]);
        continue
      }
      
      if ((direction < 0 && outgoing_tx) || (direction > 0 && !outgoing_tx)) 
        continue;
      else
        this.add_tx_to_txList(tx_list[i]);

      if (depth<this.tree_depth) {
        let nextPromise: Promise<any>;
        if (outgoing_tx) {
          nextPromise = this.http_get('http://api.etherscan.io/api?module=account&action=txlist'+
              '&address='+to+
              '&startblock='+tx_list[i].blockNumber+
              '&endblock='+this.latestBlockNumber+
              '&sort=asc'+
              '&apikey='+this.etherscan_token+
              '&page=1'+
              '&offset=100')
          .toPromise()
          .then(res => {
              let next_level_tx_data = res.result;
              return this.recursive_eval_tx_list(next_level_tx_data, to,
                                                 depth+1, 1)
          }).catch(err => {console.log('Error reading outgoing tx: ', to)})
        } else {
          nextPromise = this.http_get('http://api.etherscan.io/api?module=account&action=txlist'+
              '&address='+from+
              '&startblock='+this.firstBlockNumber+
              '&endblock='+tx_list[i].blockNumber+
              '&sort=desc'+
              '&apikey='+this.etherscan_token+
              '&page=1'+
              '&offset=100')
          .toPromise()
          .then(res => {
              let next_level_tx_data = res.result;
              return this.recursive_eval_tx_list(next_level_tx_data, from,
                                                 depth+1, -1)
          }).catch(err => {console.log('Error reading incoming tx: ', from)})
        }
        PromiseList.push(nextPromise);          
      }
    }
    return Promise.all(PromiseList);
  }

  // read_tx_leaf(tx_list, depth): void {
    
  //   for(let i=0; i<tx_list.length; i++) {
  //     let txEntry = new TXData();
  //     txEntry.from = tx_list[i].from
  //     txEntry.hash = tx_list[i].hash
  //     txEntry.value = tx_list[i].value
  //     txEntry.to = tx_list[i].to
  //     this.transactionList.push(txEntry);
  //     if ((depth<this.tree_depth) && (txEntry.from == this.accountAddress)) {
  //       this.http_get('http://api.etherscan.io/api?module=account&action=txlist'+
  //             '&address='+txEntry.to+
  //             '&startblock='+tx_list[i].blockNumber+
  //             '&endblock='+this.latestBlockNumber+
  //             '&sort=desc'+
  //             '&apikey='+this.etherscan_token)
  //           .toPromise()
  //           .then(res => {
  //             let lower_level_tx_data = res.result;
  //             console.log(lower_level_tx_data)
  //             this.read_tx_leaf(lower_level_tx_data, depth+1, promiseList)

  //     }
  //   }
      
  // }

  updatePlot(): void {
    this.mindmap.status = 'Applying filters.';
    [this.filtered_nodeId, this.filtered_adjacencyList] =
      this.filtersService.filtered_transactions()
    this.txtreaterService.setNodeList(this.filtered_nodeId);
    this.txtreaterService.setEdgeList(this.filtered_adjacencyList);
    this.zone.run(() => this.mindmap.drawMindMap())
  }

  toggleOptions(): void {
    this.optionService.openOptions();
  }

  toggleFilters(): void {
    this.filtersService.openFilters();
  }
  
  toggleStatistics(): void {
    this.statisticsService.openStatistics();    
  }
}
