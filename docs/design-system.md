# Design system : guide des composants

> Source des jetons : [`src/app/globals.css`](../src/app/globals.css) (ADR 0003). Composants : `src/components/ui/` (ADR 0004).
> Identité : **« carnet de croquis »**, ludique et ludifiée (ADR 0006), avec une **touche rétro** et une **apparence personnalisable** (ADR 0007).
> Guide vivant : la page `/design-system` de l'application. Mobile d'abord : tout se pense au pouce, à une main.

## L'identité en un coup d'œil (ADR 0006)

| Élément | Règle |
| --- | --- |
| **Papier** | Fond crème pointillé (`background`), cartes blanches (`card`) ; la nuit, papier violet profond |
| **Autocollant** | Contour de 2 px (`border-outline`) + ombre dure décalée de 3 px sans flou (`shadow-sticker`). Ce qu'on touche **s'enfonce dans son ombre** |
| **Boîte de crayons** | Prune `accent` (action principale), soleil `reward` (XP, étoiles), braise `ember` (série), ciel `sky` (info), menthe `success`, rouge `danger`. Jamais un vert vif en couleur principale |
| **Formes** | Rayons généreux (16 / 24 / 32 px), pastilles rondes, badges et logo légèrement penchés |
| **Voix** | Fredoka (`font-display`) pour titres, boutons et nombres ; Geist pour lire |
| **Mascotte** | Mine, un crayon : content, ravi, complice, endormi. **Jamais triste ni déçue** |

### La touche rétro (ADR 0007) : en petites doses, et désactivable

| Détail | Où | Classe / composant |
| --- | --- | --- |
| Police pixel (Pixelify Sans) | Petits **libellés** : titres de section, pastilles, barres de titre ; **très grands nombres** (statistiques, niveau). **Jamais** pour de petits chiffres (le 5 se lit S) ni pour des phrases | `font-pixel` |
| Relief de bouton façon Windows 95 | Tous les `.btn` | `shadow-button` (liseré clair en haut à gauche, sombre en bas à droite) |
| Barre de progression en blocs | `ProgressBar` | `.progress-blocks` |
| Petite fenêtre | **Trois cartes seulement** : séance du jour, avant/après, conseil. Ne pas en mettre partout | `WindowCard` + `.window-bar` |

Le profil a un interrupteur **« Touche rétro »** (`data-style="classic"`) : sans elle, tous ces détails disparaissent (Fredoka, pas de relief, barres lisses, pas de barre de titre).
Chaque jeton rétro (`--font-retro`, `--bevel-light`, `--bevel-dark`, `--segment-gap`) a son pendant classique, vérifié par `src/ci/design-tokens.test.ts`.

### Apparence choisie par l'élève (ADR 0007)

| Choix | Valeurs | Attribut de `<html>` |
| --- | --- | --- |
| Mode | Auto (suit le téléphone), Clair, Sombre | `data-theme` (absent = Auto) |
| Couleurs (palette complète) | Prune (défaut), Corail, Océan, Bonbon, Lagon, Graphite | `data-accent` (absent = Prune) |
| Touche rétro | oui (défaut) / non | `data-style="classic"` quand non |

Gardé sur l'appareil (`localStorage`), posé avant le premier affichage par un script du `<head>`. Un thème de couleurs est une **palette complète** : papier (`background`), cartes (`card`), encre (`foreground`, `ink`, `outline`),
accent et texte sur l'accent, en clair et en sombre. Le soleil (`reward`), la braise (`ember`), le ciel (`sky`) et les couleurs de signal sont communs à tous les thèmes.
**Ajouter un thème** : un bloc `[data-accent="…"]` dans `globals.css` (7 jetons, avec `light-dark()`), une ligne dans `ACCENTS` et `ACCENT_LABELS` (`src/lib/appearance.ts`) ; les contrastes de la palette sont testés en clair et en sombre.
**Écrire un composant** : n'utiliser que les jetons (`bg-background`, `bg-card`, `text-foreground`, `border-outline`, `bg-accent`…), jamais une couleur en dur, et il suit tous les thèmes.
Pour voir un composant dans un autre thème (tests, guide), ajouter `data-swatch` et `data-accent="…"` sur son conteneur.

### Ton et ludification : ce que le design ne fait jamais

Le jeu sert le dessin (`docs/pedagogie/gamification.md`) : **aucune punition** (pas de mascotte triste, de compte à rebours, de « tu as perdu »), **aucun classement**, **aucune récompense
aléatoire**, une seule célébration à la fois. Un badge à obtenir est visible mais calme (pointillés). L'XP et le niveau restent discrets ; les étoiles de maîtrise, elles, mesurent la qualité.

## Les règles d'or

1. **On utilise les composants et les jetons** ; on n'écrit pas de couleur, d'arrondi ou de durée en dur.
2. **Tout ce qui se touche répond** (le bouton et la carte s'enfoncent dans leur ombre, le reste rétrécit un peu) : `Button`, `.card-link`, `.pressable`.
3. **Une zone tactile fait au moins 44 px** (40 px pour un contrôle compact dans une ligne, jamais moins).
4. **Une seule célébration à la fois**, courte (moins de 2 s), silencieuse par défaut, jamais bloquante.
5. **Rien n'est indispensable à l'haptique ou au son** (absents sur iOS) : le visuel suffit toujours.
6. **Les animations s'arrêtent** pour les personnes qui le demandent (`prefers-reduced-motion`).

## Jetons

| Besoin | Jeton ou classe |
| --- | --- |
| Couleurs | `accent`, `accent-strong`, `accent-ink`, `danger`, `success`, `warning`, **`reward`** (XP, étoiles), **`ember`** (série), **`sky`** (info), `card`, `ink` (visage, texte sur le jaune), **`outline`** (contours et ombres), `muted`, `faint`, `surface`, `line` |
| Police | `font-display` (Fredoka) pour titres, boutons et nombres ; `font-pixel` (rétro) pour les petits libellés ; le reste en Geist |
| Arrondis | `rounded-control` (16 px), `rounded-card` (24 px), `rounded-sheet` (32 px), `rounded-full` |
| Zones tactiles | `min-h-control-sm` (40), `min-h-tap` (44), `min-h-control` (48) |
| Ombres | Dures, décalées, sans flou : `shadow-sticker` / `shadow-card` (repos, 3 px), `shadow-sticker-sm` (pastilles, 2 px), `shadow-pop` (flottant), `shadow-glow` (action principale, identique au repos) |
| Mouvement | `ease-spring` (apparaît), `ease-soft` (se déplace) ; animations `animate-pop`, `animate-shake`, `animate-wiggle`, `animate-bob` (mascotte), `animate-twinkle` (étincelles), `animate-toast-in`, `animate-shine`, `animate-ring-fill`, `animate-bar-fill`, `animate-sheet-up`, `animate-fade-in` |
| Classes | `.btn` + `-primary/-reward/-secondary/-outline/-danger/-ghost/-sm`, `.card`, `.card-link`, `.pressable`, `.chip`, `.field`, `.alert`, `.skeleton`, `.spinner` |

## Composants (`src/components/ui/`)

| Composant | Rôle | À retenir |
| --- | --- | --- |
| `Button` | Toute action | Autocollant qui s'enfonce dans son ombre ; variantes (`reward` = jaune, pour célébrer), taille `sm`, `loading` (spinner + désactivé + `aria-busy`), haptique configurable |
| `Switch` | Réglage oui/non | Toute la ligne est la zone tactile ; contrôlé ou non ; description accessible ; le rond jaune est **centré** (4 px de marge partout, allumé ou éteint : vérifié par un test e2e) |
| `SegmentedControl` | 2 à 4 choix exclusifs (durée, thème) | Surbrillance qui glisse ; flèches du clavier ; groupe `radiogroup` |
| `ProgressRing` | Objectif de la semaine, niveau | Pur CSS, fonctionne en Server Component ; `tone="reward"` pour l'XP |
| `ProgressBar` | XP du niveau | Se remplit à l'affichage ; reflet qui passe |
| `Skeleton` | Chargement | Reflet ; invisible pour les lecteurs d'écran |
| `EmptyState` | Liste vide | Un message chaleureux et **la prochaine action** ; `mascot` pour y mettre Mine |
| `Mascot` | Mine, le crayon | 4 humeurs (`happy`, `cheer`, `wink`, `sleepy`), flotte doucement, décorative par défaut (`label` si elle porte un sens) |
| `MascotMessage` | Accueil, conseil, félicitation | Mine et sa bulle ; la bulle est le texte, Mine est décorative |
| `StatPill` | Série de semaines, XP, séances | Pastille icône + nombre, annoncée comme une phrase (`3 semaines de suite`) ; teintes `ember`, `reward`, `accent`, `sky` |
| `LevelBadge` | Niveau de l'élève | Sceau festonné avec le numéro et le titre ; annoncé `Niveau 4, Premier trait` |
| `GoalDots` | Objectif de la semaine | Un rond par séance voulue, coché quand faite ; ne dépasse jamais l'objectif ; `progressbar` accessible |
| `MasteryStars` | Maîtrise d'une compétence (0 à 5) | Étoiles jaunes cernées qui apparaissent l'une après l'autre ; mesure la qualité, pas l'effort |
| `AchievementBadge` | Badge de succès | Autocollant penché quand obtenu ; pointillés calmes quand à obtenir (jamais caché ni culpabilisant) |
| `WindowCard` | Carte avec barre de titre de petite fenêtre | Rétro, **3 cartes seulement** ; barre décorative (`aria-hidden`), masquée sans la touche rétro |
| `NavBar`, `TabBar`, `Avatar` | Coque de l'app | Voir plus bas : mêmes jetons (surface `card`, trait d'encre) |
| `NavBar` | Barre haute de l'app | La marque (retour à l'accueil) à gauche, `actions` à droite (bouton de compte) ; collée en haut, même fond givré que la `TabBar`, encoche gérée |
| `TabBar` | Navigation principale (4 onglets) | Zone tactile 56 px, `aria-current`, encoche iPhone gérée ; onglet actif contrôlable ; `label` pour nommer une 2ᵉ barre sur la page |
| `Avatar` | Photo de profil | Photo ronde ou initiales sur l'accent (aussi quand l'image échoue) ; annoncé comme le nom de la personne ; `sm` / `md` / `lg` |
| `ToastProvider` / `useToast()` | Retour discret après une action | 3 au maximum, disparaît seul (3,5 s), `role="alert"` pour les erreurs, haptique |
| `BottomSheet` | Choix secondaire, confirmation | `<dialog>` natif : Échap, arrière-plan inerte, fond cliquable ; se ferme en tirant la poignée |
| `Confetti` | Petite célébration | Pur CSS, déterministe (angle d'or), retiré du DOM à la fin ; ignoré en mouvement réduit |
| `XpBurst` | Fin de séance | Étoile qui apparaît, XP qui montent, confettis ; annonce uniquement la valeur finale |
| `ImageViewer` | Agrandir un dessin ou une référence | Pincement, double toucher, glisser, molette, boutons ; l'image ne sort jamais de l'écran |
| `icons` | Pictogrammes | 24 px, `currentColor`, décoratifs (`aria-hidden`) : nommer le parent |

Bibliothèque `src/lib/` : `cn()` (assemble des classes), `haptic()` (vibration légère, Android seulement), `zoom` (calculs purs de la visionneuse), `sheet-gesture` (quand fermer la feuille), `confetti` (pièces déterministes), `use-count-up` (compteur animé).

## Ajouter un composant

1. Le créer dans `src/components/ui/` (Server Component si possible, `"use client"` sinon), avec les jetons.
2. Un **test unitaire** (rôles, états, clavier, cas limites) à côté.
3. L'**ajouter à la page `/design-system`** et un test end-to-end si le comportement dépend du navigateur (toucher, animation, taille).
4. Une ligne dans le tableau ci-dessus.
