import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';


import * as vizjs from 'viz.js';

@Component({
  selector: 'app-testpage',
  templateUrl: './testpage.component.html',
  styleUrls: ['./testpage.component.css']
})
export class TestpageComponent implements OnInit {

  constructor(private domSanitizer: DomSanitizer) {}

  graph_string: string = `digraph G {
                        start -> a0;
                        start -> b0;
                        A1 -> b3;
                        GG2 -> a3;
                        a3 -> a0;
                        a3 -> end;
                        b3 -> end;
                        }`;
  svgimage: any;

  ngOnInit() {
    this.svgimage = this.domSanitizer.bypassSecurityTrustHtml(
        vizjs(this.graph_string, "svg"));
  	
  }

}
