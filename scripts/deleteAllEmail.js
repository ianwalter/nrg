const { requester } = require('@ianwalter/requester')

const run = async () => requester.delete('http://localhost:1080/email/all')

run()
