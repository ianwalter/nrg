const { requester } = require('@ianwalter/requester')

module.exports = async () => requester.delete('http://localhost:1080/email/all')
