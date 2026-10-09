# Configuration du dépôt (guide pour un mainteneur seul)

Ce guide dit **quoi régler, où, et pourquoi**, pour que DrawToday soit tenu comme un projet d'équipe alors qu'une seule
personne y travaille. Ce que le dépôt peut faire seul est déjà dans le code (CI, labels, règles importables) ; ce qui
reste ne peut se faire que dans les interfaces GitHub, Vercel et Supabase. La liste de contrôle finale est à la fin.

> Principe : **les règles s'appliquent aussi à toi**. Seul, on n'a personne pour dire « non » : ce sont la CI et les
> règles de branche qui jouent ce rôle. Elles sont conçues pour ne jamais te bloquer sans raison (aucune approbation
> par une autre personne n'est exigée, voir « Pourquoi 0 approbation »).

Le pas-à-pas de la première mise en service (Supabase, Vercel, secrets) reste dans [`runbook.md`](./runbook.md) ; ce
guide en est la version « réglages du dépôt », à jour des règles importables.

## 1. Réglages généraux (Settings → General)

| Réglage | Valeur | Pourquoi |
| --- | --- | --- |
| Features | Décocher **Wikis**, **Projects** ; laisser **Issues** ; **Discussions** au choix | La doc est dans `docs/`, le suivi dans `.dev/` et les issues |
| Pull Requests → **Allow squash merging** | Coché, **seul** (message par défaut : *Pull request title*) | Le titre de la PR devient le commit : historique linéaire, Conventional Commits |
| Allow merge commits / rebase merging | Décochés | Un seul mode de fusion = un historique lisible |
| **Always suggest updating pull request branches** | Coché | Bouton « Update branch » quand `main` a avancé |
| **Allow auto-merge** | Coché | Tu actives « Auto-merge » et la PR se fusionne dès que la CI est verte |
| **Automatically delete head branches** | Coché | Pas de branches mortes |

## 2. Protection de `main` et des tags (Settings → Rules → Rulesets)

Deux fichiers sont versionnés et **importables tels quels** (*New ruleset → Import a ruleset*) :

| Fichier | Protège | Règles |
| --- | --- | --- |
| [`.github/rulesets/main.json`](../.github/rulesets/main.json) | la branche par défaut (`main`) | pas de suppression, pas de force-push, historique linéaire, PR obligatoire (squash uniquement, discussions résolues, relectures obsolètes écartées au push), 6 vérifications requises |
| [`.github/rulesets/tags.json`](../.github/rulesets/tags.json) | les tags de version `v*` | pas de suppression, de réécriture ni de mise à jour (un tag publié ne bouge plus) |

Vérifications requises (noms exacts des jobs de [`ci.yml`](../.github/workflows/ci.yml)) : `Quality`,
`Conventional Commits`, `PR title`, `Secret scan`, `Dependency audit`, `End-to-end tests`.

À savoir :

- **`Database tests` n'est volontairement pas requis** : ce job ne tourne que si la PR touche `supabase/` (filtre de
  chemins). Une vérification requise qui ne se lance pas bloque la PR pour toujours. Le workflow reste en place et
  rouge s'il y a un problème ; ne fusionne pas une PR `supabase/` rouge.
- **Aucun « bypass »** : toi non plus, tu ne pousses pas sur `main`. Si un jour tu dois débloquer une situation,
  désactive le ruleset (*Enforcement: Disabled*), corrige, **réactive-le** — c'est tracé dans l'historique.
- **« Branches à jour avant fusion » est désactivé** (`strict_required_status_checks_policy: false`) : seul, ça ne
  protège de presque rien et ça force à relancer la CI après chaque fusion. Active-le si plusieurs personnes
  fusionnent en parallèle.
- Après un import, vérifier dans l'interface que les six vérifications sont reconnues : un nom qui n'a jamais tourné
  est affiché mais n'est pas attrapé. Ouvre d'abord une PR (la CI tourne), puis active le ruleset.
- Un test (`src/ci/repository-config.test.ts`) garde ces fichiers cohérents avec les noms de jobs de la CI.

### Pourquoi 0 approbation (et le code owner ?)

GitHub **interdit d'approuver sa propre PR**. Exiger « 1 approbation » ou « review des code owners » alors que
[`CODEOWNERS`](../.github/CODEOWNERS) ne contient que toi bloquerait toutes les PR. La relecture humaine exigée par
[`CLAUDE.md`](../CLAUDE.md) est donc **la tienne, avant de fusionner** : lis le diff (onglet *Files changed*), vérifie
la case « généré par un LLM » du template, puis fusionne. Quand une deuxième personne arrive :

1. mettre `required_approving_review_count` à `1` et `require_code_owner_review` à `true` dans le ruleset ;
2. ajouter la personne (ou une équipe) dans `CODEOWNERS` ;
3. adapter `src/ci/repository-config.test.ts` (le test « solo » le dira).

## 3. Sécurité (Settings → Advanced Security / Code security)

| Réglage | Valeur |
| --- | --- |
| Private vulnerability reporting | **Activé** (la politique [`SECURITY.md`](../.github/SECURITY.md) y renvoie) |
| Dependency graph, **Dependabot alerts**, **Dependabot security updates** | Activés (les mises à jour de version sont dans [`dependabot.yml`](../.github/dependabot.yml)) |
| **Secret scanning** + **Push protection** | Activés : GitHub refuse un push qui contient un secret (en plus de `gitleaks` en CI) |
| Code scanning (CodeQL) | Optionnel : gratuit pour un dépôt public ; ajouter le workflow « default setup » si tu veux |

Compte GitHub : **authentification à deux facteurs** (clé de sécurité ou passkey), et idéalement des commits signés
(clé SSH de signature) — non imposé par le ruleset pour ne pas bloquer les contributions via l'interface web.

## 4. Actions (Settings → Actions → General)

| Réglage | Valeur | Pourquoi |
| --- | --- | --- |
| Actions permissions | *Allow all actions* (ou *Allow … and select non-…* si tu veux restreindre) | Les workflows utilisent `actions/*`, `googleapis/release-please-action`, `supabase/setup-cli`, gitleaks |
| Workflow permissions | **Read repository contents and packages permissions** | Chaque workflow déclare lui-même ses droits (`permissions:`) |
| **Allow GitHub Actions to create and approve pull requests** | **Coché** | Nécessaire à release-please pour ouvrir la PR de version |
| Fork pull request workflows | *Require approval for all outside collaborators* | Une PR extérieure ne lance rien sans ton accord |

Environnement `production` (Settings → Environments) : **Required reviewers** = toi, branches autorisées = `main`,
secrets `SUPABASE_ACCESS_TOKEN`, `SUPABASE_DB_PASSWORD`, `SUPABASE_PROJECT_ID`. Les migrations ne partent en
production qu'après ton clic « Approve ».

## 5. Vercel : déployer **uniquement** depuis `main`

Trois verrous, du plus fort au plus fin. Les deux premiers sont dans [`vercel.json`](../vercel.json) et testés ;
le troisième est un réglage de projet.

1. **`git.deploymentEnabled`** : `{ "main": true, "**": false }`. Vercel ne crée aucun déploiement pour une autre
   branche que `main` (pas de *preview*, ni pour les branches `feat/…`, ni pour Dependabot). C'est l'économie
   voulue : le plan Hobby est limité (100 déploiements par jour) et les aperçus exposeraient du code non relu.
2. **`ignoreCommand`** : `test "$VERCEL_GIT_COMMIT_REF" != "main"`. Si un déploiement était quand même demandé pour
   une autre branche (règle mal lue, intégration future), Vercel exécute cette commande avant de construire :
   code de sortie `0` = **construction ignorée**, `1` = on construit. Seule la branche exactement nommée `main`
   construit ; une branche inconnue ou vide est ignorée.
3. **Production Branch = `main`** (Vercel → Project → Settings → Environments → Production) :
   seule `main` peut devenir la production.

Réglages complémentaires dans le tableau de bord Vercel :

- *Settings → Git* : *Connected Git Repository* = `iSweat-exe/DrawToday`, **Deploy Hooks** : aucun inutile
  (un hook peut forcer un déploiement d'une branche).
- *Settings → Deployment Protection* : laisser **Standard Protection** ; les URL de déploiement ne sont pas publiques.
- *Settings → Environment Variables* : variables de **Production** uniquement (voir `runbook.md`) ;
  ne rien définir pour *Preview* tant qu'il n'y a pas d'aperçu.
- Plan **Hobby = usage non commercial** : si l'app devient payante (abonnement, publicité), passer à Pro.
- Après chaque changement de ces réglages : pousser une branche de test et vérifier dans *Deployments* qu'**aucun**
  déploiement n'apparaît (ou qu'il est marqué « Ignored »), puis fusionner dans `main` et vérifier qu'un déploiement
  Production démarre.

`vercel.json` figure dans [`CODEOWNERS`](../.github/CODEOWNERS). Le test `src/ci/repository-config.test.ts` exécute réellement la commande `ignoreCommand` pour `main`,
`feat/…`, `dependabot/…`, `main-old`, une branche vide, etc.

## 6. Supabase

Deux projets (dev et prod, jamais partagés), voir `runbook.md`. Réglages à ne pas oublier côté dépôt :

- Les clés **`service_role`** ne sont que sur Vercel (serveur) et dans l'environnement GitHub `production`, jamais dans
  le code ni dans un `.env*` committé.
- *Authentication → URL Configuration* : `Site URL` = URL de production ; `Redirect URLs` = production et
  `http://localhost:3000/**` (pas de wildcard sur des domaines que tu ne contrôles pas).
- Le plan gratuit met le projet en pause après 7 jours sans activité : le cron `/api/keep-alive` l'évite (variable
  `CRON_SECRET` sur Vercel).
- Pas de sauvegarde automatique fiable sur le plan gratuit : suivre la procédure d'export de `runbook.md`.

## 7. Labels, issues et PR (déjà automatisés)

- Les **labels** viennent de [`.github/labels.yml`](../.github/labels.yml) (workflow `Sync labels` à chaque push sur
  `main`). Ne les modifie jamais à la main dans l'interface.
- Dès l'ouverture d'une PR, le workflow `Auto label` pose : `type:` (titre), `size:` (lignes), `area:` (fichiers),
  `checklist:` (identifiants `A-xxx` / `O-xxx` du template), `status:` (brouillon ou prête), `needs-tests`,
  `needs-docs`, `llm-generated`… Détail dans [`git-workflow.md`](./git-workflow.md). **Rien à faire** : écris
  seulement un titre Conventional Commit et remplis la section « Checklist item ».
- Les formulaires d'issue (bug, fonctionnalité, tâche LLM) posent `area:`, `platform:`, `priority:`.

## 8. Rythme de maintenance (15 minutes par semaine)

1. **Lundi** : les PR Dependabot (groupées en minor/patch). Une PR rouge sur une majeure de `typescript`, `@types/node`
   ou `eslint-config-next` : la fermer (elles sont ignorées dans `dependabot.yml`), jamais `npm audit fix --force`.
2. Ouvrir la PR de version de release-please quand elle apparaît, relire le `CHANGELOG`, fusionner : le tag `vX.Y.Z` est
   posé (et protégé par le ruleset des tags).
3. Vercel → *Usage* et Supabase → *Reports* : vérifier les quotas (tableau dans `runbook.md`).
4. Une fois par trimestre : relire **Settings → Rules** (les rulesets sont toujours actifs), les clés d'accès
   (*Settings → Developer settings*), les secrets inutilisés, et tester une restauration de sauvegarde.

## 9. Liste de contrôle (à cocher une fois, puis à relire chaque trimestre)

**GitHub**

- [ ] Squash seul, branches supprimées après fusion, auto-merge activé (§ 1)
- [ ] Ruleset `Protect main` importé et **Active** (`.github/rulesets/main.json`)
- [ ] Ruleset `Protect release tags` importé et **Active** (`.github/rulesets/tags.json`)
- [ ] Private vulnerability reporting, Dependabot alerts + security updates, secret scanning + push protection (§ 3)
- [ ] « Allow GitHub Actions to create and approve pull requests » coché, permissions par défaut en lecture (§ 4)
- [ ] Environnement `production` : reviewer = toi, branche `main`, 3 secrets Supabase
- [ ] Authentification à deux facteurs sur le compte

**Vercel**

- [ ] Production Branch = `main`
- [ ] `vercel.json` : `git.deploymentEnabled` + `ignoreCommand` déployés (vérifié avec une branche de test)
- [ ] Variables de Production définies (dont `CRON_SECRET`), aucune pour Preview
- [ ] Domaine / URL de production notés dans `NEXT_PUBLIC_SITE_URL`

**Supabase**

- [ ] Projets dev et prod séparés, `service_role` uniquement côté serveur
- [ ] Redirect URLs et `Site URL` corrects
- [ ] Moniteur externe sur `/api/health` (O-075)

**Preuve que tout fonctionne** : ouvre une petite PR de test — les labels apparaissent en moins d'une minute, les six
vérifications tournent, le bouton de fusion reste grisé tant qu'elles ne sont pas vertes, aucun déploiement Vercel
n'est créé, et après la fusion un déploiement Production démarre.
