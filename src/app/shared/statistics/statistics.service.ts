import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs/Subject';
import { TxTreaterService } from '../tx-treater.service';

@Injectable()
export class StatisticsService {

  public subject = new Subject<any>();
  public showStatistics:boolean = false;

  constructor(private txtreaterService: TxTreaterService) { }

  openStatistics(): void {
    this.showStatistics = !this.showStatistics;
  }

  connectObservable(): Observable<any> {
    return this.subject.asObservable();
  }

  get number_of_nodes(): number {
    return this.txtreaterService.nodes.length;
  }

  get number_of_edges(): number {
    return this.txtreaterService.edges.length;
  }

  get coinSymbol(): string {
    if (this.txtreaterService.tokenSymbol == undefined)
      return 'Ξ';
    else 
      return this.txtreaterService.tokenSymbol;
  }

  get_transaction_volume(): number{
    let tx_volume = 0
    for (let i=0; i<this.txtreaterService.plotted_adjacency_list.length; i++) {
      let adjacency_list = this.txtreaterService.plotted_adjacency_list[i];
      if (adjacency_list === undefined) continue;
      for(let j=0; j<adjacency_list.length;j++) {
        tx_volume += adjacency_list[j].value/this.txtreaterService.tokenDecimals;
      }
    }
    return tx_volume
  }
}
