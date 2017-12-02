import { OnInit, ElementRef } from '@angular/core';

export class Mindmap implements OnInit {

  public container: any;
  public network: any;

  ngOnInit() {
    this.container = document.getElementById('Mindmap');
  }

  initMindmap(): void {
    
  }
}