import { Injectable } from '@angular/core';
import { Web3ConnectService } from '../shared/web3-connect.service';

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
  public nodeBalanceList: Array<number> = []; // contains list for each to which other nodes it points and by which transaction
  public nodeTokenBalanceList: Array<number> = []; // if is erc20 token loaded, contains Token Balances
  // set from a selected list of nodes
  public nodes: Array<any> = []; // contains all data to plot nodes
  public edges: Array<any> = []; // contains all data to plot edges
  public network_statistics = {}

  public plotted_node_ids = [];
  public plotted_adjacency_list = [];


  constructor(private web3service: Web3ConnectService) { }

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
      // read txData
      let tx_from: string = txData.from;
      let tx_to: string = txData.to;
      let tx_value: number = this.web3service.toDecimal(txData.value);
      let tx_hash: string = txData.hash;

      // check case of a contract creation ?
      if (tx_to === null) tx_to = tx_from;
       
      // check whether FROM or TO are already in List
      let id_from = is_id_in_List(tx_from);
      let id_to = is_id_in_List(tx_to);

      // add entry to nodeAdjacencyList
      this.nodeAdjacencyList[id_from].push({
        'from': id_from,
        'to': id_to,
        'hash': tx_hash,
        'value': tx_value})
    }
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
          console.log(error, 'Error with node ', this.nodeAddressList[i])
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
            console.log(error, 'Error with node ', this.nodeAddressList[i])
          })
        )
      }
    }
    return Promise.all(promisesBalance).then(() => this.status = '');
  }

  getNodeSize(value): number {
    let relative_value: number = value / this.coin_supply;
    if (relative_value > 1e-4) return 25
    else if (1e-7 > relative_value) return 5
    else return (relative_value - 1e-7) * (25-5)/(1e-4 - 1e-7) + 5
  }

  getEdgeSize(value): number {
    let relative_value: number = value / this.coin_supply;
    if (relative_value > 1e-5) return 2.5
    else if (1e-8 > relative_value) return 0.5
    else return (relative_value - 1e-8) * (2.5-0.5)/(1e-5 - 1e-8) + 0.5
  }

  setNodeList(nodeIdList?: Array<any>): void{
    if (nodeIdList === undefined) {
      nodeIdList = this.nodeIdList;
    }
    this.plotted_node_ids = nodeIdList;
    
    this.nodes = [];
    for(let i=0; i<nodeIdList.length; i++){
      let node_id: number = nodeIdList[i];
      let title: string =
        'Wallet: '+ this.nodeAddressList[node_id] + '<br>'+
        'Ether Balance: ' + this.nodeBalanceList[node_id]/1e18 + '  Ξ';
      let size: number;
      if (this.tokenLoaded){
        title = title + '<br>' +
          'Token Balance: ' + this.nodeTokenBalanceList[node_id]/this.tokenDecimals + '  ' + this.tokenSymbol;
        size = this.getNodeSize(this.nodeTokenBalanceList[node_id]);
      } else {
        size = this.getNodeSize(this.nodeBalanceList[node_id]);
      }
      this.nodes.push({
        id: nodeIdList[i],
        label: this.nodeAddressList[node_id].slice(0, 8),
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
    for (let i=0; i<nodeAdjacencyList.length; i++) {
      let adjacency_list = nodeAdjacencyList[i];
      if (adjacency_list === undefined) continue;
      for(let j=0; j<adjacency_list.length;j++) {
        let edge = adjacency_list[j];
        let title: string = 'TX: '+ edge.hash + '<br> Value: ';
        if (this.tokenLoaded) title = title + edge.value/this.tokenDecimals + ' ' + this.tokenSymbol
        else title = title + edge.value/1e18 + ' Ξ'
        this.edges.push({
          from: edge.from, 
          to: edge.to,
          label: edge.hash.slice(0,8),
          title: title,
          width: this.getEdgeSize(edge.value),
          url:  'https://etherscan.io/tx/'+edge.hash
        });
      }      
    }
  }
}
