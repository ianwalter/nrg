const [entry] = process.argv.splice(2)
const { app } = await import(entry)

app.ready().then(() => {
  console.log('est', app)
  app.serve()
})
