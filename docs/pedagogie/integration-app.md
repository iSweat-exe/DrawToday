# Intégrer la pédagogie dans l'application

> Comment transformer ce dossier en **écrans, contenus et cases de checklist**, de façon intuitive. Proposition à valider ;
> aucune fonctionnalité n'est décidée tant qu'elle n'est pas une case cochée de la
> [checklist application](../../.dev/checklist-v1.0.0-application.md).

## Le principe : DrawToday est un entraîneur, le papier est la toile

Un débutant s'entraîne mieux **sur papier** (prise du crayon, geste de l'épaule, grand format) qu'avec un doigt sur un petit écran. L'application :

1. **choisit** la séance du jour (le parcours) ;
2. **montre** l'exemple (image de référence, schéma, éventuellement une courte vidéo) ;
3. **chronomètre** les 4 blocs ;
4. **recueille** la revue de séance et, si l'utilisateur le veut, une **photo** du résultat ;
5. **motive** (XP, étoiles, objectif de la semaine) ;
6. **garde la mémoire** des progrès (carnet, avant/après).

> **Décision à prendre** (question 13 de `.dev/decisions-a-valider.md`) : un canevas de dessin **dans** l'application est un autre produit (gestion du
> stylet, pression, annulation, calques, performances sur téléphone). Il n'est **pas** nécessaire pour la v1.0.0 et il est au Backlog.

## Les écrans (navigation par 4 onglets)

| Onglet | Écran | Contenu | Cases de checklist |
| --- | --- | --- | --- |
| **Aujourd'hui** | Accueil | Carte « Séance du jour » (durée, 4 blocs en aperçu), bouton **Commencer**, anneau de l'objectif de la semaine, défi du jour, XP et niveau **discrets** | A-042, A-045, A-046, A-072 |
| | **Lecteur de séance** | Le bloc en cours, étapes courtes, image zoomable, chrono, Pause / Passer / Terminer, revue en fin | A-045, A-046 |
| **Parcours** | Carte du parcours | Les semaines, séances faites / à venir, défis, bilans, **carte des compétences** (étoiles) | A-047, A-048, A-075 |
| | Bibliothèque | Exercices (fiches), conseils (cartes), vidéos plus tard | A-040, A-041, A-050 |
| **Carnet** | Journal | Grille des photos et notes, filtre par exercice, **avant/après** côte à côte, export | A-044, A-074 |
| **Profil** | Profil | Niveau, titre, badges, statistiques ; **réglages** : durée par séance, objectif hebdomadaire, notifications, pause, données | A-070, A-071, A-072, A-073 |

Les onglets sont les **seuls liens préchargés** (`docs/performance.md`) ; tout autre lien a `prefetch={false}`.

### Onboarding (moins de 2 minutes)

1. **Pourquoi dessiner ?** (loisir, progresser, métier) — pour personnaliser le ton, pas le contenu.
2. **Combien de temps par séance ?** 10 / 15 / **30** / 45 minutes ; **combien de séances par semaine ?** 3 à 6.
3. **Quel matériel as-tu ?** crayon, stylo fin, rien de spécial — l'app recommande sans exiger.
4. **Niveau** (voir `competences.md`) : je n'ai jamais dessiné / je gribouille / j'ai de l'expérience.
5. **Semaine de découverte** (15 min par jour, 7 jours) puis **Fondations**.
6. **Notifications** en **dernier** et **facultatives** (rappel quotidien à l'heure choisie).

> Aucun compte exigé pour essayer la première séance : la connexion arrive **après** le premier plaisir (mode invité, A-022). Les données du
> premier jour sont conservées sur l'appareil puis rattachées au compte.

### Le lecteur de séance (le cœur de l'application)

- **Un écran par étape** (segmentation), 1 à 2 phrases + **une image**. Pas de long texte, pas de redondance entre l'image et le texte (principes de conception multimédia).
- **Chronomètre fiable** : calculé à partir de **l'heure de début** (pas d'un compteur qui s'arrête quand l'application passe en arrière-plan) ; signal sonore ou vibration à
  la fin de chaque bloc (la vibration n'existe pas partout, **à vérifier** sur iOS).
- **Écran maintenu allumé** pendant la séance (API Wake Lock, **support à vérifier** sur iOS en PWA installée).
- **Zoom toujours possible** sur les images de référence (accessibilité ; le zoom n'est jamais désactivé).
- **Hors-ligne** : la séance du jour et ses images sont disponibles sans réseau (stratégie de cache à définir en A-081) ; les résultats sont envoyés plus tard.
- À la fin : revue M1 (3 champs courts), photo facultative, récapitulatif XP, **prochaine séance**.

## Les contenus

### La carte exercice

Directement issue de [`exercices.md`](./exercices.md) : but, matériel, étapes, critères d'auto-contrôle, erreurs fréquentes, version plus difficile. Une carte = **un fichier de contenu**
(texte + une image ou un schéma). **Où vit le contenu ?** À décider (question 5) : fichiers du dépôt (relus dans les PR, versionnés) ou base de données (modifiables sans déploiement).
Recommandation provisoire : **fichiers du dépôt au départ** (plus simple, gratuit, relus par un humain), base de données quand l'édition devient fréquente.

### La carte conseil (« tips »)

Format court et **testable** (cadre de conception de cours) :

| Élément | Règle |
| --- | --- |
| **Objectif** | Une phrase avec un verbe d'action : « À la fin, tu sais tracer une ellipse d'un seul geste » |
| **Idée** | **Un seul concept**, moins de 120 mots, une image ou un schéma |
| **Exemple** | Une illustration ou un exemple résolu (étapes numérotées) |
| **Mini-quiz** | 2 questions au plus, avec **explication immédiate** de la bonne réponse |
| **Lien** | Vers l'exercice qui la met en pratique |
| **Rappel espacé** | La carte peut revenir quelques jours plus tard sous forme d'**une** question |

Exemples de questions (avec le retour affiché) :

1. *Image : trois boîtes dont l'une a des arêtes qui s'écartent.* « Laquelle est mal construite ? » → Retour : « La 2ᵉ : ses arêtes qui s'éloignent s'écartent au lieu de se rapprocher. Dans une
   boîte en perspective, elles convergent. »
2. « Un cylindre est au niveau de tes yeux ; son ellipse est… » → *plate* / *ronde*. Retour : « Plate : plus on est proche du niveau des yeux, plus l'ellipse est aplatie. »
3. « Dans une sphère éclairée, l'ombre portée est… » → *sur la sphère* / *au sol, à l'opposé de la lampe*. Retour : « L'ombre portée est au sol ; sur la sphère, c'est l'ombre propre. »

### Les vidéos (plus tard)

- **Courtes** (4 à 8 minutes), **un seul concept**, ton conversationnel ; alterner visage et feuille ; quiz de 2 questions après.
- **Hébergement** : décision à prendre (A-060, risque R2). **Jamais** servies depuis Vercel ni Supabase sans ADR chiffré. Intégration externe : ajouter l'origine à la CSP
  (`frame-src`) dans la **même PR**.
- **v1.0.0 sans vidéo possible** : des **schémas** et des **boucles courtes** suffisent pour la plupart des exercices (voir ci-dessous).

### Schémas et boucles

Les schémas (SVG dessinés par nous) sont **très légers**, zoomables, accessibles et cacheables hors-ligne : c'est le format privilégié pour montrer une boîte, une ellipse, un entonnoir, les 5 zones de lumière.

## Droits des images de référence

| Besoin | Source recommandée | À vérifier |
| --- | --- | --- |
| Dessins au trait pour O3, O6 | Œuvres du **domaine public** (gravures, dessins anciens) : Met Open Access (CC0), Rijksmuseum (CC0), Wikimedia Commons | Licence **fichier par fichier** (`sources.md`) |
| Natures mortes, objets, formes | **Nos propres photos** et schémas | — |
| Poses humaines et animales (G1–G4) | Nos propres séances photo avec **autorisation écrite** des modèles ; œuvres du domaine public (figures) ; renvoi vers des outils externes (Line of Action, Quickposes) | Conditions d'usage des banques de photos libres (certaines interdisent de **reconstituer une base** concurrente) ; droit à l'image |
| Illustrations des exercices | **Originales** (schémas, croquis maison) | — |

**Interdit** : captures d'écran, textes ou images de Drawabox, Proko, Ctrl+Paint, etc. (voir `methodes.md`).

## Photos des utilisateurs : confidentialité et quota (décision à prendre)

Un dessin photographié appartient à l'élève ; il peut contenir un visage, un décor, des données de localisation (EXIF). Règles proposées :

- Photo **facultative**, **privée par défaut**, jamais utilisée pour entraîner un modèle ni montrée à d'autres sans choix explicite.
- **Réencodage côté client** avant envoi (image réduite, WebP) : cela retire aussi les métadonnées EXIF ; plafond de taille, vérifié côté serveur (voir `docs/security.md`).
- Suppression avec le compte et à la demande (A-101).
- `Permissions-Policy` : la caméra est coupée aujourd'hui (`camera=()`) ; un `<input type="file" capture>` n'a probablement pas besoin de cette permission (**à vérifier**) ; ne l'ouvrir que si l'on passe par `getUserMedia`.

**Le quota de stockage est le vrai problème.** Estimation (à mesurer) : une photo réencodée ≈ 100 à 150 Ko. Si chaque élève envoie ~20 photos (3 bilans M2 × 3 images + 8 défis + 2 boss) :
≈ 2 à 3 Mo par élève, soit **2 à 3 Go pour 1 000 élèves**, pour un quota gratuit d'environ **1 Go** (`.dev/constraints.md`). Options :

| Option | Avantages | Inconvénients |
| --- | --- | --- |
| **A. Photos sur l'appareil seulement** (IndexedDB) | Gratuit, privé, aucun quota | Perdues si l'appareil change ; pas de partage ; pas dans le RGPD « données hébergées » |
| **B. Sauvegarde cloud plafonnée** (ex. 6 à 8 photos par élève, sélection manuelle) | Reste dans ~1 Go à 1 000 élèves | Choix à faire par l'élève ; purge à prévoir |
| **C. Stockage externe** avec plus de gratuit (ex. un service objet à l'offre généreuse) | Plus de place | **Nouvelle dépendance** (à valider), CSP, coûts si dépassement |

**Recommandation provisoire** : **A par défaut**, **B pour les photos de bilan (M2) et de boss** (celles qui servent au avant/après), à trancher dans un ADR (A-044).

## Contraintes d'âge et de consentement

Une application de dessin attire des **mineurs**. À déterminer avant l'ouverture publique : âge minimal, consentement parental, politique de confidentialité. En France, l'âge du consentement
numérique est un sujet à vérifier précisément (non vérifié ici) ; prévoir l'information claire et un parcours **sans photo ni compte** utilisable.

## Mesures de succès (agrégées, sans donnée personnelle superflue)

| Mesure | Question à laquelle elle répond |
| --- | --- |
| % de nouveaux utilisateurs qui terminent la **séance 1** | L'entrée est-elle assez simple ? |
| % qui terminent la **semaine de découverte** | L'habitude démarre-t-elle ? |
| Séances par semaine et durée choisie | Les 30 minutes sont-elles réalistes ? |
| % de séances **minimales** | Ce filet de sécurité est-il utile ou un trop-plein ? |
| Blocs abandonnés (lequel ?) | Quel exercice est trop dur ou ennuyeux ? |
| Semaines consécutives avec objectif atteint | La série hebdomadaire retient-elle ? |
| Évolution des notes d'auto-évaluation entre M2 | Le progrès est-il ressenti ? |

> Toute analyse suit les règles de `docs/security.md` et du RGPD ; l'analytics est **à décider** (A-093 ; `.dev/constraints.md` : 50 000 événements par mois).

## Valider avec de vrais débutants avant de construire (recommandé)

Avant d'écrire du code : proposer à **5 débutants** la **semaine de découverte sur papier** (consignes imprimées, un minuteur de téléphone), 7 jours.
Mesurer : combien terminent chaque jour, où ils décrochent, ce qu'ils comprennent mal, leur dessin du jour 1 comparé au jour 7. C'est le test le moins cher de toute la
pédagogie. Résultat attendu : une liste d'ajustements des consignes (`exercices.md`) **avant** la première ligne de code.

## Ce que cela change dans la checklist

Les cases **A-039 à A-048**, **A-053**, **A-070 à A-075**, **A-085** et les décisions **R9, R10** et questions 12 à 16 ont été ajoutées ou précisées à partir de ce dossier (voir la checklist application et
`.dev/decisions-a-valider.md`).
