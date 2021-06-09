        // If email is enabled, set up instances of Mailgen to generate emails
        // and Nodemailer to send them.
        email (app, ctx) {
          if (cfg.email.enabled) {
            if (ctx.logger) ctx.logger.debug('Adding Nodemailer and Mailgen')
            const nodemailer = require('nodemailer')
            const Mailgen = require('mailgen')
            const { transport } = cfg.email
            app.context.nodemailer = nodemailer.createTransport(transport)
            app.context.mailgen = new Mailgen(cfg.email.mailgen)
          }
        },


        email: {
          // Email functionality is enabled if the accounts functionality is
          // enabled or if the user-passed options has a truthy email property.
          get enabled () {
            return !!(
              cfg.accounts.enabled ||
              this.transport.host ||
              this.transport.port ||
              options.email
            )
          },
          get transport () {
            return {
              pool: cfg.isProd,
              ignoreTLS: cfg.isDev || cfg.isTest,
              host: process.env.SMTP_HOST,
              port: process.env.SMTP_PORT
            }
          },
          get replyTo () {
            return this.from
          },
          mailgen: {
            product: {
              get name () {
                return cfg.name || packageJson.name
              },
              get link () {
                return cfg.baseUrl
              }
            }
          },
          templates: {
            emailVerification: {
              action: {
                instructions: 'To get started, please click the button below:',
                button: {
                  text: 'Verify your account'
                }
              }
            },
            passwordReset: {
              action: {
                instructions: 'Click the button below to reset your password:',
                button: {
                  text: 'Reset your password'
                }
              }
            }
          }
        },
