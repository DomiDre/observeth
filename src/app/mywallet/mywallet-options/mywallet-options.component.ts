import { Component, OnInit, NgZone } from '@angular/core';
import { MywalletOptionsService } from '../mywallet-options.service';
import { Web3ConnectService } from '../../shared/web3-connect.service';

@Component({
  selector: 'app-mywallet-options',
  templateUrl: './mywallet-options.component.html',
  styleUrls: ['./mywallet-options.component.css']
})
export class MywalletOptionsComponent implements OnInit {
  public accountAddress: string;
  public fromBlock: number;
  public toBlock: number;
  public tree_depth: number = 4;
  public maxTXperNode: number = 10;
  public AccountErrorMessage: string;

  public fromBlockDate: any;
  public toBlockDate: any;

  constructor(private zone: NgZone,
              private optionsService: MywalletOptionsService,
              private web3Service: Web3ConnectService) { }

  ngOnInit() {
    this.web3Service.getBlockNumber()
    .then((blocknumber) => {
      this.toBlock = blocknumber-1;
      this.fromBlock = 1;
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
    let doUpdate: ()=>void = ()=> {
      this.display=false;
      this.optionsService.requestingData(this.accountAddress,
                       this.fromBlock, this.toBlock, this.tree_depth, this.maxTXperNode)
    }


    let valid_address = (this.accountAddress != undefined &&
                         this.accountAddress.startsWith('0x') &&
                         this.accountAddress.length == 42);
    if(valid_address) {
      doUpdate();
    } else {
      this.AccountErrorMessage = 'Entered invalid address.'
    }
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
