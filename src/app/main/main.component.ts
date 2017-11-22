import { Component, OnInit, NgZone } from '@angular/core';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  isConnected: boolean;
  eth: any;
  connected_account: string;
  block_number: any;
  constructor(private zone: NgZone) { }

  ngOnInit() {
    this.eth = window.web3.eth;
    this.getBlockchainInfo()
  }

  getBlockchainInfo(): void {
    this.eth.getAccounts()
        .then((response) => this.zone.run(()=>{this.connected_account = response[0]}))
        .catch((error) => console.log(error));
    this.eth.getBlockNumber()
        .then((response) => this.zone.run(()=>{this.block_number = response}))
        .catch((error) => console.log(error));
  }

}
