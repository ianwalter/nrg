# @ianwalter/nrg
> A batteries-included Node.js web framework

[![npm page][npmImage]][npmUrl]
[![CI][ciImage]][ciUrl]

## Features

- ✅ Web server based on [Koa][koaUrl]
- ✅ Fast routing through a [tree-based router][nrgRouterUrl]
- ✅ Optional logging through [Pino][pinoUrl]
- 🚧 Optional session-handling and CSRF protection using [Redis][redisUrl]
- ✅ Optional database connection to [PostgreSQL][postgresUrl] using
     [knex][knexUrl] and [Objection.js][objectionUrl]
- 🚧 Optional, ready-to-roll user account system
- 🚧 CLI for database migrations and seeding
- ✅ Optional static file serving
- ✅ Optional [Webpack][webpackUrl] integration
- ✅ Optional Server-Side Rendering (SSR) support
- ✅ Optional message queue pub/sub using AMQP / [RabbitMQ][rabbitmqUrl]

## Installation

```console
yarn add @ianwalter/nrg
```

## License

Hippocratic License - See [LICENSE][licenseUrl]

&nbsp;

Created by [Ian Walter](https://ianwalter.dev)

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
[rabbitmqUrl]: https://www.rabbitmq.com/
[licenseUrl]: https://github.com/ianwalter/nrg/blob/master/LICENSE
