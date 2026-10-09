# Feuille de route : ce que DrawToday deviendra

> **Vision, pas engagement.** Ce document liste **tout ce qui est envisagé** pour DrawToday, classé par domaine, avec ses
> dépendances et ses points d'attention. Seul le périmètre de la [checklist v1.0.0](../.dev/checklist-v1.0.0-application.md)
> est « à faire » ; le reste vit ici jusqu'à ce qu'on le décide. Une idée qui n'y est pas se note ici d'abord (et au `Backlog`
> de la checklist), **jamais dans le code** (règle « une tâche = une case »).
> Tenu à jour dans la même PR que tout changement de périmètre. Rédigé le 2026-10-09.

## Hypothèse d'échelle

**Petit public** : quelques dizaines à quelques centaines d'inscrits, une poignée en ligne en même temps (voir `.dev/constraints.md`).
Conséquences pour la feuille de route : les offres gratuites suffisent largement ; on privilégie la **simplicité** ; les fonctions sociales
à grande échelle (classements, défis collectifs) n'ont pas de sens ; en revanche un **suivi personnalisé** devient possible. Si le public grandit, revoir les
points marqués ⚖.

## Légende

| Symbole | Sens |
| --- | --- |
| ● | **v1.0.0** : indispensable pour la première version publique |
| ◐ | **v1.x** : souhaitable, juste après |
| ○ | **Plus tard / idée** : à décider |
| ✅ | Déjà fait (le socle) |
| ⚖ | À revoir si le public grandit |
| [P] [S] [N] | Confiance de l'information : vérifiée / source secondaire / non vérifiée (voir `docs/pedagogie/sources.md`) |

## Les phases

| Phase | Objectif | Contenu | État |
| --- | --- | --- | --- |
| **0 · Socle** | Projet très bien équipé | CI/CD, tests, hooks, labels, docs, PWA minimale, design system | ✅ |
| **0b · Contenu** | Savoir quoi enseigner | Méthodes, 37 exercices, séance de 30 min, parcours, défis, XP (`docs/pedagogie/`) | ✅ (à valider) |
| **1 · Premier dessin** | Une séance jouable de bout en bout, **sans compte** | Identité visuelle, exercices en fiches, lecteur de séance + chronomètre, semaine de découverte, look « app mobile », données sur l'appareil | 🔜 |
| **2 · v1.0.0** | Une vraie application | Compte et synchronisation, parcours Fondations, XP, objectif hebdomadaire, succès, défis, carnet, conseils, PWA complète (hors-ligne), notifications | |
| **3 · v1.x** | Élargir | Vidéos, parcours suivants, retours personnalisés, plusieurs langues, back-office de contenu, partage | |
| **4 · Plus tard** | Idées | Canevas intégré, retour par IA, stores, offre payante, communauté | |

**Ordre recommandé** (chaque étape débloque la suivante) :

1. **Valider** la semaine de découverte **sur papier** avec 5 débutants (A-039) et trancher les questions bloquantes de `.dev/decisions-a-valider.md` (identité visuelle, papier vs canevas, providers de connexion).
2. **Identité visuelle** (couleur, logo, icônes définitifs) : le look « app mobile » en dépend.
3. **Contenu en fiches** (fichiers du dépôt) + **lecteur de séance** + chronomètre, fonctionnant **sans compte** (données sur l'appareil).
4. **Compte** + synchronisation + RLS (les données locales sont rattachées au compte à la première connexion).
5. **XP, objectif hebdomadaire, succès, défis, carnet** (calculs en base).
6. **PWA complète** : hors-ligne, installation guidée, notifications.
7. Ensuite seulement : vidéos, parcours suivants, retours personnalisés.

> **Pourquoi « local d'abord »** : un petit public et un premier plaisir immédiat plaident pour essayer **avant** de créer un compte ; cela retire aussi la plus grosse dépendance
> (e-mails d'authentification limités, connexion OAuth) de la première version. À vérifier : la durée de conservation des données d'une PWA sur iOS [N].

## Vue d'ensemble par domaine

| # | Domaine | Prio | Phase | Dépend de | Cases checklist | Docs |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | **Exercices** (fiches, catalogue) | ● | 1 | Identité visuelle | A-040, A-041 | `pedagogie/exercices.md` |
| 2 | **Séance guidée** et chronomètre | ● | 1 | 1 | A-045, A-046, A-085 | `pedagogie/routine-quotidienne.md` |
| 3 | **Parcours** (découverte, Fondations) | ● | 1–2 | 1, 2 | A-047 | `pedagogie/parcours.md` |
| 4 | **Défis** | ● | 2 | 1, 3 | A-042, A-075 | `pedagogie/defis.md` |
| 5 | **Système d'XP et niveaux** | ● | 2 | Compte, 2 | A-071 | `pedagogie/gamification.md` |
| 6 | **Objectif hebdomadaire et séries** | ● | 2 | 5 | A-072 | idem |
| 7 | **Succès** (badges, achievements) | ● | 2 | 5, 8 | A-073 | idem |
| 8 | **Compétences et maîtrise** (étoiles) | ● | 2 | 3, 4 | A-048 | `pedagogie/competences.md` |
| 9 | **Carnet** et avant/après | ● | 2 | Compte, photos | A-044, A-074 | `pedagogie/integration-app.md` |
| 10 | **Conseils** (cartes, mini-quiz) | ◐→● | 2 | 1 | A-050 à A-053 | `pedagogie/integration-app.md` |
| 11 | **Vidéos** | ◐ | 3 | ADR d'hébergement | A-060 à A-062 | `.dev/constraints.md` (R2) |
| 12 | **Authentification et comptes** | ● | 2 | Décision des providers | A-010 à A-022 | `docs/security.md` |
| 13 | **Profil et réglages** | ● | 2 | 12 | A-070 | — |
| 14 | **Look « app mobile »** | ● | 1 | Identité visuelle | A-080 (partiel) | `docs/adr/0003-design-system-tokens.md` |
| 15 | **Vraie PWA** (installation, hors-ligne, mises à jour) | ● | 2 | 1, 2 | A-080 à A-084 | `docs/architecture.md` |
| 16 | **Notifications push iOS et Android** | ● / ◐ | 2 | 12, 15 | A-083 | ci-dessous |
| 17 | **Accessibilité** | ● | continu | — | A-100 | `docs/conventions.md` |
| 18 | **Plusieurs langues** (i18n) | ○ | 3 | Décision (O-019) | O-019 | — |
| 19 | **Back-office de contenu** | ◐ | 3 | 12, rôles | A-030 à A-033 | `docs/permissions.md` |
| 20 | **Suivi, mesures, erreurs** | ◐ | 2–3 | — | A-093, O-072, O-075 | `docs/runbook.md` |
| 21 | **Vie privée, RGPD, mineurs** | ● | 2 | 12 | A-101 | `docs/security.md` |
| 22 | **Retours personnalisés** | ◐ | 3 | 9, 19 | — | ci-dessous |
| 23 | **Partage et communauté** ⚖ | ○ | 4 | 12, 9 | — | ci-dessous |
| 24 | **Retour automatique par IA** | ○ | 4 | 9 | — | ci-dessous |
| 25 | **Canevas de dessin intégré** | ○ | 4 | 14 | — | `pedagogie/integration-app.md` |
| 26 | **Parcours suivants** (nature, perspective, figure, couleur) | ◐ | 3 | Fondations | — | `pedagogie/parcours.md` |
| 27 | **Site vitrine et référencement** | ◐ | 3 | 14 | — | ci-dessous |
| 28 | **Distribution en boutique** (App Store, Play Store) | ○ | 4 | 15 | — | ci-dessous |
| 29 | **Offre payante** | ○ | 4 | R1 | — | ci-dessous |
| 30 | **Exports et sauvegarde pour l'élève** | ○ | 3 | 9 | A-101 | ci-dessous |

---

## Le détail, domaine par domaine

### 1. Exercices (●)
- **Quoi** : le catalogue des 37 exercices (échauffements, observation, construction, lumière, geste, composition, imagination), en **fiches** : but, matériel, étapes courtes,
  critères d'auto-contrôle, erreurs fréquentes, version plus difficile. Schémas SVG originaux.
- **À venir ensuite** : exercices de nouveaux parcours (nature, perspective, figure, couleur), **deux niveaux** par exercice (débutant / exigeant), variantes de contrainte.
- **Attention** : droits des images de référence (`pedagogie/methodes.md`) ; relire les consignes avec de vrais débutants (A-039).

### 2. Séance guidée et chronomètre (●)
- **Quoi** : la séance de 30 minutes en 4 blocs, durée au choix (10 / 15 / 30 / 45 / 60 min), revue en fin, XP, prochaine séance.
- **Techniquement** : chronomètre calculé depuis l'**heure de début** (pas un compteur qui s'arrête en arrière-plan) ; fiche d'exercice à l'écran ; images zoomables.
- **Contraintes d'appareil** : écran maintenu allumé (Wake Lock) — **ne fonctionnait pas dans une PWA installée sur iOS** avant un correctif attribué à iOS 18.4, source contradictoire, **à tester** [S] ;
  vibration **absente sur iOS** (jamais implémentée) [P] : prévoir un **signal sonore** et visuel de fin de bloc.

### 3. Parcours (●)
- **Quoi** : « Semaine de découverte » (7 × 15 min) puis « Fondations » (8 semaines, 40 séances) ; file de séances, pas calendrier ; sauts de semaine par défi réussi.
- **Ensuite** : parcours suivants (domaine 26), choix de parcours selon l'objectif, parcours **sur mesure** (l'élève choisit ses compétences) ○.

### 4. Défis (●)
- **Quoi** : défis de la semaine D1–D8 avec grille d'auto-évaluation, boss, mois de 31 consignes, compteurs « Les 100 », modificateurs de contrainte, défi du jour.
- **Ensuite** : défis **thématiques saisonniers** ◐ (ex. un mois d'octobre dédié à l'encre, avec **nos** consignes) ; défis **entre amis** ○ ; défis **collectifs** ⚖ (peu de sens avec un petit public).

### 5. Système d'XP et niveaux (●)
- **Quoi** : 3 XP par minute + 10 de revue, plafond de 150 XP par jour, niveaux 50 × (n − 1) × (n + 4), titres. Calcul **en base** (journal immuable, idempotent).
- **Ensuite** : réglage fin avec de vrais utilisateurs (les chiffres sont des choix de conception, jamais testés) ; **saisons** ○ (remise à zéro d'un compteur affiché, pas du niveau) ; boosts d'XP **pour contraintes** ◐.

### 6. Objectif hebdomadaire et séries (●)
- **Quoi** : objectif de 3 à 6 séances par semaine, **série de semaines**, semaine de grâce, mode pause ; pas de série quotidienne.
- **Ensuite** : **rapport hebdomadaire** (« voici ta semaine ») ◐ par notification ou en page d'accueil ; **objectifs personnels** (« finir Fondations avant l'hiver ») ○.

### 7. Succès / achievements (●)
- **Quoi** : une trentaine de badges (régularité, exploration, maîtrise, défis, volume), jamais de récompense aléatoire, aucun contenu essentiel verrouillé.
- **Ensuite** : badges **secrets** ○ ; **collections** (ex. tous les exercices d'une famille essayés) ◐ ; **tampons** de carnet ◐ ; page « Salle des succès » avec progression de chaque badge ◐.
- **Attention** : un succès est un **retour positif**, pas une pression ; pas de succès pour des actions qui poussent à la sur-pratique (douleur à la main).

### 8. Compétences et maîtrise (●)
- **Quoi** : 11 compétences, 5 étoiles de maîtrise validées par les défis et des **re-tests espacés** (7 puis 28 jours).
- **Ensuite** : **recommandations** (« ta compétence la plus fragile est… ») ◐ ; **diagnostic** de départ plus fin ○.

### 9. Carnet et avant/après (●)
- **Quoi** : journal des séances (note, photo facultative), test avant/après M2 (semaines 1, 4, 8), comparaison côte à côte.
- **Quota** : ~300 Mo pour 100 élèves à ~20 photos chacun [estimation] ; plafonner et laisser supprimer (`pedagogie/integration-app.md`).
- **Ensuite** : **export** du carnet en PDF ou archive ○ ; **frise de progrès** ◐ ; recherche par exercice ◐.

### 10. Conseils (◐ → ●)
- **Quoi** : cartes courtes (un concept, un exemple, 2 questions avec explication), rappel espacé, favoris, recherche.
- **Ensuite** : conseils **liés** à un exercice raté (« tu as noté que tes boîtes divergent : relis… ») ◐.

### 11. Vidéos (◐)
- **Quoi** : vidéos de 4 à 8 minutes, un concept chacune, quiz après.
- **Risque** : l'hébergement épuise les quotas (**R2**) : embarquer un hébergeur externe (ajouter son origine à la CSP dans la même PR) ou héberger ailleurs ; jamais depuis Vercel ni Supabase sans ADR chiffré.
- **Ensuite** : sous-titres et transcriptions ◐ ; **boucles courtes** (animations de quelques secondes) ◐ comme alternative légère.

### 12. Authentification et comptes (●)
- **Quoi** : connexion sécurisée (cookies httpOnly), mode invité, rattachement des données locales au compte, suppression de compte.
- **Options à trancher** (question 4) :

| Option | Pour | Contre |
| --- | --- | --- |
| **E-mail + lien magique ou code** | Aucun mot de passe, simple pour les débutants | Dépend du SMTP (limites des e-mails par défaut, A-012) |
| **Google** | Un toucher, très répandu | Écran de consentement à configurer, dépendance à Google |
| **Discord** | Déjà fait dans BlocusApp | Public d'un jeu vidéo, peu naturel pour des débutants en dessin |
| **Apple** | Cohérent avec l'écosystème iPhone | Compte développeur Apple payant [N] ; règles propres à l'App Store si publication en boutique [N] |
| **E-mail + mot de passe** | Familier | Gestion des mots de passe, réinitialisation, fuites ; plus de support |
| **Passkeys** | Sans mot de passe, sécurisé | Support Supabase à **vérifier** [N] |

- **Proposition** (à valider) : **invité d'abord**, puis **Google** et **e-mail (lien magique)**. À petite échelle, éviter de multiplier les providers (chaque provider est un réglage à entretenir).
- **Attention** : mineurs (consentement), CAPTCHA (A-013), limite de débit (A-019), connexion dans une **PWA installée** sur iOS (limite observée sur BlocusApp : le stockage de la PWA est séparé de Safari, donc une connexion terminée dans Safari n'arrive pas dans la PWA ; voir `docs/architecture.md` de BlocusApp, **à vérifier** pour DrawToday [N]).

### 13. Profil et réglages (●)
- **Quoi** : pseudo, avatar, niveau, titres, badges, statistiques ; durée par séance, objectif, notifications, mode pause, **thème clair/sombre/système**, couleur d'accent, données et suppression.
- **Ensuite** : choix de la **langue** (domaine 18) ; **objectifs personnels** ○.

### 14. Look « app mobile » (●)
- **Déjà là** ✅ : affichage plein écran (standalone), zones de sécurité iPhone, grandes zones tactiles (44 / 48 px), champs à 16 px (pas de zoom iOS), tokens de couleur, mode sombre, feuilles modales, respect de `prefers-reduced-motion`, zoom jamais bloqué.
- **À faire** :
  - **Identité visuelle** définitive (couleur d'accent, logo, icônes, typographie) — placeholder aujourd'hui.
  - **Barre d'onglets** en bas (Aujourd'hui, Parcours, Carnet, Profil), avec états actifs et zone de sécurité.
  - **Écrans de chargement** en squelettes, retours tactiles (états `active`), transitions courtes entre écrans, **bottom sheets** pour les actions.
  - **Écran de démarrage** (splash) et icône iOS soignés ; couleur de la barre d'état ; orientation portrait.
  - **Sons** (signal de fin de bloc) et **retour haptique** là où c'est possible : la vibration web n'existe pas sur iOS [P], donc ne jamais en dépendre.
  - **Gestes** (balayage pour passer un bloc) ◐, **tirer pour actualiser** ○.
  - **Illustrations et mascotte** ○ (ton chaleureux, jamais infantilisant).
- **Attention** : rester dans le **design system** (`src/app/globals.css`) ; aucune valeur en dur.

### 15. Vraie PWA (●)
- **Déjà là** ✅ : manifeste valide, icônes 192/512 (maskable), service worker minimal qui prend le contrôle, enregistrement en production, en-têtes de cache corrects, tests e2e.
- **À faire** :
  - **Hors-ligne** : mettre en cache la coque de l'application, la séance du jour, les fiches et schémas déjà vus ; page « hors-ligne » claire ; file d'attente des écritures envoyées au retour du réseau (A-081).
  - **Mises à jour** : message « Nouvelle version disponible » plutôt que mise à jour silencieuse.
  - **Installation guidée** : sur **Android/Chrome**, l'événement `beforeinstallprompt` permet un bouton « Installer » ; sur **iOS**, **aucun prompt** n'existe : il faut expliquer « Partager → Sur l'écran d'accueil » [P] ; on ne peut pas détecter l'installation, donc masquer l'invite quand l'appli tourne déjà en plein écran (media query `display-mode: standalone`, et `navigator.standalone` sur iOS [N]).
  - **Badge d'icône** (nombre de séances en attente) : API disponible sur **iOS 16.4+** et ordinateur, **pas sur Android** (où le badge suit les notifications) [P] ; facultatif.
  - **Raccourcis** du manifeste (« Commencer la séance ») ◐ ; **Lighthouse PWA ≥ 90** (A-084) ; **test sur de vrais téléphones** (iOS Safari/PWA, Android Chrome/PWA) à chaque version.
- **Conditions d'installation** : manifeste valide, HTTPS, icônes, service worker ; d'autres critères varient selon les navigateurs [S].

### 16. Notifications push iOS et Android (● / ◐)
- **Quoi** : un **rappel quotidien** à l'heure choisie, ton neutre (« Ta séance de 30 minutes t'attend »), 1 par jour maximum, jamais culpabilisant ; **rapport de la semaine** ◐ ; notification « défi du mois » ◐.
- **Ce qu'il faut savoir (recherche)** :
  - **Android / Chrome** : l'API Push est supportée ; demander la permission **dans un contexte pertinent** (pas au chargement) ; un refus est durable (Chrome bloque ensuite l'invite) [S].
  - **iOS / iPadOS** : Web Push **à partir de la 16.4**, **uniquement pour une application ajoutée à l'écran d'accueil**, avec un manifeste, en HTTPS, et la demande de permission doit être déclenchée par un **geste de l'utilisateur** (bouton) ; après un refus, il faudrait **réinstaller** l'appli pour redemander [S] ; des développeurs signalent des notifications qui s'arrêtent sans raison [S]. → **Notifications facultatives**, jamais le seul canal.
  - **Planification** : le cron de **Vercel Hobby ne s'exécute qu'une fois par jour**, avec une précision d'environ une heure (±59 min) [S, doc Vercel via recherche] → impossible d'envoyer à l'heure exacte choisie par chaque élève. Pistes : **`pg_cron` + `pg_net` de Supabase** (appel d'une fonction à intervalles courts ; **disponibilité sur l'offre gratuite à vérifier**), un planificateur externe, ou des **créneaux fixes** (matin / midi / soir). À trancher dans un ADR.
  - **Stockage** : une table d'abonnements (adresse du service de push, clés publiques de l'abonnement, utilisateur) protégée par RLS (chacun gère les siens ; seul le serveur lit tout pour envoyer) ; **supprimer** l'abonnement quand l'envoi répond 404 ou 410 [S] ; clés **VAPID** : la clé privée reste côté serveur (variable d'environnement non publique), jamais `NEXT_PUBLIC_` [S].
  - **Aucune dépendance de CSP** pour l'envoi (côté serveur) ; la bibliothèque d'envoi serait une **nouvelle dépendance** (à valider).
- **Règles** : demander après la **première séance réussie** (pas à l'ouverture), expliquer la valeur, permettre de **régler l'heure** et de **désactiver** facilement ; 1 notification par jour au plus ; jamais de nuit.

### 17. Accessibilité (●)
- Zoom de la page bloqué (décision assumée) **compensé** par une visionneuse zoomable pour tout contenu à agrandir, contrastes, navigation au clavier, lecteur d'écran, `prefers-reduced-motion`, tailles de texte, **daltonisme** (ne pas coder l'information par la couleur seule), sous-titres des vidéos, schémas avec texte alternatif. Audit Lighthouse et test manuel (A-100).

### 18. Plusieurs langues (○)
- Le français d'abord (O-019 en attente) ; si un jour l'anglais ou d'autres : tout le texte passe par des fichiers de traduction, **exercices compris** (contenu à traduire, pas seulement l'interface). Avec un petit public, ne le faire que si une demande réelle existe.

### 19. Back-office de contenu (◐)
- Modifier exercices, conseils, parcours et défis **sans redéployer** ; aperçu ; brouillon/publié ; historique. **Rôles minimaux** (apprenant / éditeur / admin) plutôt que le RBAC complet de BlocusApp (A-030).
- À petite échelle, des **fichiers du dépôt** relus en PR peuvent suffire longtemps : décider (question 14) avant de construire un back-office.

### 20. Suivi, mesures, erreurs (◐)
- Moniteur externe sur `/api/health` (O-075), journaux Vercel/Supabase, error boundaries ✅ ; **analytics** facultatives et échantillonnées (A-093) ; erreurs (O-072, Sentry à décider).
- **Retours des élèves** : un bouton « Dire ce qui ne va pas » (formulaire court, sans donnée personnelle superflue) ◐ — utile avec peu d'utilisateurs, où chaque avis compte.

### 21. Vie privée, RGPD, mineurs (●)
- Photos privées par défaut ; EXIF retiré ; suppression avec le compte ; export des données ; politique de confidentialité ; **âge minimal et consentement parental** à déterminer avant l'ouverture (question 15).

### 22. Retours personnalisés (◐)
- Avec un petit public, l'équipe peut **commenter** les dessins d'un défi (« un point fort, un point à travailler ») : file de retours dans un back-office, notification à l'élève. C'est le **seul retour humain** qui manque à l'auto-évaluation.
- **Attention** : charge de travail réelle ; à limiter (un défi par semaine ? sur demande ?). Aucune étude trouvée sur l'efficacité du retour entre pairs en dessin débutant (`pedagogie/sources.md`).

### 23. Partage et communauté ⚖ (○)
- Partager une page du carnet (lien privé ou image) ; **cercle d'amis** (inviter 3 à 5 personnes, voir leurs défis, s'encourager) plutôt qu'une communauté publique ; pas de classement. Modération et signalement obligatoires dès qu'un contenu est visible par d'autres.

### 24. Retour automatique par IA (○)
- Commenter un dessin photographié (proportions, valeurs). **Prudence** : risque de retours faux ou décourageants, **coût** par appel, confidentialité des photos (envoyées à un tiers), qualité des critères en dessin débutant. À n'envisager qu'après un prototype et un consentement explicite.

### 25. Canevas de dessin intégré (○)
- Dessiner **dans** l'application (stylet, pression, annulation, calques). Produit à part (gestion du stylet, performances sur téléphone, stockage des tracés). Question 13 : papier d'abord.

### 26. Parcours suivants (◐)
- **Nature et vivant**, **Perspective approfondie**, **Figure : geste et mannequin**, **Couleur** ; idées d'après les parcours de Drawabox/Proko/Ctrl+Paint (à citer, jamais à copier). Chacun suit le même schéma : séance de 30 minutes, défis, boss, étoiles.

### 27. Site vitrine et référencement (◐)
- Une page d'accueil publique (valeur, aperçu de la séance, comment installer), **indexable** (`robots.ts` : aujourd'hui tout est bloqué avant le lancement), `sitemap.ts`, métadonnées et image de partage ; pages **statiques** (aucun coût de fonction).

### 28. Distribution en boutique (○)
- Une PWA s'installe sans boutique. Publier sur les boutiques demande un **conteneur** (ex. application Android qui encapsule la PWA, ou un outil d'emballage multiplateforme) : **nouvelle dépendance**, comptes développeur **payants** [N], règles des boutiques [N]. Ne l'envisager que si l'installation par navigateur freine l'adoption.

### 29. Offre payante (○)
- **Vercel Hobby = usage non commercial** (R1) : toute monétisation impose le plan Pro. Piste neutre : tout le dessin reste gratuit ; un éventuel payant ne porterait que sur des **extras** (retours personnalisés, parcours avancés). Décision produit à prendre avant toute ligne de code.

### 30. Exports et sauvegarde pour l'élève (○)
- Export du carnet (PDF, archive d'images), export des données personnelles (RGPD), **sauvegarde** de la progression sur l'appareil.

---

## Les dépendances en un coup d'œil

```
Identité visuelle ─► Look « app mobile » ─► Barre d'onglets, écrans
Exercices (fiches) ─► Séance guidée ─► Parcours ─► Défis ─► Compétences / étoiles
                                  │                    │
                                  └──────► XP, objectif hebdomadaire, succès
Compte (Auth) ─► Synchronisation ─► Carnet (photos) ─► Retours personnalisés, partage
PWA (hors-ligne) ─► Notifications push (nécessite l'appli installée sur iOS)
Décision d'hébergement vidéo ─► Vidéos
Décision rôles / contenu ─► Back-office
```

## Ce qu'on ne fera pas (décisions de principe)

- **Pas de classement public obligatoire**, pas de ligues, pas de comparaison avec des inconnus.
- **Pas de récompense aléatoire** (loot box), pas de perte d'XP, pas de « vies ».
- **Pas de blocage de contenu** faute d'XP : l'XP n'est pas un péage.
- **Pas de copie** des contenus de tiers (Drawabox, Proko, Ctrl+Paint…) : on s'inspire et on cite.
- **Pas d'image qui ne s'agrandit pas** : le zoom de la page est bloqué, donc tout dessin ou image de référence passe par la visionneuse zoomable.
- **Pas de nouvelle dépendance** sans accord (règle `CLAUDE.md`).

## Comment faire évoluer cette liste

1. Une idée = une **ligne** dans la table de la section « Vue d'ensemble » (domaine, priorité, phase, dépendances) et, si besoin, un paragraphe de détail.
2. Une idée **décidée** pour la v1.0.0 devient une case de la checklist (même PR) ; sinon elle reste ici et au `Backlog`.
3. Une idée **rejetée** reste ici, barrée, avec la raison (pour ne pas la proposer deux fois).
4. À chaque décision structurante : un ADR (`docs/adr/`).
