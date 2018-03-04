import { Component, OnInit, OnDestroy, NgZone,  ElementRef } from '@angular/core';
import { TimerObservable } from 'rxjs/observable/TimerObservable';
import { Web3ConnectService } from '../shared/web3-connect.service';
import { Router } from '@angular/router';
import { TxTreaterService } from '../shared/tx-treater.service';
import { Subscription } from 'rxjs/Subscription';

import { Mindmap } from '../shared/mindmap';

import { FiltersComponent } from '../shared/filters/filters.component';
import { FiltersService } from '../shared/filters/filters.service';

import { StatisticsComponent } from '../shared/statistics/statistics.component';
import { StatisticsService } from '../shared/statistics/statistics.service';

import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs'
@Component({
  selector: 'app-live-ethereum-observer',
  templateUrl: './live-ethereum-observer.component.html',
  styleUrls: ['./live-ethereum-observer.component.css'],
  providers: [ FiltersService, StatisticsService ]
})
export class LiveEthereumObserverComponent implements OnInit, OnDestroy {

  public filtered_nodeId: Array<any>;
  public filtered_adjacencyList: Array<any>;

  public currentBlock: any; // the current Block containing all information
  public plottedBlock: number=0;

  public mindmap: Mindmap;
  public isLiveUpdating: boolean;
  public timer: any;
  public displayOptions: boolean = false;

  private subscription_filter: Subscription;
  private subscription_statistics: Subscription;

  constructor(private zone: NgZone,
              private web3service: Web3ConnectService,
              private router: Router,
              private element: ElementRef,
              private txtreaterService: TxTreaterService,
              private filtersService: FiltersService,
              private statisticsService: StatisticsService,
              private http: HttpClient) { }

  ngOnInit() {
    this.subscription_filter = this.filtersService.connectObservable()
    .subscribe(() => {
      this.updateDisplayData();
    });

    this.subscription_statistics = this.statisticsService.connectObservable()
    .subscribe(() => {})

    this.txtreaterService.disableTokenSetup();
    this.filtersService.setTokenMode(false);
    this.mindmap = new Mindmap(this.zone, this.txtreaterService);
    this.http_get('https://api.etherscan.io/api?module=stats&action=ethsupply&apikey=8FWC8GZWSE8SJKY7NBSE77XER4KQ8NXK1Z')
    .toPromise().then(res => {this.txtreaterService.coin_supply = res.result;})
    this.isLiveUpdating = true;


    console.log('Live Ethereum Observer connecting ... ')
    this.web3service.isConnected()
    .then((isConnected) => {
      if(!isConnected) {
        console.log('No connection...')
        this.router.navigateByUrl('/NoMetamask');
      } else {
        this.initializeDataCollection();
      }
    });
  }
  
  http_get(request: string): Observable<any> {
    return this.http.get(request);
  }

  ngOnDestroy() {
    if(this.subscription_filter) this.subscription_filter.unsubscribe();
    if(this.subscription_statistics) this.subscription_statistics.unsubscribe();
    this.isLiveUpdating = false;
    if(this.timer) this.timer.unsubscribe();
  }

  initializeDataCollection(): void {
    this.timer = TimerObservable.create(0, 2000)
    .subscribe( () => this.updateBlock())
  }

  updateBlock(): void {
    this.web3service.getBlockNumber()
    .then((blocknumber) => {
      if(blocknumber > this.plottedBlock) {
        this.plottedBlock = blocknumber;

        this.web3service.getBlock()
        .then((curblock) => {
          this.currentBlock = curblock;
          this.txtreaterService.reset_lists();
          this.updateDisplayData();
        })
      }
    })
  }
  
  updateDisplayData(): void {
    this.zone.run(() => {
      this.mindmap.in_loading_status = true;
    });
    this.txtreaterService.readTxList(this.currentBlock.transactions)
    .then(() => {
      [this.filtered_nodeId, this.filtered_adjacencyList] =
        this.filtersService.filtered_transactions()
      this.txtreaterService.setNodeList(this.filtered_nodeId);
      this.txtreaterService.setEdgeList(this.filtered_adjacencyList);
      this.mindmap.drawMindMap()
    })
  }

  toggleFreeze(): void {
    this.isLiveUpdating = !this.isLiveUpdating;
    if (this.isLiveUpdating) this.initializeDataCollection()
    else this.timer.unsubscribe();
  }

  toggleOptions(): void {
    this.filtersService.openFilters();
  }

  toggleStatistics(): void {
    this.statisticsService.openStatistics();    
  }

}