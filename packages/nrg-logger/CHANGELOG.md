# @ianwalter/nrg-logger

## 0.5.0

### Minor Changes

- b0a7c26: Adding debug for response body, add support for LogEntry severity, add support for logging ip addresses

## 0.4.0

### Minor Changes

- 9e598b4: Adding req logger

## 0.3.3

### Patch Changes

- 903a7a1: Update dependency @generates/logger to v1

## 0.3.2

### Patch Changes

- a869815: Update dependency @generates/logger to ^0.1.2

## 0.3.1

### Patch Changes

- 50d5911: Update dependency @generates/logger to ^0.1.1

## 0.3.0

### Minor Changes

- 6ab64fd: Update dependency @generates/logger to ^0.1.0

## 0.2.1

### Patch Changes

- e8bf434: Fix #553: Timestamps not getting updated on logs between req and res

## 0.2.0

### Minor Changes

- dbf75a0: Adding configuration for logging health check requests

## 0.1.4

### Patch Changes

- 2147c0a: Fixing session config

## 0.1.3

### Patch Changes

- 0b6728e: Using ctx.state.log.path in logger

## 0.1.2

### Patch Changes

- d4c1452: Changing ctx.url to ctx.path in logger

## 0.1.1

### Patch Changes

- 4b5a73f: Moving session middleware above log so session properties can be included in req/req logs

## 0.1.0

### Minor Changes

- 2e3e0a7: Exposing request / response logging using ctx.state.log

## 0.0.5

### Patch Changes

- 01b7d2c: Updating logger and usign @generates/merger

## 0.0.4

### Patch Changes

- a2e1da9: Fixing date prop merge issue in logger

## 0.0.3

### Patch Changes

- eeadb27: Fixing log timestamp destructuring issue

## 0.0.2

### Patch Changes

- 6dcdcdf: Replacing nrg-print with nrg-logger
