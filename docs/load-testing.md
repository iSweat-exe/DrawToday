# Test de charge (200 utilisateurs simultanés)

Objectif : vérifier qu'un pic de ~200 utilisateurs simultanés ne dégrade pas l'app, et **mesurer** (au lieu
d'estimer) le coût par page pour le comparer aux quotas gratuits (voir `docs/performance.md`).

## Règle absolue

**Ne jamais lancer ce test contre le site de production ni contre un projet Supabase hébergé** : il consommerait
les quotas gratuits (invocations, CPU actif, egress) et pourrait faire **mettre le déploiement en pause**.
`load/run-local.sh` refuse de démarrer si la base n'est pas locale.

## Lancer

Prérequis : Docker démarré et la CLI Supabase (`npx supabase`), sous Linux ou macOS. Rien d'autre à installer : k6
tourne dans l'image Docker `grafana/k6` (téléchargée au premier lancement).

```bash
bash load/run-local.sh          # palier de 120 s à 200 utilisateurs (durée totale ≈ 3 min + build)
bash load/run-local.sh 300s     # palier plus long
```

Le script : démarre Supabase local (`db reset`), construit et démarre l'app en production locale (`next start`), fait un
échauffement, lance le scénario k6, puis affiche le **temps CPU du serveur** et le **nombre de lectures en base**. Le
résumé de k6 est aussi écrit dans `load/last-run.txt` (ignoré par Git).

> **État du socle** : le scénario ne visite que l'accueil (page statique) et le script ne remplit pas la base (aucune
> table). Il sert de mise en place : le brancher sur les vraies pages et sur le volume cible (≈ 1000 profils et tout le
> catalogue) dès les premières fonctionnalités (case O-064). Le script n'a pas pu être exécuté lors de l'initialisation
> (pas de Docker) : le corriger au premier lancement si besoin.

## Scénario (`load/k6-200-users.js`)

200 utilisateurs virtuels arrivent en 30 s, restent au palier (120 s par défaut), puis repartent en 15 s. Chacun
parcourt `JOURNEY` (liste de pages) avec des pauses de lecture de 3 à 8 s, puis recommence. Un utilisateur sur cinq est
connecté si un cookie de session est fourni (`AUTH_COOKIE_NAME`, `AUTH_COOKIE_VALUE`), les autres sont invités. Seuls
les **documents HTML** sont demandés, donc chaque visite est un rendu complet : c'est le pire cas pour le serveur (en
production les fichiers statiques viennent du CDN).

## Seuils (le test échoue s'ils sont dépassés)

| Mesure | Seuil |
|---|---|
| Requêtes en échec | < 1 % |
| Temps de réponse p95 | < 800 ms |
| Temps de réponse p99 | < 2 s |
| Vérifications (statut 200 + page de l'app) | > 99 % |

## Résultats

Aucun pour l'instant. Consigner ici (et dans `docs/performance.md`) la date, la machine, les mesures et le coût par page.
