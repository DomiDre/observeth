import { Component, OnInit } from '@angular/core';
import { Web3ConnectService } from '../shared/web3-connect.service';

@Component({
  selector: 'app-testpage',
  templateUrl: './testpage.component.html',
  styleUrls: ['./testpage.component.css']
})


export class TestpageComponent implements OnInit {

  constructor(private web3service: Web3ConnectService) {}

  ngOnInit() {
    let address_list = [
      '0xF0387a8aE3eD6d1803427486153BE8D18D4d5dBF',
      '0x465fA41ce86e23d808a402e82D2b87eD19eeB282',
      '0xBAa08dF98c5bA8ade7025e33574A3cEd3e9d4f7c',
      '0x020c02c727B81d2cAb5a49e5f625f9424d41b514',
      '0x2cA8B3f663EDb17Ff8BEDD8F501c029dD0225f35'
    ]

    // for(let i=0; i < address_list.length; i++) {
    //   console.log(address_list[i]); 
    // }
    // console.log('after first for loop')
    
    // for(let i=0; i < address_list.length; i++) {
    //   this.web3service.web3.eth.getBalance(address_list[i],
    //     (error, res) => console.log(this.web3service.toDecimal(res)));
    // }
    // console.log('after second for loop')
    
    let promises = []
    for(let i=0; i < address_list.length; i++) {
      promises.push(
        this.web3service.getBalance(address_list[i])
        .then((balance) => console.log(this.web3service.toDecimal(balance))))
    }
    Promise.all(promises)
      .then(() => console.log('after second for loop'));
    
    

  }

}
