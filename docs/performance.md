# Performance, réseau et quotas

> Document vivant : chaque PR qui touche au cache, au rendu ou au réseau y ajoute ses règles et ses mesures.
> Cible provisoire : ~1000 utilisateurs inscrits, ~200 simultanés, sur les offres gratuites (voir
> [`.dev/constraints.md`](../.dev/constraints.md)). Règles reprises de BlocusApp, où elles ont été mesurées.

## Ce qui coûte (Vercel Hobby, Supabase Free)

Vercel Hobby : ~1 M requêtes edge/mois, ~1 M invocations de fonctions/mois, **~4 h de CPU actif/mois**, transfert
plafonné ; dépassement = déploiement mis en pause. Supabase Free : 500 Mo de base, egress limité, pause après 7 jours
d'inactivité. Chiffres à revérifier sur les pages officielles. Le CPU actif dépend surtout du **nombre de rendus
serveur** : réduire les rendus et les requêtes compte plus que raccourcir une requête SQL.

## Règles de conception

- **Préchargement (`<Link prefetch>`)** : seuls les onglets de la barre de navigation principale sont préchargés.
  Tout autre lien (listes, pagination, en-tête, marque) a `prefetch={false}`.
- **Une lecture de session par requête** : envelopper la lecture de session serveur dans `React.cache` (le JWT se vérifie
  localement avec `getClaims()`, sans appel réseau à Supabase Auth).
- **`src/proxy.ts`** ignore les préchargements (`next-router-prefetch`) et les fichiers statiques ; son `matcher` est
  testé (`src/proxy.test.ts`) : le point de `sw.js` est bien échappé. Il ne tourne que si un cookie de session est présent.
- **Fichiers statiques** : `/icons/*` est servi avec `Cache-Control: public, max-age=86400,
  stale-while-revalidate=604800` (par défaut un fichier de `public/` est revalidé à chaque chargement).
- **Cache partagé des données publiques** (`'use cache'`, profil `feed` : revalider à 2 min, expirer à 10 min, défini
  dans `next.config.ts`) : catalogues d'exercices, de conseils et de vidéos. Ces lectures passent par un client Supabase
  **sans cookies** (`src/lib/supabase/public.ts`, rôle `anon`) : le résultat ne dépend pas de qui demande et peut être
  partagé. **Règles** : (1) n'y mettre que ce que `anon` peut lire avec le même résultat que pour un connecté ; jamais
  de permissions, de profil, de progression ; (2) une erreur est **levée** dans la fonction en cache puis convertie en
  `Result` à l'extérieur (une erreur ne doit pas être mise en cache) ; (3) toute écriture appelle `updateTag('<tag>')`
  dans sa Server Action ; (4) appeler `await connection()` **avant** une lecture en cache indépendante de la requête,
  sinon Next.js l'exécute pendant le build (données figées dans la page, et build en échec si la base est injoignable —
  la CI construit avec une URL Supabase factice).
- **Fraîcheur sans sondage** : rafraîchir (`router.refresh()`) quand l'utilisateur revient sur l'app après une absence,
  jamais par minuterie réseau. **Pas de Realtime** ni de polling tant qu'aucune fonctionnalité ne l'exige.
- **Cache du routeur client** : `experimental.staleTimes.dynamic = 30` (`next.config.ts`).
- **Médias** : ne jamais servir de vidéo depuis Vercel ni Supabase (R2 de `.dev/decisions-a-valider.md`) ; images
  compressées et dimensionnées avant envoi dans Storage.
- **Écritures** : une RPC SQL unique plutôt que N requêtes ; rate limit dans la base.

## Budget

Voir le tableau de [`.dev/constraints.md`](../.dev/constraints.md) (p95 < 800 ms, page < 100 Ko, CPU < 25 ms par page
rendue…). Mesures à consigner ici avec les résultats de [`load-testing.md`](./load-testing.md) :

| Date | Contexte | p95 | CPU par page | Poids de page | Lectures en base |
| --- | --- | --- | --- | --- | --- |
| — | _aucune mesure : le socle n'a qu'une page statique_ | | | | |
