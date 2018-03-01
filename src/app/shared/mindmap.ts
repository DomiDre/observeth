import { Component, OnInit, ElementRef, NgZone } from '@angular/core';
import { TxTreaterService } from '../shared/tx-treater.service';
import * as vis from 'vis';

export class Mindmap {

  public container: any;
  public network: any;

  public options: any;
  public status: string = '';
  public in_loading_status = false;

  constructor(private zone: NgZone,
              private txtreaterService: TxTreaterService) {
    this.container = document.getElementById('Mindmap');
  }

  drawMindMap(nodeList?: Array<any>, edgeList?: Array<any>): void {
    if (nodeList === undefined) nodeList = this.txtreaterService.nodes;
    if (edgeList === undefined) edgeList = this.txtreaterService.edges;

    this.status = 'Drawing Mindmap';
    if(nodeList.length == 0) {
      this.status = 'Mindmap contains no nodes (range to small or filters to restrictive)';
    }
    this.in_loading_status = true;
    let nodes = new vis.DataSet(nodeList)
    let edges = new vis.DataSet(edgeList);
    let data = {
      nodes: nodes,
      edges: edges
    };
    // Configuration for the Timeline
    this.options = {
      nodes: {
        shape: 'diamond',
        scaling: {
          min: 10,
          max: 25,
          label: {
            min: 5,
            max: 50,
            drawThreshold: 12,
            maxVisible: 20
          }
        },
        font: {
          size: 24,
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
      // edges: {
      //   width: 0.15,
      //   color: {inherit: 'from'},
      //   smooth: {
      //     type: 'continuous'
      //   },
      //   arrows: 'to',
      //   arrowStrikethrough: false
      // },
      physics: {
        stabilization: {
            enabled: true,
            iterations: 180, // maximum number of iteration to stabilize
            updateInterval: 10,
            onlyDynamicEdges: false,
            fit: true
        }
      },
      layout: {
        randomSeed: 1,
        improvedLayout: true,
        hierarchical: {
            enabled: false, //change to true to see the other graph
            direction: 'UD',
            sortMethod: 'directed'
        }
      },
      interaction: {
        dragNodes: true,
        tooltipDelay: 200,
        hover: true
      }
    };

    // console.log(container)
    // Create a Timeline
    this.network = new vis.Network(this.container, data, this.options);
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

    this.network.once("stabilizationIterationsDone", 
      () => {
        // this.options["physics"] = false;
        // this.network.setOptions(this.options);
        this.zone.run(() => {
          this.status = '';
          this.in_loading_status = false;
        })
      }
    );

  }
}