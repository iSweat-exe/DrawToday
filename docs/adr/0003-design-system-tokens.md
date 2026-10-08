# 0003 — Design system centralisé (tokens Tailwind + classes partagées)

- **Statut** : Proposed
- **Date** : 2026-10-08
- **Décideurs** : @iSweat-exe

## Contexte

Application mobile-first (PWA iOS/Android). Sans source unique, les couleurs, arrondis et tailles de boutons se
répètent en classes Tailwind dans chaque composant, avec des incohérences d'une page à l'autre (constaté sur BlocusApp,
voir son ADR 0004). Il faut une seule source de vérité, sans dépendance supplémentaire.

## Options envisagées

1. Bibliothèque de composants (shadcn/Radix…) — riche, mais une dépendance de plus (à valider) et un poids JS client.
2. Tokens `@theme` Tailwind 4 + quelques classes `@layer components` — zéro dépendance, zéro JS.
3. Aucun cadre — incohérences durables.

## Décision

Option 2, reprise de BlocusApp. `src/app/globals.css` contient : couleurs (`accent`, `danger`, `success`, `surface`,
`line`, `muted`…, clair/sombre), arrondis (`rounded-control` 12 px, `rounded-card` 16 px, `rounded-sheet` 24 px),
espacements (`min-h-tap` 44 px, `min-h-control` 48 px, `min-h-control-sm` 40 px, `p-gutter`, `gap-section`), polices,
animations, et les classes `.card`, `.btn` (+ variantes), `.field`, `.alert`, `.chip`, `.page-title`, `.section-title`.
Les composants partagés vivront dans `src/components/`.

**Valeurs provisoires** : l'accent indigo et l'icône crayon sont des placeholders en attendant l'identité visuelle
(question 9 de `.dev/decisions-a-valider.md`). Changer la DA = modifier `globals.css` (et `public/icons`, `manifest.ts`).

## Conséquences

- Plus de couleur ou d'arrondi codé en dur dans les pages : utiliser les tokens ; ajouter un token plutôt qu'une valeur ad hoc.
- Les valeurs sombres sont écrites deux fois (préférence système et `data-theme="dark"`) : modifier les deux blocs.
- Pas de sélecteur de thème dans le socle : `data-theme` est prévu par le CSS, l'interface de réglage reste à faire.
- Doc : `docs/conventions.md` (section « Design system »).
