# Guide d'Architecture et de Déploiement

Ce document vous guide pour configurer l'infrastructure de production de ce projet en utilisant Supabase pour la base de données et Vercel pour l'hébergement.

---

## Partie 1 : Configuration de la Base de Données avec Supabase

Supabase sera notre source de vérité pour toutes les données de l'application (postes, standards, formulaires).

### Étape 1 : Créer votre projet Supabase

1.  Rendez-vous sur [supabase.com](https://supabase.com) et créez un compte (vous pouvez utiliser votre compte GitHub pour plus de simplicité).
2.  Créez une **Nouvelle Organisation** (par exemple, le nom de votre entreprise ou projet).
3.  Créez un **Nouveau Projet** au sein de cette organisation.
    *   Donnez-lui un nom clair (ex: `safesteps-prod`).
    *   **Générez un mot de passe de base de données** et **conservez-le précieusement** dans un gestionnaire de mots de passe. C'est une clé maîtresse que Supabase ne vous montrera plus.
    *   Choisissez la région du serveur la plus proche de vos utilisateurs.
4.  Attendez quelques minutes que votre projet soit provisionné.

### Étape 2 : Créer le Schéma de la Base de Données

Une fois votre projet prêt, nous devons créer les tables qui contiendront nos données.

1.  Dans le menu de gauche de votre projet Supabase, cliquez sur l'icône **Table Editor** (qui ressemble à une grille de table).
2.  Cliquez sur le grand bouton **"+ New SQL Snippet"** ou **"+ New query"**.
3.  **Copiez le script SQL ci-dessous.**

    **ATTENTION : INSTRUCTION LA PLUS IMPORTANTE**
    *   La meilleure méthode est d'utiliser **l'icône de copie** (souvent 📋 ou deux carrés) qui apparaît en haut à droite du bloc de code ci-dessous.
    *   Si vous sélectionnez le texte manuellement, votre sélection doit commencer au tout début de la ligne `-- Création de la table...` et se terminer à la toute fin de la ligne `... with check (true);`. **Ne copiez rien avant ou après.**

```sql
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

4.  **Collez le script dans l'éditeur SQL de Supabase.**
5.  **Vérification cruciale :** Assurez-vous que la première ligne dans l'éditeur est bien `-- Création de la table...` et **PAS** ` ```sql `. Si vous voyez ````sql`, supprimez cette ligne.
6.  Cliquez sur le bouton vert **"RUN"**. Si tout est correct, vous devriez voir un message de succès.

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

---

> 🚨 **DÉPANNAGE : Si vous voyez l'erreur "Clés manquantes"...**
>
> Si votre application affiche une erreur concernant des clés Supabase manquantes, c'est presque certainement un problème avec ce fichier `.env.local`. Voici une liste de vérification :
>
> *   **1. Le Nom est-il Parfait ?** Le fichier doit s'appeler ` .env.local ` (avec le point au début). Il ne doit pas être `.env` ou `.env.local.txt`.
> *   **2. Le Fichier est-il au Bon Endroit ?** Il doit être à la racine du projet, au même niveau que les fichiers `package.json` et `ARCHITECTURE.md`.
> *   **3. Les Clés sont-elles Correctes ?** Avez-vous remplacé `VOTRE_PROJECT_URL_...` par la vraie URL de votre projet ? La clé `anon` ne doit pas contenir le mot "secret".
> *   **4. Avez-vous Redémarré ?** Après avoir créé ou modifié le fichier, arrêtez le serveur de développement (souvent avec `CTRL+C` dans le terminal) et relancez-le. C'est parfois nécessaire pour que les changements soient pris en compte.

---

**Votre application est maintenant configurée pour utiliser Supabase en local !**

---

## Partie 2 : Déploiement sur Vercel

Vercel hébergera notre application et la rendra accessible au monde.

### Étape 1 : Mettre le Projet sur GitHub

Pour que Vercel puisse accéder à notre code, celui-ci doit se trouver sur GitHub.

**A. Créer le dépôt sur GitHub.com**
1.  Rendez-vous sur [github.com](https://github.com) et connectez-vous.
2.  Cliquez sur le bouton **"New"** (ou sur l'icône `+` en haut à droite, puis "New repository").
3.  Donnez un nom à votre dépôt (ex: `safesteps-app`).
4.  Laissez l'option **Public** sélectionnée.
5.  **ATTENTION :** Ne cochez **AUCUNE** case ("Add a README file", "Add .gitignore", "Choose a license"). Votre projet contient déjà ces fichiers.
6.  Cliquez sur **"Create repository"**.

**B. Envoyer le code depuis votre environnement (Méthode 1 : Ligne de Commande)**
1.  Après la création, GitHub vous montrera une page avec une URL qui se termine par `.git`. Copiez cette URL.
2.  Dans le terminal de votre environnement de développement, exécutez les commandes suivantes une par une :

    ```bash
    # Initialise un nouveau dépôt Git. Si un projet Git existe déjà, cette commande est sans danger.
    git init -b main

    # Ajoute tous les fichiers du projet pour la sauvegarde
    git add .

    # Crée une sauvegarde locale avec un message.
    # Si vous voyez "nothing to commit", ce n'est pas une erreur, continuez simplement.
    git commit -m "Initial commit"

    # Lie votre projet local au dépôt distant sur GitHub.
    # Remplacez l'URL par celle que vous avez copiée.
    # Si vous voyez une erreur "remote origin already exists", ce n'est pas grave, continuez.
    git remote add origin https://github.com/VOTRE_NOM/VOTRE_PROJET.git

    # Envoie votre code vers la branche 'main' de GitHub.
    # La commande HEAD:main est la plus robuste : elle envoie votre branche actuelle
    # (peu importe son nom local) vers la branche 'main' sur GitHub.
    git push -u origin HEAD:main
    ```

> 🚨 **DÉPANNAGE : Problèmes avec `git push` (Méthode Alternative Recommandée)**
>
> Si vous rencontrez des erreurs de connexion (`ECONNREFUSED`), d'authentification (`Authentication failed`), ou si le terminal se bloque, c'est très probablement dû aux limitations réseau de l'environnement de développement web (comme Firebase Studio).
>
> **Ne vous inquiétez pas, il existe une méthode beaucoup plus simple et fiable qui contourne complètement le terminal.**
>
> ### La Méthode par Téléversement Web (Recommandée)
>
> **Étape 1 : Télécharger votre projet depuis Firebase Studio**
> 1.  Pour télécharger le projet, la méthode la plus simple est d'utiliser la **Palette de Commandes**.
> 2.  Appuyez sur la touche `F1` (ou `Ctrl+Shift+P` / `Cmd+Shift+P`).
> 3.  Une barre de recherche s'ouvre. Tapez-y `Download Workspace` et sélectionnez cette option.
> 4.  Alternativement, dans le menu `File` (Fichier) en haut à gauche, cherchez une option comme **`Save Workspace As...`** qui aura le même effet.
> 5.  Cela téléchargera un fichier `.zip` contenant tout votre projet sur votre ordinateur.
> 6.  Décompressez (extrayez) ce fichier `.zip` dans un dossier sur votre ordinateur.
>
> **Étape 2 : Téléverser les fichiers sur GitHub**
> 1.  Retournez sur la page de votre dépôt GitHub (celle qui est vide).
> 2.  Cliquez sur le lien qui dit **`uploading an existing file`**.
> 3.  Une nouvelle page s'ouvrira, vous invitant à glisser-déposer des fichiers.
> 4.  Ouvrez le dossier que vous avez décompressé à l'étape 1.
> 5.  Sélectionnez **tous les fichiers et dossiers** de votre projet et **glissez-les** dans la fenêtre de votre navigateur.
>     *   **IMPORTANT :** N'incluez pas le dossier `.git` s'il existe. Vous pouvez aussi exclure `node_modules` s'il est présent.
> 6.  Attendez que GitHub traite tous les fichiers.
>
> **Étape 3 : Finaliser le téléversement (Commit)**
> 1.  Une fois tous les fichiers chargés, une boîte de dialogue apparaîtra en bas de la page.
> 2.  Dans la première case, écrivez un message descriptif, par exemple : `Initial project upload`.
> 3.  Assurez-vous que l'option "Commit directly to the `main` branch" est cochée.
> 4.  Cliquez sur le bouton vert **"Commit changes"**.
>
> Et voilà ! Votre code est sur GitHub. Vous pouvez maintenant passer directement à la **Partie 2 : Déploiement sur Vercel**.


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
