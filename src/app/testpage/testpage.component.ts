import { Component, OnInit, ElementRef } from '@angular/core';

import * as vis from 'vis';

@Component({
  selector: 'app-testpage',
  templateUrl: './testpage.component.html',
  styleUrls: ['./testpage.component.css']
})


export class TestpageComponent implements OnInit {

  constructor(private element: ElementRef) {}

  ngOnInit() {
    var container = document.getElementById('visualization');
    
    // Create a DataSet (allows two way data-binding)
    var nodes = new vis.DataSet([
              {id: 1, label: 'Node 1', size: 10},
              {id: 2, label: 'Node 2', size: 20},
              {id: 3, label: 'Node 3', size: 30},
              {id: 4, label: 'Node 4', size: 40},
              {id: 5, label: 'Node 5', size: 50}
          ]);
            // create an array with edges
    var edges = new vis.DataSet([
              {from: 1, to: 3},
              {from: 1, to: 2},
              {from: 2, to: 4},
              {from: 2, to: 5},
              {from: 3, to: 3}
            ]);
      var data = {
          nodes: nodes,
          edges: edges
        };
    // Configuration for the Timeline
    var options = {      nodes: {
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
      physics: false,
      interaction: {
        tooltipDelay: 200,
        hideEdgesOnDrag: true
      }
    };

    // Create a Timeline
    var timeline = new vis.Network(container, data, options);
  	
  }

}
