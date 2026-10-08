# 0001 — Choix de la stack

- **Statut** : Accepted
- **Date** : 2026-10-08
- **Décideurs** : @iSweat-exe

## Contexte

DrawToday est une application mobile-first pour apprendre à dessiner (exercices, conseils, vidéos…), équipe de
plusieurs développeurs utilisant des LLMs, budget limité aux offres gratuites de Supabase et Vercel. Un autre projet
du même auteur, BlocusApp, utilise déjà cette stack avec succès.

## Décision

React + Next.js (App Router, TypeScript) + Tailwind CSS 4 pour le front et le serveur applicatif,
Supabase (Auth, Postgres + RLS, Storage) pour le backend, Vercel pour l'hébergement, PWA pour
iOS et Android. Exactement la stack de BlocusApp.

## Conséquences

- Les limites des offres gratuites structurent l'architecture (voir `.dev/constraints.md`) : cache,
  écritures groupées, throttling.
- Vercel Hobby est réservé à un usage non commercial : passage au plan Pro si l'app est monétisée.
- La sécurité repose sur la RLS : chaque table doit être couverte par des politiques testées.
- Une application riche en médias (vidéos, images de dessins) pèse plus sur les quotas que BlocusApp : les médias
  lourds ne sont pas servis par Vercel ni Supabase sans ADR dédié.
