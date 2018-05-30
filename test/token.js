var AKJToken = artifacts.require("./AKJToken.sol");

contract('AKJToken', function(accounts) {
  let ownerAccount = accounts[0];
  let userAccount1 = accounts[1];
  let userAccount2 = accounts[2];
  let userAccount3 = accounts[3];

  let userAccountList = [accounts[4], accounts[5], accounts[6], accounts[7], accounts[8]];


  let token;

  it("should transfer money to and whitelist owner", () => {
    console.log("\n Starting test 1: \n");
    let tokenOwnerAddress;
    let TOKEN_AMOUNT = 1000000000;
    let DECIMALS = 18;
    let totalSupply = TOKEN_AMOUNT * Math.pow(10, DECIMALS);

    return AKJToken.deployed()
    .then((instance) => {
      token = instance;
      return token.owner()
    })
    .then((address) => {
      tokenOwnerAddress = address;
      assert(tokenOwnerAddress == ownerAccount, "Token owner should be default account.");
      return token.balanceOf.call(tokenOwnerAddress)
    })
    .then((balance) => {
      let ownerBalance = Number(balance);
      assert(ownerBalance == totalSupply, "Token owner should own all tokens.");
      console.log("Owner balance is: ", ownerBalance);
      return token.whitelist.call(ownerAccount)
    })
    .then((value) => {
      assert.isTrue(value, "Token owner should be whitelisted upon deployment of token.");
    })
  });

  it("should not be able to whitelist users from non-owner accounts", () => {
    console.log("\n Starting test 2: \n");
    return token.addToWhitelist(userAccount2, {from: userAccount1})
    .then((boolean) => {
      expect.fail(null, null, 'Entered invalid state. Token transfer should have failed because sender is not an owner.');
    })
    .catch(error => {
      assert(error.message.includes("revert"), "Transaction should revert because sender account is not an owner.");
    })
  });

  it("should not be able to transfer money between two un-whitelisted users", () => {
    console.log("\n Starting test 3: \n");
    let tokensToTransfer = 1000000000000000000;
    return token.transfer(userAccount2, tokensToTransfer, {from: userAccount1})
    .then((value) => {
      console.log("Entered invalid state. Token transfer should have reverted.");
      expect.fail(null, null, 'Entered invalid state. Token transfer should have reverted.');
    })
    .catch(error => {
      assert(error.message.includes("revert"), "Transaction should revert because accounts are not whitelisted.");
    })
  });

  it("should be able to whitelist users from owner account", () => {
    console.log("\n Starting test 4: \n");
    return token.addToWhitelist(userAccount2, {from: ownerAccount})
    .then((tx) => {
      let eventFlag = false;
      for (var i = 0; i < tx.logs.length; i++) {
          var log = tx.logs[i];

          if (log.event == "AddedToWhitelist") {
            eventFlag = true;
            break;
          }
        }
      assert(i < tx.logs.length, "Event 'AddedToWhitelist' has not been emitted.");
      assert.isTrue(eventFlag, "Event 'AddedToWhitelist' has not been registered.");
      assert.isTrue(Boolean(tx), "Whitelist function should return true when sent from an owner account.");
      return token.whitelist.call(userAccount2, {from: ownerAccount})
    })
    .then((value) => {
      assert.isTrue(value, "Token should have registered user as whitelisted in whitelist registry.");
    })
  });

  it("should not able to tranfer money from a whitelisted user to a non-whitelisted user", () => {
    console.log("\n Starting test 5: \n");
    let tokensToTransfer = 1000000000000000000;
    return token.whitelist.call(userAccount1, {from: ownerAccount})
    .then((value) => {
      assert.isFalse(value, "Account 1 should not be whitelisted at this point.");
      return token.whitelist.call(userAccount2);
    })
    .then((value) => {
      assert.isTrue(Boolean(value), "Account 2 should be whitelisted at this point.");
      return token.transfer(userAccount1, tokensToTransfer, {from: userAccount2});
    })
    .then((value) => {
      console.log("Entered invalid state. Token transfer should have reverted.");
      expect.fail(null, null, 'Entered invalid state. Token transfer should have reverted. One of the transacting parties is not whitelisted.');
    })
    .catch(error => {
      assert(error.message.includes("revert"), "Transaction should revert because one of the transacting parties is not whitelisted.");
    })
  });

  it("should not able to tranfer money from a non-whitelisted user to a whitelisted user", () => {
    console.log("\n Starting test 6: \n");
    let tokensToTransfer = 1000000000000000000;
    return token.whitelist.call(userAccount1, {from: ownerAccount})
    .then((value) => {
      assert.isFalse(value, "Account 1 should not be whitelisted at this point.");
      return token.whitelist.call(userAccount2);
    })
    .then((value) => {
      assert.isTrue(Boolean(value), "Account 2 should be whitelisted at this point.");
      return token.transfer(userAccount2, tokensToTransfer, {from: userAccount1});
    })
    .then((value) => {
      console.log("Entered invalid state. Token transfer should have reverted.");
      expect.fail(null, null, 'Entered invalid state. Token transfer should have reverted. One of the transacting parties is not whitelisted.');
    })
    .catch(error => {
      assert(error.message.includes("revert"), "Transaction should revert because one of the transacting parties is not whitelisted.");
    })
  });

  it("token owner should be able to fund tokens to other users", () => {
    console.log("\n Starting test 7: \n");
    let tokensToTransfer = 10000000000000000000;
    let ownerBalanceBefore = 0;
    let ownerBalanceAfter = 0;
    let ownerBalanceExpected = 0;
    let userAccount1BalanceBefore = 0;
    let userAccount1BalanceAfter =  0;
    let userAccount1BalanceExpected = 0;

    return token.addToWhitelist(userAccount1, {from: ownerAccount})
    .then((tx) => {
      let eventFlag = false;
      for (var i = 0; i < tx.logs.length; i++) {
          var log = tx.logs[i];

          if (log.event == "AddedToWhitelist") {
            eventFlag = true;
            break;
          }
        }
      assert(i < tx.logs.length, "Event 'AddedToWhitelist' has not been emitted.");
      assert.isTrue(eventFlag, "Event 'AddedToWhitelist' has not been registered.");
      assert.isTrue(Boolean(tx), "Return value of whitelist transaction from owner account should return True.");
      return token.whitelist.call(userAccount1);
    })
    .then((value) => {
      assert.isTrue(value, "Account 1 should now be whitelisted.");
      return token.balanceOf.call(ownerAccount);
    })
    .then((value) => {
      let balance = Number(value);
      ownerBalanceBefore = balance;
      console.log("Token balance of Owner BEFORE: ", balance);
      return token.balanceOf.call(userAccount1);
    })
    .then((value) => {
      let balance = Number(value);
      userAccount1BalanceBefore = balance;
      console.log("Token balance of Account1 BEFORE: ", balance);
      return token.transfer(userAccount1, tokensToTransfer, {from: ownerAccount});
    })
    .then((tx) => {
      let eventFlag = false;
      for (var i = 0; i < tx.logs.length; i++) {
          var log = tx.logs[i];

          if (log.event == "Transfer") {
            eventFlag = true;
            break;
          }
        }
      assert(i < tx.logs.length, "Event 'Transfer' has not been emitted.");
      assert.isTrue(eventFlag, "Event 'Transfer' has not been registered.");
      assert.isTrue(Boolean(tx), "Transaction return value should be true when sending tokens from owner account.");
      return token.balanceOf.call(ownerAccount);
    })
    .catch(error => {
      console.log("Caught an error in transaction.");
      throw(error);
    })
    .then((value) => {
      let balance = Number(value);
      ownerBalanceAfter = balance;
      console.log("Token balance of Owner AFTER: ", balance);
      ownerBalanceExpected = ownerBalanceBefore-tokensToTransfer;
      assert.equal(ownerBalanceExpected, balance, "Owner should have a lower balance after funding account 1 with tokens.");
      return token.balanceOf.call(userAccount1);
    })
    .then((value) => {
      let balance = Number(value);
      userAccount1BalanceAfter = balance;
      console.log("Token balance of Account1 AFTER: ", balance);
      userAccount1BalanceExpected = userAccount1BalanceBefore+tokensToTransfer;
      assert.equal(userAccount1BalanceExpected, userAccount1BalanceAfter, "Account 1 should have a higher balance after receiving funding from owner.");
    })
  });

  it("should be able to transfer money between two whitelisted users", () => {
    console.log("\n Starting test 8:\n");
    let tokensToTransfer = Number(1000000000000000000);
    let userAccount1BalanceBefore = 0;
    let userAccount1BalanceAfter = 0;
    let userAccount1BalanceExpected = 0;
    let userAccount2BalanceBefore = 0;
    let userAccount2BalanceAfter = 0;
    let userAccount2BalanceExpected = 0;

    return token.whitelist.call(userAccount1)
    .then((value) => {
      assert.isTrue(value, "Account 1 should be whitelisted already.");
      return token.whitelist.call(userAccount2);
    })
    .then((value) => {
      assert.isTrue(value, "Account 2 should be whitelisted already.");
      return token.balanceOf.call(userAccount1);
    })
    .then((value)=> {
      let balance = Number(value);
      userAccount1BalanceBefore = balance;
      console.log("Token balance of Account 1 BEFORE: ", balance);
      return token.balanceOf.call(userAccount2);
    })
    .then((value) => {
      let balance = Number(value);
      userAccount2BalanceBefore = balance;
      console.log("Token balance of Account 2 BEFORE: ", balance);
      return token.transfer(userAccount2, tokensToTransfer, {from: userAccount1});
    })
    .then((tx) => {
      let eventFlag = false;
      for (var i = 0; i < tx.logs.length; i++) {
          var log = tx.logs[i];

          if (log.event == "Transfer") {
            eventFlag = true;
            break;
          }
        }
      assert(i < tx.logs.length, "Event 'Transfer' has not been emitted.");
      assert.isTrue(eventFlag, "Event 'Transfer' has not been registered.");
      assert.isTrue(Boolean(tx), "Transaction return value should be true for successful transaction.");
      return token.balanceOf.call(userAccount1);
    })
    .then((value) => {
      let balance = Number(value);
      userAccount1BalanceAfter = balance;
      console.log("Token balance of Account 1 AFTER: ", balance);
      userAccount1BalanceExpected = userAccount1BalanceBefore-tokensToTransfer;
      assert.equal(userAccount1BalanceExpected, userAccount1BalanceAfter, "User1 should have a lower balance after sending tokens to User2.");
      return token.balanceOf.call(userAccount2);
    })
    .then((value) => {
      let balance = Number(value);
      userAccount2BalanceAfter = balance;
      console.log("Token balance of Account 2 AFTER: ", balance);
      userAccount2BalanceExpected = userAccount2BalanceBefore+tokensToTransfer;
      assert.equal(userAccount2BalanceExpected, userAccount2BalanceAfter, "User2 should have a higher balance after receiving tokens from User1.");
    })
  });

  it("should not be able to remove user from whitelist without being added", () => {
    console.log("\n Starting test 9:\n");
    return token.removeFromWhitelist(userAccount3, {from: ownerAccount})
    .then((boolean) => {
      expect.fail(null, null, 'Entered invalid state. Transaction should revert because user is not whitelisted.');
    })
    .catch(error => {
      assert(error.message.includes("revert"), "Transaction should revert because user is not whitelisted.");
    })
  });

  it("should be able to remove user who is whitelisted", () => {
    console.log("\n Starting test 10:\n");
    return token.addToWhitelist(userAccount3, {from: ownerAccount})
    .then((tx) => {
      return token.whitelist.call(userAccount3);
    })
    .then((value) => {
      assert.isTrue(value, "User should be whitelisted after addToWhitelist is invoked from owner account.");
      return token.removeFromWhitelist(userAccount3, {from: ownerAccount});
    })
    .then((tx) => {
      let eventFlag = false;
      for (var i = 0; i < tx.logs.length; i++) {
          var log = tx.logs[i];

          if (log.event == "RemovedFromWhitelist") {
            eventFlag = true;
            break;
          }
        }
      assert(i < tx.logs.length, "Event 'RemovedFromWhitelist' has not been emitted.");
      assert.isTrue(eventFlag, "Event 'RemovedFromWhitelist' has not been registered.");
      assert.isTrue(Boolean(tx), "Function removeFromWhitelist should return true when removing from whitelist.");
      return token.whitelist.call(userAccount3, {from: ownerAccount});
    })
    .then((value) => {
      assert.isFalse(value, "Return value of removeFromWhitelist should be false when successfully removing user from whitelist.");
    })
  });

  it("should be able for a user to approve another user to transfer on their behalf", () => {
    console.log("\n Starting test 11:\n");
    let approvalAmount = 10000000000000000000;
    return token.approve(userAccount2, approvalAmount, {from: userAccount1})
    .then((tx) => {
      let eventFlag = false;
      for (var i = 0; i < tx.logs.length; i++) {
          var log = tx.logs[i];

          if (log.event == "Approval") {
            eventFlag = true;
            break;
          }
        }
      assert(i < tx.logs.length, "Event 'Approval' has not been emitted.");
      assert.isTrue(eventFlag, "Event 'Approval' has not been registered.");
      assert.isTrue(Boolean(tx), "Return value of approval() should be true in case of success");
      return token.allowance.call(userAccount1, userAccount2, {from: userAccount2});
    })
    .then((value) => {
      assert.equal(value, approvalAmount, "Allowance should be set to " + approvalAmount + " but is actually " + value);
    })
  });

  it("should make a transaction from account 1, invoked by account 2", () => {
    console.log("\n Starting test 12:\n");
    let tokensToTransfer = 1000000000000000000;
    let userAccount1BalanceBefore = 0;
    let userAccount1BalanceAfter = 0;
    let userAccount1BalanceExpected = 0;
    let userAccount2BalanceBefore = 0;
    let userAccount2BalanceAfter = 0;
    let userAccount2BalanceExpected = 0;

    return token.balanceOf.call(userAccount1)
    .then((value)=> {
      let balance = Number(value);
      userAccount1BalanceBefore = balance;
      console.log("Token balance of Account 1 BEFORE: ", balance);
      return token.balanceOf.call(userAccount2);
    })
    .then((value) => {
      let balance = Number(value);
      userAccount2BalanceBefore = balance;
      console.log("Token balance of Account 2 BEFORE: ", balance);
      return token.transferFrom(userAccount1, userAccount2, tokensToTransfer, {from: userAccount2});
    })
    .then((tx) => {
      let eventFlag = false;
      for (var i = 0; i < tx.logs.length; i++) {
          var log = tx.logs[i];

          if (log.event == "Transfer") {
            eventFlag = true;
            break;
          }
        }
      assert(i < tx.logs.length, "Event 'Transfer' has not been emitted.");
      assert.isTrue(eventFlag, "Event 'Transfer' has not been registered.");
      assert.isTrue(Boolean(tx), "Return value of transferFrom() should be true in case of success.");
      return token.balanceOf.call(userAccount1);
    })
    .then((value) => {
      let balance = Number(value);
      userAccount1BalanceAfter = balance;
      console.log("Token balance of Account 1 AFTER: ", balance);
      userAccount1BalanceExpected = userAccount1BalanceBefore-tokensToTransfer;
      assert.equal(userAccount1BalanceExpected, userAccount1BalanceAfter, "User1 should have a lower balance after sending tokens to User2.");
      return token.balanceOf.call(userAccount2);
    })
    .then((value) => {
      let balance = Number(value);
      userAccount2BalanceAfter = balance;
      console.log("Token balance of Account 2 AFTER: ", balance);
      userAccount2BalanceExpected = userAccount2BalanceBefore+tokensToTransfer;
      assert.equal(userAccount2BalanceExpected, userAccount2BalanceAfter, "User2 should have a higher balance after receiving tokens from User1.");
    })
  });

  it("should be able for a user to remove approval by approving 0 transacting value", () => {
    console.log("\n Starting test 13:\n");
    let approvalAmount = 0;
    return token.approve(userAccount2, approvalAmount, {from: userAccount1})
    .then((tx) => {
      let eventFlag = false;
      for (var i = 0; i < tx.logs.length; i++) {
          var log = tx.logs[i];

          if (log.event == "Approval") {
            eventFlag = true;
            break;
          }
        }
      assert(i < tx.logs.length, "Event 'Approval' has not been emitted.");
      assert.isTrue(eventFlag, "Event 'Approval' has not been registered.");
      assert.isTrue(Boolean(tx), "Return value of approval() should be true in case of success");
      return token.allowance.call(userAccount1, userAccount2, {from: userAccount2});
    })
    .then((value) => {
      assert.equal(value, approvalAmount, "Allowance should be set to " + approvalAmount + " but is actually " + value);
      return token.transferFrom(userAccount1, userAccount2, 10000, {from: userAccount2});
    })
    .then((boolean) => {
      expect.fail(null, null, 'Entered invalid state. Token transfer should have failed because sender is not approved.');
    })
    .catch(error => {
      assert(error.message.includes("revert"), "Transaction should revert because sender is not approved.");
    })
  });

  it("owner should be able to add many accounts to whitelist", () => {
    console.log("\n Starting test 14:\n");
    return token.addManyToWhitelist(userAccountList, {from: ownerAccount})
    .then((tx) => {
      let eventFlag = false;
      for (var i = 0; i < tx.logs.length; i++) {
          var log = tx.logs[i];

          if (log.event == "AddedToWhitelist") {
            eventFlag = true;
            break;
          }
        }
      assert(i < tx.logs.length, "Event 'AddedToWhitelist' has not been emitted.");
      assert.isTrue(eventFlag, "Event 'AddedToWhitelist' has not been registered.");
      assert.isTrue(Boolean(tx), "Whitelist function should return true when sent from an owner account.");
      return token.whitelist.call(accounts[4], {from: ownerAccount})
    })
    .then((value) => {
      assert.isTrue(value, "Token should have registered user as whitelisted in whitelist registry.");
      return token.whitelist.call(accounts[5], {from: ownerAccount})
    })
    .then((value) => {
      assert.isTrue(value, "Token should have registered user as whitelisted in whitelist registry.");
      return token.whitelist.call(accounts[6], {from: ownerAccount})
    })
    .then((value) => {
      assert.isTrue(value, "Token should have registered user as whitelisted in whitelist registry.");
      return token.whitelist.call(accounts[7], {from: ownerAccount})
    })
    .then((value) => {
      assert.isTrue(value, "Token should have registered user as whitelisted in whitelist registry.");
      return token.whitelist.call(accounts[8], {from: ownerAccount})
    })
  });

  it("owner should be able to remove many accounts to whitelist", () => {
    console.log("\n Starting test 15:\n");
    return token.removeManyFromWhitelist(userAccountList, {from: ownerAccount})
    .then((tx) => {
      let eventFlag = false;
      for (var i = 0; i < tx.logs.length; i++) {
          var log = tx.logs[i];

          if (log.event == "RemovedFromWhitelist") {
            eventFlag = true;
            break;
          }
        }
      assert(i < tx.logs.length, "Event 'RemovedFromWhitelist' has not been emitted.");
      assert.isTrue(eventFlag, "Event 'RemovedFromWhitelist' has not been registered.");
      assert.isTrue(Boolean(tx), "Whitelist function should return true when sent from an owner account.");
      return token.whitelist.call(accounts[4], {from: ownerAccount})
    })
    .then((value) => {
      assert.isFalse(value, "Token should have registered user as removed from whitelist registry.");
      return token.whitelist.call(accounts[5], {from: ownerAccount})
    })
    .then((value) => {
      assert.isFalse(value, "Token should have registered user as removed from whitelist registry.");
      return token.whitelist.call(accounts[6], {from: ownerAccount})
    })
    .then((value) => {
      assert.isFalse(value, "Token should have registered user as removed from whitelist registry.");
      return token.whitelist.call(accounts[7], {from: ownerAccount})
    })
    .then((value) => {
      assert.isFalse(value, "Token should have registered user as removed from whitelist registry.");
      return token.whitelist.call(accounts[8], {from: ownerAccount})
    })
  });

  it("should not be able to remove many whitelist users from non-owner accounts", () => {
    console.log("\n Starting test 16: \n");
    return token.removeManyFromWhitelist(userAccountList, {from: userAccount1})
    .then((boolean) => {
      expect.fail(null, null, 'Entered invalid state. Token transfer should have failed because sender is not an owner.');
    })
    .catch(error => {
      assert(error.message.includes("revert"), "Transaction should revert because sender account is not an owner.");
    })
  });

  it("should be possible to burn tokens from any address", () => {
    console.log("\n Starting test 17: \n");
    let totalSupplyBefore = 0;
    let totalSupplyAfter = 0;
    let totalSupplyExpected = 0;
    let burnAmount = 500000000000000000000000;
    let ownerBalanceBefore = 0;
    let ownerBalanceAfter = 0;
    let ownerBalanceExpected = 0;

    return token.balanceOf.call(ownerAccount)
    .then((value) => {
      let balance = Number(value);
      ownerBalanceBefore = balance;
      return token.totalSupply.call();
    })
    .then((value) => {
      totalSupplyBefore = Number(value);
      return token.burn(burnAmount, {from: ownerAccount});
    })
    .then(() => {
      return token.balanceOf.call(ownerAccount);
    })
    .then((value) => {
      ownerBalanceAfter = Number(value);
      ownerBalanceExpected = ownerBalanceBefore - burnAmount;
      assert.equal(ownerBalanceExpected, ownerBalanceAfter, "Owner should have a lower balance after burning tokens.");
      return token.totalSupply.call();
    })
    .then((value) => {
      totalSupplyAfter = Number(value);
      totalSupplyExpected = totalSupplyBefore - burnAmount;
      console.log("TotalSupplyBefore: ", totalSupplyBefore);
      console.log("TotalSupplyAfter: ", totalSupplyAfter);
      console.log("totalSupplyExpected: ", totalSupplyExpected);
      assert.equal(totalSupplyExpected, totalSupplyAfter, "TotalSupply should have a lower balance after burning tokens.");
    })
  });
});
