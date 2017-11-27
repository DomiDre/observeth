import { Component, OnInit, Input, NgZone } from '@angular/core';
import { Web3ConnectService } from '../shared/web3-connect.service';


@Component({
  selector: 'app-contract-observer',
  templateUrl: './contract-observer.component.html',
  styleUrls: ['./contract-observer.component.css']
})
export class ContractObserverComponent implements OnInit {

  @Input() private tokenContractAddress: string='0x8f8221afbb33998d8584a2b05749ba73c37a938a';
  @Input() private numBlocks: number=100;
  private transactionList: Array<any>;

  private firstBlockNumber: number=1;
  private latestBlockNumber: number=1;
  private loadingProcessing: boolean=false;
  private processingBlockNumber: number;
  @Input() private progress: number;
  constructor(private zone: NgZone,
              private web3service: Web3ConnectService) { }

  ngOnInit() {
    this.updateData();
  }

  updateData(): void {
    this.transactionList = new Array<any>();
    this.loadingProcessing = true;
    this.progress = 0;


    this.web3service.web3.eth.getBlockNumber()
      .then(blocknumber => {
        this.latestBlockNumber = blocknumber;
        this.firstBlockNumber = blocknumber-this.numBlocks;
        this.processingBlockNumber = this.firstBlockNumber;
      })
      // METAMASK AND WEB3.0 DOESNT SUPPORT SUBSCRIBE...
      // .then(() => {
      //   this.web3service.web3.eth.subscribe('logs',
      //   { fromBlock: this.firstBlockNumber, 
      //     toBlock: this.latestBlockNumber,
      //     address: this.tokenContractAddress
      //   }, (error, result) => {
      //     console.log(error, result);
      //     this.transactionList.push(result);
      //     this.processingBlockNumber = result.blockNumber;
      //     console.log(result);
      //   })}
      // ).then(() => this.loadingProcessing=false);
    
  }
    
  // checkProgress(doneCallback: () => void) {
  //   this.progress = (this.processingBlockNumber - this.firstBlockNumber)/
  //                   (this.latestBlockNumber - this.firstBlockNumber)*100;
  //   // this.progress += 1;
  //   console.log(`Current progress: ${this.progress}%`);
  //   if (this.progress < 100 && this.loadingProcessing) {
  //     window.setTimeout(() => {
  //       this.checkProgress(doneCallback);
  //     }, 100);
  //   } else {
  //     doneCallback();
  //   }
  // }

  // updateDisplay(): void {

  // }
}  
