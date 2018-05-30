var AKJToken = artifacts.require("./AKJToken.sol");

// let tokenInstance;

module.exports = function(deployer) {


  deployer.deploy(AKJToken);
  // .then(() => {
  //   tokenInstance = AKJToken;
  // })


};
