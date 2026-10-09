# 0006 — Design « ludique » : l'identité « carnet de croquis »

- **Statut** : Accepted
- **Date** : 2026-10-09
- **Décideurs** : @iSweat-exe

## Contexte

Le propriétaire veut un design **ludique, fondé sur la ludification**, dans l'esprit des applications d'apprentissage les plus
engageantes, **sans copier la direction artistique de Duolingo** (vert vif, chouette, boutons à tranche 3D de la même couleur).
L'identité visuelle était un placeholder (accent indigo, question 9 de `.dev/decisions-a-valider.md`). Contraintes : aucune
dépendance ajoutée, offres gratuites, mobile d'abord, et la pédagogie de `docs/pedagogie/gamification.md` (zéro punition, le jeu
s'efface derrière le dessin, pas de classement, pas de récompense aléatoire).

## Options envisagées

1. **Reprendre les codes d'une application existante** (vert, mascotte animale, boutons 3D) — reconnaissable, mais c'est exactement ce qu'il ne faut pas faire.
2. **Un thème « jeu vidéo »** (néons, pixels) — décalé pour apprendre à dessiner, et fatigant à lire.
3. **Le carnet de croquis** : le support même de l'activité. Papier chaud quadrillé, traits d'encre épais, ombres décalées « autocollant », boîte de crayons de couleur, mascotte crayon.

## Décision

Option 3. L'identité tient en six règles, toutes dans `src/app/globals.css` (les jetons) et `src/components/ui/` :

1. **Le papier** : fond crème pointillé (`--background`), cartes blanches (`--card`) ; la nuit, un papier violet profond.
2. **L'encre** : tout élément « autocollant » a un **contour de 2 px** (`border-outline`) et une **ombre dure décalée** de 3 px sans flou
   (`shadow-sticker`). Ce qu'on touche **s'enfonce dans son ombre** (translation de 3 px) au lieu de rétrécir. De jour, l'encre est un
   violet nuit (`--outline` = `--ink`) ; la nuit, un noir encore plus profond (`--outline`) : plus qu'un trait, c'est un effet de relief (les cartes y sont plus claires que le fond pour qu'il se lise).
3. **La boîte de crayons** : prune (`accent`, l'action principale), soleil (`reward`, XP et étoiles), braise (`ember`, la série de semaines), ciel (`sky`, information),
   menthe foncée (`success`), rouge (`danger`). **Pas de vert vif comme couleur principale** (un test le vérifie).
4. **Les formes** : rayons généreux (16 / 24 / 32 px), pastilles rondes, éléments légèrement penchés (badges, logo) comme des stickers collés à la main.
5. **La voix** : Fredoka, une police arrondie, pour les titres, les boutons et les nombres (`font-display`) ; Geist reste pour la lecture.
6. **La mascotte « Mine »** : un crayon jaune qui se tient sur sa pointe. Quatre humeurs (content, ravi, complice, endormi) ; **jamais triste ni déçue**. Elle accueille, félicite
   et occupe les écrans vides ; elle n'est jamais le seul porteur d'une information.

Composants ajoutés (`src/components/ui/`) : `Mascot`, `MascotMessage`, `StatPill` (série, XP), `LevelBadge`, `GoalDots` (objectif de la semaine), `MasteryStars` (étoiles de maîtrise),
`AchievementBadge`, `Avatar` (déjà là) ; variante de bouton `reward`. Tous les composants existants sont restylés avec les mêmes jetons ; les noms de jetons ne changent pas
(`accent`, `reward`, `line`, `muted`…), plus `card`, `ink`, `outline`, `ember`, `sky`.

### Garde-fous (la ludification au service de l'apprentissage)

- **Zéro punition** : aucune humeur triste, aucun rouge « perdu », aucun compte à rebours, aucune alerte de perte. Un badge à obtenir est calme (pointillés), jamais caché ni culpabilisant.
- **Le jeu s'efface derrière le dessin** : animations de moins de 2 s, silencieuses, `prefers-reduced-motion` respecté (règle globale), haptique facultative.
- **Rien n'est aléatoire** : les récompenses viennent de la pratique (`docs/pedagogie/gamification.md`).
- **Lisibilité** : un test (`src/ci/design-tokens.test.ts`) vérifie 4,5:1 pour tous les textes (clair et sombre), 3:1 pour les contours, et que les deux blocs sombres de `globals.css` restent identiques.

## Conséquences

- Le look change partout d'un coup : toute capture d'écran, toute maquette Figma et les icônes de l'application (`public/icons`, **toujours provisoires**) sont à aligner sur cette identité.
- Les couleurs de la barre du navigateur (`theme-color`, `manifest.ts`) suivent le papier (`#fff6e5` / `#17122b`).
- Plus de CSS à maintenir qu'avec un thème neutre, mais zéro dépendance ; la police Fredoka est servie par `next/font` (auto-hébergée au build, aucune requête vers Google à l'exécution).
- Les cartes « autocollant » épaississent un peu les écrans : la densité d'information reste faible, ce qui convient à une application à usage court.
- Le choix reste réversible : changer d'identité, c'est changer `globals.css` (voir ADR 0003).
