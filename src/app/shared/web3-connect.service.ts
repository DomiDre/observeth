import { Injectable } from '@angular/core';

import Web3 from 'web3';

declare global {
  interface Window { web3: any; }
}

window.web3 = window.web3 || undefined;

@Injectable()
export class Web3ConnectService {

  private _web3: any;

  constructor() {}

  connectToNode(): void { 
      console.log('Connecting to Web3...')
      if (typeof this._web3 !== 'undefined') { // if already defined -> ok.
        this.web3 = new this.Web3(this.web3.currentProvider);
      } 
      else if (typeof window.web3 !== 'undefined') { // use injected web3 provider from browser
        console.log('Connecting to Metamask.', window.web3)
        this.web3 = new this.Web3(window.web3.currentProvider);
      }
      else {
        console.log('Metamask was not found. Trying to connect to localhost:8545');
        this.web3 = new this.Web3(new this.Web3.providers.HttpProvider('http://localhost:8545'));
        // use websocket provider. Run geth with: geth --syncmode "light" --ws --wsorigins "*" --rpc
        // this.web3 = new this.Web3('ws://localhost:8546');

        // Connect using web3 0.20.2
        // console.log('Connecting to Infura.')
        // this.web3 = new this.Web3(
        //   new this.Web3.providers.HttpProvider('https://mainnet.infura.io/506w9CbDQR8fULSDR7H0'));
      }
      //console.log('Web3 version:', this.web3.version);
      console.log('Web3 version:', this.web3.version.api);
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

  isConnected(): boolean {
    // 0.20.2 method
    return this.web3.isConnected((error, result) => result);
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