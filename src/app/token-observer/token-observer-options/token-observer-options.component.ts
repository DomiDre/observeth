import { Component, OnInit, NgZone } from '@angular/core';
import { OptionsService } from '../options.service';
import { ERC20_tokens } from '../../shared/erc20';
import { Web3ConnectService } from '../../shared/web3-connect.service';


@Component({
  selector: 'app-token-observer-options',
  templateUrl: './token-observer-options.component.html',
  styleUrls: ['./token-observer-options.component.css']
})
export class TokenObserverOptionsComponent implements OnInit {

  public tokenContractAddress: string='';
  public selectedToken: any;
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
      this.toBlock = blocknumber;
      this.fromBlock = blocknumber - 100;
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

  get tokens(): any {
    return ERC20_tokens;
  }

  setTokenContractAdress(token?: any): void {
    if (token !== undefined) {
      this.selectedToken = token;
      this.tokenContractAddress = token.address;
    }
  }

  getData(): void {
    this.display=false;
    this.optionsService.requestingData(this.tokenContractAddress,
                                       this.fromBlock, this.toBlock)
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
