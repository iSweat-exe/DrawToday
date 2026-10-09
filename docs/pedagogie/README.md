# Pédagogie du dessin — base de connaissances de DrawToday

> **Statut : proposition fondée sur de la recherche, à valider** (voir `.dev/decisions-a-valider.md`).
> Ce dossier est la source de vérité pour **ce que l'application enseigne et comment** : méthodes existantes,
> compétences, exercices, séances quotidiennes, parcours, défis, système d'XP. Il ne contient aucun code ; la
> [checklist application](../../.dev/checklist-v1.0.0-application.md) en tire les cases à réaliser.
> Rédigé le 2026-10-08 à partir de recherches web (voir [`sources.md`](./sources.md) pour les limites : les sites
> de référence n'ont pu être lus qu'à travers des résumés de moteur de recherche, pas directement).

## Objectif produit

Donner à un débutant **de bons exercices à faire environ 30 minutes par jour**, dans un ordre qui a du sens, avec des
**défis**, des **parcours** à suivre et un système d'**XP** motivant et ludique, sans jamais faire passer le jeu
avant l'apprentissage. L'application est un **entraîneur** : elle guide, chronomètre, motive et garde la mémoire des
progrès ; l'essentiel du dessin se fait **sur papier**, devant l'écran (décision à confirmer, voir `integration-app.md`).

## Le contenu du dossier

| Fichier | Contenu | Pour qui |
| --- | --- | --- |
| [`methodes.md`](./methodes.md) | Ce que font Drawabox, Proko, Ctrl+Paint, Nicolaides, Edwards, Loomis… ce qu'on **emprunte**, ce qu'on **évite**, et ce qu'on **n'a pas le droit** de copier | Produit, contenu |
| [`competences.md`](./competences.md) | La carte des compétences du dessinateur débutant et leurs prérequis (l'arbre de progression) | Produit, contenu, données |
| [`exercices.md`](./exercices.md) | Le **catalogue de 37 exercices** (consigne, durée, critères de réussite, erreurs fréquentes) | Contenu, développement |
| [`routine-quotidienne.md`](./routine-quotidienne.md) | La **séance de 30 minutes**, ses variantes (10 / 15 / 45 / 60 min) et le rythme de la semaine | Produit, UX |
| [`parcours.md`](./parcours.md) | Le parcours **Fondations (8 semaines, 40 séances)** séance par séance, la semaine de découverte et les parcours suivants | Produit, contenu |
| [`defis.md`](./defis.md) | Défis quotidiens, hebdomadaires, boss et mensuels, grille d'auto-évaluation, **31 consignes originales** | Produit, contenu |
| [`gamification.md`](./gamification.md) | XP, niveaux, objectifs hebdomadaires, badges, récompenses, garde-fous, esquisse des données | Produit, UX, données |
| [`integration-app.md`](./integration-app.md) | Comment tout cela devient des écrans, des contenus et des cases de checklist ; contraintes PWA, droits d'images, confidentialité | Tous |
| [`../roadmap.md`](../roadmap.md) | La **feuille de route** : tout ce qui est prévu pour DrawToday, par domaine et par phase | Tous |
| [`sources.md`](./sources.md) | Les références, le **niveau de confiance** de chacune et ce qui reste à vérifier | Tous |

## Les 12 principes de conception

Chaque principe indique **sur quoi il repose** (détail et niveau de confiance dans [`sources.md`](./sources.md)).

1. **Dessiner s'apprend.** Les erreurs des adultes viennent surtout de la **perception** (on ne voit pas ce qu'on
   croit voir), pas de la main (Cohen & Bennett, 1997 ; un cours de dessin améliore les compétences visuelles :
   Chamberlain et al., 2021, avec réserve sur la causalité). → L'appli enseigne à **regarder** autant qu'à tracer.
2. **Observer avant de tracer.** Contour aveugle, copie à l'envers, espaces négatifs, mesure : des exercices qui
   contournent les « étiquettes » mentales (Nicolaides, Edwards). On garde les exercices, pas la théorie des
   « hémisphères » qui est discutée.
3. **Des séances courtes et régulières.** 30 minutes par jour battent 3 heures le dimanche ; une habitude met en
   moyenne ~2 mois à s'installer, avec une énorme variabilité (Lally et al., 2010 : médiane 66 jours, de 18 à 254).
   → Séance minimale de 10 minutes, jamais de culpabilisation.
4. **Pratique délibérée.** Un objectif précis, des critères de réussite vérifiables, un retour immédiat, une
   difficulté juste au-dessus du niveau (Ericsson). → Chaque exercice a un **but**, des **critères d'auto-contrôle**
   et une **revue de séance** de 2 minutes.
5. **Confiance du trait avant précision.** Viser, répéter le geste à vide (« ghosting »), tracer d'un seul geste
   depuis l'épaule, ne pas retoucher (Drawabox, via sources secondaires).
6. **Construire avant de détailler.** Boîtes, cylindres, sphères : on pense en volumes avant de penser en
   contours (Drawabox, Loomis, Proko).
7. **Alterner et espacer.** Mélanger les compétences dans la semaine et revenir sur les anciennes aide
   l'apprentissage à long terme, même si c'est moins confortable (Kornell & Bjork, 2008 ; effet d'espacement).
   → Le rythme de la semaine **n'est pas** un bloc de 5 séances identiques.
8. **Exemple, pratique guidée, pratique libre.** On montre d'abord, on guide ensuite, on lâche à la fin (principe
   des exemples résolus ; cadre de conception de cours). Chaque leçon suit ce schéma.
9. **Une moitié du temps pour le plaisir.** Drawabox impose la « règle des 50 % » : la moitié du temps de dessin est
   libre. → Carnet libre dans la semaine ; il compte aussi pour les objectifs.
10. **Le corps compte.** Dessiner depuis l'épaule donne des traits plus fluides, le poignet reste pour les
    détails ; poser la main plutôt que l'avant-bras ; faire des pauses (Drawabox ; repère général d'ergonomie).
11. **La gamification sert l'apprentissage, jamais l'inverse.** Autonomie, compétence, lien aux autres
    (Ryan & Deci) ; des récompenses mal conçues peuvent réduire la motivation intrinsèque (Deci, Koestner & Ryan,
    1999, résultat discuté) ; effets petits à moyens des méta-analyses (Sailer & Homner, 2020). → XP lié à la
    **pratique réelle**, séries **pardonnantes**, pas de classement obligatoire.
12. **Des références libres de droits et des contenus originaux.** On ne reproduit ni les textes ni les images de
    Drawabox, Proko et consorts ; on s'en inspire, on les cite, on **renvoie** vers eux. Images de référence :
    domaine public / CC0 (Met, Rijksmuseum, Wikimedia Commons) ou nos propres photos.

## Ce qui est volontairement hors périmètre (pour l'instant)

Figure humaine complète et anatomie, couleur et peinture, dessin numérique sur tablette, perspective à trois points,
retour par IA ou par la communauté. Ils sont décrits comme **parcours suivants** dans [`parcours.md`](./parcours.md)
et placés au Backlog de la checklist.
