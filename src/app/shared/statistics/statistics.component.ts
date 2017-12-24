import { Component, OnInit } from '@angular/core';
import { StatisticsService } from './statistics.service';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.css']
})
export class StatisticsComponent implements OnInit {

  constructor(private statisticsService: StatisticsService) { }

  ngOnInit() {
  }

  get display(): boolean {
    return this.statisticsService.showStatistics;
  }
  set display(_display: boolean) {
    this.statisticsService.showStatistics = _display;
  }

  get num_nodes(): number {
    return this.statisticsService.number_of_nodes;
  }

  get num_edges(): number {
    return this.statisticsService.number_of_edges;
  }

  get tx_volume(): number {
    return this.statisticsService.get_transaction_volume();
  }

  get coin_symbol(): string {
    return this.statisticsService.coinSymbol;
  }
}
