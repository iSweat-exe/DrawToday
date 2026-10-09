# DrawToday

Application mobile-first (PWA iOS/Android) pour **apprendre à dessiner** (exercices, conseils, vidéos…),
construite avec **Next.js (App Router) + React + TypeScript + Tailwind CSS 4 + Supabase**, déployée sur
**Vercel** (offres gratuites). Même socle technique et mêmes règles de travail que BlocusApp.

> Avant toute contribution (développeur **ou** LLM) : lire [`CLAUDE.md`](./CLAUDE.md) et le dossier
> [`.dev/`](./.dev/README.md).

## Prérequis

- Node.js **22+** (voir `.nvmrc`, recommandé : 24) et npm
- Docker + la CLI Supabase (`npx supabase`) pour la base locale et les tests SQL
- Un projet Supabase (dev) — URL et clés dans `.env.local`
- Git configuré avec accès au dépôt GitHub

## Installation (< 10 min)

```bash
git clone https://github.com/iSweat-exe/DrawToday.git
cd DrawToday
npm install            # installe aussi les hooks Git (husky)
cp .env.example .env.local
# remplir .env.local avec les valeurs de votre projet Supabase de DEV
npm run dev            # http://localhost:3000
```

Variables d'environnement : voir [`.env.example`](./.env.example). Ne jamais commiter un fichier `.env*`.

## Scripts

| Commande                | Rôle                                                      |
| ----------------------- | --------------------------------------------------------- |
| `npm run dev`           | Serveur de développement                                  |
| `npm run build`         | Build de production                                       |
| `npm run lint`          | ESLint (0 warning en CI)                                  |
| `npm run typecheck`     | `next typegen` + `tsc --noEmit`                           |
| `npm run format`        | Prettier (écriture) — `format:check` en CI                |
| `npm run test`          | Tests unitaires (Vitest)                                  |
| `npm run test:coverage` | Tests unitaires + seuils de couverture (CI)               |
| `npm run test:e2e`      | Tests end-to-end (Playwright, build de production)        |
| `npm run db:start`      | Supabase local (Docker) · `db:reset` · `db:test` (pgTAP)  |
| `npm run db:types`      | Régénère `src/lib/database.types.ts` depuis la base locale |

## Organisation du projet

```
src/app/        Routes (App Router) : (auth) = login/register, (app) = pages connectées
src/components/ Composants partagés
src/features/   Code par domaine métier (1 dossier = 1 domaine : exercises, tips, videos…)
src/lib/        Code partagé : clients Supabase, utilitaires, couche data
src/server/     Code exécuté uniquement côté serveur
supabase/       Migrations, tests SQL (pgTAP), seed, config locale
e2e/ · load/    Tests end-to-end (Playwright) · test de charge (k6)
docs/           Documentation technique (architecture, base de données, permissions…) et pédagogie (docs/pedagogie/)
.dev/           Pilotage : checklists v1.0.0, contraintes, décisions, recettes LLM
```

## CI/CD en bref

| Quand                      | Quoi                                                                                   |
| -------------------------- | -------------------------------------------------------------------------------------- |
| Chaque PR                  | format, lint, typecheck, tests + couverture, build, commits et titre Conventional, scan de secrets, audit prod, e2e |
| PR touchant `supabase/**`  | migrations rejouées sur une base jetable + tests SQL (pgTAP)                           |
| Fusion sur `main`          | déploiement Vercel (production uniquement), migrations appliquées après approbation, release-please |
| Chaque PR / issue          | labels automatiques (type, area, taille, tests/docs manquants)                         |

Détails : [`docs/git-workflow.md`](./docs/git-workflow.md) et [`docs/runbook.md`](./docs/runbook.md).

## Documentation

- [Architecture](./docs/architecture.md) · [Conventions](./docs/conventions.md) ·
  [Workflow Git](./docs/git-workflow.md)
- [Base de données](./docs/database.md) · [Permissions](./docs/permissions.md) ·
  [Sécurité](./docs/security.md) · [Performance](./docs/performance.md) · [Runbook](./docs/runbook.md) ·
  [Test de charge](./docs/load-testing.md)
- [Pédagogie du dessin](./docs/pedagogie/README.md) : méthodes, exercices, parcours, défis, XP
- [Décisions d'architecture (ADR)](./docs/adr/README.md)

## Déploiement

Vercel : la **production** uniquement depuis `main`, **aucune preview** par PR (quota Hobby, voir
[`docs/runbook.md`](./docs/runbook.md)). Attention : l'offre Vercel Hobby est réservée à un usage non
commercial.

## Contribuer

1. Choisir une case des checklists (`.dev/`), déclarer l'owner dans l'issue.
2. Créer une branche `feat/…`, `fix/…`, `docs/…` ou `chore/…`.
3. Commits en **Conventional Commits** (anglais), code et commentaires en **anglais**.
4. Ouvrir une PR avec le template, CI verte + 1 review humaine, squash merge.
