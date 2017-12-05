#!/bin/bash
solc guestbook.sol --abi --bin > ./test_contracts/compiled_guestbook.dat

solidity_clean ./test_contracts/compiled_guestbook.dat ./test_contracts/compiled_guestbook.js
