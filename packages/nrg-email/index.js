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
