# Architecture

> Document vivant : à mettre à jour dans chaque PR qui change l'architecture.

## Vue d'ensemble

```
Navigateur / PWA (React)
   │  cache client · service worker (installation, puis hors-ligne)
   ▼
Vercel (Next.js App Router)
   │  Server Components · Server Actions · Route Handlers · proxy (rafraîchit la session)
   │  cache serveur ('use cache' + tags) · rate limiting
   ▼
Supabase
   Auth · Postgres (RLS + fonctions SQL) · Storage
```

## Principes

1. **Lire peu, écrire en lot** : cache client → cache serveur → base de données.
2. **La base est la source de vérité des permissions** (RLS + fonctions SQL) ; le serveur les
   revérifie ; l'UI ne fait que masquer.
3. **Dégradation gracieuse** : sous charge on ralentit (file, throttle) au lieu de planter.
4. **Aucun secret côté client** : `SUPABASE_SERVICE_ROLE_KEY` uniquement dans `src/server/`.
5. **Les médias lourds** (vidéos, grandes images) ne passent ni par Vercel ni par Supabase sans ADR chiffré.
6. Contraintes des offres gratuites : voir [`.dev/constraints.md`](../.dev/constraints.md).

## Vision produit

Application PWA pour apprendre à dessiner : exercices, conseils, vidéos… Le périmètre exact de la v1.0.0 est à
valider (`.dev/decisions-a-valider.md`).

## Routes

| Groupe  | Route               | Contenu                                         | Accès  |
| ------- | ------------------- | ----------------------------------------------- | ------ |
| `(app)` | `/`                 | Accueil (page d'attente du socle)               | Public |
| —       | `/manifest.webmanifest` | Manifeste PWA (`src/app/manifest.ts`)        | Public |
| —       | `/robots.txt`, `/sitemap.xml` | SEO (`robots.ts`, `sitemap.ts` : rien n'est indexé avant le lancement) | Public |
| —       | `/api/health`       | Santé pour un moniteur externe : `{ "status": "ok" \| "down" }`, jamais mis en cache | Public |
| —       | `/api/keep-alive`   | Cron quotidien Vercel : empêche la mise en pause de Supabase ; protégé par `CRON_SECRET` | Vercel Cron |

Les groupes de routes prévus : `(auth)` (connexion, hors de la coque de l'app) et `(app)` (pages de l'application).
Ajouter ici chaque nouvelle route avec son niveau d'accès.

## Session (Supabase Auth)

`src/proxy.ts` rafraîchit les cookies de session (`updateSession`, `src/lib/supabase/middleware.ts`) sans jamais
rediriger (un invité peut lire). Il ne s'exécute que pour les requêtes qui portent un cookie de session
(`drawtoday-auth`, `src/lib/supabase/cookie.ts`) et ni pour les préchargements ni pour les fichiers statiques : voir
`docs/performance.md`. Trois clients Supabase :

| Fichier                     | Usage                                                                                   |
| --------------------------- | --------------------------------------------------------------------------------------- |
| `src/lib/supabase/server.ts` | Server Components, Server Actions, Route Handlers (session de l'utilisateur, via cookies) |
| `src/lib/supabase/client.ts` | Composants client (navigateur)                                                          |
| `src/lib/supabase/public.ts` | Données publiques uniquement : sans cookies, rôle `anon`, donc cacheable et partageable |

Le flux de connexion (providers, callback) n'existe pas encore : voir la checklist application, étape 1.2.

## PWA

`public/sw.js` (service worker minimal : installable, prend le contrôle tout de suite), enregistré en production par
`ServiceWorkerRegister`. Il n'a pas encore de stratégie de cache (étape 1.8). `/sw.js` n'est jamais mis en cache ;
`/icons/*` l'est 24 h (`next.config.ts`). Les icônes actuelles sont provisoires.
