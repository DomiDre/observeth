import { Injectable } from '@angular/core';
import { Web3ConnectService } from '../shared/web3-connect.service';
import { DatePipe } from '@angular/common';
import { EtherWallets } from './wallets';
import { ERC20_tokens } from './erc20';

@Injectable()
export class TxTreaterService {

  public status: string = '';
  public coin_supply: number = 1;

  public tokenLoaded: boolean = false;
  public tokenDecimals: number;
  public tokenSymbol: string;

  // set by readTxList:
  public number_of_nodes: number = 0;
  public nodeIdList: Array<number> = []; // positions corresponds to id of node
  public nodeAddressList: Array<string> = []; // positions corresponds to id, value is address
  public nodeAdjacencyList: Array<any> = []; // contains list for each to which other nodes it points and by which transaction
  public nodeBalanceList: Array<number> = []; // contains list for balance of each node
  public nodeTokenBalanceList: Array<number> = []; // if is erc20 token loaded, contains Token Balances
  // set from a selected list of nodes
  public nodes: Array<any> = []; // contains all data to plot nodes
  public edges: Array<any> = []; // contains all data to plot edges
  public network_statistics = {}

  public plotted_node_ids = [];
  public plotted_adjacency_list = [];
  public etherWallets = EtherWallets;

  constructor(private web3service: Web3ConnectService,
              private datePipe: DatePipe) { 
    for(let erc20token of ERC20_tokens) {
      this.etherWallets[erc20token.address.toLowerCase()] = erc20token.name
    }
  }

  reset_lists(): void {
    this.nodes = new Array();
    this.edges = new Array();
    
    this.number_of_nodes = 0;
    this.nodeIdList = new Array<number>();
    this.nodeAddressList = new Array<string>();
    this.nodeAdjacencyList = new Array();
    this.nodeBalanceList = new Array<number>();
    this.nodeTokenBalanceList = new Array<number>();
  }

  disableTokenSetup(): void {
    this.tokenLoaded = false;
    this.tokenDecimals = 10**18;
    this.tokenSymbol = undefined;
  }

  readTxList(txList: Array<any>, erc20contract?: any): Promise<any> {
    if (erc20contract !== undefined) this.tokenLoaded = true;

    this.status = 'Reading TX List';
    let is_id_in_List: (node_address: string) => number = 
      (node_address: string) => {
      let idx_node_in_AddressList = this.nodeAddressList.indexOf(node_address);
      let node_id;
      if (idx_node_in_AddressList > -1) { 
        node_id = idx_node_in_AddressList;
      } else {
        node_id = this.number_of_nodes;
        this.nodeIdList.push(node_id);
        this.nodeAddressList.push(node_address);
        this.nodeAdjacencyList.push([]);
        this.number_of_nodes++;
      }
      return node_id;
    }
    //reads a txList and sorts its entries to nodes, nodeAddressList and nodeAdjacencyList 
    for(let txData of txList) {
      if (txData == undefined) continue;

      // check case of a contract creation ?
      if (txData.to === null) txData.to = txData.from;
       
      // check whether FROM or TO are already in List
      let id_from = is_id_in_List(txData.from);
      let id_to = is_id_in_List(txData.to);

      txData.from = id_from;
      txData.to = id_to;
      // add entry to nodeAdjacencyList
      this.nodeAdjacencyList[id_from].push(txData);
    }
    // console.log(this.nodeAdjacencyList)
    this.status = 'Fetching Node Balances'
    let promisesBalance = [];
    for(let i=0; i<this.nodeAddressList.length; i++) {
      promisesBalance.push(
        this.web3service.getBalance(this.nodeAddressList[i])
        .then((balance) => {
          let etherValue = this.web3service.toDecimal(balance);
          this.nodeBalanceList[i] = etherValue;
        })
        .catch(error => {
          console.log(error, 'Error at getting balance of node ', this.nodeAddressList[i], '. Retrying.')
          this.web3service.getBalance(this.nodeAddressList[i])
          .then((balance) => {
            let etherValue = this.web3service.toDecimal(balance);
            this.nodeBalanceList[i] = etherValue;
          })
        })
      )
    }
    if (this.tokenLoaded) {
      for(let i=0; i<this.nodeAddressList.length; i++) {
        promisesBalance.push(
          this.web3service.getERC20balance(erc20contract, this.nodeAddressList[i])
          .then((balance) => {
            let tokenValue = this.web3service.toDecimal(balance);
            this.nodeTokenBalanceList[i] = tokenValue;
          })
          .catch(error => {
            console.log(error, 'Error at getting token Balance of node ', this.nodeAddressList[i], '. Retrying.')
            this.web3service.getERC20balance(erc20contract, this.nodeAddressList[i])
            .then((balance) => {
              let tokenValue = this.web3service.toDecimal(balance);
              this.nodeTokenBalanceList[i] = tokenValue;
            })

          })
        )
      }
    }
    return Promise.all(promisesBalance).then(() => this.status = '');
  }

  getNodeSize(value): number {
    let relative_value: number = value / this.coin_supply * 96.6e6*this.tokenDecimals/this.coin_supply;
    if (relative_value > 1e-6) return 25
    else if (1e-11 > relative_value) return 5
    else return (relative_value - 1e-11) * (25-5)/(1e-6 - 1e-11) + 5
  }

  getEdgeSize(value): number {
    let relative_value: number = value / this.coin_supply* 96.6e6*this.tokenDecimals/this.coin_supply;
    if (relative_value > 1e-7) return 5
    else if (1e-11 > relative_value) return 0.1
    else return (relative_value - 1e-11) * (5-0.1)/(1e-7 - 1e-11) + 0.1
  }

  setNodeList(nodeIdList?: Array<any>): void{
    if (nodeIdList === undefined) {
      nodeIdList = this.nodeIdList;
    }
    this.plotted_node_ids = nodeIdList;
    
    let nodeBalanceList;
    if (this.tokenLoaded){
      nodeBalanceList = this.nodeTokenBalanceList;
    } else {
      nodeBalanceList = this.nodeBalanceList;
    }

    let min_node_val = Math.min(...nodeBalanceList);
    let max_node_val = Math.max(...nodeBalanceList);
    // let b = 15;
    // let m = (50-b)/(max_node_val - min_node_val);

    let A = (50-10)/(Math.sqrt(max_node_val) - Math.sqrt(min_node_val));
    let b = 50 - A*Math.sqrt(max_node_val);

    this.nodes = [];
    for(let i=0; i<nodeIdList.length; i++){
      let node_id: number = nodeIdList[i];
      let node_label: string = '';
      let title: string = '';

      if (this.etherWallets[this.nodeAddressList[node_id]] != undefined){
        node_label = this.etherWallets[this.nodeAddressList[node_id]];
        title = title + node_label + '<br>'
      }
      title = title +
        'Wallet: '+ this.nodeAddressList[node_id] + '<br>'+
        'Ether Balance: ' + this.nodeBalanceList[node_id]/1e18 + '  Ξ';
      let size: number;
      if (this.tokenLoaded){
        title = title + '<br>' +
          'Token Balance: ' + this.nodeTokenBalanceList[node_id]/this.tokenDecimals + '  ' + this.tokenSymbol;
      } else {
      }
      // size = m*nodeBalanceList[node_id] + b;
      size = A * Math.sqrt(nodeBalanceList[node_id]) +b;
      this.nodes.push({
        id: nodeIdList[i],
        label: node_label,
        size: size,
        url: 'https://etherscan.io/address/'+this.nodeAddressList[node_id],
        title: title
      })      
    }

  }

  setEdgeList(nodeAdjacencyList?: Array<any>): void {
    if (nodeAdjacencyList === undefined) nodeAdjacencyList = this.nodeAdjacencyList;
    
    this.plotted_adjacency_list = nodeAdjacencyList;
    this.edges = [];

    let vals = [];
    for (let i=0; i<nodeAdjacencyList.length; i++) {
      let adjacency_list = nodeAdjacencyList[i];
      if (adjacency_list === undefined) continue;
      for(let j=0; j<adjacency_list.length;j++) {
        vals.push(adjacency_list[j].value);
      }
    }

    let min_edge_value = Math.min(...vals);
    let max_edge_value = Math.max(...vals);

    // let b = 0.1;
    // let m = (10-b)/(max_edge_value - min_edge_value);
    let A = (10-0.1)/(Math.sqrt(max_edge_value) - Math.sqrt(min_edge_value));
    let b = 10 - A*Math.sqrt(max_edge_value);
    // console.log(m,b)
    for (let i=0; i<nodeAdjacencyList.length; i++) {
      let adjacency_list = nodeAdjacencyList[i];
      
      if (adjacency_list === undefined) continue;
      for(let j=0; j<adjacency_list.length;j++) {
        let edge = adjacency_list[j];
        let title: string = 'TX: '+ edge.hash;
        if(edge.blockNumber!==undefined) {
          title = title + '<br> BlockNumber ' + edge.blockNumber;
          if(edge.timeStamp!==undefined)
            title = title + ' @ ' + this.datePipe.transform(edge.timeStamp, 'medium');
        };
        
        if(edge.gas!==undefined) title = title + '<br> Gas: ' + edge.gas;
        if(edge.gasPrice!==undefined)  title = title + '<br> GasPrice ' + edge.gasPrice/1e9 + ' GWei';
        
        if (this.tokenLoaded) title = title + '<br> Value: ' + edge.value/this.tokenDecimals + ' ' + this.tokenSymbol;
        else title = title + '<br> Value: ' + edge.value/1e18 + ' Ξ';
        
        this.edges.push({
          from: edge.from, 
          to: edge.to,
          arrows: 'to',
          // label: edge.hash.slice(0,8),
          title: title,
          width: A*Math.sqrt(edge.value) + b,//m*edge.value+b,
          url:  'https://etherscan.io/tx/'+edge.hash
        });
      }      
    }
  }
}
