import { Component, OnInit, Input, NgZone, ElementRef } from '@angular/core';
import { Web3ConnectService } from '../shared/web3-connect.service';
import { TXData } from '../shared/txData';
import * as vis from 'vis';
import { ERC20_abi } from '../shared/erc20'

@Component({
  selector: 'app-contract-observer',
  templateUrl: './contract-observer.component.html',
  styleUrls: ['./contract-observer.component.css']
})
export class ContractObserverComponent implements OnInit {

  @Input() public tokenContractAddress: string='0x8f8221afbb33998d8584a2b05749ba73c37a938a';

  @Input() public numBlocks: number=100;
  private transactionList: Array<TXData>;

  private firstBlockNumber: number=1;
  private latestBlockNumber: number=1;
  private loadingProcessing: boolean=false;
  private processingBlockNumber: number;
  private current_subscription: any;
  private network: any;
  
  private ERC20_contract: any;
  private TokenTotalSupply: number;
  private TokenDecimals: number;
  private TokenSymbol: string;

  @Input() private progress: number;

  constructor(private zone: NgZone,
              private web3service: Web3ConnectService,
              private element: ElementRef) { }

  ngOnInit() {
  }

  updateData(): void {
    this.transactionList = new Array<any>();
    this.loadingProcessing = true;
    this.progress = 0;


    document.getElementById('loadingBar').style.display = 'block';
    document.getElementById('loadingBar').style.opacity = '10';
    document.getElementById('loading_progress_text').innerHTML = '0%';
    document.getElementById('loadingBar_header_text').innerHTML = 'Fetching Data from Ethereum Blockchain.';
    document.getElementById('bar').style.width = '0px';

    // Web3 0.20.2
    this.ERC20_contract = this.web3service.web3.eth.contract(ERC20_abi)
                         .at(this.tokenContractAddress);    
    this.ERC20_contract.decimals((error, result) => 
      this.TokenDecimals = this.web3service.web3.toDecimal(result));
 
    this.ERC20_contract.symbol((error, result) => 
      this.TokenSymbol = result);

    this.ERC20_contract.totalSupply((error, result) => 
      this.TokenTotalSupply = this.web3service.web3.toDecimal(result));
    
    this.web3service.web3.eth.getBlockNumber(
      (error, blocknumber) => {
      this.updateFirstAndLastBlockNumber(blocknumber);
      this.web3service.web3.eth.filter({
        fromBlock: this.firstBlockNumber,
        toBlock: this.latestBlockNumber,
        address: this.tokenContractAddress
      })
      .get((error, logs) => {
        this.evaluateLogs0_20(logs, 
          () => {
            this.initMindmap();
            this.loadingProcessing = false;
          })
      })
    });
  
    // Web3 1.0
    // this.web3service.web3.eth.getBlockNumber() // gets the latest block number
    // .then(blocknumber => this.updateFirstAndLastBlockNumber(blocknumber))
    // .then(() => this.getLogs())
    // .then(logs => this.evaluateLogs(logs))
    // .then(() => this.initMindmap())
    // .then(() => this.loadingProcessing=false);
  }

  updateFirstAndLastBlockNumber(blocknumber): void {
      this.latestBlockNumber = blocknumber;
      this.firstBlockNumber = blocknumber-this.numBlocks;
      this.processingBlockNumber = this.firstBlockNumber;
  }

  getLogs(): Promise<any> {
    return this.web3service.web3.eth.getPastLogs( { 
      fromBlock: this.web3service.web3.utils.toHex(this.firstBlockNumber),
      toBlock: this.web3service.web3.utils.toHex(this.latestBlockNumber),
      address: this.tokenContractAddress
    })
  }
  
  evaluateLogs0_20(logs, callback): void {
    let TransferHex = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
    let ApproveHex = '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925';

    for(let txData of logs) {
      let methodId = txData.topics['0'];
      if (methodId === TransferHex) { // transfer: 1 transfers to 2 
        let txEntry = new TXData();
        txEntry.hash = txData.transactionHash;
        
        txEntry.value = this.web3service.web3.toDecimal(txData.data);
        txEntry.from = this.removeLeadingZeros0_20(txData.topics['1']);
        txEntry.to = this.removeLeadingZeros0_20(txData.topics['2']);
        this.transactionList.push(txEntry);
      } else if (methodId == ApproveHex) { // approve: you allowed somebody else to withdraw from your account
        // not implemented yet
      } else {
        console.log(methodId,' not known, check ', txData.transactionHash,'. Please report this.');
      }
      this.processingBlockNumber = txData.blockNumber;
    }
    callback();
  }

  removeLeadingZeros0_20(data): string {
    let cleaned_string = data.replace(/0x0*/,'0x');
    while(cleaned_string.length < 42) cleaned_string = cleaned_string.replace('0x', '0x0')
    return cleaned_string;
  }

  removeLeadingZeros(data): string {
    let byteData = this.web3service.web3.utils.hexToBytes(data);
    for (let i = 0; i < byteData.length; i++) {
      if (byteData[0] == 0) {
        byteData.splice(0, 1);
      }
    }
    return this.web3service.web3.utils.bytesToHex(byteData);
  }

  evaluateLogs(logs): void {
    let TransferHex = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
    let ApproveHex = '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925';

    for(let txData of logs) {
      let methodId = txData.topics['0'];
      if (methodId === TransferHex) { // transfer: 1 transfers to 2 
        let txEntry = new TXData();
        txEntry.hash = txData.transactionHash;
        // check 1e18 factor
        txEntry.value = this.web3service.web3.utils.hexToNumberString(txData.data);
        txEntry.from = this.removeLeadingZeros(txData.topics['1']);
        txEntry.to = this.removeLeadingZeros(txData.topics['2']);
        this.transactionList.push(txEntry);
      } else if (methodId == ApproveHex) { // approve: you allowed somebody else to withdraw from your account
        // not implemented yet
      } else {
        console.log(methodId,' not known, check ', txData.transactionHash,'. Please report this.');
      }
      this.processingBlockNumber = txData.blockNumber;          
    }
  }


  initMindmap(): void {
    document.getElementById('loadingBar_header_text').innerHTML = 'Sorting nodes and edges.';
    let nodeList = new Array();
    let edgeList = new Array();

    let nodeArray = new Array();

    let id_running: number = 1;
    let id_from: number;
    let id_to: number;

    for(let txData of this.transactionList){
      let tx_from: string = txData.from;
      let tx_to: string = txData.to;
      let tx_value: number = txData.value;
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
               'Value: ' + tx_value/(10**this.TokenDecimals) + ' ' + this.TokenSymbol,
        width: this.getEdgeSize(tx_value),
        url:  'https://etherscan.io/tx/'+tx_hash
      });
    }

    document.getElementById('loadingBar_header_text').innerHTML = 'Getting Ether and Token balances.';
    let nodes_remaining = nodeList.length;
    for(let i=0; i<nodeList.length; i++) {
      this.ERC20_contract.balanceOf(nodeList[i],
      (error, TokenBalance) => {
        let tokenValue = this.web3service.web3.toDecimal(TokenBalance);
    
        this.web3service.web3.eth.getBalance(nodeList[i], 
        (error, balance) => {
          // console.log(i, error, balance);
          let etherValue = this.web3service.web3.toDecimal(balance);
          nodeArray.push({
            id: i+1,
            label: nodeList[i].slice(0, 8),
            size: this.getNodeSize(tokenValue),
            url: 'https://etherscan.io/address/'+nodeList[i],
            title: 'Wallet: '+ nodeList[i] + '<br>'+
                   'Ether Balance: ' + etherValue/1e18 + '  Ξ<br>'+
                   'Token Balance: ' + tokenValue/(10**this.TokenDecimals) + ' ' + this.TokenSymbol
          })
          --nodes_remaining;
          // console.log(i, nodes_remaining)
          if (nodes_remaining <= 0) this.drawMindMap(nodeArray, edgeList);
        })
      })     
    }
  }

  getNodeSize(balance):number {
    let relative_balance: number = balance / this.TokenTotalSupply;
    if (relative_balance > 1e-4) return 25
    else if (1e-7 > relative_balance) return 5
    else return (relative_balance - 1e-7) * (25-5)/(1e-4 - 1e-7) + 5
  }

  getEdgeSize(value):number {
    let relative_value: number = value / this.TokenTotalSupply;
    if (relative_value > 1e-5) return 2.5
    else if (1e-8 > relative_value) return 0.5
    else return (relative_value - 1e-8) * (2.5-0.5)/(1e-5 - 1e-8) + 0.5
  }

  drawMindMap(nodeArray, edgeList): void {
    document.getElementById('loadingBar_header_text').innerHTML = 'Drawing Mindmap';

    let container = document.getElementById('TokenMindmap');
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
      interaction: {
        dragNodes: true,
        tooltipDelay: 200,
        hover: true
      }
    };

    // console.log(container)
    // Create a Timeline
    this.network = new vis.Network(container, data, options);
    
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
    

    this.network.on("stabilizationProgress", function(params) {
      let maxWidth = 100;
      let minWidth = 0;
      let widthFactor = params.iterations/params.total;
      let width = Math.max(minWidth,maxWidth * widthFactor);
      document.getElementById('bar').style.width = width + '%';
      document.getElementById('loading_progress_text').innerHTML = Math.round(widthFactor*100) + '%';
    });
    this.network.once("stabilizationIterationsDone", function() {
        document.getElementById('loading_progress_text').innerHTML = '100%';
        document.getElementById('bar').style.width = '100%';
        document.getElementById('loadingBar').style.opacity = '0';
        // really clean the dom element
        setTimeout(function () {document.getElementById('loadingBar').style.display = 'none';}, 500);
    });


  }
}
      
