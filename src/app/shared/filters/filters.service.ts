import { Injectable } from '@angular/core';
import { TxTreaterService } from '../tx-treater.service';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs/Subject';
import { Filters } from './filters';

@Injectable()
export class FiltersService {

  public filters = Filters;
  public filterValue:number; 
  public activeFilterList: Array<string>; // string list of all active filters 
  public availableFilters: Array<string>=[];

  public showFilters:boolean = false;
  public subject = new Subject<any>();
  public coinSymbol: string = 'Ξ';

  public TokenMode: boolean = false;
  constructor(private txtreaterService: TxTreaterService) {
    this.setAvailableFilters();
  }

  setTokenMode(state:boolean): void {
    if (state) {
      this.TokenMode = true;
      this.coinSymbol = '';
    } else {
      this.TokenMode = false;
      this.coinSymbol = 'Ξ';
    }
    this.setAvailableFilters();
  }

  setAvailableFilters(): void {
    this.availableFilters = [];
    for(let filter in this.filters) {
      if(filter == '') continue
      if(!this.TokenMode && this.filters[filter].tokenFilter) continue
      this.availableFilters.push(filter);
    }
  }

  toggleHidingSidebar(): void {
    this.subject.next();
  }

  getActiveFilterList(): Array<string> {
    return this.activeFilterList;
  }
  get validity_checks(): { (tx: any): boolean}[]{
    this.activeFilterList = [];
    let validity_checks = [];
    if (this.filters['MinTxVol'].set) {
      this.activeFilterList.push('Transaction volume >= ' + this.filters['MinTxVol'].value + ' ' + this.coinSymbol);
      validity_checks.push((tx) => tx.value/this.txtreaterService.tokenDecimals >= this.filters['MinTxVol'].value);
    }
    
    if (this.filters['MinEthBalanceFrom'].set) {
      this.activeFilterList.push('Ether balance of transaction sender >= ' + this.filters['MinEthBalanceFrom'].value + ' Ξ');
      validity_checks.push((tx) => this.txtreaterService.nodeBalanceList[tx.from]/1e18 >= this.filters['MinEthBalanceFrom'].value);
    }

    if (this.filters['MinEthBalanceTo'].set) {
      this.activeFilterList.push('Ether balance of transaction receiver >= ' + this.filters['MinEthBalanceTo'].value + ' Ξ');
      validity_checks.push((tx) => this.txtreaterService.nodeBalanceList[tx.to]/1e18 >= this.filters['MinEthBalanceTo'].value);
    }

    if (this.filters['MinEthBalance'].set) {
      this.activeFilterList.push('Ether balance of nodes >= ' + this.filters['MinEthBalance'].value + ' Ξ');
      validity_checks.push((tx) => this.txtreaterService.nodeBalanceList[tx.to]/1e18 >= this.filters['MinEthBalance'].value);
      validity_checks.push((tx) => this.txtreaterService.nodeBalanceList[tx.from]/1e18 >= this.filters['MinEthBalance'].value);
    }
    
    if(this.TokenMode) {
      if (this.filters['MinTokBalanceFrom'].set) {
        this.activeFilterList.push('From node token balance >= ' + this.filters['MinTokBalanceFrom'].value + ' ' + this.coinSymbol);
        validity_checks.push((tx) => this.txtreaterService.nodeBalanceList[tx.from]/this.txtreaterService.tokenDecimals >= this.filters['MinTokBalanceFrom'].value);
      }

      if (this.filters['MinTokBalanceTo'].set) {
        this.activeFilterList.push('To node token balance >= ' + this.filters['MinTokBalanceTo'].value + ' ' + this.coinSymbol);
        validity_checks.push((tx) => this.txtreaterService.nodeBalanceList[tx.to]/this.txtreaterService.tokenDecimals >= this.filters['MinTokBalanceTo'].value);
      }

      if (this.filters['MinTokBalance'].set) {
        this.activeFilterList.push('Node token balance >= ' + this.filters['MinTokBalance'].value + ' ' + this.coinSymbol);
        validity_checks.push((tx) => this.txtreaterService.nodeTokenBalanceList[tx.to]/this.txtreaterService.tokenDecimals >= this.filters['MinTokBalance'].value);
        validity_checks.push((tx) => this.txtreaterService.nodeTokenBalanceList[tx.from]/this.txtreaterService.tokenDecimals >= this.filters['MinTokBalance'].value);
      }
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
