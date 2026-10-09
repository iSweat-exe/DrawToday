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
| R8 | **Zoom de la page bloqué** (décision du propriétaire, 2026-10-09) | Même choix que BlocusApp : sensation d'application native. Contrepartie assumée : le blocage du zoom gêne certains utilisateurs (critère d'accessibilité WCAG 1.4.4) ; il est donc **compensé** par une visionneuse zoomable pour les dessins et les images de référence (A-087), tailles de texte lisibles et mode sombre. À réévaluer si des retours d'utilisateurs le demandent. |
| R9 | **Stockage des photos des élèves** | ~100–150 Ko par photo (estimation) ; ~20 photos par élève ≈ 2–3 Mo par élève : **~300 Mo pour 100 élèves**, ~1 Go à ~350 élèves, pour un quota gratuit d'environ 1 Go. Avec un petit public, la sauvegarde cloud plafonnée est **réaliste** ; à surveiller si le public grandit (`docs/pedagogie/integration-app.md`, A-044). |
| R10 | **Droits des contenus de tiers** | Drawabox, Proko, Ctrl+Paint… sont protégés : on s'en inspire et on cite, on ne copie ni textes ni images. Images de référence : domaine public/CC0 ou les nôtres, licence vérifiée fichier par fichier (`docs/pedagogie/methodes.md`). |

## Idées ajoutées (🆕)
| ID | Idée | Décision |
|---|---|---|
| O-019 | i18n : aucun texte UI en dur | ☐ GARDER ☐ RETIRER |
| O-072 | Monitoring d'erreurs (Sentry free) | ☐ GARDER ☐ RETIRER |
| A-013 | CAPTCHA + leaked password protection | ☐ GARDER ☐ RETIRER |
| A-020 | Security Advisor Supabase à 0 warning | ☐ GARDER ☐ RETIRER |
| A-022 | Mode invité (lecture seule du contenu public) | ☐ GARDER ☐ RETIRER |
| A-042 | « Défi du jour » (carte tirée au hasard, 10 min) | ☐ GARDER ☐ RETIRER |
| A-044 | Envoi de son dessin | ☐ GARDER ☐ RETIRER |
| A-051 | Recherche full-text dans les conseils | ☐ GARDER ☐ RETIRER |
| A-052 | Favoris | ☐ GARDER ☐ RETIRER |
| A-062 | Sous-titres / transcription des vidéos | ☐ GARDER ☐ RETIRER |
| A-071 | Série de jours consécutifs (streak) | ☐ GARDER ☐ RETIRER |
| A-083 | Notifications push (rappel quotidien) | ☐ GARDER ☐ RETIRER |
| A-093 | Analytics échantillonnée | ☐ GARDER ☐ RETIRER |
| A-101 | RGPD : export/suppression de compte | ☐ GARDER ☐ RETIRER |
| A-045 | Séance guidée de 4 blocs avec chronomètre (30 min, variantes 10/15/45) | ☐ GARDER ☐ RETIRER |
| A-047 | Parcours « Semaine de découverte » puis « Fondations » (8 semaines) | ☐ GARDER ☐ RETIRER |
| A-048 | Étoiles de maîtrise avec re-tests espacés | ☐ GARDER ☐ RETIRER |
| A-071 | XP : 3 XP/min, plafond 150/jour, niveaux 50 × (n − 1) × (n + 4) | ☐ GARDER ☐ RETIRER |
| A-072 | Objectif hebdomadaire et série de **semaines** (pas de série quotidienne) | ☐ GARDER ☐ RETIRER |
| A-073 | Badges (~30) | ☐ GARDER ☐ RETIRER |
| A-074 | Carnet et comparaison avant/après | ☐ GARDER ☐ RETIRER |
| A-075 | Défis hebdomadaires, boss, mois de 31 consignes, compteurs « Les 100 » | ☐ GARDER ☐ RETIRER |

## Questions ouvertes
1. Quel est le périmètre exact de la v1.0.0 (exercices, conseils, vidéos… et quoi d'autre : progression, communauté, parcours) ?
2. ~~Cible de charge~~ **Réponse (2026-10-09) : petit public, pas 1 000 utilisateurs.** À préciser : ordre de grandeur visé (quelques dizaines ? quelques centaines ?) et ouverture publique ou sur invitation.
3. L'app est-elle commerciale ou le deviendra-t-elle (impact sur Vercel Hobby, R1) ?
4. Connexion : quels providers (e-mail/mot de passe, Google, Discord…) ? Que voit un invité sans compte ?
5. Rôles : suffit-il d'« apprenant » et « admin », ou faut-il un RBAC complet ? Qui crée le contenu : l'app, Supabase Studio, des fichiers dans le dépôt ?
6. Où héberger les vidéos (YouTube/Vimeo en embed, CDN vidéo, autre) ? Vidéos créées par vous ou tierces ?
7. Langue : interface uniquement en français, ou plusieurs langues (O-019) ? Nom de domaine ?
8. Région des projets Supabase et Vercel (O-008) ?
9. Identité visuelle : couleur d'accent, logo, icônes (le socle utilise une couleur indigo et une icône crayon **provisoires**).
10. Hors-ligne : quels contenus doivent marcher sans réseau (A-081) ?
11. Analytics et monitoring d'erreurs : oui/non, outil (A-093, O-072) ?
12. Motivation : valides-tu l'**objectif hebdomadaire** à la place d'une série quotidienne, l'**absence de classement**, et les chiffres de `docs/pedagogie/gamification.md` (XP, niveaux, badges) ?
13. Les élèves dessinent-ils **sur papier** (l'application est un entraîneur, recommandé pour la v1.0.0) ou **dans l'application** (canevas : un autre produit) ?
14. Contenu : qui écrit et illustre les exercices, conseils et schémas ? Où vit-il : **fichiers du dépôt** (recommandé au départ) ou base de données ? Photos de modèles pour le geste : séance photo avec autorisations, œuvres du domaine public, ou renvoi vers des outils externes ?
15. Public visé : **âge minimal**, présence de mineurs, consentement parental et politique de confidentialité (à déterminer avant l'ouverture).
16. Photos des élèves : option A (appareil seulement), B (cloud plafonné, **suffisant pour un petit public**) ou C (stockage externe) ? Voir R9.
