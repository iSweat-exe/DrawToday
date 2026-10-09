# 0002 — Outillage, CI/CD et tests repris de BlocusApp

- **Statut** : Accepted
- **Date** : 2026-10-08
- **Décideurs** : @iSweat-exe

## Contexte

BlocusApp a mis au point un système de travail complet (règles pour les LLMs, checklists, CI/CD, tests, labels
automatiques, migrations déployées automatiquement). DrawToday doit démarrer avec le même niveau d'équipement, sans
le reconstruire ni copier le code métier de BlocusApp.

## Décision

Reprendre à l'identique, ou adapté, tout ce qui est **générique** ; ne rien reprendre de ce qui est **propre au domaine** de BlocusApp.

| Repris tel quel | Adapté | Volontairement non repris |
| --- | --- | --- |
| Workflows CI (`ci.yml`, `supabase.yml`, `auto-label.yml`, `labels-sync.yml`, `release-please.yml`), Dependabot, `CODEOWNERS`, template de PR, scripts de labels | Domaines `area:` (`labels.yml`, `labeler.yml`, formulaires d'issue, `auto-label-issue.sh`) ; `package.json`, nom du cookie (`drawtoday-auth`), `vercel.json` (sans région), `supabase/config.toml` (hook JWT et Discord désactivés) | RBAC et hook JWT, administration, carte (MapLibre), annonces, calendrier, OAuth Discord/Google, page de santé détaillée, Vercel Analytics |
| husky + lint-staged + commitlint, ESLint, Prettier, TypeScript strict, `NoZoom` et verrouillage du zoom de la page (ré-adopté le 2026-10-09 après une première décision inverse) | `next.config.ts` (CSP sans carte ni analytics, `Permissions-Policy` sans géolocalisation) | — |
| Vitest (seuil 70 %), Playwright (desktop + mobile), pgTAP (test RLS global) | Tests e2e réécrits pour les pages de DrawToday ; `load/` généralisé (Linux/macOS, sans seed métier) | Tests et migrations du domaine de BlocusApp |
| `CLAUDE.md`, `AGENTS.md`, `.dev/`, `docs/`, skills Supabase (`.claude/skills`, `.agents/skills`) | Contenu des checklists, contraintes, ADR, recettes (+ « nouveau domaine ») | Mesures de performance de BlocusApp (non transposables) |

## Conséquences

- Les identifiants `O-xxx` sont les mêmes que ceux de BlocusApp (comparaison facile).
- Une amélioration de l'outillage faite dans l'un des projets peut être reportée dans l'autre ; il n'y a pas de
  synchronisation automatique, c'est un choix pour éviter de coupler deux dépôts.
- La première PR touchant `supabase/**` est la première validation réelle de `supabase.yml` pour ce dépôt.
