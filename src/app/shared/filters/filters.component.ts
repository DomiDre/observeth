import { Component, OnInit, Input, NgZone } from '@angular/core';
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
  public filterEntryBoxValue: number;
  public filterList: any = [];

  public activeFilterList: Array<string> = [];

  constructor(private zone: NgZone,
              private filtersService: FiltersService) { }

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

  selectedFilter(): void {
    this.currentFilterSelection = this.selectedFilterString;
    this.filterPlaceholder = this.filtersService.filters[this.selectedFilterString].title;
    this.filterEntryBoxValue = this.filtersService.filters[this.selectedFilterString].value;
  }

  updateFilters(): void {
    this.zone.run(() => {
      this.filtersService.validity_checks;
      this.activeFilterList = this.filtersService.getActiveFilterList();
    });
  }

  filterValueChanged(filter: string): void {
    this.zone.run(() => {
      this.filtersService.filters[filter].value = this.filterEntryBoxValue;
      this.filtersService.filters[filter].set = 
        (this.filtersService.filters[filter].value !== this.filtersService.filters[filter].defaultValue)

      this.filtersService.validity_checks;
      this.activeFilterList = this.filtersService.getActiveFilterList();
    });
  }

  close(): void {
    this.filtersService.toggleHidingSidebar();
  }

}
