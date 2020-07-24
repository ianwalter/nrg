# @ianwalter/nrg
> A batteries-included Node.js web framework

[![npm page][npmImage]][npmUrl]
[![CI][ciImage]][ciUrl]

## Resources

📚 &nbsp; **[Website / Documentation][nrgUrl]**

## Features

✅ &nbsp; Web server based on [Koa][koaUrl]

✅ &nbsp; Fast routing through a [tree-based router][nrgRouterUrl]

✅ &nbsp; Optional logging via [Print][printUrl]

🚧 &nbsp; Optional session-handling and CSRF protection using a backend like
          [Redis][redisUrl] or JWT

✅ &nbsp; Optional database connection to a backend like
          [PostgreSQL][postgresUrl] using [knex][knexUrl] and
          [Objection.js][objectionUrl]

✅ &nbsp; Optional, ready-to-roll user account system

🚧 &nbsp; Optional OAuth integration with providers like GitHub, Twitter, etc.
          via [grant][grantUrl]

🚧 &nbsp; CLI for setup, migrations, seeding, and custom scripts

✅ &nbsp; Optional static file serving

✅ &nbsp; Optional [Webpack][webpackUrl] integration

✅ &nbsp; Optional Server-Side Rendering (SSR) support

✅ &nbsp; Optional message queue pub/sub using [AMQP][amqpUrl] /
          [RabbitMQ][rabbitmqUrl]

## Installation

```console
pnpm add @ianwalter/nrg
```

## License

Hippocratic License - See [LICENSE][licenseUrl]

&nbsp;

Created by [Ian Walter](https://ianwalter.dev)

[npmImage]: https://img.shields.io/npm/v/@ianwalter/nrg.svg
[npmUrl]: https://www.npmjs.com/package/@ianwalter/nrg
[ciImage]: https://github.com/ianwalter/nrg/workflows/CI/badge.svg
[ciUrl]: https://github.com/ianwalter/nrg/actions
[nrgUrl]: https://nrg.ianwalter.dev
[koaUrl]: https://koajs.com/
[nrgRouterUrl]: https://github.com/ianwalter/nrg/blob/master/packages/nrg-router#readme
[printUrl]: https://github.com/ianwalter/print
[redisUrl]: https://redis.io/
[postgresUrl]: https://www.postgresql.org/
[knexUrl]: https://knexjs.org/
[objectionUrl]: https://vincit.github.io/objection.js/
[grantUrl]: https://github.com/simov/grant
[webpackUrl]: https://webpack.js.org/
[amqpUrl]: https://github.com/squaremo/amqp.node
[rabbitmqUrl]: https://www.rabbitmq.com/
[licenseUrl]: https://github.com/ianwalter/nrg/blob/master/LICENSE
