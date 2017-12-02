import { Component, OnInit } from '@angular/core';
import { Particle } from '../shared/particle';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {
  particle: object = {};
  
  constructor() { }

  ngOnInit() {
    this.particle = new Particle().getOptions();
  }
}