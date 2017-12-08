import { Component, OnInit, NgZone,  ElementRef } from '@angular/core';
import { TimerObservable } from 'rxjs/observable/TimerObservable';
import { Web3ConnectService } from '../shared/web3-connect.service';
import { Router } from '@angular/router';
import { Filters } from './filters'

import { Mindmap } from '../shared/mindmap';

@Component({
  selector: 'app-live-ethereum-observer',
  templateUrl: './live-ethereum-observer.component.html',
  styleUrls: ['./live-ethereum-observer.component.css']
})
export class LiveEthereumObserverComponent implements OnInit {

  public connected_account: string;
  public filtered_transactions: Array<any>;
  public currentBlock: any; // the current Block containing all information
  public plottedBlock: number=0;

  public filters = Filters;
  public filterButtonLabel: string="Add Filter";
  public filterPlaceholder:string="";
  public filterValue:number;
  public activeFilterList: Array<string>;

  public currentFilterSelection:string='';

  public mindmap: Mindmap;

  public isLiveUpdating: boolean;

  public timer: any;

  constructor(private zone: NgZone,
              private web3service: Web3ConnectService,
              private router: Router,
              private element: ElementRef) { }

  ngOnInit() {
    this.filterPlaceholder = this.filters[this.currentFilterSelection].title;
    this.mindmap = new Mindmap(this.zone, this.web3service);
    this.mindmap.coin_supply = 96178066; // don't hardcode this
    this.isLiveUpdating = true;

    if (!this.web3service.isConnected()) this.router.navigateByUrl('/NoMetamask');
    else this.initializeDataCollection()
  }

  initializeDataCollection(): void {
    this.timer = TimerObservable.create(0, 2000)
    .subscribe( () => this.updateBlock())
  }

  selectedFilter(filter: string) {
    this.currentFilterSelection = filter;
    this.filterPlaceholder = this.filters[filter].title;
    this.filterButtonLabel = filter;
  }

  filterValueChanged(filter: string) {
    this.filters[filter].set = 
      (this.filters[filter].value !== this.filters[filter].defaultValue)
    this.updateDisplayData()
  }

  updateBlock(): void {
      this.web3service.getBlockNumber()
      .then((blocknumber) => {
        if(blocknumber > this.plottedBlock) {
          this.plottedBlock = blocknumber;

          this.web3service.getBlock()
          .then((curblock) => {
            this.currentBlock = curblock;
            this.updateDisplayData();
          })
        }
      })
  }
  
  updateDisplayData(): void {
    this.zone.run(() => {
      this.mindmap.in_loading_status = true;
      this.filtered_transactions = new Array<any>();
      this.activeFilterList = new Array<string>();

      let validity_checks: { (tx: any): boolean}[] = []; 

      if (this.filters['MinTxVol'].set) {
        this.activeFilterList.push('Transaction volume >= ' + this.filters['MinTxVol'].value);
        validity_checks.push((tx) => tx.value/1e18 >= this.filters['MinTxVol'].value);
      }
      
      if (this.filters['MinGasPri'].set) {
        this.activeFilterList.push('Gas price >= ' + this.filters['MinGasPri'].value);
        validity_checks.push((tx) => tx.gasPrice/1e9 >= this.filters['MinGasPri'].value);
      }
      
      if (this.filters['MinGas'].set) {
        this.activeFilterList.push('Gas >= ' + this.filters['MinGas'].value);
        validity_checks.push((tx) => tx.gas >= this.filters['MinGas'].value);
      }
      
      for (let tx of this.currentBlock.transactions) {
        let valid_tx:boolean = true;

        for (let i=0; i<validity_checks.length; i++) 
          valid_tx = valid_tx && validity_checks[i](tx)

        if (valid_tx)
          this.filtered_transactions.push(tx);
      }
    });
    this.mindmap.initMindmapFromTxList(this.filtered_transactions)
    .then(() => {
      this.mindmap.drawMindMap(this.mindmap.nodes, this.mindmap.edges)
    });
  }

  toggleFreeze(): void{
    this.isLiveUpdating = !this.isLiveUpdating;
    if (this.isLiveUpdating) this.initializeDataCollection()
    else this.timer.unsubscribe();
  }

}