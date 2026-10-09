# Checklist v1.0.0 — Application (Phase 1)

> **Proposition de départ à valider** : le périmètre exact n'est pas encore décidé (voir
> [`decisions-a-valider.md`](./decisions-a-valider.md)). Les cases 🆕 sont des idées de Claude ; retirer ce qui ne
> convient pas AVANT de commencer l'étape concernée.
> Prérequis : [Phase 0 terminée](./checklist-v1.0.0-organisation.md).
> Contraintes de charge : voir [`constraints.md`](./constraints.md).
> **Ordre strict.** Chaque étape = 1 ou plusieurs PRs, avec tests + doc.

## Vision produit
DrawToday est une **application PWA pour apprendre à dessiner** :
- **Exercices** : pratique guidée, du débutant au confirmé.
- **Conseils** : articles courts de technique.
- **Vidéos** : leçons filmées.
- _« etc. »_ : le reste du périmètre (progression, communauté, parcours…) est à préciser (question 1).

---

## Étape 1.1 — Schéma de base & fondations BDD
- [x] **A-001** Migrations Supabase versionnées dans `supabase/migrations/` (jamais d'édition manuelle en prod) — _`supabase start` rejoue tout en CI_ (socle : `keep_alive`)
- [ ] **A-002** Table `profiles` liée à `auth.users` (id, pseudo unique, avatar_url, created_at, updated_at) + trigger de création à l'inscription — _inscription crée un profil_
- [ ] **A-003** Modèle de contenu : `exercises`, `tips`, `videos` (+ niveaux, catégories/tags) — _schéma documenté dans `docs/database.md`_
- [ ] **A-004** Index sur toutes les colonnes filtrées/jointes ⚡ — _`EXPLAIN` sur requêtes clés_
- [~] **A-005** Génération des types TS depuis le schéma (`npm run db:types`) — _zéro type écrit à la main_ (voir O-054)
- [ ] **A-006** Seed de dev (`supabase/seed.sql`) avec du contenu d'exemple — _documenté_

## Étape 1.2 — Authentification sécurisée 🔒
- [~] **A-010** Supabase Auth via `@supabase/ssr` (cookies httpOnly, pas de token en localStorage) — _clients et cookie `drawtoday-auth` en place ; reste le flux de connexion_
- [ ] **A-011** Connexion / déconnexion — _providers à trancher (question 4) ; parcours E2E OK_
- [ ] **A-012** SMTP custom configuré (limite e-mails du free tier) — _e-mails reçus_
- [ ] **A-013** CAPTCHA (Turnstile/hCaptcha) + protection contre mots de passe fuités sur signup/login 🆕 — _bots bloqués_
- [~] **A-014** `src/proxy.ts` : rafraîchit la session (fait) ; protège les routes privées (reste) — _route privée inaccessible déconnecté_
- [x] **A-015** **RLS activée sur TOUTES les tables du schéma `public`**, « deny by default » — _test pgTAP `rls_enabled` exécuté en CI_ (à rester vrai pour chaque nouvelle table)
- [ ] **A-016** Politiques RLS écrites par table (select/insert/update/delete séparées), avec `(select auth.uid())` ⚡ — _tests pgTAP accès OK/KO_
- [ ] **A-017** `service_role` utilisée uniquement côté serveur (`src/server/`), jamais exposée — _grep CI sur `NEXT_PUBLIC_`_
- [ ] **A-018** Vérifier que `anon` n'a aucun droit inattendu (`REVOKE` explicite) — _audit des grants_
- [ ] **A-019** Rate limit sur les endpoints d'auth et sur les écritures utilisateur — _429 / `rate_limited` après N essais_
- [ ] **A-020** Supabase Security Advisor (lints) : corriger tous les warnings 🆕 — _0 warning_
- [ ] **A-022** Mode invité : consultation du contenu public sans compte (périmètre à décider, question 4) 🆕 🔒 — _un invité ne peut rien écrire (test RLS)_

## Étape 1.3 — Rôles et gestion du contenu 🔒
> Décision préalable (ADR) : rôles minimalistes (apprenant / admin) ou RBAC complet comme BlocusApp ? Le contenu
> est-il géré dans l'app, dans Supabase Studio, ou par seed/migrations ? (question 5)
- [ ] **A-030** ADR « modèle de rôles et édition du contenu » — _décision écrite_
- [ ] **A-031** Rôles et permissions implémentés côté BDD (RLS + fonction SQL), revérifiés côté serveur (`requirePermission()` dans `src/server/`) — _l'UI ne fait que masquer_
- [ ] **A-032** Tests automatisés : pour chaque rôle, chaque permission autorisée/refusée — _matrice testée en CI_
- [ ] **A-033** Édition du contenu (créer/modifier/publier exercices, conseils, vidéos), si faite dans l'app — _brouillon/publié, auteur_

## Étape 1.4 — Exercices
- [ ] **A-040** Catalogue d'exercices : liste, filtres (niveau, catégorie), détail — _lecture publique mise en cache (`'use cache'`, profil `feed`)_
- [ ] **A-041** Étapes d'un exercice : consigne, durée, matériel, images de référence — _page détail complète_
- [ ] **A-042** « Exercice du jour » 🆕 — _un exercice mis en avant par jour_
- [ ] **A-043** Marquer un exercice comme fait — _écriture protégée par RLS, limitée en débit_
- [ ] **A-044** Envoi de son dessin (photo, Supabase Storage) 🆕 — _compression côté client, taille et format plafonnés, quota Storage surveillé (`constraints.md`)_

## Étape 1.5 — Conseils
- [ ] **A-050** Liste et détail des conseils, catégories — _lecture publique mise en cache_
- [ ] **A-051** Recherche (full-text Postgres, index GIN) 🆕 ⚡ — _`EXPLAIN` avec le volume cible_
- [ ] **A-052** Favoris 🆕 — _par utilisateur, RLS_

## Étape 1.6 — Vidéos
- [ ] **A-060** ADR « hébergement des vidéos » (embed YouTube/Vimeo, CDN vidéo, Supabase Storage) — _décision écrite, quotas chiffrés ; voir `constraints.md`_
- [ ] **A-061** Liste et lecteur de vidéos ; CSP mise à jour dans la même PR (`frame-src` / `media-src`) — _aucune violation CSP (test E2E)_
- [ ] **A-062** Sous-titres / transcription (accessibilité) 🆕 — _vidéo utilisable sans le son_

## Étape 1.7 — Progression
- [ ] **A-070** Historique des exercices faits et statistiques de base — _page profil_
- [ ] **A-071** Série de jours consécutifs (streak) 🆕 — _calcul côté SQL, fuseau horaire de l'utilisateur_

## Étape 1.8 — PWA & hors-ligne
- [~] **A-080** Manifest et icônes — _socle : icônes **provisoires** à remplacer par l'identité visuelle_
- [ ] **A-081** Service worker : stratégie de cache hors-ligne (contenu déjà consulté) + page hors-ligne — _mode avion testé_
- [ ] **A-082** Invite d'installation (iOS : consignes « Ajouter à l'écran d'accueil » ; Android : `beforeinstallprompt`) — _testé sur de vrais téléphones_
- [ ] **A-083** Notifications push (rappel quotidien) 🆕 — _recherche iOS (PWA installée uniquement) avant d'implémenter_
- [ ] **A-084** Lighthouse PWA ≥ 90 — _rapport consigné_

## Étape 1.9 — Performance & charge ⚡
- [ ] **A-090** Cache serveur des données publiques, invalidation par `updateTag()` — _règles dans `docs/performance.md`_
- [ ] **A-091** Budget de page (< 100 Ko) et stratégie d'images (voir `constraints.md`) — _mesuré_
- [ ] **A-092** Test de charge k6 avec les volumes cibles (`load/`) — _seuils de `docs/load-testing.md` respectés_
- [ ] **A-093** Analytics (échantillonnée) 🆕 — _décision RGPD + quota ; CSP à jour_

## Étape 1.10 — Qualité, conformité et release
- [ ] **A-100** Accessibilité : contrastes, navigation clavier, lecteur d'écran, zoom, `prefers-reduced-motion` — _Lighthouse a11y ≥ 90_
- [ ] **A-101** RGPD : export et suppression de compte (dessins envoyés inclus) 🆕 🔒 — _testé_
- [ ] **A-102** Revue de sécurité : RLS, secrets, en-têtes (securityheaders.com), `npm audit`, Security Advisor à 0 warning — _consignée dans `docs/security.md`_
- [ ] **A-103** Contrôle des quotas (`docs/runbook.md`) une semaine après l'ouverture — _< 70 % de chaque quota_
- [ ] **A-104** Release v1.0.0 : changelog (release-please), tag — _déployée depuis `main`_

---

## Backlog (hors v1.0.0)
- 🆕 Partage public de dessins, galerie, retours entre apprenants.
- 🆕 Parcours d'apprentissage structurés (semaines, objectifs).
- 🆕 Abonnement ou contenu payant (implique le plan Vercel Pro : voir R1 dans `decisions-a-valider.md`).
