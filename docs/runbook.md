# Runbook (opérations)

## Mise en service (une seule fois, par un mainteneur)

Ce que le dépôt ne peut pas faire seul (les réglages détaillés et la liste de contrôle sont dans [`repository-setup.md`](./repository-setup.md)). L'ordre compte ; cocher les cases O-xxx correspondantes de la checklist.

1. **GitHub — premier push** : `git push -u origin main` du commit d'initialisation. La CI se lance ; le workflow
   « Sync labels » crée les labels du dépôt (`.github/labels.yml`).
2. **GitHub — réglages du dépôt** :
   - Settings → Actions → General → cocher **Allow GitHub Actions to create and approve pull requests**
     (release-please, O-028).
   - Settings → Rules → Rulesets → *Import a ruleset* : `.github/rulesets/main.json` et `.github/rulesets/tags.json`
     (O-024 : PR obligatoire en squash, six vérifications requises, historique linéaire, pas de force-push).
   - Settings → Pull requests → n'autoriser que **Squash merge** ; supprimer les branches après fusion.
   - Settings → Code security : activer Dependabot alerts et le secret scanning.
3. **Supabase** : créer **deux projets** (dev et prod, jamais partagés), même région (O-007, O-008). Pour la prod,
   noter la « reference ID », le mot de passe de la base et créer un Access Token (Account → Access Tokens).
4. **GitHub — environnement `production`** (Settings → Environments, O-034b) : ajouter **Required reviewers** (toi),
   restreindre les branches à `main`, et les secrets `SUPABASE_ACCESS_TOKEN`, `SUPABASE_DB_PASSWORD`,
   `SUPABASE_PROJECT_ID`.
5. **Vercel** : importer le dépôt, Production Branch = `main`. Variables d'environnement (Production) :
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_SITE_URL`,
   `SUPABASE_SERVICE_ROLE_KEY` (quand un code serveur en a besoin), `CRON_SECRET` (longue chaîne aléatoire).
   Renseigner `regions` dans `vercel.json` avec la région la plus proche de Supabase (voir plus bas).
6. **Supabase prod** — réglages à la main : désactiver l'écriture du journal d'audit Auth en base (voir plus bas),
   vérifier « JWT expiry » = 3600, configurer un SMTP custom avant l'ouverture publique, ajouter les Redirect URLs
   (`https://<prod>/auth/callback`, `http://localhost:3000/auth/callback`) dès que la connexion existe.
7. **Moniteur externe** (O-075) : sonde HTTP gratuite (UptimeRobot, Better Stack…) sur `https://<prod>/api/health`
   toutes les 5 min, alerte si le code n'est pas 200.

## Environnements

| Env  | Supabase        | Vercel                         |
| ---- | --------------- | ------------------------------ |
| dev  | projet de DEV (ou Supabase local via Docker) | local (`npm run dev`) |
| prod | projet de PROD  | production depuis `main`       |

Seule la branche `main` est déployée (`git.deploymentEnabled` dans `vercel.json`) : **aucune preview** n'est créée
pour les branches ni les pull requests, afin de ne pas consommer le quota de déploiements Hobby. Tester en local
(`npm run dev`) et via la CI. Utiliser un projet Supabase **distinct** pour dev et prod. Si les previews sont
réactivées un jour, ne jamais en pointer une vers la base de production.

## Gestion des secrets (O-070)

- Local : `.env.local` (jamais commité). Modèle : `.env.example`.
- Vercel : Project Settings → Environment Variables (séparer Preview et Production).
- `SUPABASE_SERVICE_ROLE_KEY` : serveur uniquement, jamais `NEXT_PUBLIC_`.
- **Rotation** (clé fuitée ou départ d'un développeur) : régénérer dans Supabase (Project Settings → API),
  mettre à jour Vercel, redéployer, révoquer l'ancienne clé. Si un secret a été commité : le considérer
  compromis, le rotater, puis nettoyer l'historique si nécessaire.
- Le mot de passe de la base Postgres ne doit apparaître nulle part dans le projet.

## Keep-alive contre la mise en pause (Supabase gratuit)

Un projet Supabase gratuit est mis en pause après ~7 jours sans activité. `vercel.json` déclare un cron quotidien
(`0 6 * * *`) qui appelle `/api/keep-alive` (un appel à la fonction SQL `keep_alive()`, sans lecture de table).
**À faire une fois sur Vercel** : définir la variable d'environnement `CRON_SECRET` (une longue chaîne aléatoire,
environnement Production) ; Vercel l'envoie alors tout seul en `Authorization: Bearer …` à ses crons et la route
refuse tout autre appelant. Vérifier ensuite dans Vercel → Settings → Cron Jobs que la tâche apparaît et que sa
dernière exécution renvoie 200. L'offre Hobby autorise un cron par jour. **Prérequis** : la migration
`20261008120000_keep_alive.sql` doit être appliquée sur le projet (sinon la route répond 503).

## Durée de vie du jeton (JWT) : 1 heure

Garder la valeur par défaut de Supabase (3600 s) : **tous les renouvellements de jeton partent des adresses IP de
Vercel**, et la limite de Supabase Auth (150 renouvellements par tranche de 5 minutes et par IP, par défaut) est
atteinte plus vite avec une durée courte ; un refus (429) déconnecte l'utilisateur dont le jeton vient d'expirer.
Chaque renouvellement écrit aussi 2 lignes dans le journal d'audit d'Auth (voir plus bas).

- Local : `jwt_expiry = 3600` dans `supabase/config.toml`.
- **Projet hébergé (à vérifier à la main)** : tableau de bord Supabase, réglage « JWT expiry » : **3600** secondes.

## Journal d'audit de Supabase Auth : ne pas l'écrire en base

Supabase Auth écrit **2 lignes par renouvellement de jeton** (`token_refreshed` et `token_revoked`) dans
`auth.audit_log_entries`, une table que rien ne purge. À 1000 utilisateurs actifs, cela représente des millions de
lignes par an (beaucoup moins pour un petit public, mais la table n'est jamais purgée) : le quota de **500 Mo** de la base gratuite serait atteint en quelques mois.

**À faire une fois sur le projet hébergé** : tableau de bord Supabase → Authentication → Audit Logs → activer
« Disable writing auth audit logs to the project database ». Les journaux restent consultables dans le tableau de bord
(Logs Explorer). Contrôler ensuite la taille avec :

```sql
select relname, pg_size_pretty(pg_total_relation_size(c.oid))
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'auth' order by pg_total_relation_size(c.oid) desc limit 5;
```

## Région des fonctions Vercel (O-008)

Par défaut les fonctions Vercel tournent à Washington (`iad1`). Si le projet Supabase est en Europe, chaque lecture en
base ajoute ~90 ms d'aller-retour transatlantique (durée de fonction comptée en mémoire provisionnée, et latence
perçue). Une fois la région Supabase connue, ajouter dans `vercel.json` `"regions": ["<code>"]` (une seule région est
autorisée sur l'offre Hobby ; ex. `dub1` pour Irlande/`eu-west-1`, `fra1` pour Francfort/`eu-central-1`). Le socle ne
fixe aucune région : la région Supabase n'est pas encore choisie.

## Contrôle des quotas (une semaine après l'ouverture, puis chaque mois) (A-103)

À comparer aux estimations de `docs/performance.md` :

| Où | Quoi lire | Attendu (alerte si > 70 % du quota) |
|---|---|---|
| Vercel → Usage → Edge Requests, par chemin | requêtes par jour × 30 | < 1 M |
| Vercel → Usage → Function Invocations, par fonction | `/_middleware` (le `proxy`) et les pages | < 1 M au total. Le `proxy` ne doit compter que les connectés |
| Vercel → Usage → Fast Origin Transfer | Go du mois | < 10 Go |
| Vercel → Usage → Active CPU | heures du mois | < 4 h |
| Supabase → Reports / Usage | Database size, Storage, Egress, MAU | < 500 Mo de base, < quota Storage et egress, < 50 000 MAU |
| Supabase → Authentication → Logs | erreurs 429 | aucune : sinon revoir la durée du jeton |

Mesure de la taille des tables après quelques semaines :

```sql
select schemaname, relname, pg_size_pretty(pg_total_relation_size(relid)) as size
from pg_stat_user_tables order by pg_total_relation_size(relid) desc limit 10;
```

Sur Hobby un dépassement **met le projet en pause** (jusqu'à 30 jours), il n'est pas facturé.

## Déploiement (O-035)

1. Lier le dépôt GitHub à Vercel (une seule fois, voir « Mise en service »).
2. Production Branch = `main`. Les autres branches et les PR ne sont **pas** déployées ; pour une preview ponctuelle,
   lancer `vercel deploy` à la main.
3. Les migrations Supabase sont appliquées **automatiquement** après la fusion sur `main` (section ci-dessous) : ne
   plus les passer à la main.
4. Vérifier les quotas (Supabase + Vercel) après chaque release.

## Migrations automatiques (workflow `.github/workflows/supabase.yml`)

- **Sur une PR** touchant `supabase/**` : job « Database tests » : `supabase start` (base jetable en local, toutes
  les migrations rejouées depuis zéro) puis `supabase test db` (pgTAP, dont les tests RLS). Une migration cassée ou
  un test SQL rouge fait échouer la PR. Aucun secret n'est exposé aux PR.
- **Après fusion sur `main`** d'une PR qui ajoute une migration : job « Apply migrations to production » (après les
  tests) : `supabase link`, `supabase db push --dry-run` (liste ce qui va être appliqué, visible dans le journal)
  puis `supabase db push`. Une seule exécution à la fois (`concurrency`), jamais annulée en cours de route, chaque
  migration est transactionnelle (en cas d'erreur, la migration fautive n'est pas appliquée). Le job échoue avec un
  message clair s'il manque un secret.
- **Configuration** : voir « Mise en service », étape 4 (environnement `production`, secrets `SUPABASE_*`).
- **Base de référence (une seule fois si des migrations ont déjà été passées à la main)** : `db push` applique tout
  ce qui n'est pas dans l'historique `supabase_migrations` du projet. Si des migrations ont été exécutées dans
  l'éditeur SQL, déclarer leurs versions comme déjà appliquées : Actions → **Supabase** → *Run workflow* sur
  `main`, champ `mark_applied` = les versions séparées par des espaces (noms des fichiers de `supabase/migrations/`
  sans `_description.sql`). Ne mettre **que** celles réellement présentes en production.
- **Règle de compatibilité** : le code se déploie sur Vercel dès la fusion, en parallèle de la migration (et la
  migration peut attendre une approbation). Écrire les migrations de façon **additive** (nouvelle colonne, nouvelle
  fonction, nouvelle table) et ne retirer l'ancien (colonne, fonction) qu'une PR plus tard, quand plus aucun code ne
  s'en sert. Le code doit tolérer l'absence d'un ajout récent.
- Un échec laisse la production inchangée pour la migration fautive : lire le journal, corriger par une **nouvelle**
  migration (jamais en éditant une migration déjà fusionnée), puis relancer le workflow (*Re-run jobs*).

## Sauvegarde et restauration (O-073)

L'offre gratuite de Supabase n'offre pas de sauvegarde automatique fiable : planifier un export régulier.

```bash
# Export complet (remplacer l'URI par la chaîne de connexion du POOLER, jamais commitée)
pg_dump "$SUPABASE_DB_URL" --no-owner --format=custom --file=backup-YYYY-MM-DD.dump

# Restauration vers une base VIERGE de test
pg_restore --no-owner --dbname="$TARGET_DB_URL" backup-YYYY-MM-DD.dump
```

- Stocker les dumps hors du dépôt, chiffrés. Les fichiers du Storage (dessins) ne sont pas dans le dump : les exporter à part.
- Fréquence recommandée : hebdomadaire, plus une avant chaque migration risquée.
- **À faire** : tester une restauration complète une fois les premières tables en place.

## Projet Supabase en pause

L'offre gratuite met le projet en pause après ~1 semaine d'inactivité. Le restaurer depuis le dashboard ; le cron
`/api/keep-alive` sert à l'éviter.

## Incidents

1. Consulter les logs Vercel (Runtime Logs) et Supabase (Logs Explorer) ; vérifier `/api/health`.
2. Si un déploiement est en cause : « Instant Rollback » dans Vercel (aucune migration n'est annulée : elles sont additives).
3. Corriger via PR (hotfix `fix/…`), ne jamais modifier la production à la main.
