import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class MywalletOptionsService {

  public showOptions:boolean = false;

  private subject = new Subject<any>();

  constructor() { }


  openOptions(): void {
    this.showOptions = true;
  }

  requestingData(contractAddress: string, from: number, to: number): void {
    this.subject.next({contractAddress, from, to})
  }

  connectObservable(): Observable<any> {
    return this.subject.asObservable();
  }
  
}
