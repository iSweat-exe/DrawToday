# Architecture Decision Records (ADR)

Chaque décision structurante (stack, bibliothèque, modèle de données, compromis de sécurité) est
consignée ici dans **un fichier numéroté** : `NNNN-titre-en-kebab-case.md`, créé depuis
[`0000-template.md`](./0000-template.md).

Un ADR n'est jamais supprimé : s'il est remplacé, son statut passe à `Superseded by NNNN`.

| N°                                           | Titre                                       | Statut   |
| -------------------------------------------- | ------------------------------------------- | -------- |
| [0001](./0001-stack-choice.md)               | Choix de la stack                           | Accepted |
| [0002](./0002-tooling-from-blocusapp.md)     | Outillage, CI/CD et tests repris de BlocusApp | Accepted |
| [0003](./0003-design-system-tokens.md)       | Design system centralisé (tokens)           | Proposed |

À venir (décisions bloquantes, voir `.dev/decisions-a-valider.md`) : modèle de rôles et édition du contenu (A-030),
hébergement des vidéos (A-060), stratégie hors-ligne (A-081), monitoring des erreurs (O-072).
