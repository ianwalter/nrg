---
home: true
heroImage: /nrg.svg
heroText: "@ianwalter/nrg"
tagline: A batteries-included web framework for Node.js
actionText: Get Started →
actionLink: /guide/
features:
  - title: Scalable
    details: |
      Use the same framework whether you're building a simple microservice or a
      complex user application.
  - title: Flexible
    details: |
      Sensible defaults and composable middleware allow customization while
      keeping the codebase minimal.
  - title: Efficient
    details: |
      Ruthless architectural decisions translate into high performance and
      maintainability.
footer: Hippocratic License | Copyright © 2020-present Ian Walter
---

## Features

✅ &nbsp; Web server based on [Koa][koaUrl]

✅ &nbsp; Fast routing through a [tree-based router][nrgRouterUrl]

✅ &nbsp; Optional logging through [Pino][pinoUrl]

🚧 &nbsp; Optional session-handling and CSRF protection using [Redis][redisUrl]

✅ &nbsp; Optional database connection to [PostgreSQL][postgresUrl] using
          [knex][knexUrl] and [Objection.js][objectionUrl]

🚧 &nbsp; Optional, ready-to-roll user account system

✅ &nbsp; CLI for setup, migrations, seeding, and custom scripts

✅ &nbsp; Optional static file serving

✅ &nbsp; Optional [Webpack][webpackUrl] integration

✅ &nbsp; Optional Server-Side Rendering (SSR) support

✅ &nbsp; Optional message queue pub/sub using [AMQP][amqpUrl] /
          [RabbitMQ][rabbitmqUrl]

🚧 &nbsp; Optional worker setup to offload tasks/jobs via message queue(s)

[npmImage]: https://img.shields.io/npm/v/@ianwalter/nrg.svg
[npmUrl]: https://www.npmjs.com/package/@ianwalter/nrg
[ciImage]: https://github.com/ianwalter/nrg/workflows/CI/badge.svg
[ciUrl]: https://github.com/ianwalter/nrg/actions
[koaUrl]: https://koajs.com/
[nrgRouterUrl]: https://github.com/ianwalter/nrg-router
[pinoUrl]: http://getpino.io/#/
[redisUrl]: https://redis.io/
[postgresUrl]: https://www.postgresql.org/
[knexUrl]: https://knexjs.org/
[objectionUrl]: https://vincit.github.io/objection.js/
[webpackUrl]: https://webpack.js.org/
[amqpUrl]: https://github.com/squaremo/amqp.node
[rabbitmqUrl]: https://www.rabbitmq.com/
[licenseUrl]: https://github.com/ianwalter/nrg/blob/master/LICENSE
