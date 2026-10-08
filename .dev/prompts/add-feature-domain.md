# Recette : ajouter un domaine métier (exercises, tips, videos…)

Un domaine = un dossier `src/features/<domaine>/` + un label `area:` + une couche `src/lib/data/<domaine>.ts`.
Les labels sont posés automatiquement à partir de ces chemins : il faut déclarer le domaine partout où la liste existe (ci-dessous).

```
Lis CLAUDE.md, docs/conventions.md et docs/git-workflow.md, puis traite la case <A-xxx>.

Tâche : créer le domaine <nom> (<description>).

Règles :
- Crée src/features/<nom>/ (composants, actions, schémas de validation) et src/lib/data/<nom>.ts (seul endroit
  qui parle à Supabase pour ce domaine).
- Si le domaine est NOUVEAU (pas encore dans .github/labels.yml), ajoute son label dans la MÊME PR, partout :
    1. .github/labels.yml            (label "area: <nom>")
    2. .github/labeler.yml           (chemins : src/features/<nom>/**, src/app/**/<nom>/**, src/lib/data/<nom>*)
    3. .github/ISSUE_TEMPLATE/bug.yml, feature.yml et llm-task.yml  (liste "Area")
    4. .github/scripts/auto-label-issue.sh  (liste du `case`)
  Les listes doivent rester identiques (le workflow "Sync labels" crée le label à la fusion sur main).
- Données lisibles par tous (Guests) : lecture via src/lib/supabase/public.ts + 'use cache' (profil `feed`),
  invalidée par updateTag() dans chaque écriture (voir docs/performance.md).
- Table(s) : suis la recette create-migration.md (RLS + tests SQL).
- Tests unitaires de la couche data et des actions ; E2E si parcours critique.
- Mets à jour docs/architecture.md (routes), docs/database.md, la checklist.

Livrable : branche feat/<nom>, PR < 400 lignes (découpe en plusieurs PR si besoin), commits Conventional Commits en anglais.
```
