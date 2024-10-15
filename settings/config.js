//node index.js --pairing-code
global.fs = require("fs")
global.path = require("path")

global.d = new Date()
global.calender = d.toLocaleDateString("id")

global.jprefix = "."
global.ownNumb = "6287745423307"
global.ownName = "wiken >.<"
global.botNumb = "6285210453013"
global.botName = "Alya >.<"
global.lol = "wikenn"


global.autOwn = "req(62-8S57547ms11).287p"
let file = require.resolve(__filename)
require("fs").watchFile(file, () => {
  require("fs").unwatchFile(file)
  console.log("\x1b[0;32m" + __filename + " \x1b[1;32mupdated!\x1b[0m")
  delete require.cache[file]
  require(file)
})