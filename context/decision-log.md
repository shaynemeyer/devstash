# Decision Log

Architectural and testing decisions worth remembering across sessions.

---

## Testing

### Don't mock `auth()` to unit-test server actions (2026-05-31)

**Decision:** Server actions that call `auth()` are not unit-tested with a mocked session.

**Reason:** The logic beyond Zod validation in a typical action is: check the session exists, call a DB query. Mocking `auth()` adds non-trivial setup for coverage of a one-line guard. More importantly, the meaningful risk in actions — that DB queries enforce ownership (e.g. `where: { id, userId }`) — is only caught by an integration test against a real database. A mock wouldn't surface a regression there anyway.

**What is tested:** Pure validation logic (Zod schemas) is unit-tested. Actions and DB queries are covered by manual testing or future integration tests.
