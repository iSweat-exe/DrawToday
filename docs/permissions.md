# Permissions

> Document vivant. **Le modèle de rôles n'est pas encore décidé** (checklist application, A-030 ; question 5 de
> `.dev/decisions-a-valider.md`). Ce fichier fixe les principes ; il sera complété (tableau permission × rôle) dès que
> l'ADR est accepté.

## Principes (hérités de BlocusApp, valables quel que soit le modèle)

1. **La base décide.** Les permissions sont appliquées par la RLS et des fonctions SQL ; le serveur les revérifie
   (`requirePermission()` dans `src/server/`, à créer avec la première permission) ; l'UI ne fait que masquer.
2. **Deny by default.** Aucune politique = aucun accès. `anon` n'a que les droits de lecture explicitement accordés.
3. **Nomenclature** `ressource.action`, en minuscules (ex. `exercise.publish`). Jamais de permission codée en dur dans le front.
4. **Un changement de permission = une NOUVELLE migration** (jamais d'édition d'une migration existante), avec ses
   tests : pour chaque rôle, la permission est autorisée ou refusée comme prévu.
5. **Hiérarchie** (si plusieurs rôles d'administration) : on ne peut pas agir sur un rôle supérieur ou égal au sien.

## Pistes (à trancher dans l'ADR)

| Option | Quand | Coût |
| --- | --- | --- |
| Rôles minimaux (`learner`, `admin`) dans `profiles.role` | Contenu géré par une seule équipe | Faible |
| RBAC en tables (`roles`, `permissions`, `role_permissions`) + claims dans le JWT (Custom Access Token Hook) | Plusieurs profils d'éditeurs, permissions à régler sans redéploiement | Élevé : l'implémentation de BlocusApp (son `docs/permissions.md` et ses migrations RBAC) sert de référence |

Si le hook JWT est repris : l'activer dans `supabase/config.toml` (`[auth.hook.custom_access_token]`, désactivé dans le
socle) **et** à la main sur le projet hébergé (voir `docs/runbook.md`).
