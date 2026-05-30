# Todos

- [ ] `src/app/api/auth/register/route.ts`: `sendVerificationEmail` is imported but never called when `EMAIL_VERIFICATION_ENABLED=false`. Clean up the import (or make it conditional) once a real Resend domain is wired up and the flag is permanently enabled.
