import { Component, OnInit, Input } from '@angular/core';
import { FiltersService } from './filters.service';

@Component({
  selector: 'app-filters',
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.css']
})
export class FiltersComponent implements OnInit {

  public currentFilterSelection:string='';
  public filterPlaceholder:string='';
  public selectedFilterString: string;

  public filterList: any = [];
  constructor(public filtersService: FiltersService) { }

  ngOnInit() {
    this.filterList.push({label:'Select Filter', value:''})
    for(let filter of this.filtersService.availableFilters) {
      this.filterList.push({label:filter, 
                            value:filter})
    }
  }

  get filterName(): string {
    return this.filtersService.filters[this.selectedFilterString].title;
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
