
module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 7545,
      network_id: "*", // Match any network id // 19071 / *
      gas: 4712388
    }
  },
  solc: {
    optimizer: {
      enabled: true,
      runs: 200
    }
  }
};
