import { Injectable, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class OptionsService {

  public showOptions:boolean = false;

  private subject = new Subject<any>();

  constructor() { }

  openOptions(): void {
    this.showOptions = true;
  }

  requestingData(from: number, to: number): void {
    this.subject.next({from, to})
  }

  connectObservable(): Observable<any> {
    return this.subject.asObservable();
  }
}
