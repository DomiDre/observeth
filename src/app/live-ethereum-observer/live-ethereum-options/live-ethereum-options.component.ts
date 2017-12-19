import { Component, OnInit, Input } from '@angular/core';
import { FiltersService } from '../filters.service';

@Component({
  selector: 'app-live-ethereum-options',
  templateUrl: './live-ethereum-options.component.html',
  styleUrls: ['./live-ethereum-options.component.css']
})
export class LiveEthereumOptionsComponent implements OnInit {

  public currentFilterSelection:string='';
  public filterPlaceholder:string='';
  public selectedFilterString: string;
  constructor(public filtersService: FiltersService) { }

  ngOnInit() {
  }

  get display(): boolean {
    return this.filtersService.showFilters;
  }
  set display(_display: boolean) {
    this.filtersService.showFilters = _display;
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
