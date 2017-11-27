import { Injectable } from '@angular/core';

import Web3 from 'web3';

@Injectable()
export class Web3ConnectService {

  private _web3: any;

  constructor() {}

  connectToNode(): void { 
      console.log('Connecting to web3.')
      if (typeof this._web3 !== 'undefined') {
        this.web3 = new this.Web3(this.web3.currentProvider);
      } else {
        this.web3 = new this.Web3(new this.Web3.providers.HttpProvider('https://mainnet.infura.io/506w9CbDQR8fULSDR7H0'));
      }
      console.log('Web3 version:', this.web3.version);
  }

  get web3(): any {
    if (!this._web3) {
        this.connectToNode();
    }
    return this._web3;
  }

  set web3(web3: any) {
    this._web3 = web3;
  }
 
  get Web3(): any {
      return Web3;
  }
}



      // connect to Metamask
      // if (typeof window['web3'] !== 'undefined') {
      //   console.log('Connecting to Web3 using Metamask.');
      //   this.web3 = new this.Web3(window['web3'].currentProvider);
      //   console.log('Web3 version:', this.web3.version);
      //   this.nodeConnected = true;
      // } else {
      //   console.log('No web3 in your browser? You should consider trying MetaMask!');
      //   this.web3 = new this.Web3(new this.Web3.providers.HttpProvider("http://localhost:8545"));
      // }