# @ianwalter/nrg

## 0.11.5

### Patch Changes

- a28a06f: Move maxAge into cookie config

## 0.11.4

### Patch Changes

- 2147c0a: Fixing session config
- Updated dependencies [2147c0a]
  - @ianwalter/nrg-logger@0.1.4
  - @ianwalter/nrg-router@1.0.1
  - @ianwalter/nrg-session@7.0.1
  - @ianwalter/nrg-test@1.2.1

## 0.11.3

### Patch Changes

- 2bfa662: Updating nrg-logger

## 0.11.2

### Patch Changes

- 3999d1d: Update dependency knex to ^0.21.6

## 0.11.1

### Patch Changes

- 4b5a73f: Moving session middleware above log so session properties can be included in req/req logs
- Updated dependencies [4b5a73f]
  - @ianwalter/nrg-logger@0.1.1

## 0.11.0

### Minor Changes

- 655cc90: Adding #429: plugBefore / plugAfter utilities

### Patch Changes

- ae5da22: Updating plugin logs

## 0.10.2

### Patch Changes

- Updated dependencies [2e3e0a7]
  - @ianwalter/nrg-logger@0.1.0

## 0.10.1

### Patch Changes

- e10fb70: Improving verifyToken logging

## 0.10.0

### Minor Changes

- f9abe92: Refactoring nrg-mq so it can more easily be used without an app

### Patch Changes

- Updated dependencies [f9abe92]
  - @ianwalter/nrg-mq@1.2.0

## 0.9.1

### Patch Changes

- bf4ac05: Improving account update logic to be more flexible

## 0.9.0

### Minor Changes

- 8e0e610: Cleaning up csrf endpoint testing logic

### Patch Changes

- Updated dependencies [8e0e610]
  - @ianwalter/nrg-test@1.2.0

## 0.8.4

### Patch Changes

- 0e7a537: Updating @ianwalter/dot to 1.0.5
- ac773c3: Improving handleAuthorization logic

## 0.8.3

### Patch Changes

- d9abda1: Fixing typo in redis connection config, port -> password

## 0.8.2

### Patch Changes

- e408904: Adding back csrf endpoint and updating requester
- Updated dependencies [e408904]
  - @ianwalter/nrg-test@1.1.2

## 0.8.1

### Patch Changes

- 1d42647: Remove production condition when adding app.close

## 0.8.0

### Minor Changes

- 8a9d13e: Adding #400: getSession middleware

### Patch Changes

- 4b7f893: Replacing new secret command with new id using nanoid
- Updated dependencies [8a9d13e]
  - @ianwalter/nrg-test@1.1.1

## 0.7.3

### Patch Changes

- 01b7d2c: Updating logger and usign @generates/merger
- Updated dependencies [01b7d2c]
  - @ianwalter/nrg-logger@0.0.5

## 0.7.2

### Patch Changes

- a2e1da9: Fixing date prop merge issue in logger
- Updated dependencies [a2e1da9]
  - @ianwalter/nrg-logger@0.0.4

## 0.7.1

### Patch Changes

- eeadb27: Fixing log timestamp destructuring issue
- Updated dependencies [eeadb27]
  - @ianwalter/nrg-logger@0.0.3

## 0.7.0

### Minor Changes

- 6dcdcdf: Replacing nrg-print with nrg-logger

### Patch Changes

- Updated dependencies [6dcdcdf]
  - @ianwalter/nrg-logger@0.0.2

## 0.6.1

### Patch Changes

- Updating nrg-mq

## 0.6.0

### Minor Changes

- 870fe01: Changed DB models to use nanoid for IDs instead of sequential integers

## 0.5.1

### Patch Changes

- ba5c2f9: Updating print to v8.1.0
- Updated dependencies [ba5c2f9]
  - @ianwalter/nrg-print@1.2.0
  - @ianwalter/nrg-mq@1.0.1

## 0.5.0

### Minor Changes

- 3610195: Adding #367: Explicit Next.js integration

### Patch Changes

- 4a8bcfd: Adding debug log for OAuth middleware
- 3cff5a5: Fixing copy migrations command
- 27c456e: Adding warning log for unauthorized role
- Updated dependencies [3610195]
  - @ianwalter/nrg-print@1.1.0
  - @ianwalter/nrg-test@1.1.0

## 0.4.0

### Minor Changes

- f312613: Adding #333: Oauth support
- f312613: Adding #348: Rate limit middleware

## 0.3.1

### Patch Changes

- 60dddc3: Fixing chromafi issue with debug logs

## 0.3.0

### Minor Changes

- 4450ca6: - Changed app.start to app.serve
  - Refactored serve method and fixed a port config issue
  - Replaced supertest with nrg-test
  - Added the app.close method

### Patch Changes

- Updated dependencies [4450ca6]
  - @ianwalter/nrg-mq@1.0.0
  - @ianwalter/nrg-test@1.0.0
  - @ianwalter/nrg-print@1.0.0
  - @ianwalter/nrg-router@1.0.0
  - @ianwalter/nrg-session@7.0.0

## 0.2.0

### Minor Changes

- a5b1f4a: - Renamed app.start to app.serve
  - #227: Increase Error.stackTraceLimit if in dev
  - 2c08b63505a9959cc1b48575795cd0c619d746ea: Fixing serveSsr changes
  - Update dependency objection to ^2.2.1
  - Update dependency koa-compress to ^5.0.1
  - #311: Change default path from /email-verification to /verify-email
  - Update dependency pg to ^8.3.0
