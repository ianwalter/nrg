const [entry] = process.argv.splice(2)
const app = require(entry)

app.serve()
