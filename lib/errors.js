/**
 * A base error used to set the name property to the class name so that errors
 * that extend it can be more easily identified.
 */
class GeneralError extends Error {
  constructor (message) {
    super(message)
    this.name = this.constructor.name
  }
}

/**
 * A HTTP error used for responses with a status code of 400 or above.
 */
class HttpError extends GeneralError {
  constructor (status, message) {
    super(message)
    this.status = status
  }
}

/**
 * A HTTP error used to make handling 400 Bad Request responses easier.
 */
class BadRequestError extends HttpError {
  constructor (message) {
    super(400, message)
    this.logLevel = 'warn'
    this.body = { message }
  }
}

/**
 * A HTTP error used to make handling 401 Unauthorized responses easier.
 */
class UnauthorizedError extends HttpError {
  constructor (message = 'Unauthorized') {
    super(401, message)
    this.logLevel = 'warn'
  }
}

/**
 * A HTTP error used to make handling 404 Not Found responses easier.
 */
class NotFoundError extends HttpError {
  constructor (message = 'Not Found') {
    super(404, message)
    this.logLevel = 'warn'
  }
}

/**
 * A HTTP error used to provide feedback when a request body fails validation.
 */
class ValidationError extends BadRequestError {
  constructor ({ message = 'Validation Error', feedback }) {
    super(message)
    this.body = { message, feedback }
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
