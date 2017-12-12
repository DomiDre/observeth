import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { FiltersService } from '../filters.service';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-live-ethereum-options',
  templateUrl: './live-ethereum-options.component.html',
  styleUrls: ['./live-ethereum-options.component.css']
})
export class LiveEthereumOptionsComponent implements OnInit, OnDestroy {
  @Input() display: boolean = false;
  @Output() sidebar_hidden = new EventEmitter<any>();
  
  public currentFilterSelection:string='';
  public filterPlaceholder:string='';
  public selectedFilterString: string;
  constructor(public filtersService: FiltersService) { }

  ngOnInit() {
  }

  ngOnDestroy() {

  }

  hidingSidebar(): void {
    this.sidebar_hidden.emit();
  }

  selectedFilter(filter: string) {
    this.currentFilterSelection = filter;
    this.filterPlaceholder = this.filtersService.filters[filter].title;
    this.selectedFilterString = this.filterPlaceholder;
  }

  filterValueChanged(filter: string) {
    let active_filter = this.filtersService.filters[filter]
    active_filter.set = 
      (active_filter.value !== active_filter.defaultValue)
    this.filtersService.validity_checks;
  }
}
