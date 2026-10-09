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
| `(app)` | `/`                 | Accueil « Aujourd'hui » : séance du jour, objectif, niveau, défi, conseil (**maquette**) | Public |
| `(app)` | `/parcours`         | Parcours « Fondations » : semaines et carte des compétences (**maquette**) | Public |
| `(app)` | `/carnet`           | Carnet : avant/après et pages (**maquette**)     | Public |
| `(app)` | `/profil`           | Profil : le compte (**réel**, connecté ou invité), puis niveau, statistiques, badges, réglages (**maquette**) | Public |
| `(auth)` | `/connexion`       | Connexion Discord / GitHub ou mode invité (sans barre d'onglets, non indexée) | Public |
| —       | `/auth/callback`    | Retour du provider OAuth : échange le code contre une session, puis redirige (Route Handler) | Public |
| —       | `/manifest.webmanifest` | Manifeste PWA (`src/app/manifest.ts`)        | Public |
| —       | `/robots.txt`, `/sitemap.xml` | SEO (`robots.ts`, `sitemap.ts` : rien n'est indexé avant le lancement) | Public |
| —       | `/api/health`       | Santé pour un moniteur externe : `{ "status": "ok" \| "down" }`, jamais mis en cache | Public |
| —       | `/api/keep-alive`   | Cron quotidien Vercel : empêche la mise en pause de Supabase ; protégé par `CRON_SECRET` | Vercel Cron |

Groupes de routes : `(auth)` (connexion, hors de la coque de l'app) et `(app)` (pages de l'application, dans la coque ci-dessous).
Ajouter ici chaque nouvelle route avec son niveau d'accès.

## Maquettes (données d'exemple, A-112)

Les quatre écrans montrent l'application finie avec des **données d'exemple**, pour juger du design avant que le contenu n'existe. Rien ne vient de la base.
Chaque écran affiche la pastille « Aperçu · données d'exemple » (`PreviewNotice`) ; les boutons qui n'ont pas encore de fonction le disent dans un toast.

| Où | Quoi |
| --- | --- |
| `src/features/exercises/mock.ts` | séance du jour, semaines de Fondations, compétences, défi |
| `src/features/progress/mock.ts` | XP et niveau, objectif, badges, pages du carnet |
| `src/features/mock-data.test.ts` | garde les données d'exemple **cohérentes avec `docs/pedagogie/`** (courbe de niveaux, XP par durée, 8 semaines, bilans en S1/S4/S8…) |

**Les remplacer** : quand une fonctionnalité réelle arrive (A-042, A-047, A-070…), son composant lit `src/lib/data/*` à la place de `mock.ts`, la pastille disparaît de l'écran,
et le `mock.ts` correspondant est supprimé avec ses tests. Le compte de `/profil` est déjà réel.

## Apparence (ADR 0007)

L'élève choisit le mode (Auto, Clair, Sombre), un thème de couleurs et la touche rétro, depuis **Profil → Apparence**. Le choix tient dans `localStorage` (`drawtoday-appearance`) et se traduit par trois attributs de `<html>`
(`data-theme`, `data-accent`, `data-style`) que `globals.css` met en forme. Aucun cookie, aucune lecture côté serveur : les pages restent statiques.

| Fichier | Rôle |
| --- | --- |
| `src/lib/appearance.ts` | valeurs permises, lecture tolérante (`parseAppearance`), attributs, application à la page, **script d'initialisation** du `<head>` |
| `src/lib/appearance-store.ts` | stockage, notification, synchronisation entre onglets, repli en mémoire |
| `src/lib/use-appearance.ts` | le hook (`useSyncExternalStore`) ; défaut côté serveur, valeur réelle après l'hydratation |
| `src/components/appearance-sync.tsx` | applique le choix au démarrage (couleur de la barre du navigateur) |
| `src/features/settings/appearance-card.tsx` | l'écran de choix |

## Coque de l'application (`src/app/(app)/layout.tsx`)

Barre haute (`NavBar` : la marque, qui ramène à l'accueil, et le bouton de compte), contenu, **barre d'onglets** (`TabBar` :
Aujourd'hui, Parcours, Carnet, Profil ; seuls liens préchargés). La coque est **statique** (servie par le CDN) : seul le bouton de
compte (`AccountChip`) lit la session, dans un `<Suspense>` avec un espace réservé de sa taille, et arrive en flux. Toute nouvelle
lecture de la session dans une page ou la coque doit, elle aussi, être dans un `<Suspense>` (`cacheComponents`) : le build échoue sinon.

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

### Connexion et mode invité (ADR 0005)

```
/connexion ──(formulaire)──▶ Server Action signInWithProvider ──▶ Supabase /authorize ──▶ Discord | GitHub
                                                                                              │
/ (session en cookies) ◀── Route Handler /auth/callback (échange du code, PKCE) ◀──────────────┘
```

- `src/features/auth/` : actions (`signInWithProvider`, `signOut`), boutons, bouton de compte, page de connexion, carte du profil.
- `src/lib/auth/` : providers acceptés (liste fermée) et `Account` (`user` ou `guest`) construit depuis les claims du JWT, sans requête en base.
- `src/lib/data/account.ts` : `getCurrentAccount()`, le point d'entrée unique pour savoir qui est là (dédupliqué par requête).
- **Un invité est un visiteur sans session** : il lit le contenu public, ce qu'il fait reste sur son appareil. Rien n'est écrit en base pour lui.
- Seule une erreur **codée** (`denied`, `oauth`, `provider`) revient sur `/connexion` : le message du provider n'est jamais affiché.

## PWA

`public/sw.js` (service worker minimal : installable, prend le contrôle tout de suite), enregistré en production par
`ServiceWorkerRegister`. Il n'a pas encore de stratégie de cache (étape 1.8). `/sw.js` n'est jamais mis en cache ;
`/icons/*` l'est 24 h (`next.config.ts`). Les icônes actuelles sont provisoires.
