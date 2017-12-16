import { Component, OnInit, OnDestroy, Input, NgZone, ElementRef } from '@angular/core';
import { Web3ConnectService } from '../shared/web3-connect.service';
import { TxTreaterService } from '../shared/tx-treater.service';
import { TXData } from '../shared/txData';
import * as vis from 'vis';
import { ERC20_abi } from '../shared/erc20'
import { OptionsService } from './etheroptions.service'
import { Mindmap } from '../shared/mindmap';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-ether-observer',
  templateUrl: './ether-observer.component.html',
  styleUrls: ['./ether-observer.component.css'],
  providers: [ OptionsService ]
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

  constructor(private zone: NgZone,
              private web3service: Web3ConnectService,
              private txtreaterService: TxTreaterService,
              private element: ElementRef,
              private optionService: OptionsService) { }

  ngOnInit() {
    this.subscription = this.optionService.connectObservable()
                        .subscribe((data) => {
                          this.firstBlockNumber = data.from;
                          this.latestBlockNumber = data.to;
                          this.updateData();
                        });
    this.mindmap = new Mindmap(this.zone, this.txtreaterService);
    this.txtreaterService.coin_supply =  96371155; // don't hardcode this
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
            resolve();
        })
        .catch((error) => {})
      }).then( () => {
        console.log(typeof(block_number), block_number)
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
    
  }
}


      

  // removeLeadingZeros(data): string {
  //   let byteData = this.web3service.web3.utils.hexToBytes(data);
  //   for (let i = 0; i < byteData.length; i++) {
  //     if (byteData[0] == 0) {
  //       byteData.splice(0, 1);
  //     }
  //   }
  //   return this.web3service.web3.utils.bytesToHex(byteData);
  // }

  // evaluateLogs(logs): void {
  //   let TransferHex = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
  //   let ApproveHex = '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925';

  //   for(let txData of logs) {
  //     let methodId = txData.topics['0'];
  //     if (methodId === TransferHex) { // transfer: 1 transfers to 2 
  //       let txEntry = new TXData();
  //       txEntry.hash = txData.transactionHash;
  //       // check 1e18 factor
  //       txEntry.value = this.web3service.web3.utils.hexToNumberString(txData.data);
  //       txEntry.from = this.removeLeadingZeros(txData.topics['1']);
  //       txEntry.to = this.removeLeadingZeros(txData.topics['2']);
  //       this.transactionList.push(txEntry);
  //     } else if (methodId == ApproveHex) { // approve: you allowed somebody else to withdraw from your account
  //       // not implemented yet
  //     } else {
  //       console.log(methodId,' not known, check ', txData.transactionHash,'. Please report this.');
  //     }
  //     this.processingBlockNumber = txData.blockNumber;          
  //   }
  // }
