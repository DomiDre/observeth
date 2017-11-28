import { Component, OnInit, Input, NgZone } from '@angular/core';
import { Web3ConnectService } from '../shared/web3-connect.service';


@Component({
  selector: 'app-contract-observer',
  templateUrl: './contract-observer.component.html',
  styleUrls: ['./contract-observer.component.css']
})
export class ContractObserverComponent implements OnInit {

  @Input() private tokenContractAddress: string='0x8f8221afbb33998d8584a2b05749ba73c37a938a';

  @Input() private numBlocks: number=1000;
  private transactionList: Array<any>;

  private firstBlockNumber: number=1;
  private latestBlockNumber: number=1;
  private loadingProcessing: boolean=false;
  private processingBlockNumber: number;
  private current_subscription: any;
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
    // if (this.current_subscription) {
    //   console.log('Unsubscribing previous subscription.')
    //   this.current_subscription.unsubscribe((err,res) => {
    //       if(res) {
    //         console.log('Unsubscribed previous subscription');
    //       }}
    //   )
    // }
    this.web3service.web3.eth.getBlockNumber()
      .then(blocknumber => {
        this.latestBlockNumber = blocknumber;
        this.firstBlockNumber = blocknumber-this.numBlocks;
        this.processingBlockNumber = this.firstBlockNumber;
      })
      .then(() => {
        console.log('Subscribing to logs.');
        console.log(this.firstBlockNumber, this.latestBlockNumber, this.tokenContractAddress);
        this.current_subscription = this.web3service.web3.eth.subscribe('logs',
          { fromBlock: 1, 
            topic: [this.tokenContractAddress]
          }, (err, res) => { 
            if(!err) {
              console.log(res) } 
          }).on('data', trxData => {
            this.transactionList.push(trxData);
            this.processingBlockNumber = trxData.blockNumber;
            console.log(trxData.transactionHash);
          })
      })
      .then(() => this.loadingProcessing=false);
  }
}  
    

    // this.current_subscription = this.web3service.web3.eth.subscribe('logs',
    //       { fromBlock: this.firstBlockNumber, 
    //         toBlock: this.latestBlockNumber,
    //         address: this.tokenContractAddress,
    //         topic: [this.tokenContractAddress]
    //       }, (err, res) => { 
    //         if(!err) {
    //           console.log(res) } 
    //       }).on('data', trxData => {
    //         this.transactionList.push(trxData);
    //         this.processingBlockNumber = trxData.blockNumber;
    //         console.log(trxData.transactionHash);
    //       })
    //   })
    //   .then(() => this.loadingProcessing=false);
    // // var subscription = 
    //   this.web3service.web3.eth.subscribe('logs', 
    //                      { fromBlock: 1, 
    //                        topics: ["0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"] 
    //             }, function() {})
    // .on("data", function(trxData){
    //   function formatAddress(data) {
    //     var step1 = web3.utils.hexToBytes(data);
    //     for (var i = 0; i < step1.length; i++) if (step1[0] == 0) step1.splice(0, 1);
    //     return web3.utils.bytesToHex(step1);
    //   }

    //   console.log("Register new transfer: " + trxData.transactionHash);
    //   console.log("Contract " + trxData.address + " has transaction of " + web3.utils.hexToNumberString(trxData.data) + " from " + formatAddress(trxData.topics['1']) + " to " + formatAddress(trxData.topics['2']));
    //   //console.log(trxData);
    //   web3.eth.getTransactionReceipt(trxData.transactionHash, function(error, reciept) {
    //     console.log('Sent by ' + reciept.from + ' to contract ' + reciept.to);
    //   });
    // });

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
