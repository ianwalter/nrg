const decamelize = require('decamelize')
const { createLogger } = require('@generates/logger')
const { isEmpty } = require('./validators')

const logger = createLogger({ level: 'info', namespace: 'nrg.validation' })

const defaults = { failFast: 0 }
const pipe = (...fns) => val => fns.reduce((acc, fn) => fn(acc), val)
const toValidators = (acc, [key, option]) =>
  option?.validate && key !== 'canBeEmpty' ? acc.concat([option]) : acc

module.exports = class SchemaValidator {
  constructor (schema, options) {
    this.fields = {}

    // Merge the given options with the defaults.
    this.options = Object.assign({}, defaults, options)

    // Convert the fields in the schema definition to objects that can be used
    // to validate data.
    for (const [field, options] of Object.entries(schema)) {
      const defaultName = decamelize(field, ' ')
      this.fields[field] = {
        ...options,
        name: options.name && !options.validate ? options.name : defaultName,
        validators: Object.entries(options).reduce(toValidators, []),
        modifiers: Object.values(options).filter(o => o?.modify)
      }

      // Intended for nested SchemaValidators.
      if (options.validate) {
        this.fields[field].validators.push(options)
        if (options.constructor?.name === 'SchemaValidator') {
          this.fields[field].isSchemaValidator = true
        }
      }
    }
  }

  handleFailure (ctx, key, field) {
    // Log validation failure.
    if (ctx.validations[key].isEmpty) {
      logger.debug(`Required field ${key} is empty`)
    } else if (ctx.validations[key].err) {
      logger.warn('Error during validation', ctx.validations[key].err)
    } else {
      logger.debug('Validation failure', ctx.validations[key])
    }

    // Determine validation failure message and add it to feedback.
    let message = ctx.validations[key].message
    if (!message && field.message) {
      if (typeof field.message === 'function') {
        message = field.message(ctx, key, field)
      } else {
        message = field.message
      }
    } else if (!message) {
      message = `A valid ${field.name} is required.`
    }
    if (ctx.feedback[key]) {
      ctx.feedback[key].push(message)
    } else {
      ctx.feedback[key] = [message]
    }

    // Add any other feedback within the validation object to feedback for the
    // field.
    const { feedback } = ctx.validations[key]
    if (feedback) {
      if (Array.isArray(feedback)) {
        ctx.feedback[key] = ctx.feedback[key].concat(feedback)
      } else {
        ctx.feedback[key].push(feedback)
      }
    }
  }

  async validate (input, state) {
    const ctx = {
      options: this.options,
      validations: {},
      feedback: {},
      data: {},
      input,
      state,
      failureCount: 0,
      get isValid () {
        return !this.failureCount
      }
    }

    for (const [key, field] of Object.entries(this.fields)) {
      const { canBeEmpty } = field

      // Add the input to the data map so that the subset of data can be used
      // later.
      ctx.data[key] = pipe(...field.modifiers)(input[key])

      const vInput = ctx.data[key]
      const vState = state && state[key]
      if (canBeEmpty) {
        // If the field can be empty, skip other validations if the canBeEmpty
        // validation is valid.
        ctx.validations[key] = await canBeEmpty.validate(vInput, vState, ctx)
        if (ctx.validations[key].isValid) continue
      }

      if (!canBeEmpty && isEmpty(vInput)) {
        // If the field can't be empty and is empty, mark it as invalid and skip
        // validations.
        ctx.validations[key] = { isValid: false, isEmpty: true }
      } else {
        // Perform the validation(s).
        for (const validator of field.validators) {
          try {
            ctx.validations[key] = await validator.validate(vInput, vState, ctx)
            if (field.isSchemaValidator) {
              ctx.data[key] = ctx.validations[key].data
            }
          } catch (err) {
            ctx.validations[key] = { isValid: false, err }
          }
          if (!ctx.validations[key].isValid) break
        }
      }

      // Perform validation failure steps if the validation fails.
      if (ctx.validations[key] && ctx.validations[key].isValid === false) {
        ctx.failureCount++
        this.handleFailure(ctx, key, field)
        if (ctx.options.failFast && ctx.options.failFast === ctx.failureCount) {
          break
        }
      }
    }

    return ctx
  }
}
