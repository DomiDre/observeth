import { Injectable } from '@angular/core';
import { TxTreaterService } from '../shared/tx-treater.service';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs/Subject';

const Filters = {
  '': {
    title: '',
    defaultValue: undefined,
    value: undefined,
    set: false
  },
  'MinBalanceFrom': {
    title: 'Minimum node balance of transaction sender',
    defaultValue: 0,
    value: 0,
    set: false
  },
  'MinBalanceTo': {
    title: 'Minimum node balance of transaction receiver',
    defaultValue: 0,
    value: 0,
    set: false
  },
  'MinTxVol': {
    title: 'Minimum transaction volume',
    defaultValue: 0,
    value: 0,
    set: false
  },
  // 'MinGasPri': {
  //   title: 'Minimum gas price',
  //   defaultValue: 0,
  //   value: 0,
  //   set: false
  // },
  // 'MinGas': {
  //   title: 'Minimum gas',
  //   defaultValue: 0,
  //   value: 0,
  //   set: false
  // }
}

@Injectable()
export class FiltersService {

  public filters = Filters;
  public filterValue:number; 
  public activeFilterList: Array<string>; // string list of all active filters 
  public availableFilters: Array<string>=[];

  public showFilters:boolean = false;
  public subject = new Subject<any>();

  constructor(private txtreaterService: TxTreaterService) {
    for(let filter in this.filters) {
      if(filter !== '') this.availableFilters.push(filter);
    }
  }

  get validity_checks(): { (tx: any): boolean}[]{
    this.activeFilterList = [];
    let validity_checks = [];
    if (this.filters['MinTxVol'].set) {
      this.activeFilterList.push('Transaction volume >= ' + this.filters['MinTxVol'].value + ' Ξ');
      validity_checks.push((tx) => tx.value/1e18 >= this.filters['MinTxVol'].value);
    }
    
    if (this.filters['MinBalanceFrom'].set) {
      this.activeFilterList.push('From node balance >= ' + this.filters['MinBalanceFrom'].value + ' Ξ');
      validity_checks.push((tx) => this.txtreaterService.nodeBalanceList[tx.from]/1e18 >= this.filters['MinBalanceFrom'].value);
    }

    if (this.filters['MinBalanceTo'].set) {
      this.activeFilterList.push('To node balance >= ' + this.filters['MinBalanceTo'].value + ' Ξ');
      validity_checks.push((tx) => this.txtreaterService.nodeBalanceList[tx.to]/1e18 >= this.filters['MinBalanceTo'].value);
    }

    // if (this.filters['MinGasPri'].set) {
    //   this.activeFilterList.push('Gas price >= ' + this.filters['MinGasPri'].value + ' GWei');
    //   validity_checks.push((tx) => tx.gasPrice/1e9 >= this.filters['MinGasPri'].value);
    // }
    
    // if (this.filters['MinGas'].set) {
    //   this.activeFilterList.push('Gas >= ' + this.filters['MinGas'].value);
    //   validity_checks.push((tx) => tx.gas >= this.filters['MinGas'].value);
    // }
    return validity_checks;
  }

  filtered_transactions(nodeIds?:Array<number>, adjacencyList?: Array<any>): [Array<number>, Array<any>] {
    if (adjacencyList === undefined) {
      nodeIds = this.txtreaterService.nodeIdList;
      adjacencyList = this.txtreaterService.nodeAdjacencyList;
    }

    let validity_checks = this.validity_checks; // get array of functions to check on tx

    let valid_ids = new Array<boolean>();
    for(let i=0; i<adjacencyList.length; i++) valid_ids.push(false); // initialize list to determine if node is still included after filter

    let prefiltered_adjacencyList = new Array<any>();
    for(let i=0; i<adjacencyList.length; i++) {
      let node_included = false;

      for(let j=0; j<adjacencyList[i].length; j++) {
        let tx = adjacencyList[i][j];
        let valid_tx:boolean = true;
        for (let k=0; k<validity_checks.length; k++) 
          valid_tx = valid_tx && validity_checks[k](tx)
        
        if (valid_tx) {
          if (!node_included) {
            node_included = true;
            prefiltered_adjacencyList[i] = [];
          }
          prefiltered_adjacencyList[i].push(tx)
          valid_ids[tx.from] = true;
          valid_ids[tx.to] = true;
        }
      }
    }

    let filtered_nodeIds = new Array<number>();
    let filtered_adjacencyList = new Array<any>();
    for(let i=0; i<valid_ids.length; i++) {
      if (valid_ids[i]) {
        filtered_nodeIds.push(nodeIds[i]);
        filtered_adjacencyList.push(prefiltered_adjacencyList[i])
      }
    }
    return [filtered_nodeIds, filtered_adjacencyList]
  }

  openFilters(): void {
    this.showFilters = true;
  }

  connectObservable(): Observable<any> {
    return this.subject.asObservable();
  }
}
