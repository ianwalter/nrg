# @ianwalter/nrg
> A batteries-included Node.js web framework

[![npm page][npmImage]][npmUrl]
[![CI][ciImage]][ciUrl]

## Features

- [x] Web server based on [Koa][koaUrl]
- [x] Fast routing through a [tree-based router][nrgRouterUrl]
- [x] Logging through [Pino][pinoUrl]
- [ ] Session-handling and CSRF protection using [Redis][redisUrl]
- [x] Database connection to [PostgreSQL][postgresUrl] using [knex][knexUrl] and
      [Objection.js][objectionUrl]
- [ ] Ready-to-roll user account system
- [ ] CLI for database migrations and seeding
- [x] Static file serving
- [x] [Webpack][webpackUrl] integration
- [x] Server-side Rendering (SSR) support

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
[nrgRouteUrl]: https://github.com/ianwalter/nrg-router
[pinoUrl]: http://getpino.io/#/
[redisUrl]: https://redis.io/
[postgresUrl]: https://www.postgresql.org/
[knexUrl]: https://knexjs.org/
[objectionUrl]: https://vincit.github.io/objection.js/
[webpackUrl]: https://webpack.js.org/
[licenseUrl]: https://github.com/ianwalter/nrg/blob/master/LICENSE
