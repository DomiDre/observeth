import { Component, OnInit, OnDestroy, Input, NgZone, ElementRef } from '@angular/core';
import { Web3ConnectService } from '../shared/web3-connect.service';
import { TxTreaterService } from '../shared/tx-treater.service';
import { TXData } from '../shared/txData';
import * as vis from 'vis';
import { ERC20_abi } from '../shared/erc20'
import { OptionsService } from './options.service'
import { Mindmap } from '../shared/mindmap';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-token-observer',
  templateUrl: './token-observer.component.html',
  styleUrls: ['./token-observer.component.css'],
  providers: [ OptionsService ]
})
export class TokenObserverComponent implements OnInit, OnDestroy {

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
      this.tokenContractAddress = data.contractAddress;
      this.firstBlockNumber = data.from;
      this.latestBlockNumber = data.to;
      this.updateData();
    });
    this.mindmap = new Mindmap(this.zone, this.txtreaterService);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  updateData(): void {
    this.mindmap.in_loading_status = true;
    
    this.txtreaterService.reset_lists();
    this.mindmap.status = 'Reading ERC20 contract ' + this.tokenContractAddress;
    this.transactionList = new Array<any>();
    
    this.ERC20_contract = this.web3service.getERC20Contract(this.tokenContractAddress)
    this.web3service.getERC20details(this.ERC20_contract)
    .then((data) => {
      this.txtreaterService.tokenDecimals = 10**this.web3service.toDecimal(data[0]);
      this.txtreaterService.tokenSymbol = data[1];
      this.txtreaterService.coin_supply = this.web3service.toDecimal(data[2]);
    }).then( () => {
      this.mindmap.status = 'Getting logs between block ' + 
        this.firstBlockNumber + ' and ' + this.latestBlockNumber;
      this.web3service.web3.eth.filter({
        fromBlock: this.firstBlockNumber,
        toBlock: this.latestBlockNumber,
        address: this.tokenContractAddress
      })
      .get((error, logs) => {
        this.evaluateLogs0_20(logs, 
        () => {
          this.mindmap.status = 'Reading TX List';
          this.txtreaterService.readTxList(this.transactionList, this.ERC20_contract)
          .then(() => {
            this.txtreaterService.setNodeList();
            this.txtreaterService.setEdgeList();
          })
          .then(() => 
            this.zone.run(() => 
            this.mindmap.drawMindMap()
            )
          )
        })
      })
    })
  }

  
  evaluateLogs0_20(logs, callback): void {
    let TransferHex = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
    let ApproveHex = '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925';

    for(let txData of logs) {
      let methodId = txData.topics['0'];
      if (methodId === TransferHex) { // transfer: 1 transfers to 2 
        let txEntry = new TXData();
        txEntry.hash = txData.transactionHash;
        
        txEntry.value = this.web3service.toDecimal(txData.data);
        txEntry.from = this.removeLeadingZeros0_20(txData.topics['1']);
        txEntry.to = this.removeLeadingZeros0_20(txData.topics['2']);
        this.transactionList.push(txEntry);
      } else if (methodId == ApproveHex) { // approve: you allowed somebody else to withdraw from your account
        // not implemented yet
      } else {
        console.log(methodId,' not known, check ', txData.transactionHash,'. Please report this.');
      }
      this.processingBlockNumber = txData.blockNumber;
    }
    callback();
  }

  removeLeadingZeros0_20(data): string {
    let cleaned_string = data.replace(/0x0*/,'0x');
    while(cleaned_string.length < 42) cleaned_string = cleaned_string.replace('0x', '0x0')
    return cleaned_string;
  }


  toggleOptions(): void {
    this.optionService.openOptions();
  }

  toggleFilters(): void {
    
  }
}
      
  // getLogs(): Promise<any> {
  //   return this.web3service.web3.eth.getPastLogs( { 
  //     fromBlock: this.web3service.web3.utils.toHex(this.firstBlockNumber),
  //     toBlock: this.web3service.web3.utils.toHex(this.latestBlockNumber),
  //     address: this.tokenContractAddress
  //   })
  // }

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
