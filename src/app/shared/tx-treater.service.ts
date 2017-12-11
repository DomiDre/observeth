import { Injectable } from '@angular/core';
import { Web3ConnectService } from '../shared/web3-connect.service';

@Injectable()
export class TxTreaterService {

  public status: string = '';
  public coin_supply: number = 1;

  // set by readTxList:
  public number_of_nodes: number = 0;
  public nodeIdList: Array<number> = []; // positions corresponds to id of node
  public nodeAddressList: Array<string> = []; // positions corresponds to id, value is address
  public nodeAdjacencyList: Array<any> = []; // contains list for each to which other nodes it points and by which transaction
  public nodeBalanceList: Array<number> = []; // contains list for each to which other nodes it points and by which transaction

  // set from a selected list of nodes
  public nodes: Array<any> = []; // contains all data to plot nodes
  public edges: Array<any> = []; // contains all data to plot edges
  public network_statistics = {}

  constructor(private web3service: Web3ConnectService) { }

  reset_lists(): void {
    this.nodes = new Array();
    this.edges = new Array();
    
    this.number_of_nodes = 0;
    this.nodeIdList = new Array<number>();
    this.nodeAddressList = new Array<string>();
    this.nodeAdjacencyList = new Array();
    this.nodeBalanceList = new Array<number>();
  }

  readTxList(txList: Array<any>): Promise<any> {

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
    this.nodes = [];
    for(let i=0; i<nodeIdList.length; i++){
      let node_id: number = nodeIdList[i];
      console.log(i, nodeIdList[i], this.nodeBalanceList[node_id], this.nodeAddressList[node_id]);
      this.nodes.push({
        id: nodeIdList[i],
        label: this.nodeAddressList[node_id].slice(0, 8),
        size: this.getNodeSize(this.nodeBalanceList[node_id]),
        url: 'https://etherscan.io/address/'+this.nodeAddressList[node_id],
        title: 'Wallet: '+ this.nodeAddressList[node_id] + '<br>'+
               'Ether Balance: ' + this.nodeBalanceList[node_id]/1e18 + '  Ξ'
      })      
    }

  }

  setEdgeList(nodeAdjacencyList?: Array<any>): void {
    if (nodeAdjacencyList === undefined) nodeAdjacencyList = this.nodeAdjacencyList;

    this.edges = [];
    for (let i=0; i<nodeAdjacencyList.length; i++) {
      let adjacency_list = nodeAdjacencyList[i];
      if (adjacency_list === undefined) continue;
      for(let j=0; j<adjacency_list.length;j++) {
        let edge = adjacency_list[j];
        this.edges.push({
          from: edge.from, 
          to: edge.to,
          label: edge.hash.slice(0,8),
          title: 'TX: '+ edge.hash + '<br>'+
                 'Value: ' + edge.value/1e18 + ' Ξ',
          width: this.getEdgeSize(edge.value),
          url:  'https://etherscan.io/tx/'+edge.hash
        });
      }      
    }
  }
}
