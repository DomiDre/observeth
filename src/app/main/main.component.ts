import { Component, OnInit } from '@angular/core';
import { Particle } from '../shared/particle';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {
  public particle: Particle;
  
  constructor() { }

  ngOnInit() {
    this.particle = new Particle();
    this.particle.setDefaultLayout();
  }
}