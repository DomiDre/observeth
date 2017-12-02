import { Component, OnInit, NgZone,  ElementRef } from '@angular/core';
import { TimerObservable } from 'rxjs/observable/TimerObservable';
import { Web3ConnectService } from '../shared/web3-connect.service';
import { Router } from '@angular/router';
import { Filters } from './filters'
import * as vis from 'vis';

@Component({
  selector: 'app-live-ethereum-observer',
  templateUrl: './live-ethereum-observer.component.html',
  styleUrls: ['./live-ethereum-observer.component.css']
})
export class LiveEthereumObserverComponent implements OnInit {

  public connected_account: string;
  public filtered_transactions: Array<any>;
  public currentBlock: any; // the current Block containing all information
  public plottedBlock: number=0;

  public filters = Filters;
  public filterButtonLabel: string="Add Filter";
  public filterPlaceholder:string="";
  public filterValue:number;
  public activeFilterList: Array<string>;

  public currentFilterSelection:string='';

  public network:any;
  public MindMapContainer: any;

  constructor(private zone: NgZone,
              private web3service: Web3ConnectService,
              private router: Router,
              private element: ElementRef) { }

  ngOnInit() {
    this.filterPlaceholder = this.filters[this.currentFilterSelection].title;
    this.MindMapContainer = document.getElementById('Mindmap');

    if (!this.web3service.isConnected()) this.router.navigateByUrl('/NoMetamask');
    else this.initializeDataCollection()
  }

  initializeDataCollection(): void {
    TimerObservable.create(0, 1000)
    .subscribe( () => this.updateBlock())
  }

  selectedFilter(filter: string) {
    this.currentFilterSelection = filter;
    this.filterPlaceholder = this.filters[filter].title;
    this.filterButtonLabel = filter;
  }

  filterValueChanged(filter: string) {
    this.filters[filter].set = 
      (this.filters[filter].value !== this.filters[filter].defaultValue)
    this.updateDisplayData()
  }

  // WEB3 0.20.2:
  updateBlock(): void {
    this.web3service.web3.eth.getBlockNumber(
      (error, blocknumber) => {
        if (blocknumber > this.plottedBlock) {
          this.plottedBlock = blocknumber;
          this.web3service.web3.eth.getBlock('latest', true,
            (error, curblock) => {this.currentBlock = curblock
                                  this.updateDisplayData()});
        }
      });


  }
  
  updateDisplayData(): void {
    this.zone.run(() => {
      this.filtered_transactions = new Array<any>();
      this.activeFilterList = new Array<string>();

      let validity_checks: { (tx: any): boolean}[] = []; 

      if (this.filters['MinTxVol'].set) {
        this.activeFilterList.push('Transaction volume >= ' + this.filters['MinTxVol'].value);
        validity_checks.push((tx) => tx.value/1e18 >= this.filters['MinTxVol'].value);
      }
      
      if (this.filters['MinGasPri'].set) {
        this.activeFilterList.push('Gas price >= ' + this.filters['MinGasPri'].value);
        validity_checks.push((tx) => tx.gasPrice/1e9 >= this.filters['MinGasPri'].value);
      }
      
      if (this.filters['MinGas'].set) {
        this.activeFilterList.push('Gas >= ' + this.filters['MinGas'].value);
        validity_checks.push((tx) => tx.gas >= this.filters['MinGas'].value);
      }
      
      for (let tx of this.currentBlock.transactions) {
        let valid_tx:boolean = true;

        for (let i=0; i<validity_checks.length; i++) 
          valid_tx = valid_tx && validity_checks[i](tx)

        if (valid_tx)
          this.filtered_transactions.push(tx);
      }
    });
    this.initMindmap();
  }




  initMindmap(): void {
    // document.getElementById('loadingBar_header_text').innerHTML = 'Sorting nodes and edges.';
    let nodeList = new Array();
    let edgeList = new Array();

    let nodeArray = new Array();

    let id_running: number = 1;
    let id_from: number;
    let id_to: number;
    for(let txData of this.filtered_transactions){
      let tx_from: string = txData.from;
      let tx_to: string = txData.to;
      let tx_value: number = this.web3service.web3.toDecimal(txData.value);
      let tx_hash: string = txData.hash;

      let idx_check_from = nodeList.indexOf(tx_from);
      let idx_check_to = nodeList.indexOf(tx_to);

      if (idx_check_from > -1) { // from is already in nodeList
        id_from = idx_check_from+1;
      } else {
        id_from = id_running;
        nodeList.push(tx_from);
        id_running++;
      }
      
      if (idx_check_to > -1) { // from is already in nodeList
        id_to = idx_check_to+1;
      } else {
        id_to = id_running;
        nodeList.push(tx_to);
        id_running++;
      }

      edgeList.push({
        from: id_from, 
        to: id_to,
        label: tx_hash.slice(0,8),
        title: 'TX: '+ tx_hash + '<br>'+
               'Value: ' + tx_value/1e18 + ' Ξ',
        width: this.getEdgeSize(tx_value),
        url:  'https://etherscan.io/tx/'+tx_hash
      });
    }

    // document.getElementById('loadingBar_header_text').innerHTML = 'Getting Ether and Token balances.';
    let nodes_remaining = nodeList.length;
    
    for(let i=0; i<nodeList.length; i++) {
      this.web3service.web3.eth.getBalance(nodeList[i], 
      (error, balance) => {
        // console.log(i, error, balance);
        // console.log(nodeList[i])
        let etherValue = this.web3service.web3.toDecimal(balance);
        nodeArray.push({
          id: i+1,
          label: nodeList[i].slice(0, 8),
          size: this.getNodeSize(balance),
          url: 'https://etherscan.io/address/'+nodeList[i],
          title: 'Wallet: '+ nodeList[i] + '<br>'+
                 'Ether Balance: ' + etherValue/1e18 + '  Ξ'
        })
        --nodes_remaining;
        // console.log(i, nodes_remaining)
        if (nodes_remaining <= 0) this.drawMindMap(nodeArray, edgeList);
      })     
    }
  }

  getNodeSize(balance):number {
    let relative_balance: number = balance / 1e18/100e6;
    if (relative_balance > 1e-4) return 25
    else if (1e-7 > relative_balance) return 5
    else return (relative_balance - 1e-7) * (25-5)/(1e-4 - 1e-7) + 5
  }

  getEdgeSize(value):number {
    let relative_value: number = value / 1e18 / 100e6;
    if (relative_value > 1e-5) return 2.5
    else if (1e-8 > relative_value) return 0.5
    else return (relative_value - 1e-8) * (2.5-0.5)/(1e-5 - 1e-8) + 0.5
  }

  drawMindMap(nodeArray, edgeList): void {
    // document.getElementById('loadingBar_header_text').innerHTML = 'Drawing Mindmap';
    
    // Create a DataSet (allows two way data-binding)
    let nodes = new vis.DataSet(nodeArray)
    //         // create an array with edges
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
    this.network = new vis.Network(this.MindMapContainer, data, options);
    
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
    

    // this.network.on("stabilizationProgress", function(params) {
    //   let maxWidth = 100;
    //   let minWidth = 0;
    //   let widthFactor = params.iterations/params.total;
    //   let width = Math.max(minWidth,maxWidth * widthFactor);
    //   document.getElementById('bar').style.width = width + '%';
    //   document.getElementById('loading_progress_text').innerHTML = Math.round(widthFactor*100) + '%';
    // });
    // this.network.once("stabilizationIterationsDone", function() {
    //     document.getElementById('loading_progress_text').innerHTML = '100%';
    //     document.getElementById('bar').style.width = '100%';
    //     document.getElementById('loadingBar').style.opacity = '0';
    //     // really clean the dom element
    //     setTimeout(function () {document.getElementById('loadingBar').style.display = 'none';}, 500);
    // });


  }
}







  // WEB3 1.0:
  // updateBlock(): void {
  //   this.web3service.web3.eth.getAccounts()
  //     .then(accounts => this.connected_account = accounts[0]);
  
  //   this.web3service.web3.eth.getBlockNumber()
  //     .then(blocknumber =>this.block_number = blocknumber);

  //   this.web3service.web3.eth.getBlock('latest', true)
  //     .then(curblock => this.currentBlock = curblock)
  //     .then(() =>  this.updateDisplayData());
  // }
