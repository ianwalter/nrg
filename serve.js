const [entry] = process.argv.splice(2)
const { app } = await import(entry)

app.serve()
