import { Component, OnInit, Input, NgZone, ElementRef } from '@angular/core';
import { Web3ConnectService } from '../shared/web3-connect.service';
import { TXData } from '../shared/txData';
import * as vis from 'vis';

@Component({
  selector: 'app-contract-observer',
  templateUrl: './contract-observer.component.html',
  styleUrls: ['./contract-observer.component.css']
})
export class ContractObserverComponent implements OnInit {

  @Input() private tokenContractAddress: string='0x8f8221afbb33998d8584a2b05749ba73c37a938a';

  @Input() private numBlocks: number=100;
  private transactionList: Array<TXData>;

  private firstBlockNumber: number=1;
  private latestBlockNumber: number=1;
  private loadingProcessing: boolean=false;
  private processingBlockNumber: number;
  private current_subscription: any;
  @Input() private progress: number;
  constructor(private zone: NgZone,
              private web3service: Web3ConnectService,
              private element: ElementRef) { }

  ngOnInit() {
    this.updateData();
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

  updateData(): void {
    this.transactionList = new Array<any>();
    this.loadingProcessing = true;
    this.progress = 0;
    // if (this.current_subscription) {
    //   console.log('Unsubscribing previous subscription.')
    //   this.current_subscription.unsubscribe((err,res) => {
    //       if(res) {
    //         console.log('Unsubscribed previous subscription');
    //       }}
    //   )
    // }
    let TransferHex = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
    let ApproveHex = '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925';
    this.web3service.web3.eth.getBlockNumber()
    .then(blocknumber => {
      this.latestBlockNumber = blocknumber;
      this.firstBlockNumber = blocknumber-this.numBlocks;
      this.processingBlockNumber = this.firstBlockNumber;
    })
    .then(() => {
      console.log('Subscribing to logs.');
      console.log(this.firstBlockNumber,
                  this.latestBlockNumber,
                  this.tokenContractAddress);

      return this.web3service.web3.eth.getPastLogs( { 
        fromBlock: this.web3service.web3.utils.toHex(this.firstBlockNumber),
        toBlock: this.web3service.web3.utils.toHex(this.latestBlockNumber),
        address: this.tokenContractAddress
      }).then(result => {

        for(let txData of result) {
          let methodId = txData.topics['0'];

          if (methodId === TransferHex) {
            let txEntry = new TXData();
            txEntry.hash = txData.transactionHash;
            // check 1e18 factor
            txEntry.value = this.web3service.web3.utils.hexToNumberString(txData.data)/1e18;
            txEntry.from = this.removeLeadingZeros(txData.topics['1']);
            txEntry.to = this.removeLeadingZeros(txData.topics['2']);
            this.transactionList.push(txEntry);

          } else if (methodId == ApproveHex) {
            // not implemented yet
            // console.log(txData, methodId)
            // let txEntry = new TXData();
            // txEntry.hash = txData.transactionHash;
            // check 1e18 factor
            // txEntry.value = this.web3service.web3.utils.hexToNumberString(txData.data)/1e18;
            // txEntry.from = this.removeLeadingZeros(txData.topics['1']);
            // txEntry.to = this.removeLeadingZeros(txData.topics['2']);
            // this.transactionList.push(txEntry);
          } else {
            console.log(methodId,' not known, check ', txData.transactionHash);
          }

          

          this.processingBlockNumber = txData.blockNumber;          
        }
      }).then(() => {
        this.loadingProcessing=false;
        this.makeMindmap();
      });
    })
  }

  makeMindmap(): void {
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

      edgeList.push({from: id_from, to: id_to});

      

    }
    for(let i=0; i<nodeList.length; i++) {
      /// CONTINUE HERE
      nodeArray.push({
        id: i+1,
        label: nodeList[i].slice(0, 8),
        size: 10,
        url: 'https://etherscan.io/address/'+nodeList[i],
        title: 'test '+i
      })
    }

    var container = document.getElementById('visualization');
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
        shape: 'dot',
        scaling: {
          min: 10,
          max: 30,
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
        }
      },
      edges: {
        width: 0.15,
        color: {inherit: 'from'},
        smooth: {
          type: 'continuous'
        }
      },
      physics: true,
      interaction: {
        dragNodes: false,
        tooltipDelay: 200,
        hover: true
      }
    };

    // console.log(container)
    // Create a Timeline
    let timeline = new vis.Network(container, data, options);
    // timeline.dragNodes = false;
    timeline.on("selectNode", params => {
        if (params.nodes.length === 1) {
            var node = nodes.get(params.nodes[0]);
            window.open(node.url, '_blank');
        }
    });
  }
}
      
