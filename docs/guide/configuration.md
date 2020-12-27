# Configuration

## createApp

Right now this is a roadmap and not fully accurate.

```js
createApp({
  // [String] The name of your application. Defaults to the `name` in
  // package.json or "nrg app".
  name,
  // [String] The host environment. Used by nrg to determine default
  // functionality. Defaults to the NODE_ENV environment or "development".
  hostEnv,
  // [String] The application environment (not to be confused with the hostEnv
  // above). Used for application logic and not by nrg itself. Defaults to
  // APP_ENV environment variables and typically set to "dev", "stage", "prod",
  // etc.
  appEnv,
  // [String] The hostname that the server should serve requests for. Defaults
  // to "0.0.0.0" if hostEnv is "production" or "localhost" otherwise.
  host,
  // [Number] The port on which the server should listen. Defaults to Node's
  // http module picking a port that's not in use.
  port,
  // [String] The base, or root, URL of your application. Defaults to
  // "http://$host:$port".
  baseUrl,
  // [Object] Log related settings.
  log: {
    // [String] The minimum severity log level that gets handled. Defaults to
    // error if hostEnv is "test", "info" if hostEnv is "production", and
    // "debug" otherwise.
    level,
    // [Array] A list of request/response properties to redact from being
    // logged. Defaults to nothing if the log level is "debug" otherwise to
    // redacting cookie request headers and set-cookie response headers.
    redact
  },
  // FIXME: make this config consistent.
  // [Object]
  middleware: {
    // [Boolean] Whether to add middleware that redirects requests using the
    // http protocol to a version of the URL that uses the https protocol.
    // Defaults to true if hostEnv is "production" and false otherwise.
    httpsRedirect,
    // [Boolean] Whether to add nrg-router which allows assigning middleware to
    // be executed when a request URL matches a given path. Defaults to true.
    router,
    // [Booolean|Object] The configuration for, or whether to add, nrg-compress
    // middleware which compresses response bodies using brotli or other
    // configured zlib-supported algorithms like gzip.
    compress,
    // [Boolean|Function] Whether to add the koa-bodyParser middleware with the
    // default configuration or pass your own request body parsing middleware.
    bodyParser,
    // [Boolean] Whether JSON response bodies should be prettified using the
    // prettyJson middleware. Defaults to false if hostEnv is production and
    // true otherwise.
    prettyJson
  },
  //
  checkHealth,
  //
  handleError,
  //
  setRequestId,
  middleware: {
  },
  static: {
    enabled: !!options.static,
    options: {}
  },
  redis: {
    enabled: !!options.accounts || !!options.redis,
    connection: {}
  },
  sessions: { keys: false },
  db: {
    client: 'pg',
    ...knexSnakeCaseMappers(),
    migrations: {},
    seeds: {}
  },
  hash: { bytes: 48, rounds: 12 },
  email: {
    // Email functionality is enabled if the accounts functionality is enabled
    // or if the user-passed options has a truthy email property.
    enabled: !!options.accounts || !!options.email,
    transport: { pool: isNotDev, ignoreTLS: !isNotDev || isTest },
    mailgen: {
      product: {
        name: options.name || packageJson.name,
        link: defaultBaseUrl || packageJson.homepage
      }
    },
    templates: {
      emailVerification: {
        action: {
          instructions: 'To get started, please click here:',
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
  accounts: {
    enabled: !!options.accounts,
    dummyPassword: 'ijFu54r6PyNdrNLj9yoBu',
    models: {
      Account,
      Token
    }
  },
  mq: {
    enabled: !!options.mq
  }
})
```
