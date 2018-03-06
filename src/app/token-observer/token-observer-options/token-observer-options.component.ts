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

  public input_token_disabled: boolean = true;

  public TokenErrorMessage: string;

  constructor(private zone: NgZone,
              private optionsService: OptionsService,
              private web3Service: Web3ConnectService) { }

  ngOnInit() {
    this.web3Service.getBlockNumber()
    .then((blocknumber) => {
      this.toBlock = blocknumber;
      this.fromBlock = blocknumber - 5838;
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

  setCustomTokenAddress(): void {
    this.input_token_disabled = false;
    this.tokenContractAddress = '';
    this.selectedToken = undefined;
    this.TokenErrorMessage = undefined;
  }

  setTokenContractAddress(token?: any): void {
    if (token !== undefined) {
      this.input_token_disabled = true;
      this.selectedToken = token;
      this.tokenContractAddress = token.address;
      this.TokenErrorMessage = undefined;
    }
  }

  getData(): void {
    let doUpdate: ()=>void = ()=> {
      this.display=false;
      this.optionsService.requestingData(this.tokenContractAddress,
                                         this.fromBlock, this.toBlock)
    }

    let valid_address = true;
    if (this.selectedToken === undefined) {
      this.checkERC20address()
      .then(valid_address => {
        if(valid_address) {
          doUpdate();
        } else {
          this.TokenErrorMessage = 'Entered token address not valid ERC20 token.'
        }
      })
    } else {
      doUpdate();
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

  checkERC20address(): Promise<boolean> {
    if (this.tokenContractAddress.length !== 42) 
      return new Promise(resolve => resolve(false));

    let erc20contract = this.web3Service.getERC20Contract(this.tokenContractAddress);
    
    return new Promise((resolve) => {
      this.web3Service.getERC20details(erc20contract)
      .then((result) => {resolve(true)})
      .catch((error) => {resolve(false)})
    })
  }

}
