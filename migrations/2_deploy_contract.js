var OptimusFoxToken = artifacts.require("OptimusFoxToken");

module.exports = function(deployer) {
	// Arguments are: contract, initialSupply
  deployer.deploy(OptimusFoxToken, 1000);
};