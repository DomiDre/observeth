import { Component, OnInit, OnDestroy, NgZone,  ElementRef } from '@angular/core';
import { TimerObservable } from 'rxjs/observable/TimerObservable';
import { Web3ConnectService } from '../shared/web3-connect.service';
import { Router } from '@angular/router';
import { FiltersService } from './filters.service';
import { TxTreaterService } from '../shared/tx-treater.service';
import { Subscription } from 'rxjs/Subscription';

import { Mindmap } from '../shared/mindmap';

import { LiveEthereumOptionsComponent } from './live-ethereum-options/live-ethereum-options.component';

@Component({
  selector: 'app-live-ethereum-observer',
  templateUrl: './live-ethereum-observer.component.html',
  styleUrls: ['./live-ethereum-observer.component.css'],
  providers: [ FiltersService ]
})
export class LiveEthereumObserverComponent implements OnInit, OnDestroy {

  public filtered_nodeId: Array<any>;
  public filtered_nodeAddress: Array<any>;
  public filtered_adjacencyList: Array<any>;

  public currentBlock: any; // the current Block containing all information
  public plottedBlock: number=0;

  public mindmap: Mindmap;
  public isLiveUpdating: boolean;
  public timer: any;
  public displayOptions: boolean = false;

  private subscription: Subscription;

  constructor(private zone: NgZone,
              private web3service: Web3ConnectService,
              private router: Router,
              private element: ElementRef,
              private filtersService: FiltersService,
              private txtreaterService: TxTreaterService) { }

  ngOnInit() {
    this.subscription = this.filtersService.connectObservable()
    .subscribe((data) => {
      //
    });

    this.mindmap = new Mindmap(this.zone, this.txtreaterService);
    this.txtreaterService.coin_supply = 96178066; // don't hardcode this
    this.isLiveUpdating = true;

    if (!this.web3service.isConnected()) this.router.navigateByUrl('/NoMetamask');
    else this.initializeDataCollection()
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
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

}