const {networkInterfaces} = require("os")

exports.getIp = () => {
  let network = networkInterfaces()
  for (const entity of Object.entries(network)) {
    let nets = entity[1]
    for (const net of nets) {
      if (net.address !== '127.0.0.1' && net.family === 'IPv4') {
        return net.address
      }
    }
  }
  return 'localhost'
}
