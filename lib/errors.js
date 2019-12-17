class GeneralError extends Error {
  constructor (message) {
    super(message)
    this.name = this.constructor.name
  }
}

class HttpError extends GeneralError {
  constructor (status, message) {
    super(message)
    this.meta = { status }
  }
}

class BadRequestError extends HttpError {
  constructor (message) {
    super(400, message)
    this.meta.level = 'warn'
    this.meta.body = { message }
  }
}

class UnauthorizedError extends HttpError {
  constructor (message = 'Unauthorized') {
    super(401, message)
    this.meta.level = 'warn'
  }
}

class NotFoundError extends HttpError {
  constructor (message = 'Not Found') {
    super(404, message)
    this.meta.level = 'warn'
  }
}

class ValidationError extends BadRequestError {
  constructor ({ message = 'Validation Error', feedback }) {
    super(message)
    this.meta.body = { message, feedback }
  }
}

module.exports = {
  GeneralError,
  HttpError,
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
  ValidationError
}
