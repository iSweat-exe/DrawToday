# Base de données

> Document vivant. Toute modification du schéma met ce fichier à jour dans la même PR.

## Règles

- Le schéma vit **uniquement** dans `supabase/migrations/` (jamais d'édition manuelle en production).
- Une migration existante ne se modifie jamais : on en ajoute une nouvelle.
- **RLS activée sur toutes les tables** du schéma `public`, « deny by default », une politique par
  opération (`select`, `insert`, `update`, `delete`) et par table, testée (accès autorisé **et** refusé).
  Le test `supabase/tests/database/rls_enabled.test.sql` échoue si une table n'a pas la RLS.
- Utiliser `(select auth.uid())` dans les politiques (performance).
- Fonctions `SECURITY DEFINER` : `search_path` fixé explicitement.
- Index sur toute colonne filtrée ou jointe, y compris les clés étrangères.
- Types TypeScript générés avec `npm run db:types` (jamais écrits à la main ; voir O-054 : le fichier du socle est
  écrit à la main au format généré, à régénérer).
- Connexions via le pooler Supabase ; jamais une connexion par requête serverless.
- Migrations **additives** (voir `docs/runbook.md`, « Règle de compatibilité »).
- Nom d'une migration : `<AAAAMMJJHHMMSS>_<description_snake_case>.sql`.

## Travailler en local

```bash
npm run db:start    # supabase start (Docker) : Postgres, Auth, Storage, Studio sur http://127.0.0.1:54323
npm run db:reset    # rejoue toutes les migrations puis supabase/seed.sql
npm run db:test     # tests pgTAP de supabase/tests/database/
npm run db:types    # régénère src/lib/database.types.ts
```

## Tables

Aucune table pour l'instant : le schéma sera créé à l'étape 1.1 de la checklist (`profiles`, `exercises`, `tips`,
`videos`…).

## Fonctions

### `public.keep_alive()`

Migration `20261008120000_keep_alive.sql`. Renvoie `true`, `SECURITY INVOKER`, `search_path` vide, exécutable par
`anon` et `authenticated`. Elle ne lit aucune table : c'est l'aller-retour le plus léger possible vers Postgres, utilisé
par `pingDatabase()` (`src/lib/data/health.ts`) pour le cron `/api/keep-alive` et pour `/api/health`. Testée dans
`supabase/tests/database/keep_alive.test.sql`.
