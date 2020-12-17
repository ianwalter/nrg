/**
 * A base error used to set the name property to the class name so that errors
 * that extend it can be more easily identified.
 */
export class GeneralError extends Error {
  constructor (message) {
    super(message)
    this.name = this.constructor.name
  }
}

/**
 * A HTTP error used for responses with a status code of 400 or above.
 */
export class HttpError extends GeneralError {
  constructor (status, message) {
    super(message)
    this.status = status
  }
}

/**
 * A HTTP error used to make handling 400 Bad Request responses easier.
 */
export class BadRequestError extends HttpError {
  constructor (message) {
    super(400, message)
    this.logLevel = 'warn'
    this.body = { message }
  }
}

/**
 * A HTTP error used to make handling 401 Unauthorized responses easier.
 */
export class UnauthorizedError extends HttpError {
  constructor ({ message = 'Unauthorized', unverified = false }) {
    super(401, message)

    // Inform the client that the request is unauthorized because the user has
    // not verified their account by completing the email verification process.
    if (unverified) this.body = { unverified }

    this.logLevel = 'warn'
  }
}

/**
 * A HTTP error used to make handling 403 Forbidden responses easier.
 */
export class ForbiddenError extends HttpError {
  constructor (message = 'Not Found') {
    super(403, message)
    this.logLevel = 'warn'
  }
}

/**
 * A HTTP error used to make handling 404 Not Found responses easier.
 */
export class NotFoundError extends HttpError {
  constructor (message = 'Not Found') {
    super(404, message)
    this.logLevel = 'warn'
  }
}

/**
 * A HTTP error used to provide feedback when a request body fails validation.
 */
export class ValidationError extends BadRequestError {
  constructor ({ message = 'Validation Error', feedback, validations }) {
    super(message)
    this.validations = validations
    this.body = { message, feedback }
  }
}
