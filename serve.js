const [entry] = process.argv.splice(2)
const { default: app } = await import(entry)

app.serve()
