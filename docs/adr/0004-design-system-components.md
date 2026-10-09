# 0004 — Design system v2 : composants à retour tactile (« juice »)

- **Statut** : Accepted
- **Date** : 2026-10-09
- **Décideurs** : @iSweat-exe

## Contexte

Le socle ne fournissait que des jetons et des classes CSS (ADR 0003). Le propriétaire veut une application qui **ressemble à une
application mobile native**, **intuitive** et dont les composants sont **satisfaisants à utiliser** : on appuie, ça répond tout de
suite, ça bouge avec naturel. Contrainte du projet : **aucune dépendance** ajoutée sans accord (`CLAUDE.md`), petit public,
offres gratuites.

## Options envisagées

1. **Bibliothèque de composants** (shadcn/Radix, une librairie d'animation) — riche, mais plusieurs dépendances et du JavaScript client en plus.
2. **Composants maison** sur Tailwind 4 + CSS (ressorts, `scale` au toucher, animations CSS) + un peu de React — zéro dépendance.
3. Statu quo (classes CSS seulement) — pas de comportements partagés (états de chargement, haptique, accessibilité).

## Décision

Option 2. `src/components/ui/` contient les composants partagés ; `src/lib/` leurs briques pures (`haptics.ts`, `cn.ts`). Principes de « juice » :

- **Retour immédiat** : tout élément tactile réagit en moins de 100 ms (le bouton rétrécit à 97 % au toucher, les cartes à 98,5 %).
- **Ressorts pour ce qui apparaît** (`ease-spring`), **ease-out doux pour ce qui bouge** (`ease-soft`) ; durées de 150 à 400 ms.
- **Haptique** (`navigator.vibrate`) sur Android seulement : l'API **n'existe pas sur iOS**, où le retour est visuel. Jamais indispensable.
- **Animations en CSS pur** quand c'est possible (anneaux, barres, confettis) : elles fonctionnent aussi dans les Server Components et ne coûtent pas de JavaScript.
- **`prefers-reduced-motion` respecté** (règle globale qui ramène les durées à ~0) et haptique coupée.
- **Zones tactiles** de 40 px (compact), 44 px (minimum iOS) et 48 px (contrôle principal), vérifiées par un test end-to-end.
- **Accessibilité** : rôles ARIA corrects (`switch`, `radiogroup`, `progressbar`, `dialog`, `status`), navigation au clavier, noms accessibles.
- Un **guide de style vivant** (`/design-system`, non indexé) montre chaque composant en situation et sert de base aux tests end-to-end.

## Conséquences

- Plus de code à maintenir qu'avec une bibliothèque, mais **aucune dépendance** et un contrôle total du comportement.
- Toute nouvelle interface utilise ces composants avant d'en créer d'autres ; un nouveau composant a un test unitaire, une entrée dans le guide de style et une ligne dans `docs/design-system.md`.
- Le **zoom de la page est bloqué** (décision du propriétaire) : les images à agrandir passent par une visionneuse zoomable de la même famille de composants.
- Les couvertures de test (`vitest.config.ts`) incluent désormais `src/components/`.
