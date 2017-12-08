import { Component, OnInit, Input, NgZone, ElementRef } from '@angular/core';
import { Web3ConnectService } from '../shared/web3-connect.service';
import { TXData } from '../shared/txData';
import * as vis from 'vis';
import { ERC20_abi } from '../shared/erc20'

import { Mindmap } from '../shared/mindmap';

@Component({
  selector: 'app-token-observer',
  templateUrl: './token-observer.component.html',
  styleUrls: ['./token-observer.component.css']
})
export class TokenObserverComponent implements OnInit {

  @Input() public tokenContractAddress: string='0x8f8221afbb33998d8584a2b05749ba73c37a938a';
  @Input() public numBlocks: number=100;

  private transactionList: Array<TXData>;

  private firstBlockNumber: number=1;
  private latestBlockNumber: number=1;
  private processingBlockNumber: number;
  
  public mindmap: Mindmap;

  private ERC20_contract: any;
  private TokenTotalSupply: number;
  private TokenDecimals: number;
  private TokenSymbol: string;


  constructor(private zone: NgZone,
              private web3service: Web3ConnectService,
              private element: ElementRef) { }

  ngOnInit() {
    this.mindmap = new Mindmap(this.zone, this.web3service);
  }

  updateData(): void {
    this.mindmap.in_loading_status = true;
    
    this.mindmap.status = 'Reading ERC20 contract ' + this.tokenContractAddress;
    this.transactionList = new Array<any>();
    
    this.ERC20_contract = this.web3service.getERC20Contract(this.tokenContractAddress)
    this.web3service.getERC20details(this.ERC20_contract)
    .then((data) => {
      this.TokenDecimals = data[0];
      this.TokenSymbol = data[1];
      this.TokenTotalSupply = data[2];

      this.mindmap.coin_supply = this.TokenTotalSupply;
    }).then( () => {
      this.web3service.getBlockNumber()
      .then((blocknumber ) =>  {
        this.updateFirstAndLastBlockNumber(blocknumber);
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
              this.mindmap.initMindmapFromTxList(this.transactionList)
              .then(() => 
                this.zone.run(() => 
                this.mindmap.drawMindMap(this.mindmap.nodes, 
                                         this.mindmap.edges)
                )
              )

            })
        })
      })
    })
  }

  updateFirstAndLastBlockNumber(blocknumber): void {
      this.latestBlockNumber = blocknumber;
      this.firstBlockNumber = blocknumber-this.numBlocks;
      this.processingBlockNumber = this.firstBlockNumber;
  }

  getLogs(): Promise<any> {
    return this.web3service.web3.eth.getPastLogs( { 
      fromBlock: this.web3service.web3.utils.toHex(this.firstBlockNumber),
      toBlock: this.web3service.web3.utils.toHex(this.latestBlockNumber),
      address: this.tokenContractAddress
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

  removeLeadingZeros(data): string {
    let byteData = this.web3service.web3.utils.hexToBytes(data);
    for (let i = 0; i < byteData.length; i++) {
      if (byteData[0] == 0) {
        byteData.splice(0, 1);
      }
    }
    return this.web3service.web3.utils.bytesToHex(byteData);
  }

  evaluateLogs(logs): void {
    let TransferHex = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
    let ApproveHex = '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925';

    for(let txData of logs) {
      let methodId = txData.topics['0'];
      if (methodId === TransferHex) { // transfer: 1 transfers to 2 
        let txEntry = new TXData();
        txEntry.hash = txData.transactionHash;
        // check 1e18 factor
        txEntry.value = this.web3service.web3.utils.hexToNumberString(txData.data);
        txEntry.from = this.removeLeadingZeros(txData.topics['1']);
        txEntry.to = this.removeLeadingZeros(txData.topics['2']);
        this.transactionList.push(txEntry);
      } else if (methodId == ApproveHex) { // approve: you allowed somebody else to withdraw from your account
        // not implemented yet
      } else {
        console.log(methodId,' not known, check ', txData.transactionHash,'. Please report this.');
      }
      this.processingBlockNumber = txData.blockNumber;          
    }
  }
}
      
