pragma solidity ^0.4.23;

import '../node_modules/openzeppelin-solidity/contracts/token/ERC20/StandardBurnableToken.sol';
import '../node_modules/openzeppelin-solidity/contracts/ownership/Ownable.sol';

contract AKJToken is BurnableToken, StandardToken, Ownable {
  event AddedToWhitelist(address sender, address added);
  event RemovedFromWhitelist(address sender, address removed);

  string public constant name = "AKJ"; // solium-disable-line uppercase
  string public constant symbol = "AKJ"; // solium-disable-line uppercase
  uint8 public constant decimals = 18; // solium-disable-line uppercase

  uint256 public constant INITIAL_SUPPLY = 1000000000 * (10 ** uint256(decimals)); // Creates 1.000.000.000 with a given amount of "decimals"

  mapping(address => bool) public whitelist;

  /**
   * @dev Constructor that gives msg.sender all of existing tokens.
   */
  constructor() public {
    totalSupply_ = INITIAL_SUPPLY;
    balances[msg.sender] = INITIAL_SUPPLY;
    whitelist[msg.sender] = true;
    emit Transfer(0x0, msg.sender, INITIAL_SUPPLY);
  }

  function addToWhitelist(address input) public onlyOwner returns(bool) {
    require(whitelist[input] == false);
    whitelist[input] = true;
    emit AddedToWhitelist(msg.sender, input);
    return whitelist[input];
  }

  function addManyToWhitelist(address[] input) public onlyOwner returns(bool) {
    for (uint i=0; i < input.length; i++) {
      addToWhitelist(input[i]);
    }
    return true;
  }

  function removeFromWhitelist(address input) public onlyOwner returns(bool) {
    require(whitelist[input]);
    require(input != msg.sender);
    whitelist[input] = false;
    emit RemovedFromWhitelist(msg.sender, input);
    return whitelist[input];
  }

  function removeManyFromWhitelist(address[] input) public onlyOwner returns(bool) {
    for (uint i=0; i < input.length; i++) {
      removeFromWhitelist(input[i]);
    }
    return true;
  }

  function transfer(address _to, uint256 _value) public returns (bool) {
    require(_to != address(0), "Recipient address is not a valid address.");
    require(_value <= balances[msg.sender], "Value must be smaller than or equal to token balance of sender.");
    require(whitelist[msg.sender], "Sender must be whitelisted to transfer AKJ Tokens.");
    require(whitelist[_to], "Receiver must be whitelisted to receive AKJ Tokens.");

    balances[msg.sender] = balances[msg.sender].sub(_value);
    balances[_to] = balances[_to].add(_value);
    emit Transfer(msg.sender, _to, _value);
    return true;
  }

  function transferFrom(address _from, address _to, uint256 _value) public returns (bool) {
    require(_to != address(0));
    require(_value <= balances[_from]);
    require(_value <= allowed[_from][msg.sender]);
    require(whitelist[_from], "Address must be whitelisted to transact.");
    require(whitelist[_to], "Address must be whitelisted to transact.");

    balances[_from] = balances[_from].sub(_value);
    balances[_to] = balances[_to].add(_value);
    allowed[_from][msg.sender] = allowed[_from][msg.sender].sub(_value);
    emit Transfer(_from, _to, _value);
    return true;
  }

  function approve(address _spender, uint256 _value) public returns (bool) {
    require(whitelist[msg.sender], "Address must be whitelisted to approve transactions.");
    require(whitelist[_spender], "Address must be whitelisted to transact.");

    allowed[msg.sender][_spender] = _value;
    emit Approval(msg.sender, _spender, _value);
    return true;
  }
}
