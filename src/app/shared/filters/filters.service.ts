import { Injectable } from '@angular/core';
import { TxTreaterService } from '../tx-treater.service';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class FiltersService {

  public filterValue:number; 
  public activeFilterList: Array<string>; // string list of all active filters 
  public availableFilters: Array<string>=[];

  public showFilters:boolean = false;
  public subject = new Subject<any>();
  public coinSymbol: string = 'Ξ';

  public TokenMode: boolean = false;
  public validity_checks: { (tx: any): boolean}[] = [];

  constructor(private txtreaterService: TxTreaterService) {
  }

  setTokenMode(state:boolean): void {
    if (state) {
      this.TokenMode = true;
      this.coinSymbol = '';
    } else {
      this.TokenMode = false;
      this.coinSymbol = 'Ξ';
    }
  }


  toggleHidingSidebar(): void {
    this.subject.next();
  }

  updateActiveFilters(filters: any): void {
    this.activeFilterList = [];
    this.validity_checks = [];
    if (filters['MinTxVol'].set) {
      this.activeFilterList.push('Transaction volume >= ' + filters['MinTxVol'].value + ' ' + this.coinSymbol);
      this.validity_checks.push((tx) => tx.value/this.txtreaterService.tokenDecimals >= filters['MinTxVol'].value);
    }
    
    if (filters['MinEthBalanceFrom'].set) {
      this.activeFilterList.push('Ether balance of transaction sender >= ' + filters['MinEthBalanceFrom'].value + ' Ξ');
      this.validity_checks.push((tx) => this.txtreaterService.nodeBalanceList[tx.from]/1e18 >= filters['MinEthBalanceFrom'].value);
    }

    if (filters['MinEthBalanceTo'].set) {
      this.activeFilterList.push('Ether balance of transaction receiver >= ' + filters['MinEthBalanceTo'].value + ' Ξ');
      this.validity_checks.push((tx) => this.txtreaterService.nodeBalanceList[tx.to]/1e18 >= filters['MinEthBalanceTo'].value);
    }

    if (filters['MinEthBalance'].set) {
      this.activeFilterList.push('Ether balance of nodes >= ' + filters['MinEthBalance'].value + ' Ξ');
      this.validity_checks.push((tx) => this.txtreaterService.nodeBalanceList[tx.to]/1e18 >= filters['MinEthBalance'].value);
      this.validity_checks.push((tx) => this.txtreaterService.nodeBalanceList[tx.from]/1e18 >= filters['MinEthBalance'].value);
    }
    
    if(this.TokenMode) {
      if (filters['MinTokBalanceFrom'].set) {
        this.activeFilterList.push('From node token balance >= ' + filters['MinTokBalanceFrom'].value + ' ' + this.coinSymbol);
        this.validity_checks.push((tx) => this.txtreaterService.nodeBalanceList[tx.from]/this.txtreaterService.tokenDecimals >= filters['MinTokBalanceFrom'].value);
      }

      if (filters['MinTokBalanceTo'].set) {
        this.activeFilterList.push('To node token balance >= ' + filters['MinTokBalanceTo'].value + ' ' + this.coinSymbol);
        this.validity_checks.push((tx) => this.txtreaterService.nodeBalanceList[tx.to]/this.txtreaterService.tokenDecimals >= filters['MinTokBalanceTo'].value);
      }

      if (filters['MinTokBalance'].set) {
        this.activeFilterList.push('Node token balance >= ' + filters['MinTokBalance'].value + ' ' + this.coinSymbol);
        this.validity_checks.push((tx) => this.txtreaterService.nodeTokenBalanceList[tx.to]/this.txtreaterService.tokenDecimals >= filters['MinTokBalance'].value);
        this.validity_checks.push((tx) => this.txtreaterService.nodeTokenBalanceList[tx.from]/this.txtreaterService.tokenDecimals >= filters['MinTokBalance'].value);
      }
    }

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
