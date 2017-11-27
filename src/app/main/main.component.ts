import { Component, OnInit, NgZone } from '@angular/core';
import { TimerObservable } from 'rxjs/observable/TimerObservable';
import { Web3ConnectService } from '../shared/web3-connect.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  private connected_account: string;
  private block_number: any;
  
  private current_block: any;

  private filtered_transactions: Array<any>;
  private filterMinValue: number = 0;
  private filterMinGasPrice: number = 0;

  constructor(private zone: NgZone,
              private web3service: Web3ConnectService) { }

  ngOnInit() {
    this.initWeb3InfoLoop()
  }

  initWeb3InfoLoop(): void {
    TimerObservable.create(0, 10000)
    .subscribe( () => this.updateBlock())
  }

  updateBlock(): void {
    this.web3service.web3.eth.getAccounts()
      .then(accounts => this.connected_account = accounts[0]);
  
    this.web3service.web3.eth.getBlockNumber()
      .then(blocknumber =>this.block_number = blocknumber);

    this.web3service.web3.eth.getBlock('latest', true)
      .then(curblock => this.current_block = curblock)
      .then(() =>  this.updateDisplayData());
  }

  updateDisplayData(): void {
    this.zone.run(() => {
      this.filtered_transactions = new Array<any>();
      for (let tx of this.current_block.transactions) {
        if (tx.value/1e18 >= this.filterMinValue &&
            tx.gasPrice/1e9 >= this.filterMinGasPrice) {
          this.filtered_transactions.push(tx);
        }
      }
    });
  }
}