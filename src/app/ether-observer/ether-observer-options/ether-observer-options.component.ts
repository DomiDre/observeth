import { Component, OnInit, NgZone } from '@angular/core';
import { OptionsService } from '../etheroptions.service';
import { Web3ConnectService } from '../../shared/web3-connect.service';


@Component({
  selector: 'app-ether-observer-options',
  templateUrl: './ether-observer-options.component.html',
  styleUrls: ['./ether-observer-options.component.css']
})
export class EtherObserverOptionsComponent implements OnInit {

  public fromBlock:number;
  public toBlock:number;
  public fromBlockDate: any;
  public toBlockDate: any;

  constructor(private zone: NgZone,
              private optionsService: OptionsService,
              private web3Service: Web3ConnectService) { }

  ngOnInit() {
    this.web3Service.getBlockNumber()
    .then((blocknumber) => {
      this.toBlock = blocknumber-1;
      this.fromBlock = blocknumber - 5;
      this.zone.run( () => {
        this.setDate('from');
        this.setDate('to');
      })
    })
  }


  get display(): boolean {
    return this.optionsService.showOptions;
  }
  set display(_display: boolean) {
    this.optionsService.showOptions = _display;
  }

  getData(): void {
    this.display=false;
    this.optionsService.requestingData(this.fromBlock, this.toBlock)
  }

  setDate(block: string): void{
    if (block === 'from') {
      this.web3Service.getBlock(this.fromBlock)
      .then((block) => this.zone.run(() => this.fromBlockDate = block.timestamp * 1000))
      .catch((error) => {})
    } else if (block === 'to') {
      this.web3Service.getBlock(this.toBlock)
      .then((block) => this.zone.run(() => this.toBlockDate = block.timestamp * 1000))
      .catch((error) => {})
    }
  }
}
