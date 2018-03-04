import { Injectable } from '@angular/core';
import { ERC20_abi } from '../shared/erc20'

// import Web3 from 'web3';

import Web3 = require('web3');

declare global {
  interface Window { web3: any; }
}

window.web3 = window.web3 || undefined;

@Injectable()
export class Web3ConnectService {

  private web3: any;
  public connected_to: string;
  public connected_to_network: string;

  constructor() {}

  isConnected(): Promise<boolean> {
    // 0.20.2 method
    if(!this.web3) {
      return this.connectToNode();
    } else {
      return new Promise((resolve, reject) => {
        resolve(this.web3.isConnected());
      });
    }
    // 1.0 method
    // return this.web3.eth.net.isListening();

  }

  connectToNode(): Promise<boolean> { 
      console.log('Initializing Web3.')
      if (typeof this.web3 !== 'undefined') { 
        // if already defined -> ok.
        console.log('Is already initialized. Reconnecting to current provider.')
        this.web3 = new Web3(this.web3.currentProvider);
      } 
      else if (typeof window.web3 !== 'undefined') { 
        // use injected web3 provider from browser
        console.log('Connecting to Metamask.')
        this.web3 = new this.Web3(window.web3.currentProvider);
        this.connected_to = 'Metamask';
      } else {
        console.log('No Metamask found... Connecting to localhost:8545');
        this.web3 = new this.Web3(new this.Web3.providers.HttpProvider('http://localhost:8545'));
        this.connected_to = 'Local Node';
      }

      // check if connection worked
      return new Promise((resolve, reject) => {      
        this.isConnected()
        .then(connected => {
          if(connected) {
            console.log('Connected to ' + this.connected_to);
            this.getNetworkId().then((network) => {
              console.log('Connected to: ' + network);
            })
            //v0.2:
            console.log('Web3 version:', this.web3.version.api);
            resolve(true);
          }
          else throw 'Connecting failed.';
        })
        .catch(error => {
          console.log(error);
          resolve(false);
        })
      })

      //v1.0:
      // console.log('This page is using web3 version:', this.web3.version);
  }

  getNetworkId(): Promise<string> {
    // v0.2 method:
    let id = this.web3.version.network;
    return new Promise((resolve, reject) => {
      if(id == 1) this.connected_to_network = 'Mainnet';
      else if(id == 3) this.connected_to_network = 'Ropsten';
      else if(id == 4) this.connected_to_network = 'Rinkeby';
      else if(id == 42) this.connected_to_network = 'Kovan';
      else this.connected_to_network = 'Unknown';
      resolve(this.connected_to_network);   
    })

    // v1.0 method:
    // return this.web3.eth.net.getId().then(id => {
    //   if(id == 1) this.connected_to_network = 'Mainnet';
    //   else if(id == 3) this.connected_to_network = 'Ropsten';
    //   else if(id == 4) this.connected_to_network = 'Rinkeby';
    //   else if(id == 42) this.connected_to_network = 'Kovan';
    //   else this.connected_to_network = 'Unknown';
    //   resolve(this.connected_to_network);
    //   })
  }
 
  get Web3(): any {
      return Web3;
  }

  toDecimal(data: any): number {
    return this.web3.toDecimal(data); // web3 0.20.2 method
  }

  getConnectedAccount(): Promise<string> {
    return new Promise ((resolve, reject) => {
      this.web3.eth.getAccounts((error, result) => {
        if (error) reject(error)
        else resolve(result[0]);
      });
    });                 
  }

  getBalance(address: string): Promise<number> {
    return new Promise( (resolve, reject) => 
      this.web3.eth.getBalance(address, 
      (error, balance) => {
        if (error) reject(error)
        else resolve(balance)
      })
    )
  }

  getBlockNumber(): Promise<number> {
    return new Promise( (resolve, reject ) =>
      this.web3.eth.getBlockNumber( // web3 0.20.2 method
      (error, blocknumber) => {
        if (error) reject(error)
        else resolve(blocknumber)
      })
    )
  }

  getBlock(blocknumber?:any): Promise<any> {
    return new Promise( (resolve, reject) => {
      if(!blocknumber) blocknumber = 'latest';

      this.web3.eth.getBlock(blocknumber, true, //web3 0.20.2 method
      (error, block) => {
        if(error) reject(error)
        else resolve(block)
      }) 
    })
  }

  getContract(contractAddress, abi): any {
    return this.web3.eth.contract(abi).at(contractAddress)
  }

  getERC20Contract(contractAddress): any {
    return this.web3.eth.contract(ERC20_abi).at(contractAddress)
  }

  getERC20balance(erc20contract, nodeAdress): Promise<any> {
    return new Promise( (resolve, reject) => {
      erc20contract.balanceOf(nodeAdress, (error, result) => {
          if(error) reject(error)
          else resolve(result)
      })
    })
  }

  public callFunctionReturningPromise(contract_function): Promise<any> {
    return new Promise( (resolve, reject) => {
      contract_function((error, result) => {
          if(error) reject(error)
          else resolve(result)
      })
    })
  }

  private getERC20info(erc20contract_function): Promise<any> {
    return new Promise( (resolve, reject) => {
      erc20contract_function((error, result) => {
          if(error) reject(error)
          else {resolve(result)}
      })
    })
  }

  getERC20details(erc20contract): Promise<any> {
    let decimals = this.getERC20info(erc20contract.decimals);
    let symbol = this.getERC20info(erc20contract.symbol);
    let totalSupply = this.getERC20info(erc20contract.totalSupply);

    return Promise.all([decimals, symbol, totalSupply])
  }

  filter(firstBlockNumber, latestBlockNumber, tokenContractAddress): any {
    return this.web3.eth.filter({
      fromBlock: firstBlockNumber,
      toBlock: latestBlockNumber,
      address: tokenContractAddress
    })
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