# Décisions à valider — risques, idées, questions

Marque chaque idée **GARDER** ou **RETIRER** (les idées retirées sont supprimées des checklists) et réponds aux
questions ouvertes. Document propre à DrawToday : les risques et idées déjà tranchés pour BlocusApp ne sont pas repris.

## Points d'attention (pas des idées, des risques réels)
| # | Sujet | Pourquoi c'est important |
|---|---|---|
| R1 | Vercel Hobby = **non commercial** | Abonnement, publicité ou contenu payant → plan Pro obligatoire (CGU Vercel). |
| R2 | **Les vidéos épuisent les quotas** | Quelques Go d'egress Supabase par mois ≈ quelques centaines de lectures. Ne pas héberger de vidéo sur Supabase ni Vercel sans ADR chiffré (A-060). |
| R3 | Stockage Supabase limité (~1 Go) | Les dessins envoyés par les utilisateurs le rempliraient vite : compression, plafonds, purge (A-044). |
| R4 | Optimisation d'images Vercel à quota réduit | Une app riche en images doit mesurer avant de choisir (A-091). |
| R5 | Pas de backups fiables en free tier | Export régulier à planifier (O-073). |
| R6 | E-mails d'auth très limités par défaut | SMTP custom indispensable avant l'ouverture publique (A-012). |
| R7 | Projet Supabase mis en pause si inactif | **Traité** : cron quotidien `/api/keep-alive` (`vercel.json`), reste à définir `CRON_SECRET` (O-074). |
| R8 | **Zoom autorisé** (différence avec BlocusApp) | BlocusApp bloque le zoom (`user-scalable=no`, `touch-action`). DrawToday ne le fait pas : c'est un défaut d'accessibilité (WCAG 1.4.4) et l'apprenant doit pouvoir zoomer sur un dessin. Décision prise dans le socle ; test E2E à l'appui. |

## Idées ajoutées (🆕)
| ID | Idée | Décision |
|---|---|---|
| O-019 | i18n : aucun texte UI en dur | ☐ GARDER ☐ RETIRER |
| O-072 | Monitoring d'erreurs (Sentry free) | ☐ GARDER ☐ RETIRER |
| A-013 | CAPTCHA + leaked password protection | ☐ GARDER ☐ RETIRER |
| A-020 | Security Advisor Supabase à 0 warning | ☐ GARDER ☐ RETIRER |
| A-022 | Mode invité (lecture seule du contenu public) | ☐ GARDER ☐ RETIRER |
| A-042 | « Exercice du jour » | ☐ GARDER ☐ RETIRER |
| A-044 | Envoi de son dessin | ☐ GARDER ☐ RETIRER |
| A-051 | Recherche full-text dans les conseils | ☐ GARDER ☐ RETIRER |
| A-052 | Favoris | ☐ GARDER ☐ RETIRER |
| A-062 | Sous-titres / transcription des vidéos | ☐ GARDER ☐ RETIRER |
| A-071 | Série de jours consécutifs (streak) | ☐ GARDER ☐ RETIRER |
| A-083 | Notifications push (rappel quotidien) | ☐ GARDER ☐ RETIRER |
| A-093 | Analytics échantillonnée | ☐ GARDER ☐ RETIRER |
| A-101 | RGPD : export/suppression de compte | ☐ GARDER ☐ RETIRER |

## Questions ouvertes
1. Quel est le périmètre exact de la v1.0.0 (exercices, conseils, vidéos… et quoi d'autre : progression, communauté, parcours) ?
2. Cible de charge : on garde ~1000 utilisateurs / ~200 simultanés (valeur de BlocusApp) ?
3. L'app est-elle commerciale ou le deviendra-t-elle (impact sur Vercel Hobby, R1) ?
4. Connexion : quels providers (e-mail/mot de passe, Google, Discord…) ? Que voit un invité sans compte ?
5. Rôles : suffit-il d'« apprenant » et « admin », ou faut-il un RBAC complet ? Qui crée le contenu : l'app, Supabase Studio, des fichiers dans le dépôt ?
6. Où héberger les vidéos (YouTube/Vimeo en embed, CDN vidéo, autre) ? Vidéos créées par vous ou tierces ?
7. Langue : interface uniquement en français, ou plusieurs langues (O-019) ? Nom de domaine ?
8. Région des projets Supabase et Vercel (O-008) ?
9. Identité visuelle : couleur d'accent, logo, icônes (le socle utilise une couleur indigo et une icône crayon **provisoires**).
10. Hors-ligne : quels contenus doivent marcher sans réseau (A-081) ?
11. Analytics et monitoring d'erreurs : oui/non, outil (A-093, O-072) ?
