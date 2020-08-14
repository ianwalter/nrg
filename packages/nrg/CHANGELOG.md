# @ianwalter/nrg

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
