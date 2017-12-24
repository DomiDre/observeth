import { Component, OnInit, Input, NgZone } from '@angular/core';
import { FiltersService } from './filters.service';
import { Filters } from './filters';

@Component({
  selector: 'app-filters',
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.css']
})
export class FiltersComponent implements OnInit {

  public filters = Filters;
  public currentFilterSelection:string='';
  public filterPlaceholder:string='';
  public selectedFilterString: string;
  public filterEntryBoxValue: number;
  public filterList: any = [];

  public availableFilters: Array<string> = [];
  public activeFilterList: Array<string> = [];

  constructor(private zone: NgZone,
              private filtersService: FiltersService) { }

  ngOnInit() {

    for(let filter in this.filters) {
      this.filters[filter].value = this.filters[filter].defaultValue;
      this.filters[filter].set = false;
    }
    this.setAvailableFilters();
    this.filterList.push({label:'Select Filter', value:''})
    for(let filter of this.availableFilters) {
      this.filterList.push({label:filter, 
                            value:filter})
    }
  }

  get filterName(): string {
    return this.filters[this.selectedFilterString].title;
  }

  get display(): boolean {
    return this.filtersService.showFilters;
  }
  set display(_display: boolean) {
    this.filtersService.showFilters = _display;
  }

  selectedFilter(): void {
    this.currentFilterSelection = this.selectedFilterString;
    this.filterPlaceholder = this.filters[this.selectedFilterString].title;
    this.filterEntryBoxValue = this.filters[this.selectedFilterString].value;
  }


  filterValueChanged(filter: string): void {
    this.filters[filter].value = this.filterEntryBoxValue;
    this.filters[filter].set = 
      (this.filters[filter].value !== this.filters[filter].defaultValue)

    this.filtersService.updateActiveFilters(this.filters);
    this.activeFilterList = this.filtersService.activeFilterList;
  
  }

  close(): void {
    this.filtersService.toggleHidingSidebar();
  }

  setAvailableFilters(): void {
    this.availableFilters = [];
    for(let filter in this.filters) {
      if(filter == '') continue
      if(!this.filtersService.TokenMode && this.filters[filter].tokenFilter) continue
      this.availableFilters.push(filter);
    }
  }

}
