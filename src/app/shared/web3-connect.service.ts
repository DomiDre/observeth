import { Injectable, Output, EventEmitter } from '@angular/core';

import Web3 from 'web3';

@Injectable()
export class Web3ConnectService {

  @Output() update = new EventEmitter();
  private web3Instance: any;
  private nodeConnected: boolean = false;
  constructor() {}

  connectToNode(): void { 
      if (typeof window['web3'] !== 'undefined') {
        console.log('Connecting to Web3 using Metamask.');
        this.web3 = new this.Web3(window['web3'].currentProvider);
        console.log('Web3 version:', this.web3.version);
        this.nodeConnected = true;
      } else {
        console.log('No web3 in your browser? You should consider trying MetaMask!');
        this.web3 = new this.Web3(new this.Web3.providers.HttpProvider("http://localhost:8545"));
      }
  }

  get isConnected(): boolean {
    return this.nodeConnected;
  }

  get web3(): any {
    if (!this.web3Instance) {
        this.connectToNode();
    }
    return this.web3Instance;
  }

  set web3(web3: any) {
    this.web3Instance = web3;
  }
 
  get Web3(): any {
      return Web3;
  }
}