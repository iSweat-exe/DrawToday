# Security policy

## Reporting a vulnerability

Please **do not open a public issue** for a security problem.

Use GitHub's private reporting: **Security → Report a vulnerability** on this repository
(<https://github.com/iSweat-exe/DrawToday/security/advisories/new>). Include the steps to reproduce, the impact
you see and, if you can, the affected page or endpoint.

You will get an answer within a few days. DrawToday is maintained by one person: please be patient, and give a
reasonable delay to fix the problem before disclosing it.

## Scope

In scope: the web app, its API routes, the Supabase database rules (RLS) and the GitHub workflows of this repository.
Out of scope: denial of service by volume, social engineering, and vulnerabilities of third-party services
(Vercel, Supabase, GitHub) that should be reported to them.

## Supported versions

Only the latest release deployed from `main` is supported.
