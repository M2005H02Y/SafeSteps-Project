# Guide d'Architecture et de Déploiement

Ce document vous guide pour configurer l'infrastructure de production de ce projet en utilisant Supabase pour la base de données et Vercel pour l'hébergement.

---

## Partie 1 : Configuration de la Base de Données avec Supabase

Supabase sera notre source de vérité pour toutes les données de l'application (postes, standards, formulaires).

### Étape 1 : Créer votre projet Supabase

1.  Rendez-vous sur [supabase.com](https://supabase.com) et créez un compte (vous pouvez utiliser votre compte GitHub pour plus de simplicité).
2.  Créez une **Nouvelle Organisation** (par exemple, le nom de votre entreprise ou projet).
3.  Créez un **Nouveau Projet** au sein de cette organisation.
    *   Donnez-lui un nom clair (ex: `sgi-prod`).
    *   Générez un **mot de passe de base de données** et **conservez-le précieusement** dans un gestionnaire de mots de passe.
    *   Choisissez la région du serveur la plus proche de vos utilisateurs.
4.  Attendez quelques minutes que votre projet soit provisionné.

### Étape 2 : Créer le Schéma de la Base de Données

Une fois votre projet prêt, nous devons créer les tables qui contiendront nos données.

1.  Dans le menu de gauche de votre projet Supabase, cliquez sur l'icône **SQL Editor**.
2.  Cliquez sur **"New query"**.
3.  Copiez-collez l'intégralité du script SQL ci-dessous dans l'éditeur.
4.  Cliquez sur le bouton **"RUN"**.

```sql
-- Désactive la sécurité au niveau des lignes pour permettre la création. Nous la réactiverons plus tard.
alter table "storage".objects drop constraint if exists "project_id_fk";

-- Création de la table pour les Postes de Travail (Workstations)
-- Cette table stocke les informations sur chaque poste ou type d'engine.
create table public.workstations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null,
  description text,
  image text, -- URL vers l'image principale sur Cloudinary
  files jsonb, -- Tableau d'objets pour les fichiers joints
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Création de la table pour les Standards
-- Cette table stocke les documents de procédure et les normes.
create table public.standards (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  version text,
  description text,
  image text, -- URL vers l'image principale sur Cloudinary
  files jsonb,
  last_updated timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Création de la table pour les Formulaires (Forms)
-- Contient la structure des formulaires dynamiques.
create table public.forms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  table_data jsonb, -- Structure du tableau dynamique
  files jsonb,
  last_updated timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Activer la sécurité au niveau des lignes (Row Level Security - RLS) pour toutes les tables.
-- C'est une étape CRUCIALE pour la sécurité. Par défaut, personne ne peut rien voir.
alter table public.workstations enable row level security;
alter table public.standards enable row level security;
alter table public.forms enable row level security;

-- Créer des politiques (policies) qui autorisent l'accès public en lecture seule.
-- Cela permet à quiconque de voir les données, ce qui est nécessaire pour nos pages publiques et notre prototype.
-- Pour une application avec des comptes utilisateurs, ces règles seraient plus restrictives.
create policy "Public workstations are viewable by everyone." on public.workstations for select using (true);
create policy "Public standards are viewable by everyone." on public.standards for select using (true);
create policy "Public forms are viewable by everyone." on public.forms for select using (true);

-- Créer des politiques qui autorisent tout le monde à insérer, mettre à jour et supprimer.
-- ATTENTION : C'est acceptable pour notre prototype, mais pour une vraie production,
-- vous voudriez restreindre cela aux utilisateurs authentifiés.
create policy "Anyone can insert a new workstation." on public.workstations for insert with check (true);
create policy "Anyone can update a workstation." on public.workstations for update using (true);
create policy "Anyone can delete a workstation." on public.workstations for delete using (true);

create policy "Anyone can insert a new standard." on public.standards for insert with check (true);
create policy "Anyone can update a standard." on public.standards for update using (true);
create policy "Anyone can delete a standard." on public.standards for delete using (true);

create policy "Anyone can insert a new form." on public.forms for insert with check (true);
create policy "Anyone can update a form." on public.forms for update using (true);
create policy "Anyone can delete a form." on public.forms for delete using (true);
```

### Étape 3 : Récupérer vos Clés d'API

1.  Dans le menu de gauche de Supabase, allez dans **Project Settings** (icône d'engrenage) > **API**.
2.  Vous y trouverez deux informations essentielles :
    *   **Project URL**
    *   Sous **Project API Keys**, copiez la clé `anon` `public`. **N'utilisez jamais la clé `service_role` (secrète) dans le code frontend.**

### Étape 4 : Configurer votre Environnement Local

1.  À la racine de notre projet, créez un fichier nommé `.env.local`.
2.  Ajoutez-y les clés récupérées à l'étape 3, ainsi que vos clés Cloudinary :

```
# Clés Supabase
NEXT_PUBLIC_SUPABASE_URL=VOTRE_PROJECT_URL_DE_SUPABASE_ICI
NEXT_PUBLIC_SUPABASE_ANON_KEY=VOTRE_ANON_KEY_DE_SUPABASE_ICI

# Clés Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=VOTRE_CLOUD_NAME_DE_CLOUDINARY
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=VOTRE_UPLOAD_PRESET_DE_CLOUDINARY
```

**Votre application est maintenant configurée pour utiliser Supabase en local !**

---

## Partie 2 : Déploiement sur Vercel

Vercel hébergera notre application et la rendra accessible au monde.

### Étape 1 : Mettre le Projet sur GitHub

Si ce n'est pas déjà fait, créez un dépôt sur [GitHub](https://github.com) et envoyez-y le code de notre projet.

### Étape 2 : Créer un Compte Vercel

1.  Rendez-vous sur [vercel.com](https://vercel.com) et inscrivez-vous (utilisez votre compte GitHub pour une intégration simplifiée).

### Étape 3 : Importer et Déployer le Projet

1.  Depuis votre tableau de bord Vercel, cliquez sur **"Add New... > Project"**.
2.  Choisissez le dépôt GitHub de notre projet et cliquez sur **"Import"**.
3.  Vercel va automatiquement détecter que c'est un projet Next.js. Vous n'avez aucun réglage de build à modifier.

### Étape 4 : Configurer les Variables d'Environnement (Étape la plus importante)

1.  Déroulez la section **"Environment Variables"**.
2.  C'est ici que vous devez ajouter les mêmes clés que dans votre fichier `.env.local`. Pour chaque clé, entrez le nom et la valeur.
    *   `NEXT_PUBLIC_SUPABASE_URL`
    *   `NEXT_PUBLIC_SUPABASE_ANON_KEY`
    *   `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
    *   `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`
3.  Cliquez sur **"Deploy"**.

Vercel va maintenant construire et déployer votre application. Après quelques minutes, vous recevrez une URL publique et votre site sera en ligne, entièrement connecté à votre base de données Supabase.

### Le Flux de Travail Futur

Désormais, à chaque fois que vous ferez un `git push` sur votre branche `main`, Vercel redéploiera automatiquement la nouvelle version de votre site. C'est magique !
