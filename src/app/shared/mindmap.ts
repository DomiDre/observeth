import { OnInit, ElementRef } from '@angular/core';
import { Web3ConnectService } from '../shared/web3-connect.service';
import * as vis from 'vis';

export class Mindmap {

  public container: any;
  public network: any;

  public nodeAddressList: Array<any>; // positions corresponds to id, value is address
  public nodeAdjencyList: Array<any>; 
  public nodes: Array<any>; // contains all data to plot nodes
  public edges: Array<any>; // contains all data to plot edges

  public status: string = '';

  constructor(private web3service: Web3ConnectService) {
    this.container = document.getElementById('Mindmap');
  }

  initMindmapFromTxList(txList: Array<any>,
    NodeSizeEstimator: (value: number) => number,
    EdgeSizeEstimator: (value: number) => number): Promise<any> {

    this.nodes = new Array();
    this.edges = new Array();

    this.nodeAddressList = new Array();
    this.nodeAdjencyList = new Array();

    let id_running: number = 0;
    let id_from: number;
    let id_to: number;

    for(let txData of txList) {
      // read txData
      let tx_from: string = txData.from;
      let tx_to: string = txData.to;
      let tx_value: number = this.web3service.toDecimal(txData.value);
      let tx_hash: string = txData.hash;

      if (tx_to === null) { // contract creation ?
        tx_to = tx_from}; 

      // check whether from or to are already in List
      let idx_check_from = this.nodeAddressList.indexOf(tx_from);
      // is to already in this.nodeAddressList ? otherwise its -1
      if (idx_check_from > -1) { 
        id_from = idx_check_from;
      } else {
        id_from = id_running;
        this.nodeAddressList.push(tx_from);
        this.nodeAdjencyList.push([])
        id_running++;
      }
      
      let idx_check_to = this.nodeAddressList.indexOf(tx_to);
      // is from already in this.nodeAddressList ? otherwise its -1
      if (idx_check_to > -1) { 
        id_to = idx_check_to;
      } else {
        id_to = id_running;
        this.nodeAddressList.push(tx_to);
        this.nodeAdjencyList.push([])
        id_running++;
      }

      // create an edge between from and to
      this.edges.push({
        from: id_from, 
        to: id_to,
        label: tx_hash.slice(0,8),
        title: 'TX: '+ tx_hash + '<br>'+
               'Value: ' + tx_value/1e18 + ' Ξ',
        width: EdgeSizeEstimator(tx_value),
        url:  'https://etherscan.io/tx/'+tx_hash
      });
      this.nodeAdjencyList[id_from].push(id_to)
    }

    // get the Balance of all nodes
    let promisesBalance = []
    for(let i=0; i<this.nodeAddressList.length; i++) {
      // console.log(this.nodeAddressList[i]);
      promisesBalance.push(
        this.web3service.getBalance(this.nodeAddressList[i])
        .then((balance) => {
          let etherValue = this.web3service.toDecimal(balance);
          this.nodes.push({
            id: i,
            label: this.nodeAddressList[i].slice(0, 8),
            size: NodeSizeEstimator(balance),
            url: 'https://etherscan.io/address/'+this.nodeAddressList[i],
            title: 'Wallet: '+ this.nodeAddressList[i] + '<br>'+
                   'Ether Balance: ' + etherValue/1e18 + '  Ξ'
          })
        })
        .catch(error => {
          console.log(error, 'Error with node ', this.nodeAddressList[i])
        })
      )
    }
    return Promise.all(promisesBalance)
  }


  drawMindMap(nodeList, edgeList): void {
    this.status = 'Drawing Mindmap';
    let nodes = new vis.DataSet(nodeList)
    let edges = new vis.DataSet(edgeList);
    let data = {
      nodes: nodes,
      edges: edges
    };
    // Configuration for the Timeline
    let options = {
      nodes: {
        shape: 'diamond',
        scaling: {
          min: 10,
          max: 25,
          label: {
            min: 8,
            max: 30,
            drawThreshold: 12,
            maxVisible: 20
          }
        },
        font: {
          size: 12,
          face: 'Tahoma'
        },
        color: {
          background: '#62688f',
          border: '#454a75',
          hover: {
            border:'#62688f',
            background: '#8a92b2'
          },
          highlight: {
            border:'#62688f',
            background: '#8a92b2'
          }
        }
      },
      edges: {
        width: 0.15,
        color: {inherit: 'from'},
        smooth: {
          type: 'continuous'
        },
        arrows: 'to',
        arrowStrikethrough: false
      },
      physics: true,
      layout: {
        improvedLayout: false
      },
      interaction: {
        dragNodes: true,
        tooltipDelay: 200,
        hover: true
      }
    };

    // console.log(container)
    // Create a Timeline
    this.network = new vis.Network(this.container, data, options);
    this.network.on("click", params => {
      if (params.nodes.length === 0 && params.edges.length > 0) {
        let edge = edges.get(params.edges[0]);
        window.open(edge.url, '_blank');
      }
      else if (params.nodes.length === 1) {
          let node = nodes.get(params.nodes[0]);
          window.open(node.url, '_blank');
      }
    })
  }
}