# @ianwalter/nrg

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
