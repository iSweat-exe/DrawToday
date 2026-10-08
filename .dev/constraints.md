# Contraintes & budget de charge

> Chiffres des offres gratuites à **revérifier** avant le dev (ils changent) :
> https://supabase.com/pricing · https://vercel.com/pricing · https://supabase.com/docs/guides/realtime/limits

## Cible
- Provisoire, reprise de BlocusApp : ~1000 utilisateurs inscrits, ~200 simultanés (pic). **À confirmer**
  (voir `decisions-a-valider.md`, question 2).

## Limites connues à garder en tête (à confirmer)

| Service | Limite (free) | Impact |
|---|---|---|
| Supabase Realtime | ~200 connexions simultanées | Ne pas ouvrir 1 websocket par composant ; pas de Realtime tant qu'aucune fonctionnalité ne l'exige. |
| Supabase DB | ~500 Mo | Prévoir purge/archivage ; ne jamais stocker d'images/vidéos en base. |
| Supabase DB | connexions directes limitées | Passer par le pooler (Supavisor), jamais de connexion par requête serverless. |
| Supabase Storage | ~1 Go de fichiers | **Dessins envoyés par les utilisateurs** : compresser côté client, plafonner la taille, purger. |
| Supabase egress | ~5 Go/mois | **Les vidéos ne doivent pas être servies depuis Supabase** (une vidéo regardée 1000 fois suffit à épuiser le quota) : voir `decisions-a-valider.md` R2. |
| Supabase projet | mise en pause après ~1 semaine d'inactivité | Cron quotidien `/api/keep-alive` (`vercel.json`) déjà en place. |
| Supabase Auth | e-mails SMTP par défaut très limités | Configurer un SMTP custom (Resend, Brevo…) avant toute ouverture publique. |
| Supabase Auth | ≈ 150 renouvellements de jeton par tranche de 5 min et par IP ; **tous partent des IP de Vercel** | Garder le jeton à 1 h (défaut). |
| Supabase DB | `auth.audit_log_entries` grossit à chaque renouvellement de jeton | Désactiver l'écriture du journal d'audit Auth en base (`docs/runbook.md`). |
| Vercel Hobby | **usage non commercial uniquement** | Si l'app est commerciale / monétisée (abonnement, pub) → plan Pro obligatoire (CGU). |
| Vercel Hobby | ~100 déploiements par jour | Seul `main` est déployé (`vercel.json`) : pas de preview par branche ni par PR. |
| Vercel Hobby | durée de fonction, bande passante, invocations plafonnées | Cache + batch pour limiter les invocations. |
| Vercel Hobby | ~1 M requêtes edge, ~1 M invocations (le `proxy` en compte une par requête qu'il intercepte), ~4 h de CPU actif | Le `proxy` ne s'exécute que pour les connectés, jamais pour un préchargement ; garder peu de requêtes par écran. |
| Vercel Hobby | ~10 Go de transfert depuis le serveur (Fast Origin Transfer) : au-delà, projet mis en pause | Servir un maximum depuis le CDN (pages statiques), alléger les pages rendues par le serveur. |
| Vercel Hobby | optimisation d'images (`next/image`) à quota réduit | App riche en images : à mesurer avant de choisir entre `next/image`, images pré-dimensionnées dans Storage ou CDN dédié. |
| Cache `'use cache'` | **par instance** Vercel : N instances chaudes = N lectures par donnée et par fenêtre | Fenêtre de 2 min (profil `feed`, `next.config.ts`). |

## Principes d'architecture qui en découlent
1. **Lire peu, écrire en lot** : cache client → cache serveur → BDD (dans cet ordre).
2. **Écritures groupées** (batching) avec RPC SQL unique plutôt que N requêtes.
3. **Une seule source de permissions** : la BDD (RLS + fonctions SQL). Le front ne fait que masquer l'UI.
4. **Dégradation gracieuse** : sous charge, on ralentit (queue/throttle) au lieu de planter.
5. **Aucun secret côté client** : `service_role` uniquement côté serveur, jamais `NEXT_PUBLIC_`.
6. **Les médias lourds (vidéos, grandes images) ne passent ni par Vercel ni par Supabase** sans décision écrite (ADR).

## Budget de charge (à mesurer avec `docs/load-testing.md` dès qu'il y a des pages dynamiques)

| Mesure | Budget | Mesuré |
|---|---|---|
| Temps de réponse p95 / p99 | < 800 ms / < 2 s | à mesurer |
| Taux d'erreur | < 1 % | à mesurer |
| CPU par page rendue | < 25 ms | à mesurer |
| Poids d'une page | < 100 Ko | à mesurer |
| Lectures en base par page | < 5 % des pages | à mesurer |
| CPU actif Vercel (600 000 pages/mois) | < 70 % de ~4 h | à estimer |

Ces budgets sont ceux de BlocusApp, repris comme point de départ.
