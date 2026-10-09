# Conventions de code

## Langue

Code, commentaires, TSDoc, identifiants, messages de commit et titres de PR : **anglais**. Les textes
affichés à l'utilisateur sont en français pour l'instant (décision i18n en attente).

## Nommage

| Élément                  | Convention               | Exemple                 |
| ------------------------ | ------------------------ | ----------------------- |
| Fichiers et dossiers     | `kebab-case`             | `exercise-card.tsx`     |
| Composants React, types  | `PascalCase`             | `ExerciseCard`, `Level` |
| Fonctions, variables     | `camelCase`              | `getSiteUrl`            |
| Hooks                    | `useXxx`                 | `useProfile`            |
| Constantes globales      | `UPPER_SNAKE_CASE`       | `MAX_UPLOAD_BYTES`      |
| Permissions              | `ressource.action`       | `exercise.publish`      |
| Tables / colonnes SQL    | `snake_case`, minuscules | `exercise_steps`        |

## Structure des dossiers

```
src/app/<group>/<route>/page.tsx   Routes ; groupes (auth) et (app)
src/components/                    Composants UI partagés (sans logique métier)
src/features/<domaine>/            Composants, hooks, actions d'un domaine (exercises, tips, videos…)
src/lib/                           Code partagé (supabase/, data/, validation/, utils)
src/server/                        Code strictement serveur (service_role, jobs)
src/test/                          Initialisation des tests (setup Vitest)
supabase/migrations/               Migrations SQL
supabase/tests/database/           Tests SQL (pgTAP), dont les tests RLS
e2e/ · load/                       Tests end-to-end (Playwright) · test de charge (k6)
docs/ · .dev/                      Documentation et pilotage
```

Un fichier de test est à côté du fichier testé (`foo.ts` → `foo.test.ts`).

## React / Next.js

- **Server Components par défaut.** `"use client"` uniquement pour l'état local, les effets, les
  événements, les API navigateur. Garder les composants client petits et proches des feuilles.
- Aucune requête Supabase directe dans les composants : passer par `src/lib/data/*` (point unique pour
  le cache, le batching, la compression).
- Cette version de Next.js a des changements incompatibles : consulter `node_modules/next/dist/docs/`.
- `<Link>` : `prefetch={false}` par défaut, sauf les onglets principaux (voir `docs/performance.md`).
- Le **zoom de la page est bloqué** (décision du propriétaire, 2026-10-09, pour une sensation d'application native) : `user-scalable=no`, `maximum-scale=1`, `NoZoom` (iOS) et `touch-action: pan-x pan-y`. Tout contenu que
  l'élève doit agrandir (dessins, images de référence) passe par la **visionneuse zoomable** de l'application (ADR 0004) : ne jamais afficher une image qu'on ne peut pas agrandir.

## Validation et erreurs

- Valider **toute** entrée à chaque frontière (Server Actions, Route Handlers, formulaires) avec un schéma
  (Zod, à ajouter au premier usage). Ne jamais faire confiance au client.
- Erreurs prévisibles : type `Result` (`src/lib/result.ts`), pas d'exception pour le flux normal.
- Logs sans donnée personnelle (pas d'e-mail, de token, de contenu saisi).

## Design system (UI)

Source unique : `src/app/globals.css` (voir ADR 0003). Les valeurs sombres y sont écrites deux fois (système et
`data-theme="dark"`) : les modifier dans les deux blocs. Ne jamais coder en dur une couleur, un arrondi ou une
hauteur de bouton : utiliser les tokens et classes partagées. Ajouter un token plutôt qu'une valeur ad hoc.

| Besoin                | À utiliser                                                                    |
| --------------------- | ----------------------------------------------------------------------------- |
| Couleurs              | `bg-accent`, `text-accent`, `text-danger`, `text-success`, `text-muted`, `text-faint`, `border-line`, `bg-surface` |
| Arrondis              | `rounded-control` (boutons, champs), `rounded-card` (cartes), `rounded-sheet` (feuilles), `rounded-full` (pastilles, avatars) |
| Zones tactiles        | `min-h-tap` (44 px), `min-h-control` (48 px), `min-h-control-sm` (40 px)      |
| Rythme                | `p-gutter` (marge de page), `gap-section` (entre sections)                    |
| Cartes / alertes      | `.card`, `.card-link`, `.alert .alert-error`, `.chip .chip-accent`            |
| Boutons               | `.btn` + `.btn-primary` / `-secondary` / `-outline` / `-danger`, `.btn-sm`    |
| Champs de formulaire  | `.field`, `.field-label`, `.field-error`                                      |
| Titres                | `.page-title`, `.section-title`                                               |

Les **composants** (`Button`, `Switch`, `SegmentedControl`, `ProgressRing`…) sont décrits dans [`design-system.md`](./design-system.md) ; on les utilise avant d'en créer d'autres.

La couleur d'accent du socle est provisoire (identité visuelle à choisir).

## TypeScript / qualité

- `strict`, `noUncheckedIndexedAccess`, pas de `any` (erreur ESLint), pas de `@ts-ignore` sans
  commentaire expliquant pourquoi.
- Les types de la base sont **générés** (`npm run db:types`), jamais écrits à la main.
- TSDoc (anglais) sur toute fonction exportée de `src/lib/` et `src/server/` (règle ESLint).
- Commentaires : expliquer le _pourquoi_, pas le _quoi_.
- Prettier gère le format (`npm run format`) ; ESLint doit passer avec 0 warning. Les hooks Git
  (`pre-commit` : lint-staged, `commit-msg` : commitlint) s'installent avec `npm install`.

## Tests

| Type | Outil | Où | Quand |
| --- | --- | --- | --- |
| Unitaires | Vitest + Testing Library (jsdom) | `src/**/*.test.{ts,tsx}` | Toute logique de `src/lib/`, `src/server/`, `src/features/` |
| Politiques RLS et SQL | pgTAP (`supabase test db`) | `supabase/tests/database/*.test.sql` | Toute table et toute fonction SQL : accès autorisé **et** refusé |
| End-to-end | Playwright (desktop + mobile Pixel 7, build de production) | `e2e/` | Parcours critiques, PWA, en-têtes de sécurité |
| Charge | k6 | `load/` | Avant l'ouverture et après un changement de cache (jamais contre la production) |

Couverture minimale (70 % lignes, fonctions, branches, instructions) sur `src/lib/` et `src/server/` : voir
`vitest.config.ts` (la couche `src/lib/supabase/` est exclue : fine surcouche du framework, couverte par les tests e2e).
Les tests e2e tournent sans base de données joignable (variables Supabase factices) : ils ne doivent pas en dépendre.
