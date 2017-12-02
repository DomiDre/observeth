import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-no-metamask',
  templateUrl: './no-metamask.component.html',
  styleUrls: ['./no-metamask.component.css']
})
export class NoMetamaskComponent implements OnInit {
  myStyle: object = {};
  myParams: object = {};
  width: number = 100;
  height: number = 100;
  
  constructor() { }

  ngOnInit() {
    this.myStyle = {
      'position': 'fixed',
      'width': '100%',
      'height': '100%',
      'z-index': -1,
      'top': 0,
      'left': 0,
      'right': 0,
      'bottom': 0,
    };
    this.myParams = {
      particles: {
        number: {
          value: 200,
        },
        color: {
          value: '#ff0000'
        },
        shape: {
          type: 'circle',
        },
        line_linked: {
          enable_auto: true,
          width:1,
          opacity: 0.4,
          color: '#aa0000',
          distance: 150
        }
      }
    };
  }
}
