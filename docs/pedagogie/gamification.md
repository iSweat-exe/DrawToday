# Motivation et ludification : XP, niveaux, objectifs, badges

> **Proposition à valider.** Tous les chiffres sont des **choix de conception**, calculés pour être cohérents entre eux
> (un script de vérification a servi à les fixer), mais **jamais testés auprès d'utilisateurs**. L'objectif : un système
> **agréable et motivant** qui récompense la **pratique réelle**, sans jamais devenir le but de l'application.

## Ce que dit la recherche (et ce que ça change)

| Constat | Source (confiance) | Décision |
| --- | --- | --- |
| La motivation durable repose sur **l'autonomie, la compétence ressentie et le lien aux autres** | Deci & Ryan, théorie de l'autodétermination [S] | Chaque élément de jeu doit servir l'un des trois (voir tableau ci-dessous) |
| Des **récompenses tangibles attendues** peuvent réduire la motivation intrinsèque ; le **retour positif** non | Deci, Koestner & Ryan (1999, 128 études) [P] — **débat** sur l'ampleur (Cameron & Pierce) | Les récompenses sont **symboliques** (XP, badges, titres) et liées à l'**effort réel**, jamais à de l'argent ni à des objets ; le retour est **concret et positif** |
| La gamification a des effets **petits à moyens** : cognitif g = 0,49, motivationnel g = 0,36, comportemental g = 0,25 ; moins stables sur la motivation | Sailer & Homner (2020) [P] | On ne mise pas tout sur le jeu : la qualité des exercices vient en premier |
| La **fiction de jeu** et la **compétition associée à la collaboration** aident les résultats comportementaux | Sailer & Homner (2020) [P] | Un peu de narration (titres, parcours), des **objectifs collectifs** plutôt que des classements individuels |
| Quand les points deviennent **le but**, certains apprenants trichent ou perdent de vue l'apprentissage | Étude qualitative d'une application de langues [P] | L'XP **ne dépend pas** de la note d'auto-évaluation ; pas de classement public ; plafonds |
| Les séries quotidiennes jouent sur l'**aversion à la perte** ; une remise à zéro brutale est une **plainte fréquente** ; les « gels » et les restaurations existent | Praticiens, Duolingo [S] — pas d'étude contrôlée | **Objectif hebdomadaire**, pas de série quotidienne ; semaine de grâce ; mode pause |
| Une habitude met **~2 mois** en moyenne à s'installer, avec une énorme variabilité | Lally et al. (2010) [P] | Reconnaissance **régulière** (badges tous les quelques jours), pas seulement à 30 ou 100 jours |
| Flow : objectifs clairs, retour immédiat, **défi adapté** au niveau | Csikszentmihalyi [S] | Chaque séance a un but et un retour ; deux niveaux par exercice ; les défis s'ajustent aux étoiles de maîtrise |

### Les trois besoins et ce qui les soutient

| Besoin | Éléments de DrawToday |
| --- | --- |
| **Autonomie** | Durée de séance choisie, objectif hebdomadaire choisi, carnet libre, contraintes facultatives, ordre des défis du mois libre, notifications **optionnelles** |
| **Compétence** | Étoiles de maîtrise par compétence, comparaison **avant/après**, retour concret après chaque défi, niveaux des exercices adaptés |
| **Lien** | Carnet partageable (facultatif), défis collectifs (plus tard), crédit aux méthodes et aux auteurs qui nous inspirent |

## Une petite communauté change les choix

DrawToday aura **peu d'utilisateurs** (voir `.dev/constraints.md`). Cela renforce certaines décisions : **aucun classement** (un classement de quelques personnes est gênant, pas motivant),
objectifs **personnels** (série de semaines, étoiles, avant/après) plutôt que sociaux, défis collectifs **reportés** (un « objectif commun » de 10 000 traits n'a pas de sens à 20 personnes). En contrepartie, une petite
communauté permet des **retours personnalisés** de l'équipe sur les dessins (voir `docs/roadmap.md`) et des choix de contenu faits avec les utilisateurs.

## Principes

1. **L'XP récompense le temps de pratique et la régularité, pas le résultat.** Un dessin « raté » rapporte autant qu'un dessin réussi : l'élève n'a aucune raison de bâcler ni de tricher.
2. **La maîtrise a son propre système** (étoiles par compétence, re-tests espacés) : c'est là que la **qualité** est mesurée.
3. **Zéro punition.** Pas de perte d'XP, pas de « vies », pas de message culpabilisant. Un jour manqué est un jour manqué.
4. **Le jeu s'efface derrière le dessin.** Les animations sont brèves, silencieuses par défaut, et respectent `prefers-reduced-motion`.
5. **Aucun classement obligatoire.** Pas de ligues, pas de comparaison avec des inconnus (la recherche ne justifie pas le coût en pression sociale).
6. **Aucune boucle d'achat, aucune récompense aléatoire** (« loot box »).

## L'XP

### Règle générale

**3 XP par minute pratiquée** + **10 XP** pour la revue de séance (M1, ou une note en carnet libre).

| Activité | XP |
| --- | --- |
| Séance de **10 min** (minimale) | 3 × 10 + 10 = **40** |
| Séance de **15 min** | 3 × 15 + 10 = **55** |
| Séance de **30 min** (standard) | 3 × 30 + 10 = **100** |
| Séance de **45 min** | 3 × 45 + 10 = **145** |
| Séance de **60 min** (atelier) | 3 × 60 + 10 = 190 → **150** (plafond du jour) |

- **Plafond de l'XP de pratique : 150 XP par jour.** Raison : encourager la régularité plutôt que les marathons, et ménager la main.
- **Rejouer** une séance déjà faite : XP de pratique **divisé par deux** (ni boucle de farm, ni obstacle au plaisir de recommencer).
- Les **bonus** (défis, étoiles, objectif hebdomadaire, badges) sont **hors plafond**.
- Le temps est **déclaré par le chronomètre de séance** : pas de vérification de dessin (impossible à automatiser, et sans enjeu puisqu'il n'y a pas de classement).

### Bonus

| Événement | XP | Fréquence |
| --- | --- | --- |
| Défi de la semaine terminé (quelle que soit la note) | **+100** | 1 fois par défi ; **+50** pour un re-test espacé |
| Boss (D4, D8) | **+250** | 1 fois |
| Test avant/après M2 | **+50** | À chaque bilan |
| **Objectif hebdomadaire atteint** | **+50** | 1 fois par semaine |
| Étoile de maîtrise ★ / ★★ / ★★★ / ★★★★ / ★★★★★ | +20 / +40 / +100 / +150 / +250 | Une fois par étoile et par compétence |
| Mois de 31 consignes : 20 consignes sur 31 | **+200** | 1 fois par mois (badge compris) |
| Paliers des compteurs « Les 100 » | selon le badge (voir plus bas) | Une fois |
| Première séance de la vie | **+50** | 1 fois |

> L'étoile ★★★★ (re-test à 7 jours) et ★★★★★ (re-test à 28 jours) payent plus que les premières : **revenir sur une notion est mieux récompensé que de l'abandonner**. Ce choix exploite
> l'effet d'espacement.

## Les niveaux

**XP total pour atteindre le niveau n : T(n) = 50 × (n − 1) × (n + 4).**
Le coût de chaque niveau augmente de **100 XP** à chaque niveau (300 pour passer du niveau 1 au 2, 400 pour le suivant…).

| Niveau | XP cumulé pour l'atteindre | XP pour passer au suivant | Titre (proposition) |
| --- | --- | --- | --- |
| 1 | 0 | 300 | Premier trait |
| 2 | 300 | 400 | Premier trait |
| 3 | 700 | 500 | Premier trait |
| 4 | 1 200 | 600 | Premier trait |
| 5 | 1 800 | 700 | Main sûre |
| 6 | 2 500 | 800 | Main sûre |
| 7 | 3 300 | 900 | Main sûre |
| 8 | 4 200 | 1 000 | Main sûre |
| 9 | 5 200 | 1 100 | Main sûre |
| 10 | 6 300 | 1 200 | Œil construit |
| 11 | 7 500 | 1 300 | Œil construit |
| 12 | 8 800 | 1 400 | Œil construit |
| 15 | 13 300 | 1 700 | Regard affûté |
| 20 | 22 800 | 2 200 | Atelier |
| 25 | 34 800 | 2 700 | Atelier |
| 30 | 49 300 | 3 200 | Maîtrise du trait |

Titres : niveaux 1–4 « Premier trait », 5–9 « Main sûre », 10–14 « Œil construit », 15–19 « Regard affûté », 20–29 « Atelier », 30 et plus
« Maîtrise du trait ». Les titres sont **neutres du point de vue du genre** et facultatifs (l'élève choisit lequel afficher).

### Calibrage : ce que cela donne en pratique

À 5 séances de 30 min par semaine, plus le défi, l'objectif hebdomadaire et un carnet libre de 20 min, le parcours **Fondations** rapporte **≈ 6 330 XP**
(32 séances guidées à 100 + 8 séances-défis à 100 + 8 bonus de défi à 100 + 2 boss à 250 + 3 bilans M2 à 50 + 8 objectifs hebdo à 50 + 8 carnets libres de 20 min
à 60), soit **≈ 790 XP par semaine**, plus ≈ 1 120 XP d'étoiles (jusqu'à ★★★ sur 7 compétences) : on termine Fondations vers le **niveau 10**. Au même rythme :
niveau 20 ≈ 29 semaines, niveau 30 ≈ 62 semaines.
La courbe est volontairement **rapide au début** (un nouvel utilisateur monte de niveau en 3 séances) et **plus lente ensuite**.

## L'objectif hebdomadaire et la série de semaines

- L'élève choisit son **objectif** : **3, 4, 5 ou 6 séances par semaine** (par défaut 4). Une séance compte à partir de **10 minutes** (séance minimale incluse) ; le carnet libre compte aussi.
- **Série de semaines** : nombre de semaines consécutives où l'objectif est atteint. Il n'y a **pas de série quotidienne**.
- **Semaine de grâce** : une semaine manquée par période de 8 semaines **n'interrompt pas** la série. L'application l'applique **automatiquement**, sans demander.
- **Mode pause** : l'élève peut mettre sa série en pause jusqu'à 2 semaines (voyage, maladie, examens) ; la reprise ne coûte rien.
- **Retour après une longue absence** : badge « Retour » (positif), message chaleureux, **séance minimale** proposée.
- **Aucune alerte de perte.** Rappels : un seul par jour au maximum, à l'heure choisie, ton neutre (« Ta séance de 30 minutes t'attend »).
- **Pourquoi pas une série quotidienne** : elle exploite l'aversion à la perte, produit de l'anxiété et des abandons quand elle se brise ; la recherche sur les
  habitudes ne montre pas qu'un jour manqué ruine l'habitude (Lally et al. ; à vérifier, voir `sources.md`).

## Les étoiles de maîtrise

Voir [`competences.md`](./competences.md) : 5 étoiles par compétence, de ★ « découverte » à ★★★★★ « maîtrisée », validées par des **défis** et des
**re-tests espacés** (7 jours puis 28 jours). C'est le **compteur de qualité** de l'application. L'XP et les niveaux mesurent l'**effort** ; les étoiles mesurent la **compétence**.

## Les badges

Un badge dit « tu as fait quelque chose de bien » ; il ne **donne** jamais accès à du contenu essentiel. Une trentaine au lancement, répartis en quatre familles. XP en plus de l'XP
de pratique (hors plafond).

### Régularité
| Badge | Condition | XP |
| --- | --- | --- |
| Première séance | Terminer sa première séance | (50, voir plus haut) |
| Semaine pleine | Atteindre l'objectif hebdomadaire une fois | 0 |
| Quatre semaines | 4 semaines d'objectif de suite | 100 |
| Huit semaines | 8 semaines de suite | 200 |
| Séance minimale | Faire une séance de 10 minutes un jour difficile | 20 |
| Retour | Reprendre après 14 jours d'absence ou plus | 20 |
| Carnet ouvert | 10 carnets libres | 50 |

### Exploration
| Badge | Condition | XP |
| --- | --- | --- |
| Touche-à-tout | Essayer au moins un exercice de chaque famille (W, O, C, V, G, K, I) | 100 |
| Œil neuf | Faire O1, O3 et O4 | 50 |
| Mémoire | 20 dessins de mémoire | 50 |
| Lumière | Terminer V1 à V3 | 50 |

### Maîtrise
| Badge | Condition | XP |
| --- | --- | --- |
| Trait sûr | ★★★ en C1 (D1) | 50 |
| Boîtes | ★★★ en C3 (D2 ou D3) | 50 |
| Volume | ★★★ en C5 (D4) | 50 |
| Œil juste | ★★★ en C4 (D5) | 50 |
| Valeurs | ★★★ en C6 (D6) | 50 |
| Objets | ★★★ en C8 (D7) | 50 |
| Consolidé | Un re-test espacé réussi (★★★★) | 100 |

### Défis et volume
| Badge | Condition | XP |
| --- | --- | --- |
| Mi-parcours | Boss D4 terminé | 0 (XP du boss) |
| **Fondations** | Boss D8 terminé | 0 (XP du boss) |
| Avant/après | Faire M2 deux fois et nommer deux progrès | 50 |
| Mois de 31 | 20 consignes sur 31 | 0 (XP du défi) |
| Cent traits / Cinq cents / Mille | Compteur de traits fantômes | 50 / 100 / 200 |
| Cent ellipses | 100 ellipses | 50 |
| Cent boîtes / Deux cent cinquante | 100 / 250 boîtes | 50 / 100 |
| Cent gestes | 100 gestes | 50 |

> Les noms et les conditions sont des **propositions**. Un badge « surprise » occasionnel (ex. première séance un jour de pluie) peut ajouter de la
> variété, à condition de rester **récompense, jamais pression**.

## Ce que l'on débloque (sans rien acheter)

| Élément | Condition | Remarque |
| --- | --- | --- |
| Parcours suivants | Avoir terminé Fondations (prérequis, pas XP) | Voir `parcours.md` |
| **Titres de niveau** | Atteindre le niveau | Affichage facultatif |
| **Couleurs d'accent** de l'application | Niveaux 3, 6, 9… | S'appuie sur le design system (`globals.css`) |
| **Couvertures de carnet**, **tampons** | Badges | Purement esthétique |
| Mode « atelier » (séance de 60 min) | Aucune condition | Jamais verrouillé |

Rien d'essentiel au **dessin** (exercices, parcours, conseils, vidéos) n'est verrouillé par l'XP : l'XP n'est pas un péage.

## Retour et célébration

- **Fin de séance** : récapitulatif en 3 lignes (temps, XP, étoiles gagnées), la **photo** facultative, la **prochaine séance** en une ligne. Animation de **moins de 2 secondes**, silencieuse par défaut.
- **Passage de niveau** : écran bref, ton chaleureux, une phrase concrète (« Tu as passé 12 séances à construire des boîtes »).
- **Après un défi** : un point fort, un point à retravailler, un exercice proposé (voir `defis.md`).
- **Comparaison dans le temps** (M2) : l'écran **le plus motivant** d'un débutant est l'avant/après côte à côte. Il doit être soigné.
- Respecter `prefers-reduced-motion`, les contrastes et la navigation au clavier.

## Garde-fous (à ne pas faire)

1. Pas de **XP pour l'ouverture de l'application** ni pour des clics.
2. Pas de **classement public** ni de ligues ; pas de comparaison avec des inconnus.
3. Pas de perte d'XP, pas de **vies**, pas de blocage de contenu faute de points.
4. Pas de notifications culpabilisantes (« tu vas perdre… ») ; pas de notifications de nuit.
5. Pas de mécanique à **récompense aléatoire**.
6. Pas d'**obligation** de partager ses dessins ; un dessin partagé est toujours choisi, jamais automatique.
7. Pas de **moteur de tricherie** à surveiller : puisqu'aucune récompense n'a de valeur extérieure, il n'y a pas d'incitation.

## Esquisse technique (non engageante, à confirmer par un ADR et la checklist)

Ce n'est **pas** un schéma ; ce sont les **entités** à prévoir. Les règles de la base (RLS, tests) s'appliquent (`docs/database.md`).

| Entité | Rôle | Remarques |
| --- | --- | --- |
| `exercises`, `paths`, `path_steps` | Catalogue et parcours | Données publiques, lisibles par les invités ; cache partagé (profil `feed`) |
| `practice_sessions` | Une séance (durée, type, revue) | Lecture/écriture par son propriétaire seulement |
| `xp_events` | **Journal immuable** des gains d'XP | Écrit **uniquement par une fonction SQL** (jamais directement par le client) ; clé d'idempotence ; plafond de 150 XP/jour calculé en base |
| profil (niveau, XP, objectif, série) | Compteurs dérivés | Mis à jour par la même fonction SQL, en une écriture |
| `competence_mastery` | Étoiles par compétence, dates de re-test | Lecture/écriture du propriétaire |
| `challenges`, `challenge_attempts` | Défis, scores, étoiles | Résultat auto-évalué ; photo facultative |
| `badges`, `user_badges` | Définitions et attributions | Attribution par fonction SQL |
| `journal_entries` | Carnet (note, date, photo facultative) | Privé par défaut |
| Stockage des photos | Bucket **privé**, dossier par utilisateur | **Voir `integration-app.md` : quota de stockage** |

Règles à respecter : **fuseau horaire** de l'utilisateur pour les jours et les semaines (début de semaine : lundi, par défaut) ; calculs d'XP **côté base**
(une seule écriture par séance, pas N requêtes) ; aucun Realtime (quota) ; mises à jour optimistes côté client.
