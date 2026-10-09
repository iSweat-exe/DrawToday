# Checklist v1.0.0 — Organisation du développement (Phase 0)

> Objectif : établir règles et objectifs pour développer proprement, sans débordement.
> Cette phase doit être **100 % terminée** avant d'attaquer [la checklist application](./checklist-v1.0.0-application.md).
> Même contenu que celle de BlocusApp (mêmes identifiants `O-xxx`), adaptée à DrawToday.

> **État du socle** : le commit d'initialisation (`1f55bd5`) est sur `main` et sa CI est **entièrement verte**
> ([CI](https://github.com/iSweat-exe/DrawToday/actions/runs/37860910360) : Quality, tests e2e, audit, scan de secrets ;
> [Supabase](https://github.com/iSweat-exe/DrawToday/actions/runs/37860910430) : migrations + tests pgTAP ;
> « Sync labels » et « Release » en succès). `[x]` = vérifié par cette CI ou documentation fusionnée.
> `[~]` = livré mais pas encore exercé (workflow qui ne se déclenche que sur une PR, ou réglage restant) ;
> `[ ]` = réglage manuel sur GitHub, Vercel ou Supabase, ou décision en attente.

---

## Étape 0.1 — Initialisation du dépôt
- [x] **O-001** Créer le dépôt GitHub et pousser le projet — _dépôt `iSweat-exe/DrawToday` existant ; premier push à faire_
- [x] **O-002** `git init`, branche par défaut `main`, `.gitignore` Node/Next/Vercel (`.env*` ignorés sauf `.env.example`) — _aucun secret versionné_
- [x] **O-003** Scaffold Next.js (App Router) + TypeScript strict + ESLint + Prettier — _`npm run build` passe_
- [x] **O-004** Verrouiller les versions : `engines` dans `package.json`, `.nvmrc`, `package-lock.json` commité — _même version Node pour tous_
- [x] **O-005** Scripts npm standard : `dev`, `build`, `lint`, `typecheck`, `test`, `test:e2e`, `format` — _documentés dans le README_
- [x] **O-006** Fichier `.env.example` listant toutes les variables (sans valeurs) — _onboarding sans question_
- [ ] **O-007** Créer les projets Supabase (dev + prod) et Vercel, lier Vercel ↔ GitHub — _production déployée depuis `main`_
- [ ] **O-008** Aligner la région des fonctions Vercel sur celle du projet Supabase (`regions` dans `vercel.json`, une seule région sur Hobby) ⚡ — _voir `docs/runbook.md`, section « Région des fonctions Vercel »_

## Étape 0.2 — Conventions de code (stack Next.js / React / TypeScript)
- [x] **O-010** TypeScript `strict: true`, `noUncheckedIndexedAccess`, interdiction de `any` (règle ESLint) — _CI échoue sinon_
- [x] **O-011** Config ESLint (`next/core-web-vitals`, `typescript-eslint`, règles hooks) + Prettier — _format auto à la sauvegarde_
- [x] **O-012** Règles de nommage : fichiers `kebab-case`, composants `PascalCase`, hooks `useXxx`, constantes `UPPER_SNAKE_CASE` — _documenté dans `docs/conventions.md`_
- [x] **O-013** Structure de dossiers figée (`src/app`, `src/features/<domaine>`, `src/lib`, `src/server`, `supabase/migrations`) — _schéma dans la doc_
- [x] **O-014** Règle Server Components par défaut ; `"use client"` uniquement si nécessaire — _documenté_
- [x] **O-015** Règle : aucun accès Supabase direct dans les composants → passer par une couche `src/lib/data/*` — _point unique pour cache/batch/compression_
- [ ] **O-016** Validation des entrées avec un schéma (Zod, à ajouter au premier usage) à **chaque** frontière (API, Server Actions, formulaires) — _règle documentée ; ticker au premier formulaire_
- [x] **O-017** Gestion d'erreurs uniforme (type `Result`/codes d'erreur) et logs sans données personnelles — _documenté, `src/lib/result.ts`_
- [x] **O-018** **Tous les commentaires, noms de variables, messages de commit, JSDoc : en anglais** — _vérifié en revue de PR_
- [ ] **O-019** Les textes UI utilisateur passent par un fichier de traductions (i18n) 🆕 — _décision en attente, voir `decisions-a-valider.md`_

## Étape 0.3 — Convention Git & GitHub
- [x] **O-020** Adopter **Conventional Commits** : `type(scope): description` — _documenté avec exemples_
- [x] **O-021** `commitlint` + `husky` : hook `commit-msg` qui rejette les messages invalides — _commit non conforme impossible_
- [x] **O-022** Hook `pre-commit` (`lint-staged` : eslint + prettier) — _rapide (< 10 s)_
- [x] **O-023** Stratégie de branches : `main` (protégée, = prod), branches `feat/…`, `fix/…`, `docs/…`, `chore/…` — _nommage documenté_
- [ ] **O-024** Protection de `main` : PR obligatoire, 1 review min, checks CI requis (Quality, Conventional Commits, PR title, Secret scan, Dependency audit, End-to-end tests, Database tests), pas de force-push, historique linéaire (squash merge) — _réglages GitHub à appliquer après le premier push_
- [~] **O-025** Template de PR (`.github/pull_request_template.md`) : description, lien issue, checklist (tests, docs, migration, RLS) — _affiché à chaque PR_
- [~] **O-026** Templates d'issues (bug, feature, tâche LLM) + labels versionnés (`.github/labels.yml`), synchronisés et posés automatiquement (type, area, size…), cf. `docs/git-workflow.md` — _labels créés sur GitHub au premier passage du workflow « Sync labels » sur `main`_
- [~] **O-027** `CODEOWNERS` : les dossiers sensibles (`supabase/`, auth, serveur, `.github/`) nécessitent un reviewer désigné 🔒 — _fichier actif ; exiger la review des code owners dans la protection de `main`_
- [~] **O-028** Versionnage SemVer + `CHANGELOG.md` généré par `release-please` — _tag `v1.0.0` à la fin_ (activer « Allow GitHub Actions to create and approve pull requests » dans Settings → Actions → General)
- [x] **O-029** Taille de PR recommandée (< ~400 lignes) et « 1 PR = 1 case de checklist » — _documenté_ (le commit d'initialisation fait exception : c'est un socle)

## Étape 0.4 — CI/CD
- [x] **O-030** GitHub Actions : `format`, `lint`, `typecheck`, `test:coverage`, `build` à chaque PR — _bloque le merge si rouge_
- [~] **O-031** Vérification des commits/titres de PR au format Conventional Commits en CI — _CI rouge sinon_
- [x] **O-032** Scan de secrets (gitleaks) 🔒 — _CI rouge si secret détecté_
- [x] **O-033** Audit des dépendances (`npm audit --omit=dev` + Dependabot hebdo) — _PRs automatiques hebdo_
- [x] **O-034** Migrations Supabase testées en CI sur une base jetable (`supabase start` + `supabase test db`, pgTAP) — _`.github/workflows/supabase.yml` ; à valider sur la première PR touchant `supabase/**`_
- [ ] **O-034b** Migrations appliquées **automatiquement en production** après fusion sur `main` (`supabase db push`, environnement GitHub `production` avec approbation, secrets `SUPABASE_*`) 🔒 — _workflow prêt ; reste : créer l'environnement et les secrets (réglages GitHub), cf. `docs/runbook.md`_
- [ ] **O-035** Déploiement : production uniquement depuis `main`, aucune preview (quota Hobby) — _vérifié après O-007_

## Étape 0.5 — Organisation multi-développeurs avec LLMs
- [x] **O-040** `CLAUDE.md` (et `AGENTS.md` pointant vers le même contenu) à la racine : stack, commandes, conventions, interdits — _un LLM peut coder sans contexte oral_
- [x] **O-041** Section « Règles pour les LLMs » : lire `.dev/` avant d'agir, 1 tâche = 1 case de checklist, ne pas toucher hors périmètre, ne jamais inventer d'API/clé/table — _écrite_
- [x] **O-042** Interdits absolus pour LLM : modifier `.env*`, committer des secrets, désactiver RLS, `--no-verify`, force-push, supprimer des migrations existantes 🔒 — _écrits dans `CLAUDE.md`_
- [ ] **O-043** Obligation de relecture humaine : tout code généré par LLM passe par une PR relue par un humain — _règle de protection de branche (O-024)_
- [x] **O-044** Marquage des commits assistés par LLM : `.claude/settings.json` désactive les trailers automatiques ; l'usage d'un LLM se déclare via la case dédiée du template de PR — _convention dans `docs/git-workflow.md`_
- [x] **O-045** Dossier `.dev/prompts/` : recettes réutilisables — _3 recettes : migration, page, nouveau domaine_
- [x] **O-046** Règle anti-conflit : 1 développeur/LLM par domaine (`features/<domaine>`), déclaré dans l'issue (assignee) avant de commencer — _documenté_
- [x] **O-047** Définition de « Done » commune (code + tests + doc + RLS vérifiée) — _dans le template de PR_
- [x] **O-048** Skills Supabase pour les agents (`.claude/skills`, `.agents/skills`, `skills-lock.json`) — _repris de BlocusApp, identiques_

## Étape 0.6 — Documentation (claire et toujours à jour)
- [x] **O-050** `README.md` : présentation, prérequis, installation en < 10 min, scripts, CI/CD, déploiement — _un nouvel arrivant démarre seul_
- [x] **O-051** `docs/` structuré : `architecture.md`, `conventions.md`, `database.md`, `permissions.md`, `security.md`, `performance.md`, `runbook.md`, `load-testing.md`, `git-workflow.md` — _squelettes créés_
- [x] **O-052** ADR (Architecture Decision Records) dans `docs/adr/` pour chaque décision structurante — _modèle + ADR 0001 à 0003_
- [x] **O-053** Règle « pas de PR sans doc » : si le comportement, le schéma ou une permission change → doc modifiée dans la **même PR** — _case dans le template de PR_
- [ ] **O-054** Types Supabase générés (`npm run db:types`) — _`src/lib/database.types.ts` du socle est écrit à la main au format généré (pas de Docker lors de l'initialisation) : le régénérer dès que la pile locale tourne_
- [ ] **O-055** Vérification en CI que les types générés sont à jour (diff = échec) — _à ajouter dans `supabase.yml` après O-054 (passer la sortie par Prettier avant de comparer)_
- [x] **O-056** TSDoc (en anglais) sur toutes les fonctions publiques des couches `lib/` et `server/` — _règle ESLint `jsdoc`_

## Étape 0.7 — Qualité & tests
- [x] **O-060** Framework de tests unitaires (Vitest) + Testing Library — _`npm test` passe_
- [x] **O-061** Tests E2E (Playwright, desktop + mobile, build de production) — _tournent en CI ; ajouter les parcours critiques avec les fonctionnalités_
- [x] **O-062** Tests des politiques RLS (pgTAP dans `supabase/tests/database/`) : chaque table a un test « accès autorisé / refusé » 🔒 — _test global « toutes les tables ont la RLS » en place ; obligatoire pour toute nouvelle table_
- [x] **O-063** Seuil de couverture minimal sur `lib/` et `server/` (70 %) — _CI_
- [~] **O-064** Test de charge k6 (pic de 20 utilisateurs, ajustable) — _`load/` + `docs/load-testing.md` ; à brancher sur les vraies pages et données (jamais contre la production)_

- [x] **O-067** Tests unitaires et e2e de l'existant : manifeste, robots/sitemap, pages d'erreur, enregistrement du service worker, `sw.js`, clients Supabase, `next.config` (en-têtes, CSP, caches), installation PWA — _CI_

## Étape 0.8 — Sécurité & opérations de base
- [x] **O-070** Gestion des secrets : variables Vercel + `.env.local` ; rotation documentée — _`docs/runbook.md`_
- [~] **O-071** En-têtes de sécurité (CSP, HSTS, X-Frame-Options…) dans `next.config.ts` 🔒 — _vérifié par test E2E ; scanner externe à passer après le premier déploiement_
- [ ] **O-072** Monitoring minimal des erreurs (logs Vercel + error boundaries ; Sentry à décider) 🆕 — _error boundaries en place ; décision : voir `decisions-a-valider.md`_
- [~] **O-073** Procédure de backup/restauration (le free tier n'a pas de backup auto fiable → export régulier) 🔒 — _procédure écrite dans `docs/runbook.md` ; test de restauration à faire après la 1ʳᵉ table_
- [~] **O-074** Protection contre la mise en pause du projet Supabase — _`/api/keep-alive` + cron quotidien (`vercel.json`) ; reste : définir `CRON_SECRET` sur Vercel_
- [ ] **O-075** Moniteur externe gratuit sur `/api/health` avec alerte e-mail 🆕 — _alerte reçue lors d'une coupure simulée_ (**à faire à la main**)

---

## ✅ Critère de sortie Phase 0
Un nouveau développeur (ou LLM) clone le dépôt, lance `npm install && npm run dev`, ouvre une PR conforme, la CI passe, et il n'a posé aucune question sur les conventions.

## Backlog (hors v1.0.0)
_(vide — y noter toute idée qui déborde)_
