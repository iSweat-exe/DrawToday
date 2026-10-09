# Sécurité

> Document vivant. Voir aussi [`permissions.md`](./permissions.md) et [`runbook.md`](./runbook.md).

## Règles non négociables

1. RLS sur toutes les tables ; l'accès `anon` est révoqué explicitement là où il n'est pas voulu.
2. `SUPABASE_SERVICE_ROLE_KEY` uniquement côté serveur, jamais préfixée `NEXT_PUBLIC_`.
3. Aucun secret dans le dépôt (scan `gitleaks` en CI). Les `.env*` sont ignorés, sauf `.env.example`.
4. Validation de toutes les entrées côté serveur (schéma) ; limites de taille avant et après décompression.
5. Rate limiting par utilisateur sur toutes les écritures (à implémenter dans la base avec la première écriture,
   A-019 ; BlocusApp l'a fait avec une table `rate_limits`).
6. Sessions Supabase en cookies httpOnly (`@supabase/ssr`), jamais en `localStorage`. Le cookie a un nom fixe,
   `drawtoday-auth` (`src/lib/supabase/cookie.ts`), commun à tous les clients Supabase ; le `matcher` du `proxy` en dépend.
7. Le cache ne contient jamais de réponse authentifiée partagée entre utilisateurs ; le service worker ne
   met pas en cache les réponses authentifiées.

## Cache partagé

Le cache serveur partagé (`'use cache'`) ne contient que des données lisibles par le rôle `anon`, lues par un client
sans cookies (`src/lib/supabase/public.ts`). Ne jamais y mettre une donnée qui varie selon l'utilisateur (permissions,
profil, progression) : elle serait servie à tout le monde. Si une règle RLS de lecture de ces tables est un jour
restreinte (« membres seulement »), il faut retirer la lecture du cache partagé au même moment.

## Fichiers envoyés par les utilisateurs (dessins)

Quand l'envoi de dessins arrive (A-044) : bucket dédié, taille et format plafonnés côté Storage **et** revérifiés côté
serveur (format réel, dimensions), écriture limitée à son propre dossier, aucune donnée sensible dans les métadonnées
(EXIF : position GPS à retirer), suppression avec le compte (A-101).

## En-têtes HTTP

Définis dans `next.config.ts` (CSP, HSTS, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`,
`Permissions-Policy`, `Cross-Origin-Opener-Policy`, `frame-ancestors`). Un test e2e vérifie leur présence et l'absence
de violation de la CSP. Toute nouvelle origine externe (hébergeur de vidéos, CDN d'images, analytics, avatars d'un
provider OAuth) doit être ajoutée explicitement à la CSP dans la même PR. `Permissions-Policy` coupe caméra, micro,
géolocalisation et paiement : n'activer `camera=(self)` qu'avec la fonctionnalité qui en a besoin.

## Connexion OAuth (Discord, GitHub)

- Flux **PKCE** côté serveur : le code d'autorisation est échangé par `/auth/callback`, la session vit dans des cookies
  (`drawtoday-auth`) posés par le client Supabase serveur.
- Le provider reçu d'un formulaire est validé contre une **liste fermée** (`isOAuthProvider`) avant tout appel ; l'URL de retour est
  construite côté serveur (`getSiteUrl()`), jamais depuis la requête, et doit figurer dans les **Redirect URLs** du projet Supabase.
- Il n'existe **aucun paramètre `next`** : après la connexion on revient toujours à `/` (pas de redirection ouverte). À ajouter avec A-014
  en n'acceptant que des chemins relatifs.
- Les messages d'erreur du provider ne sont jamais affichés ni repris dans l'URL : seuls les codes `denied`, `oauth`, `provider` existent.
- Les photos de profil viennent de `cdn.discordapp.com` et `avatars.githubusercontent.com` (CSP `img-src`) ; l'URL est revalidée
  (`https`, hôte autorisé) avant d'être affichée, avec `referrerPolicy="no-referrer"`.
- Les secrets des applications OAuth ne sont que dans l'environnement (`SUPABASE_AUTH_EXTERNAL_*`), jamais dans le dépôt.
- La déconnexion ne ferme que la session de l'appareil (`scope: "local"`).

## Surveillance

`/api/health` est public et ne renvoie que `{ "status": "ok" | "down" }` (jamais de mesure, de compteur ni de
configuration) ; son résultat est gardé 10 s par instance. `/api/keep-alive` est réservé au cron Vercel quand
`CRON_SECRET` est défini (à définir sur Vercel : sans lui, la route reste ouverte, ce qui est sans danger — aucune
donnée n'est renvoyée — mais permet de consommer des invocations).

## Signalement d'une vulnérabilité

Ne pas ouvrir d'issue publique : contacter directement les mainteneurs.

## Revue avant release

Checklist A-102 : RLS, secrets, en-têtes, dépendances (`npm audit`), Security Advisor Supabase à 0 warning.

## Limites connues de la CSP (suivi)

- `script-src` autorise `'unsafe-inline'` car Next.js injecte des scripts inline ; passer à des **nonces**
  rendrait toutes les pages dynamiques (perte du cache statique). À réévaluer avant la v1.0.0.
- Après le premier déploiement, passer l'URL de production dans un scanner d'en-têtes
  (https://securityheaders.com) et consigner le résultat ici.
- HSTS est envoyé sans `preload` : n'ajouter `preload` qu'après décision explicite (difficile à annuler).
