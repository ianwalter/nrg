const BaseError = require('@ianwalter/base-error')

class BadRequestError extends BaseError {
  constructor (message) {
    super(message)
    this.level = 'warn'
    this.status = 400
    this.body = { message }
  }
}

class UnauthorizedError extends BaseError {
  constructor (message) {
    super(message)
    this.level = 'warn'
    this.status = 401
  }
}

class ValidationError extends BadRequestError {
  constructor (err) {
    super(err.message)
    this.body = err
  }
}

module.exports = { 
  BadRequestError, 
  UnauthorizedError,
  ValidationError 
}
