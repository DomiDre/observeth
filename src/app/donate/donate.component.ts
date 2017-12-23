import { Component, OnInit } from '@angular/core';
import { Web3ConnectService } from '../shared/web3-connect.service';
import { TimerObservable } from 'rxjs/observable/TimerObservable';

interface GuestbookEntry {
    alias: string;
    donation: number;
    message: string;
    time: any;
}

@Component({
  selector: 'app-donate',
  templateUrl: './donate.component.html',
  styleUrls: ['./donate.component.css']
})
export class DonateComponent implements OnInit {
  

  public guestbook_address: string = '0x322909bb3aA921F101d829c0eDF57493468D9BD4'; // ropsten address
  public guestbook_abi: any = [{"constant":true,"inputs":[],"name":"minimum_donation","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_new_storage","type":"address"}],"name":"changeDonationWallet","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"running_id","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"destroy","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_new_owner","type":"address"}],"name":"changeOwner","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"entries","outputs":[{"name":"owner","type":"address"},{"name":"alias","type":"string"},{"name":"timestamp","type":"uint256"},{"name":"donation","type":"uint256"},{"name":"message","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_minDonation","type":"uint256"}],"name":"changeMinimumDonation","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"entry_id","type":"uint256"}],"name":"getEntry","outputs":[{"name":"","type":"address"},{"name":"","type":"string"},{"name":"","type":"uint256"},{"name":"","type":"uint256"},{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_alias","type":"string"},{"name":"_message","type":"string"}],"name":"createEntry","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[],"name":"donationWallet","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"payable":true,"stateMutability":"payable","type":"fallback"}];
  public guestbook_contract: any;
  public entry_alias: string = 'Anonymous';
  public entry_donation: number = 0.01;
  public entry_message: string;
  public error_message: string;

  public timer: any;

  public num_entries: number;
  public guestbook_entries: GuestbookEntry[];
  constructor(private web3connect: Web3ConnectService) { }

  ngOnInit() {
    this.guestbook_contract = 
      this.web3connect.getContract(this.guestbook_address, this.guestbook_abi);

    this.timer = TimerObservable.create(0, 10000)
    .subscribe( () => this.getMessages())
  }

  getMessages() {
    this.web3connect.callFunctionReturningPromise(this.guestbook_contract.running_id)
    .then((result) => {
      this.num_entries = this.web3connect.toDecimal(result);
      let promisesGetEntries = []
      let guestbook_entries = []
      for(let i=0; i<this.num_entries; i++) {
        promisesGetEntries.push(new Promise( (resolve, reject) => {
          this.guestbook_contract.getEntry(i, (error, result) => {
            if(error) reject(error)
            else resolve(result)
            })
          }).then((result) => {
            let entry: GuestbookEntry = {
              alias: result[1],
              time: result[2]*1000,
              donation: result[3]/1e18,
              message: result[4]
            };
            guestbook_entries[i] = entry;
          })
        )
      }

      Promise.all(promisesGetEntries)
      .then((result) => {
        this.guestbook_entries = guestbook_entries.reverse();
      })
    });

  }

  pressDonate() {
    if (this.entry_donation < 0) {
      this.error_message = 'Please enter a positive number as donation.'
    }  else {
      let entry_message = this.entry_message || '';
      this.web3connect.getConnectedAccount().then((account) => {
        new Promise( (resolve, reject) => {
          this.guestbook_contract.createEntry.estimateGas(this.entry_alias, entry_message,
          {from: account, value:this.entry_donation*1e18, gasPrice:1e9},
          (error, result) => {
            if(error) reject(error)
            else resolve(result)
          })
        }).then((gasEstimate) => {
          this.guestbook_contract.createEntry(this.entry_alias, entry_message,
          {from: account, value:this.entry_donation*1e18, gas:gasEstimate, gasPrice:1e9},
          (error, result) => {})
        })
      })
    }
  }
}
