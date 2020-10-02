---
"@ianwalter/nrg": patch
---

- [x] Set session to rolling = true by default
- [x] Set the maxAge / idle timeout to 30 minutes by default
- [x] Add resetSession middleware for when rolling = false
- [x] Add rememberMe to cfg.sessions and login validator
- [x] Change create session middleware to set maxAge to null if remember me is
      enabled and true
- [x] Set short sessions.cookie.maxAge in accounts example and add tests
