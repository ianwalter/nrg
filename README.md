# @ianwalter/nrg
> A batteries-included Node.js web framework

[![npm page][npmImage]][npmUrl]
[![CI][ciImage]][ciUrl]

## Resources

📚 &nbsp; **[Website / Documentation][nrgUrl]**

## Features

✅ &nbsp; Web server based on [Koa][koaUrl]

✅ &nbsp; Optional fast routing through a [tree-based router][nrgRouterUrl]

✅ &nbsp; Optional beautiful logging

✅ &nbsp; Optional session-handling and CSRF protection using a backend like
          [Redis][redisUrl]

✅ &nbsp; Optional database connection to a backend like
          [PostgreSQL][postgresUrl] using [knex][knexUrl] and
          [Objection.js][objectionUrl]

✅ &nbsp; Optional, ready-to-role (ha ha, get it?) user account system

✅ &nbsp; Optional OAuth integration with providers like GitHub, Twitter, etc.
          via [grant][grantUrl]

✅ &nbsp; Optional rate limiting via [node-rate-limiter-flexible][rlfUrl]

🚧 &nbsp; CLI for setup, migrations, seeding, and custom scripts

✅ &nbsp; Optional static file serving

✅ &nbsp; Optional [Next.js][nextUrl] integration

✅ &nbsp; Optional [Webpack][webpackUrl] integration

✅ &nbsp; Optional message queue pub/sub using [AMQP][amqpUrl] /
          [RabbitMQ][rabbitmqUrl]

✅ &nbsp; Optional [Sentry][sentryUrl] integration

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
[nrgRouterUrl]: https://github.com/ianwalter/nrg/blob/main/packages/nrg-router#readme
[redisUrl]: https://redis.io/
[postgresUrl]: https://www.postgresql.org/
[knexUrl]: https://knexjs.org/
[objectionUrl]: https://vincit.github.io/objection.js/
[grantUrl]: https://github.com/simov/grant
[rlfUrl]: https://github.com/animir/node-rate-limiter-flexible
[nextUrl]: https://nextjs.org
[webpackUrl]: https://webpack.js.org/
[amqpUrl]: https://github.com/squaremo/amqp.node
[rabbitmqUrl]: https://www.rabbitmq.com/
[sentryUrl]: https://sentry.io
[licenseUrl]: https://github.com/ianwalter/nrg/blob/main/LICENSE
