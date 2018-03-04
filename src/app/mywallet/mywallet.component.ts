import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { Web3ConnectService } from '../shared/web3-connect.service';
import { TxTreaterService } from '../shared/tx-treater.service';
import { Mindmap } from '../shared/mindmap';
import { Router } from '@angular/router';
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
export class MywalletComponent implements OnInit, OnDestroy {

  private subscription_options: Subscription;
  private subscription_filter: Subscription;
  private subscription_statistics: Subscription;
  public mindmap: Mindmap;

  public etherscan_token = '8FWC8GZWSE8SJKY7NBSE77XER4KQ8NXK1Z'

  public accountAddress: string;
  public firstBlockNumber: number;
  public latestBlockNumber: number;
  public tree_depth: number;
  public maxTXperNode: number;
  public transactionList: Array<TXData>;

  public filtered_nodeId: Array<any>;
  public filtered_adjacencyList: Array<any>;

  constructor(private zone: NgZone,
              private router: Router,
              private web3service: Web3ConnectService,
              private txtreaterService: TxTreaterService,
              
              private optionService: MywalletOptionsService,
              private filtersService: FiltersService,
              private statisticsService: StatisticsService,
              private http: HttpClient
              ) { }


  ngOnInit() {
    this.http_get('https://api.etherscan.io/api?module=stats&action=ethsupply&apikey='+this.etherscan_token)
    .toPromise().then(res => {this.txtreaterService.coin_supply = res.result;})
    
    // initialize subscriptions
    this.subscription_options = this.optionService.connectObservable()
                        .subscribe((data) => {
                          this.accountAddress = data.contractAddress;
                          this.firstBlockNumber = data.from;
                          this.latestBlockNumber = data.to;
                          this.tree_depth = data.treeDepth;
                          this.maxTXperNode = data.maxTXperNode;
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

    // initialize mindmap
    this.txtreaterService.disableTokenSetup();
    this.filtersService.setTokenMode(false);
    this.mindmap = new Mindmap(this.zone, this.txtreaterService);

    console.log('My Wallet connecting ... ')
    this.web3service.isConnected()
    .then((isConnected) => {
      if(!isConnected) {
        console.log('No connection...')
        this.router.navigateByUrl('/NoMetamask');
      } else {
        this.toggleOptions()
      }
    });
  }

  ngOnDestroy() {
    if(this.subscription_options) this.subscription_options.unsubscribe();
    if(this.subscription_filter) this.subscription_filter.unsubscribe();
    if(this.subscription_statistics) this.subscription_statistics.unsubscribe();
  }

  updateData(): void {
    this.mindmap.in_loading_status = true;
    this.accountAddress = this.accountAddress.toLowerCase();
    this.txtreaterService.reset_lists();
    this.mindmap.status = 'Reading address ' + this.accountAddress;
    this.transactionList = new Array<any>();
    
    let promiseChain = [];
    let reached_depth = 0;
    //get tx of your account as start point
    let promiseLoop: (currentLevel: Array<any>) => Promise<any>  = (currentLevel) => {
      if (currentLevel.length == 0) {
        return Promise.resolve();
      } else {
        return new Promise((resolve, reject) => {
          reached_depth++;
          this.mindmap.status = 'Getting level ' + reached_depth;
          this.get_next_level(currentLevel)
          .then((nextLevel) => {
            this.mindmap.status = 'Fetched tx for level ' + reached_depth + '. Evaluating';
            let next_current_level = [];
            for(let i=0; i<nextLevel.length; i++) {
              let node = nextLevel[i];
              if (node == undefined || node.tx_list == null) continue;
              let current_level_addend =
                this.evaluate_node(node.tx_list, node.node_address, 
                                   node.depth, node.direction);
              next_current_level = next_current_level.concat(current_level_addend);
            }
            resolve(next_current_level)
          });
        }).then(promiseLoop);
      }
    };

    this.http_get('https://api.etherscan.io/api?module=account&action=txlist'+
              '&address='+this.accountAddress+
              '&startblock='+this.firstBlockNumber+
              '&endblock='+this.latestBlockNumber+
              '&sort=desc'+
              '&apikey='+this.etherscan_token+
              '&page=1'+
              '&offset='+this.maxTXperNode)
    .toPromise()
    .then(res => {
      this.mindmap.status = 'Fetched tx for level 0. Evaluating';
      let current_level = this.evaluate_node(res.result, this.accountAddress, 0, 0);
      return current_level
    }).then(promiseLoop)
    .then(() => {
      return this.txtreaterService.readTxList(this.transactionList)
    }).then(() => this.updatePlot())

      // {
      //     this.mindmap.status = 'Fetched tx for level 1. Evaluating';
      //     let current_level = [];
      //     for(let i=0; i<nextLevel.length; i++) {
      //       let node = nextLevel[i];
      //       if (node == undefined || node.tx_list == null) continue;
      //       let current_level_addend =
      //         this.evaluate_node(node.tx_list, node.node_address, 
      //                            node.depth, node.direction);
      //       current_level = current_level.concat(current_level_addend);
      //     }
      //     return current_level
      // }).then(current_level => {
      //   this.mindmap.status = 'Getting level 2.';
      //   return this.get_next_level(current_level)

      // }).then(nextLevel => {
      //   this.mindmap.status = 'Fetched tx for level 2. Evaluating';
      //   let current_level = [];
      //   for(let i=0; i<nextLevel.length; i++) {
      //     let node = nextLevel[i];
      //     if (node == undefined || node.tx_list == null) continue;
      //     let current_level_addend =
      //       this.evaluate_node(node.tx_list, node.node_address, 
      //                          node.depth, node.direction);
      //     current_level = current_level.concat(current_level_addend);
      //   }
      // })
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
    if ((txEntry.from != undefined) && txEntry.to != undefined)
      this.transactionList.push(txEntry);
  }

  evaluate_node(tx_list, node_address: string, depth:number, direction: number): Array<any> {
    //sync method
    let added_inc_addresses = [];
    let added_out_addresses = [];
    let outgoing_tx: boolean;
    
    let next_level_tx: Array<any> = []; 
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

      if (from == to) { // contract creation or pointing to itself
        this.add_tx_to_txList(tx_list[i]);
        continue
      }
      
      if ((direction < 0 && outgoing_tx) || (direction > 0 && !outgoing_tx)) 
        continue;
      else { // these are the tx of interest: moving into the direction of interest
        this.add_tx_to_txList(tx_list[i]);
        
        if (depth < this.tree_depth) {
          if (outgoing_tx) 
            next_level_tx.push({
              'node_address': to,
              'direction': 1,
              'depth': depth+1,
              'blockNumber': tx_list[i].blockNumber
            })
          else
            next_level_tx.push({
              'node_address': from,
              'direction': -1,
              'depth': depth+1,
              'blockNumber': tx_list[i].blockNumber
            })
        }
      }
    }
    return next_level_tx;
  }

  get_outgoing_tx(node_address, blockNumber): Promise<any> {
    return this.http_get('https://api.etherscan.io/api?module=account&action=txlist'+
      '&address='+node_address+
      '&startblock='+blockNumber+
      '&endblock='+this.latestBlockNumber+
      '&sort=asc'+
      '&apikey='+this.etherscan_token+
      '&page=1'+
      '&offset='+this.maxTXperNode)
      .toPromise()
  }
  
  get_incoming_tx(node_address, blockNumber): Promise<any> {
    return this.http_get('https://api.etherscan.io/api?module=account&action=txlist'+
      '&address='+node_address+
      '&startblock='+this.firstBlockNumber+
      '&endblock='+blockNumber+
      '&sort=desc'+
      '&apikey='+this.etherscan_token+
      '&page=1'+
      '&offset='+this.maxTXperNode)
      .toPromise()
  }

  get_tx(node_address, blockNumber, direction): Promise<any> {
    if (direction > 0) {
      return this.get_outgoing_tx(node_address, blockNumber);
    } else {
      return this.get_incoming_tx(node_address, blockNumber);
    }
  }

  PromiseLoopGetTx(i, tx, callback): Promise<any> {
    return this.get_tx(tx.node_address, tx.blockNumber, tx.direction)
    .then((res) => callback(res, i, tx))
    .catch((err) => {console.log('Error while requestion data at '+ tx.depth+
                                 ' node #' + i + '. Waiting 2s and retrying.');
                     setTimeout(2000);
                     this.PromiseLoopGetTx(i, tx, callback)})
  }

  get_next_level(current_level_tx: Array<any>): Promise<any> {
    let PromiseList = [];
    let nextLevel: Array<any> = [];
    let nodes_left: number;
    let errous_nodes: Array<any> = [];

    let total_nodes: number = current_level_tx.length;
    nodes_left = total_nodes;

    let callback = (res, i, tx) => {
      nodes_left--;
      this.mindmap.status = 'Treating depth ' + tx.depth + '. Still need to get data for ' + nodes_left + ' nodes.'
      nextLevel[i] = {
        'tx_list': res.result,
        'direction': tx.direction,
        'depth': tx.depth,
        'node_address': tx.node_address
      }
    }

    for(let i=0; i<total_nodes; i++)
      PromiseList.push(this.PromiseLoopGetTx(i, current_level_tx[i], callback));

    return Promise.all(PromiseList)
    .then(result => {
      return nextLevel
    });
  }

  // recursive_eval_tx_list(tx_list, node_address: string, depth:number, direction: number): Promise<any> {
  //   if (depth > this.max_reached_depth) {
  //     this.max_reached_depth = depth;
  //     this.mindmap.status = 'Reading & Sorting transactions... Depth level reached: '+depth+'/'+this.tree_depth+
  //                           '\nThis might take a few minutes...';
  //   }
  //   console.log('Depth: ', depth);

  //   let outgoing_tx: boolean;
  //   let added_inc_addresses = [];
  //   let added_out_addresses = [];

  //   let PromiseList = [];

  //   for(let i=0; i<tx_list.length; i++) {
  //     let from = tx_list[i].from;
  //     let to = tx_list[i].to;

  //     outgoing_tx = (from == node_address);
  //     // check if its multiple tx with another node
  //     if (outgoing_tx) {
  //       if (added_out_addresses.indexOf(to) > -1) continue; // already in list
  //       else added_out_addresses.push(to);
  //     } else {
  //       if (added_inc_addresses.indexOf(from) > -1) continue; // already in list
  //       else added_inc_addresses.push(from);
  //     }

  //     if (from == to) { // contract creation
  //       this.add_tx_to_txList(tx_list[i]);
  //       continue
  //     }
      
  //     if ((direction < 0 && outgoing_tx) || (direction > 0 && !outgoing_tx)) 
  //       continue;
  //     else
  //       this.add_tx_to_txList(tx_list[i]);

  //     if (depth<this.tree_depth) {
  //       let nextPromise: Promise<any>;
  //       if (outgoing_tx) {
  //         nextPromise = this.http_get('http://api.etherscan.io/api?module=account&action=txlist'+
  //             '&address='+to+
  //             '&startblock='+tx_list[i].blockNumber+
  //             '&endblock='+this.latestBlockNumber+
  //             '&sort=asc'+
  //             '&apikey='+this.etherscan_token+
  //             '&page=1'+
  //             '&offset=100')
  //         .toPromise()
  //         .then(res => {
  //             let next_level_tx_data = res.result;
  //             return this.recursive_eval_tx_list(next_level_tx_data, to,
  //                                                depth+1, 1)
  //         }).catch(err => {console.log('Error reading outgoing tx: ', to)})
  //       } else {
  //         nextPromise = this.http_get('http://api.etherscan.io/api?module=account&action=txlist'+
  //             '&address='+from+
  //             '&startblock='+this.firstBlockNumber+
  //             '&endblock='+tx_list[i].blockNumber+
  //             '&sort=desc'+
  //             '&apikey='+this.etherscan_token+
  //             '&page=1'+
  //             '&offset=100')
  //         .toPromise()
  //         .then(res => {
  //             let next_level_tx_data = res.result;
  //             return this.recursive_eval_tx_list(next_level_tx_data, from,
  //                                                depth+1, -1)
  //         }).catch(err => {console.log('Error reading incoming tx: ', from)})
  //       }
  //       PromiseList.push(nextPromise);          
  //     }
  //   }
  //   return Promise.all(PromiseList);
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
