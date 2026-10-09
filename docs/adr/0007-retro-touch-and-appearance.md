# 0007 — Touche rétro et apparence personnalisable (mode, thèmes de couleurs)

- **Statut** : Accepted
- **Date** : 2026-10-09
- **Décideurs** : @iSweat-exe

## Contexte

L'identité « carnet de croquis » (ADR 0006) plaît, mais le propriétaire veut **un côté rétro, années 90, sans en abuser**, et que les
utilisateurs puissent **personnaliser le design** : clair, sombre, et plusieurs thèmes de couleurs. Contraintes : aucune dépendance,
pas de flash du mauvais thème au chargement, pages restées statiques (`cacheComponents`), petit public, un invité n'a pas de compte.

## Options envisagées

**Touche rétro**
1. Tout passer en pixel art (police, icônes, bordures crantées) — très marqué, fatigant, illisible pour les chiffres.
2. **Quelques détails bien choisis**, désactivables : police pixel pour les petits libellés, relief « bouton Windows 95 », barres de progression en blocs, petites fenêtres avec barre de titre.
3. Rien.

**Personnalisation**
1. Cookie lu côté serveur — rend toutes les pages dynamiques (perte du cache CDN, quota Vercel).
2. **`localStorage` + petit script dans le `<head>`** qui pose des attributs sur `<html>` avant le premier affichage ; tout le reste en CSS.
3. Bibliothèque de thèmes — une dépendance de plus.

## Décision

**Rétro (option 2).** Dosage volontairement léger :
- police **Pixelify Sans** (`font-pixel`) pour les **libellés** : titres de section, pastilles, barres de titre ; et pour de **très grands nombres** seulement (statistiques, niveau). Pas pour les petits chiffres : le « 5 » pixel se lit « S » (constaté) ;
- **relief de bouton** : un liseré clair en haut à gauche, sombre en bas à droite (`shadow-button`), sous l'ombre « autocollant » ;
- **barres de progression en blocs** (`.progress-blocks`, des trous peints par-dessus) ;
- **`WindowCard`** : barre de titre de petite fenêtre (trois carrés, un nom façon fichier, une case de fermeture), sur **trois cartes seulement** (séance du jour, avant/après, conseil). Décorative (`aria-hidden`), le titre réel est dans la carte.

Tout se coupe d'un interrupteur (**« Touche rétro »**, `data-style="classic"`) : la police redevient Fredoka, le relief, les trous et les barres de titre disparaissent. Un test garantit que chaque jeton rétro a son pendant « classique ».

**Apparence (option 2).** Trois choix, rangés dans `localStorage` (`drawtoday-appearance`) :
- **mode** : Auto (suit le téléphone), Clair, Sombre → `data-theme` sur `<html>` (déjà prévu par le CSS) ;
- **thème de couleurs** : Prune (défaut), Corail, Océan, Bonbon, Lagon, Graphite → `data-accent`. Un thème est une **palette complète**, pas seulement un accent : le **papier**, les **cartes**, l'**encre** (texte, contours, visage de Mine) et l'**accent**
  avec le texte dessus, pour le clair **et** le sombre, avec `light-dark()` : **un seul bloc par thème** au lieu de quatre. Le jaune des récompenses, la braise de la série, le ciel et les couleurs de signal (erreur, succès) sont communs.
  Chaque pastille de choix est un petit **papier** avec un point d'accent (`data-swatch` : elle porte la palette de **son** thème, quel que soit le thème actif) ;
- **touche rétro** → `data-style`.

Un script de quelques centaines d'octets (`APPEARANCE_INIT_SCRIPT`) dans le `<head>` applique le choix avant le premier affichage ; un test vérifie qu'il donne **exactement** le même résultat que le code TypeScript
(`parseAppearance` + `appearanceAttributes`) pour toute valeur stockée, y compris cassée. L'état est partagé par `useSyncExternalStore` (`use-appearance.ts`), synchronisé entre onglets
(événement `storage`), et la couleur de la barre du navigateur (`theme-color`) suit le papier choisi, y compris quand le téléphone passe du clair au sombre.

## Conséquences

- **Rien côté serveur** : les pages restent statiques ; le serveur rend le look par défaut et le script corrige avant le premier affichage (aucun flash). La CSP autorise déjà les scripts en ligne.
- **Le choix reste sur l'appareil.** Quand le profil existera (A-070), il pourra être enregistré avec le compte et rattaché à la première connexion, comme le reste de ce que fait un invité (ADR 0005).
- **Un thème = un bloc CSS + une ligne** dans `ACCENTS` / `ACCENT_LABELS`. `src/ci/design-tokens.test.ts` vérifie que la liste et le CSS concordent et que **chaque palette** (base + 6 thèmes, clair et sombre : 14) tient les contrastes : texte, texte secondaire, texte coloré sur le papier **et** sur les cartes, texte sur l'accent, visage de Mine sur son jaune.
- Navigateurs : `light-dark()` demande Chrome 123, Safari 17.5, Firefox 120 (2024). Plus ancien : le thème de couleurs retombe sur la prune, sans casser la page.
- Avec certains thèmes, deux couleurs peuvent se ressembler (l'accent Océan et le « ciel » des blocs de séance) : un détail, pas un défaut d'accessibilité (les blocs sont numérotés).
- Les signaux (`danger`, `success`, `warning`) restent lisibles sur **tous** les papiers : le test le prouve ; en changer une valeur oblige à re-vérifier les 14 palettes.
- Hors périmètre ici : thèmes à débloquer par niveau (`gamification.md` en parle) et couleurs libres.
