import { Component, OnInit } from '@angular/core';
import { Particle } from '../shared/particle';

@Component({
  selector: 'app-no-metamask',
  templateUrl: './no-metamask.component.html',
  styleUrls: ['./no-metamask.component.css']
})
export class NoMetamaskComponent implements OnInit {
  public particle: Particle;
  
  constructor() { }

  ngOnInit() {
    this.particle = new Particle();
    this.particle.setErrorLayout();
  }
}
