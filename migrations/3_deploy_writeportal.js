const WritePortalContract = artifacts.require("WritePortal");

module.exports = function(deployer) {
    deployer.deploy(WritePortalContract);
}
