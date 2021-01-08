const decamelize = require('decamelize')
const { createLogger } = require('@generates/logger')

const logger = createLogger({ level: 'info', namespace: 'nrg.validation' })

const defaults = { failFast: 0 }
const hasValidate = option => option && typeof option.validate !== 'undefined'
const hasModify = option => option && typeof option.modify !== 'undefined'
const pipe = (...fns) => val => fns.reduce((acc, fn) => fn(acc), val)

module.exports = class SchemaValidator {
  constructor (schema, options) {
    this.fields = {}

    // Merge the given options with the defaults.
    this.options = Object.assign({}, defaults, options)

    logger.debug('Schema', schema)

    // Convert the fields in the schema definition to objects that can be used
    // to validate data.
    for (const [field, options] of Object.entries(schema)) {
      this.fields[field] = {
        ...options,
        name: options.name || decamelize(field, ' '),
        validators: Object.values(options).filter(hasValidate),
        modifiers: Object.values(options).filter(hasModify)
      }
    }

    logger.debug('Fields', this.fields)
  }

  handleFailure (feedback, key, field, validation = {}) {
    // Log validation failure.
    if (validation.undefined) {
      logger.debug(`Required field ${key} undefined`)
    } else if (validation.err) {
      logger.warn('Error during validation', validation.err)
    } else {
      logger.debug('Validation failure', validation)
    }

    // Determine validation failure message and add it to feedback.
    let message = validation.message
    if (!message && field.message) {
      if (typeof field.message === 'function') {
        message = field.message({ key, field, validation })
      } else {
        message = field.message
      }
    } else if (!message) {
      message = `A valid ${field.name} is required.`
    }
    if (feedback[key]) {
      feedback[key].push(message)
    } else {
      feedback[key] = [message]
    }

    // Add any other feedback within the validation object to feedback for the
    // field.
    if (validation.feedback) {
      if (Array.isArray(validation.feedback)) {
        feedback[key] = feedback[key].concat(validation.feedback)
      } else {
        feedback[key].push(validation.feedback)
      }
    }
  }

  async validate (input) {
    const { failFast } = this.options
    const validations = {}
    const feedback = {}
    const data = {}

    let failureCount = 0
    for (const [key, field] of Object.entries(this.fields)) {
      const isUndefined = input[key] === undefined
      const isEmpty = isUndefined || input[key] === '' || input[key] === null

      if (field.ignoreEmpty && isEmpty) continue

      // Add the input to the data map so that the subset of data can be used
      // later.
      data[key] = pipe(...field.modifiers)(input[key])

      // Perform the validation.
      if (isUndefined && !field.isOptional) {
        validations[key] = { isValid: false, undefined: true }
      } else if (input[key] !== undefined) {
        for (const validator of field.validators) {
          try {
            // FIXME: Maybe allow multiple validations for a key or at least
            // add a way to merge them?
            validations[key] = await validator.validate(data[key])
          } catch (err) {
            validations[key] = { isValid: false, err }
          }
          if (!validations[key].isValid) break
        }
      }

      // Perform validation failure steps if the validation fails.
      if (validations[key] && !validations[key].isValid) {
        failureCount++
        this.handleFailure(feedback, key, field, validations[key])
        if (failFast && failFast === failureCount) break
      }
    }

    return { isValid: !failureCount, validations, feedback, data }
  }
}
