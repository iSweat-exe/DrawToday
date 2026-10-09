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

## Étape 1.4 — Exercices et séances guidées
> Contenu et règles : [`docs/pedagogie/`](../docs/pedagogie/README.md) (catalogue de 37 exercices, séance de 30 min, parcours Fondations de 8 semaines).
- [ ] **A-039** Valider la **semaine de découverte sur papier** avec 5 débutants avant d'écrire le lecteur de séance 🆕 — _7 jours, abandons et incompréhensions relevés, consignes ajustées dans `docs/pedagogie/exercices.md`_
- [ ] **A-040** Catalogue d'exercices : liste, filtres (famille, compétence, durée, niveau), détail — _lecture publique mise en cache (`'use cache'`, profil `feed`)_
- [ ] **A-041** Fiche d'exercice : but, matériel, étapes courtes, critères d'auto-contrôle, erreurs fréquentes, version plus difficile (format de `exercices.md`) — _schémas SVG originaux, image zoomable_
- [ ] **A-042** « Défi du jour » (carte tirée parmi les compétences débloquées) 🆕 — _10 minutes, facultatif_
- [ ] **A-043** Enregistrer une séance terminée (durée réelle, bloc par bloc) — _écriture protégée par RLS, limitée en débit_
- [ ] **A-044** Photo facultative du dessin (réencodée côté client, EXIF retiré) 🆕 🔒 — _ADR sur le quota de stockage (`integration-app.md`) avant de coder_
- [ ] **A-045** Séance guidée : file de séances, 4 blocs (échauffement, cœur, application, revue), **chronomètre fiable**, durée au choix (10 / 15 / 30 / 45 min) 🆕 — _testé sur de vrais téléphones, app en arrière-plan_
- [ ] **A-046** Revue de séance (M1), écran de fin (XP, prochaine séance) 🆕 — _trois champs courts, animation < 2 s, `prefers-reduced-motion` respecté_
- [ ] **A-047** Parcours : **Semaine de découverte** (7 × 15 min) et **Fondations** (8 semaines, 40 séances), file et non calendrier 🆕 — _un jour manqué ne saute rien_
- [ ] **A-048** Carte des compétences et **étoiles de maîtrise** (re-tests espacés à 7 et 28 jours) 🆕 — _règles de `competences.md`_

## Étape 1.5 — Conseils
- [ ] **A-050** Liste et détail des conseils, au format **carte conseil** (un concept, < 120 mots, exemple, mini-quiz de 2 questions avec explication) — _lecture publique mise en cache_
- [ ] **A-051** Recherche (full-text Postgres, index GIN) 🆕 ⚡ — _`EXPLAIN` avec le volume cible_
- [ ] **A-052** Favoris 🆕 — _par utilisateur, RLS_
- [ ] **A-053** Rappel espacé : une question d'une ancienne carte, à intervalles croissants 🆕 — _jour 1, 3, 7, 14_

## Étape 1.6 — Vidéos
- [ ] **A-060** ADR « hébergement des vidéos » (embed YouTube/Vimeo, CDN vidéo, Supabase Storage) — _décision écrite, quotas chiffrés ; voir `constraints.md`_
- [ ] **A-061** Liste et lecteur de vidéos ; CSP mise à jour dans la même PR (`frame-src` / `media-src`) — _aucune violation CSP (test E2E)_
- [ ] **A-062** Sous-titres / transcription (accessibilité) 🆕 — _vidéo utilisable sans le son_

## Étape 1.7 — Progression et motivation
> Règles et chiffres : [`docs/pedagogie/gamification.md`](../docs/pedagogie/gamification.md) et [`defis.md`](../docs/pedagogie/defis.md).
- [ ] **A-070** Historique des séances et statistiques de base — _page profil_
- [ ] **A-071** **XP et niveaux** : 3 XP par minute + 10 de revue, plafond 150 XP/jour, niveau = 50 × (n − 1) × (n + 4) 🆕 — _calcul **en base** (fonction SQL), journal d'XP immuable, tests de plafond et d'idempotence_
- [ ] **A-072** **Objectif hebdomadaire** (3 à 6 séances), série de **semaines**, semaine de grâce, mode pause 🆕 — _fuseau horaire de l'utilisateur ; remplace la série de jours consécutifs_
- [ ] **A-073** Badges (liste initiale de `gamification.md`) 🆕 — _attribution par la base, aucune récompense aléatoire_
- [ ] **A-074** **Carnet** : journal, photos privées, comparaison **avant/après** (M2) 🆕 — _quota de stockage respecté (A-044)_
- [ ] **A-075** **Défis** : D1 à D8 avec grille d'auto-évaluation, mois de 31 consignes, compteurs « Les 100 » 🆕 — _étoiles calculées selon `defis.md`_

## Étape 1.8 — PWA & hors-ligne
- [~] **A-080** Manifest et icônes — _socle : icônes **provisoires** à remplacer par l'identité visuelle_
- [ ] **A-081** Service worker : stratégie de cache hors-ligne (contenu déjà consulté) + page hors-ligne — _mode avion testé_
- [ ] **A-082** Invite d'installation (iOS : consignes « Ajouter à l'écran d'accueil » ; Android : `beforeinstallprompt`) — _testé sur de vrais téléphones_
- [ ] **A-083** Notifications push iOS et Android (rappel quotidien) 🆕 — _ADR avant de coder : iOS 16.4+ et appli installée, permission sur geste ; cron Vercel Hobby = 1 fois/jour (planification via `pg_cron` ? à vérifier) ; voir `docs/roadmap.md`, domaine 16_
- [ ] **A-084** Lighthouse PWA ≥ 90 — _rapport consigné_
- [~] **A-086** **Zoom de la page bloqué** (iPhone et Android) : `viewport`, `NoZoom`, `touch-action` — _tests unitaires et e2e ; CI à valider_
- [ ] **A-087** **Visionneuse zoomable** (pincement, double toucher, glisser) pour les dessins et les images de référence, contrepartie du zoom bloqué 🆕 — _testée sur de vrais téléphones_
- [ ] **A-085** Chronomètre de séance en arrière-plan : heure de début (pas un compteur), écran maintenu allumé (Wake Lock), signal de fin de bloc 🆕 — _support iOS à vérifier sur un vrai appareil_

## Étape 1.9 — Performance & charge ⚡
- [ ] **A-090** Cache serveur des données publiques, invalidation par `updateTag()` — _règles dans `docs/performance.md`_
- [ ] **A-091** Budget de page (< 100 Ko) et stratégie d'images (voir `constraints.md`) — _mesuré_
- [ ] **A-092** Test de charge k6 (pic de ~20 utilisateurs) avec les volumes cibles (`load/`) — _seuils de `docs/load-testing.md` respectés_
- [ ] **A-093** Analytics (échantillonnée) 🆕 — _décision RGPD + quota ; CSP à jour_

## Étape 1.10 — Qualité, conformité et release
- [ ] **A-100** Accessibilité : contrastes, navigation clavier, lecteur d'écran, zoom, `prefers-reduced-motion` — _Lighthouse a11y ≥ 90_
- [ ] **A-101** RGPD : export et suppression de compte (dessins envoyés inclus) 🆕 🔒 — _testé_
- [ ] **A-102** Revue de sécurité : RLS, secrets, en-têtes (securityheaders.com), `npm audit`, Security Advisor à 0 warning — _consignée dans `docs/security.md`_
- [ ] **A-103** Contrôle des quotas (`docs/runbook.md`) une semaine après l'ouverture — _< 70 % de chaque quota_
- [ ] **A-104** Release v1.0.0 : changelog (release-please), tag — _déployée depuis `main`_

---

## Backlog (hors v1.0.0)
> La liste complète des évolutions futures (priorités, phases, dépendances) est dans [`docs/roadmap.md`](../docs/roadmap.md).
- 🆕 Partage public de dessins, galerie, retours entre apprenants ; **défis collectifs** (objectif commun de la semaine).
- 🆕 **Canevas de dessin dans l'application** (stylet, pression, annulation) : produit à part, voir question 13.
- 🆕 Retour automatique sur un dessin (IA ou communauté) : aucune étude trouvée sur l'efficacité du retour entre pairs en dessin débutant (`docs/pedagogie/sources.md`).
- 🆕 Parcours suivants : **Nature et vivant**, **Perspective approfondie**, **Figure : geste et mannequin**, **Couleur** (`docs/pedagogie/parcours.md`).
- 🆕 Vidéos originales de 4 à 8 minutes (une par concept).
- 🆕 Parcours d'apprentissage structurés (semaines, objectifs).
- 🆕 Abonnement ou contenu payant (implique le plan Vercel Pro : voir R1 dans `decisions-a-valider.md`).
