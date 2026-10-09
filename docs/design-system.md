# Design system : guide des composants

> Source des jetons : [`src/app/globals.css`](../src/app/globals.css) (ADR 0003). Composants : `src/components/ui/` (ADR 0004).
> Guide vivant : la page `/design-system` de l'application. Mobile d'abord : tout se pense au pouce, à une main.

## Les règles d'or

1. **On utilise les composants et les jetons** ; on n'écrit pas de couleur, d'arrondi ou de durée en dur.
2. **Tout ce qui se touche répond** (échelle au toucher, fond qui change) : `Button`, `.card-link`, `.pressable`.
3. **Une zone tactile fait au moins 44 px** (40 px pour un contrôle compact dans une ligne, jamais moins).
4. **Une seule célébration à la fois**, courte (moins de 2 s), silencieuse par défaut, jamais bloquante.
5. **Rien n'est indispensable à l'haptique ou au son** (absents sur iOS) : le visuel suffit toujours.
6. **Les animations s'arrêtent** pour les personnes qui le demandent (`prefers-reduced-motion`).

## Jetons

| Besoin | Jeton ou classe |
| --- | --- |
| Couleurs | `accent`, `accent-strong`, `accent-ink`, `danger`, `success`, `warning`, **`reward`** (XP, succès), `muted`, `faint`, `surface`, `line` |
| Arrondis | `rounded-control` (12 px), `rounded-card` (16 px), `rounded-sheet` (24 px), `rounded-full` |
| Zones tactiles | `min-h-control-sm` (40), `min-h-tap` (44), `min-h-control` (48) |
| Ombres | `shadow-card` (repos), `shadow-pop` (flottant), `shadow-glow` (action principale) |
| Mouvement | `ease-spring` (apparaît), `ease-soft` (se déplace) ; animations `animate-pop`, `animate-shake`, `animate-toast-in`, `animate-shine`, `animate-ring-fill`, `animate-bar-fill`, `animate-sheet-up`, `animate-fade-in` |
| Classes | `.btn` + `-primary/-secondary/-outline/-danger/-ghost/-sm`, `.card`, `.card-link`, `.pressable`, `.chip`, `.field`, `.alert`, `.skeleton`, `.spinner` |

## Composants (`src/components/ui/`)

| Composant | Rôle | À retenir |
| --- | --- | --- |
| `Button` | Toute action | Variantes, taille `sm`, `loading` (spinner + désactivé + `aria-busy`), haptique configurable |
| `Switch` | Réglage oui/non | Toute la ligne est la zone tactile ; contrôlé ou non ; description accessible |
| `SegmentedControl` | 2 à 4 choix exclusifs (durée, thème) | Surbrillance qui glisse ; flèches du clavier ; groupe `radiogroup` |
| `ProgressRing` | Objectif de la semaine, niveau | Pur CSS, fonctionne en Server Component ; `tone="reward"` pour l'XP |
| `ProgressBar` | XP du niveau | Se remplit à l'affichage ; reflet qui passe |
| `Skeleton` | Chargement | Reflet ; invisible pour les lecteurs d'écran |
| `EmptyState` | Liste vide | Un message chaleureux et **la prochaine action** |
| `icons` | Pictogrammes | 24 px, `currentColor`, décoratifs (`aria-hidden`) : nommer le parent |

Bibliothèque `src/lib/` : `cn()` (assemble des classes), `haptic()` (vibration légère, Android seulement).

## Ajouter un composant

1. Le créer dans `src/components/ui/` (Server Component si possible, `"use client"` sinon), avec les jetons.
2. Un **test unitaire** (rôles, états, clavier, cas limites) à côté.
3. L'**ajouter à la page `/design-system`** et un test end-to-end si le comportement dépend du navigateur (toucher, animation, taille).
4. Une ligne dans le tableau ci-dessus.
