import { Component, OnInit, NgZone } from '@angular/core';
import { TimerObservable } from 'rxjs/observable/TimerObservable';
import { Web3ConnectService } from '../shared/web3-connect.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-live-ethereum-observer',
  templateUrl: './live-ethereum-observer.component.html',
  styleUrls: ['./live-ethereum-observer.component.css']
})
export class LiveEthereumObserverComponent implements OnInit {

  public connected_account: string;
  public block_number: any;
  public filtered_transactions: Array<any>;
  public filterMinValue: number = 0;
  public filterMinGasPrice: number = 0;

  public current_block: any;
  
  constructor(private zone: NgZone,
              private web3service: Web3ConnectService,
              private router: Router) { }

  ngOnInit() {
    if (!this.web3service.isConnected()) this.router.navigateByUrl('/NoMetamask');
    // this.initWeb3InfoLoop()
  }

  initWeb3InfoLoop(): void {
    TimerObservable.create(0, 10000)
    .subscribe( () => this.updateBlock())
  }

  // WEB3 0.20.2:
  updateBlock(): void {
    this.web3service.web3.eth.getAccounts(
      (error, accounts) => this.connected_account = accounts[0]);
  
    this.web3service.web3.eth.getBlockNumber(
      (error, blocknumber) => this.block_number = blocknumber);

    this.web3service.web3.eth.getBlock('latest', true,
      (error, curblock) => {this.current_block = curblock
                            this.updateDisplayData()});
  }
  
  // WEB3 1.0:
  // updateBlock(): void {
  //   this.web3service.web3.eth.getAccounts()
  //     .then(accounts => this.connected_account = accounts[0]);
  
  //   this.web3service.web3.eth.getBlockNumber()
  //     .then(blocknumber =>this.block_number = blocknumber);

  //   this.web3service.web3.eth.getBlock('latest', true)
  //     .then(curblock => this.current_block = curblock)
  //     .then(() =>  this.updateDisplayData());
  // }

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
