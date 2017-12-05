loadScript("compiled_guestbook.js");

var GuestbookContract = web3.eth.contract(abi);
var Guestbook = GuestbookContract.new(
   {
     from: web3.eth.accounts[0], 
     data: bin,
     gas: '3000000'
   }, function (e, contract){
    console.log(e, contract);
    if (typeof contract.address !== 'undefined') {
         console.log('Contract mined! address: ' + contract.address + ' transactionHash: ' + contract.transactionHash);
    }
 })