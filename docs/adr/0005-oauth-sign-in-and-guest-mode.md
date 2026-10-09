# 0005 — Connexion par Discord et GitHub, et mode invité local

- **Statut** : Accepted
- **Date** : 2026-10-09
- **Décideurs** : @iSweat-exe

## Contexte

La question 4 de `.dev/decisions-a-valider.md` (« quels providers ? que voit un invité ? ») est tranchée par le propriétaire :
connexion avec **Discord** et **GitHub**, plus un **mode invité** qui ne sauvegarde rien en ligne (« local »). Contraintes :
offres gratuites (pas d'e-mails à envoyer : le SMTP du free tier est très limité), petit public, aucune dépendance ajoutée.

## Options envisagées

1. **OAuth Discord et GitHub** (Supabase Auth) — aucun mot de passe à stocker, aucun e-mail à envoyer, un clic.
2. E-mail + mot de passe ou lien magique — demande un SMTP custom (A-012), une protection contre les mots de passe fuités et un CAPTCHA (A-013).
3. Invité = **connexion anonyme Supabase** (`signInAnonymously`) — une vraie ligne `auth.users` par visiteur, donc des comptes fantômes à nettoyer, et les écritures de l'invité atteindraient la base.
4. Invité = **absence de session**, données gardées sur l'appareil — aucune ligne en base, rien à nettoyer ; la RLS refuse déjà toute écriture à `anon`.

## Décision

- Options **1** et **4**. `enable_anonymous_sign_ins` reste à `false`.
- Le flux est **PKCE côté serveur** : une Server Action (`signInWithProvider`) valide le provider (liste fermée `OAUTH_PROVIDERS`), demande l'URL à Supabase
  et redirige ; le provider renvoie sur `/auth/callback`, un Route Handler qui échange le code contre une session (cookies, A-010).
  La déconnexion est locale à l'appareil (`scope: "local"`).
- **Un invité est un visiteur sans session.** Il lit tout le contenu public ; ce qu'il fait (séances, notes) reste dans le stockage de **son appareil** et ne part jamais
  vers la base. Le rattachement de ces données à un compte à la première connexion (promesse de `docs/pedagogie/integration-app.md`) se fera avec la première
  fonctionnalité qui écrit (A-043) : il n'y a encore rien à conserver.
- La connexion est **facultative** : aucune page n'en dépend pour l'instant. Le proxy ne redirige donc jamais (A-014 protégera les routes privées plus tard).
- Le nom et la photo viennent des métadonnées du provider (`user_metadata`, lues dans le JWT : aucune requête en base). L'URL de la photo n'est acceptée que
  sur les hôtes des deux providers (`AVATAR_HOSTS`, aussi listés dans la CSP) ; sinon, les initiales s'affichent.
- La table `profiles` (A-002) viendra avec sa propre migration : ce changement n'en crée pas.

## Conséquences

- Pas de mot de passe ni d'e-mail : le SMTP custom (A-012) et le CAPTCHA (A-013) ne sont plus nécessaires à l'ouverture. Le public doit avoir un compte Discord ou GitHub :
  à réévaluer si le public visé n'en a pas (question 15 : âge et public). Ajouter un provider = une ligne dans `OAUTH_PROVIDERS`, un bloc dans `config.toml`, une origine d'avatar dans la CSP.
- Deux applications OAuth à créer (Discord, GitHub), avec leurs secrets uniquement dans l'environnement : voir `docs/runbook.md`.
- Une personne qui efface les données du navigateur perd ce qu'elle a fait en invité : l'application le dit (`GuestNotice`).
- Le rate limit des endpoints d'auth (A-019) reste à faire.
