import { Component, OnInit, OnDestroy, Input, NgZone } from '@angular/core';
import { Web3ConnectService } from '../shared/web3-connect.service';
import { TxTreaterService } from '../shared/tx-treater.service';
import { TXData } from '../shared/txData';

import { OptionsService } from './etheroptions.service'
import { Mindmap } from '../shared/mindmap';
import { Subscription } from 'rxjs/Subscription';

import { FiltersComponent } from '../shared/filters/filters.component';
import { FiltersService } from '../shared/filters/filters.service';

import { StatisticsComponent } from '../shared/statistics/statistics.component';
import { StatisticsService } from '../shared/statistics/statistics.service';

import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs'

@Component({
  selector: 'app-ether-observer',
  templateUrl: './ether-observer.component.html',
  styleUrls: ['./ether-observer.component.css'],
  providers: [ OptionsService, FiltersService, StatisticsService ]
})
export class EtherObserverComponent implements OnInit, OnDestroy {

  @Input() public numBlocks: number=100;

  private transactionList: Array<TXData>;

  private tokenContractAddress: string;
  private firstBlockNumber: number;
  private latestBlockNumber: number;

  private processingBlockNumber: number;
  
  public mindmap: Mindmap;

  private ERC20_contract: any;

  private subscription_options: Subscription;
  private subscription_filter: Subscription;
  private subscription_statistics: Subscription;

  public filtered_nodeId: Array<any>;
  public filtered_adjacencyList: Array<any>;

  constructor(private zone: NgZone,
              private web3service: Web3ConnectService,
              private txtreaterService: TxTreaterService,
              private optionService: OptionsService,
              private filtersService: FiltersService,
              private statisticsService: StatisticsService,
              private http: HttpClient) { }
  ngOnInit() {
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
    this.http_get('https://api.etherscan.io/api?module=stats&action=ethsupply&apikey=8FWC8GZWSE8SJKY7NBSE77XER4KQ8NXK1Z')
    .toPromise().then(res => {this.txtreaterService.coin_supply = res.result;})
    this.toggleOptions();
    // this.toggleFilters();
  }

  http_get(request: string): Observable<any> {
    return this.http.get(request);
  }

  ngOnDestroy() {
    this.subscription_options.unsubscribe();
    this.subscription_filter.unsubscribe();
    this.subscription_statistics.unsubscribe();
  }

  updateData(): void {
    this.mindmap.in_loading_status = true;
    this.txtreaterService.reset_lists();
    this.transactionList = new Array<any>();
    
    this.mindmap.status = 'Getting all tx between block ' + 
      this.firstBlockNumber + ' and ' + this.latestBlockNumber;
    
    let transactionList = [];
    let promiseBlockInfos = [];
    let num_blocks = this.latestBlockNumber - this.firstBlockNumber + 1;


    for(let i=0; i<num_blocks; i++) {
      let block_number = this.firstBlockNumber+i
      let promise = new Promise((resolve, reject) => {
        this.web3service.getBlock(block_number)
        .then((block_i) => {
            if (block_i !== null)
              transactionList[i] = block_i.transactions;
            else {
              console.log('Error occured at fetching block ', block_number);
            }
            resolve();
        })
        .catch((error) => {})
      });
      promiseBlockInfos.push(promise)
    }
    
    Promise.all(promiseBlockInfos)
    .then(() => {
      this.transactionList = []
      for(let i=0; i<num_blocks; i++) {
        for(let j=0; j<transactionList[i].length;j++) {
          let tx_element = transactionList[i][j]
          let txEntry = new TXData();
          txEntry.from = tx_element.from;
          txEntry.hash = tx_element.hash;
          txEntry.value = this.web3service.toDecimal(tx_element.value);
          txEntry.to = tx_element.to || tx_element.from;
          txEntry.gas = tx_element.gas;
          txEntry.gasPrice = tx_element.gasPrice;
          txEntry.blockNumber = tx_element.blockNumber;
          
          if ((txEntry.from != undefined) && txEntry.to != undefined)
            this.transactionList.push(txEntry);
        }
      }
      this.mindmap.status = 'Evaluating blocks.';
      this.txtreaterService.readTxList(this.transactionList)
      .then(() => this.updatePlot())
    })
  }
  
  updatePlot(): void {
    this.mindmap.status = 'Applying filters.';
    [this.filtered_nodeId, this.filtered_adjacencyList] =
      this.filtersService.filtered_transactions()
    this.txtreaterService.setNodeList(this.filtered_nodeId);
    this.txtreaterService.setEdgeList(this.filtered_adjacencyList);

    this.mindmap.drawMindMap();
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