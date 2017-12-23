import { Component, OnInit, OnDestroy, Input, NgZone, ElementRef } from '@angular/core';
import { Web3ConnectService } from '../shared/web3-connect.service';
import { TxTreaterService } from '../shared/tx-treater.service';
import { TXData } from '../shared/txData';
import * as vis from 'vis';
import { ERC20_abi } from '../shared/erc20'
import { OptionsService } from './etheroptions.service'
import { Mindmap } from '../shared/mindmap';
import { Subscription } from 'rxjs/Subscription';

import { FiltersComponent } from '../shared/filters/filters.component';
import { FiltersService } from '../shared/filters/filters.service';

@Component({
  selector: 'app-ether-observer',
  templateUrl: './ether-observer.component.html',
  styleUrls: ['./ether-observer.component.css'],
  providers: [ OptionsService, FiltersService ]
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

  private subscription: Subscription;

  public filtered_nodeId: Array<any>;
  public filtered_nodeAddress: Array<any>;
  public filtered_adjacencyList: Array<any>;

  constructor(private zone: NgZone,
              private web3service: Web3ConnectService,
              private txtreaterService: TxTreaterService,
              private element: ElementRef,
              private optionService: OptionsService,
              private filtersService: FiltersService) { }

  ngOnInit() {
    this.subscription = this.optionService.connectObservable()
                        .subscribe((data) => {
                          this.firstBlockNumber = data.from;
                          this.latestBlockNumber = data.to;
                          this.updateData();
                        });
    this.mindmap = new Mindmap(this.zone, this.txtreaterService);
    this.txtreaterService.coin_supply =  96519270; // don't hardcode this
    this.toggleOptions()
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  updateData(): void {
    this.mindmap.in_loading_status = true;
    this.txtreaterService.reset_lists();
    this.transactionList = new Array<any>();
    
    this.mindmap.status = 'Getting all tx between block ' + 
      this.firstBlockNumber + ' and ' + this.latestBlockNumber;
    
    let transactionList = [];
    let promiseLoop: (number) => void = (block_number) => {
      let promise = new Promise((resolve, reject) => {
        this.web3service.getBlock(block_number)
        .then((block_i) => {
            if (block_i !== null)
              transactionList = transactionList.concat(block_i.transactions);
            else {
              console.log('Error occured at block ', block_number);
            }
            resolve();
        })
        .catch((error) => {})
      }).then( () => {
        if (block_number<this.latestBlockNumber) {
          promiseLoop(block_number+1);
        } else {
          this.txtreaterService.readTxList(transactionList)
          .then(() => {
            this.mindmap.status = 'Evaluating blocks.';
            this.txtreaterService.setNodeList();
            this.txtreaterService.setEdgeList();    
            this.mindmap.drawMindMap();
          })
        }
      })
    }
    promiseLoop(this.firstBlockNumber);
  }
  

  toggleOptions(): void {
    this.optionService.openOptions();
  }

  toggleFilters(): void {
    this.filtersService.openFilters();    
  }
}