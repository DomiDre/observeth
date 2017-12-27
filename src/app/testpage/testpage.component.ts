import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-testpage',
  templateUrl: './testpage.component.html',
  styleUrls: ['./testpage.component.css']
})


export class TestpageComponent implements OnInit {

  constructor() {}

  ngOnInit() {
    // this.recursion_start()
    this.promise_test()
  }

  recursion_start(): void {
    let list = [];
    let depth = 0;
    list.push(depth)
    this.recursion_step(depth+1, list)
    this.recursion_step(depth+1, list)
    this.recursion_step(depth+1, list)
    console.log(list)
  }

  recursion_step(depth:number, list: any): void {
    list.push(depth)
    if (depth < 5) {
      this.recursion_step(depth+1, list)
    }

  }

  promise_test(): void {
    let b = () => new Promise((resolve, reject) => {
      console.log(20)
      setTimeout(() => resolve(), 1000);
    })

    let a = () => new Promise((resolve, reject) => {
      console.log(10)
      setTimeout(() => resolve(), 1000);
    }).then(b)

    new Promise((resolve, reject) => {
      console.log(0)
      setTimeout(() => resolve(1), 1000);
    }).then((result) => {
      console.log(result);
      return new Promise((resolve, reject) => {
        setTimeout(() => resolve(), 1000);
      })
    }).then(a).then(a)

  }
}
