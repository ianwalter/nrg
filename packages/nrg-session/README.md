# @ianwalter/nrg-session
> Session middleware for the nrg (or koa) web framework

**Fork of koa/session in progress**


Simple session middleware for Koa. Defaults to cookie-based sessions and
supports external stores.


## Installation

```sh
yarn add @ianwalter/nrg-session
```

## Example

  View counter example:

```js
const session = require('@ianwalter/nrg-session')
const Koa = require('koa')
const app = new Koa()

app.keys = ['some secret hurr']

const CONFIG = {
  key: 'koa:sess', /** (string) cookie key (default is koa:sess) */
  /** (number || 'session') maxAge in ms (default is 1 days) */
  /** 'session' will result in a cookie that expires when session/browser is closed */
  /** Warning: If a session cookie is stolen, this cookie will never expire */
  maxAge: 86400000,
  autoCommit: true, /** (boolean) automatically commit headers (default true) */
  overwrite: true, /** (boolean) can overwrite or not (default true) */
  httpOnly: true, /** (boolean) httpOnly or not (default true) */
  signed: true, /** (boolean) signed or not (default true) */
  rolling: false, /** (boolean) Force a session identifier cookie to be set on every response. The expiration is reset to the original maxAge, resetting the expiration countdown. (default is false) */
  renew: false, /** (boolean) renew session when session is nearly expired, so we can always keep user logged in. (default is false)*/
};

app.use(session(CONFIG, app));
// or if you prefer all default config, just use => app.use(session(app));

app.use(ctx => {
  // ignore favicon
  if (ctx.path === '/favicon.ico') return

  let n = ctx.session.views || 0
  ctx.session.views = ++n
  ctx.body = n + ' views'
});

app.listen(3000);
console.log('listening on port 3000')
```

## API

### Options

  The cookie name is controlled by the `key` option, which defaults
  to "koa:sess". All other options are passed to `ctx.cookies.get()` and
  `ctx.cookies.set()` allowing you to control security, domain, path,
  and signing among other settings.

#### Custom `encode/decode` Support

  Use `options.encode` and `options.decode` to customize your own encode/decode methods.

### Hooks

  - `valid()`: valid session value before use it
  - `beforeSave()`: hook before save session

### External Session Stores

  The session is stored in a cookie by default, but it has some disadvantages:

  - Session is stored on client side unencrypted
  - [Browser cookies always have length limits](http://browsercookielimits.squawky.net/)


  You can store the session content in external stores (Redis, MongoDB or other DBs) by passing `options.store` with three methods (these need to be async functions):

  - `get(key, maxAge, { rolling })`: get session object by key
  - `set(key, sess, maxAge, { rolling, changed })`: set session object for key, with a `maxAge` (in ms)
  - `destroy(key)`: destroy session for key


  Once you pass `options.store`, session storage is dependent on your external store -- you can't access the session if your external store is down. **Use external session stores only if necessary, avoid using session as a cache, keep the session lean, and store it in a cookie if possible!**


  The way of generating external session id is controlled by the `options.genid(ctx)`, which defaults to `uuid.v4()`.

  If you want to add prefix for all external session id, you can use `options.prefix`, it will not work if `options.genid(ctx)` present.

  If your session store requires data or utilities from context, `opts.ContextStore` is also supported. `ContextStore` must be a class which claims three instance methods demonstrated above. `new ContextStore(ctx)` will be executed on every request.

### Events

`koa-session` will emit event on `app` when session expired or invalid:

- `session:missed`: can't get session value from external store.
- `session:invalid`: session value is invalid.
- `session:expired`: session value is expired.

### Custom External Key

External key is used the cookie by default, but you can use `options.externalKey` to customize your own external key methods. `options.externalKey` with two methods:

- `get(ctx)`: get the external key
- `set(ctx, value)`: set the external key

### Session#isNew

  Returns __true__ if the session is new.

```js
if (this.session.isNew) {
  // user has not logged in
} else {
  // user has already logged in
}
```

### Session#maxAge

  Get cookie's maxAge.

### Session#maxAge=

  Set cookie's maxAge.

### Session#save()

  Save this session no matter whether it is populated.

### Session#manuallyCommit()

  Session headers are auto committed by default. Use this if `autoCommit` is set to `false`.

### Destroying a session

  To destroy a session simply set it to `null`:

```js
this.session = null;
```

## Related

* [`nrg`][nrgUrl] - A batteries-included web framework for Node.js

## License

Hippocratic License - See [LICENSE][licenseUrl]

[nrgUrl]: https://github.com/ianwalter/nrg
[koaUrl]: https://koajs.com/
[npmImage]: https://img.shields.io/npm/v/@ianwalter/nrg-session.svg
[npmUrl]: https://www.npmjs.com/package/@ianwalter/nrg-session
[licenseUrl]: https://github.com/ianwalter/nrg/blob/master/packages/nrg-session/LICENSE
