# AKJ Token

Please make sure you are running Nodejs version 9 or higher. 

## If you're on Windows, please make sure you have following dependencies in order: 

With npm installed please run following commands, as an Administrator: 

``` npm install -g windows-build-tools ```

``` npm install -g gulp-cli ```

``` npm install -g node-gyp ```


## For all environments: 

This repository depends on the Truffle Framework. 

``` npm install -g truffle ```


## You're free to use any rpc. Remember to update the truffle config file with the correct ports. 

For compilation, migration and testing I use: https://github.com/trufflesuite/ganache-cli

A good option to Ganache testrpc is the EthereumJs-testrpc: ``` npm install ethereumjs-testrpc ```


### Contract compilation

``` truffle compile ```

### Contract deployment to rpc

``` truffle migrate ```

### Contract tests

``` truffle test ```
