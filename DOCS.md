# Documentation de la Pile Technique du Projet

Ce document offre une vue d'ensemble des langages, bibliothèques et technologies qui composent ce projet, ainsi que des notes sur leur compatibilité.

## Langages Principaux

- **TypeScript (TS)** : Le langage principal utilisé. C'est une surcouche de JavaScript qui ajoute un typage statique. Cela permet de détecter de nombreuses erreurs au moment du développement plutôt qu'à l'exécution, rendant le code plus sûr et plus facile à maintenir. Nous utilisons l'extension `.ts` pour la logique et `.tsx` pour les composants React.
- **JSX/TSX** : Une extension de syntaxe qui permet d'écrire du code ressemblant à du HTML directement dans les fichiers TypeScript. C'est le standard pour définir la structure des composants dans React.
- **CSS (via Tailwind CSS)** : Le style n'est pas écrit en CSS traditionnel, mais via des classes utilitaires fournies par Tailwind CSS, ce qui permet un développement rapide et cohérent.

---

## Bibliothèques et Frameworks

Voici une description des principales dépendances du projet, regroupées par fonction.

### 1. Framework Principal

- **Next.js** : Le framework de base de l'application. C'est un framework React qui offre des fonctionnalités de production prêtes à l'emploi comme le rendu côté serveur (SSR), la génération de sites statiques (SSG), le routage basé sur les fichiers, et l'optimisation des performances.
- **React** : La bibliothèque de base pour construire des interfaces utilisateur. Elle permet de créer des composants réutilisables qui gèrent leur propre état.

### 2. Interface Utilisateur (UI) et Style

- **ShadCN UI** : Ce n'est pas une bibliothèque de composants traditionnelle, mais une collection de "recettes" de composants réutilisables construits avec Radix UI et Tailwind CSS. On peut les copier-coller dans le projet et les personnaliser à volonté. C'est la source de nos `Button`, `Card`, `Dialog`, etc.
- **Tailwind CSS** : Un framework CSS "utility-first" qui permet de styliser les composants directement dans le HTML/JSX en utilisant des classes comme `p-4`, `flex`, `text-lg`. Il est configuré dans `tailwind.config.ts`.
- **Radix UI** : Une bibliothèque de primitives UI non stylisées et accessibles. Elle fournit la logique et l'accessibilité pour nos composants (comme les menus déroulants, les boîtes de dialogue), tandis que Tailwind s'occupe du style. ShadCN utilise Radix sous le capot.
- **Lucide React** : Une bibliothèque d'icônes SVG simples, légères et cohérentes. Toutes les icônes de l'application (comme `Cog`, `FileText`) viennent de là.
- **Recharts** : Utilisée pour créer des graphiques et des visualisations de données.
- **tailwindcss-animate** : Un plugin pour Tailwind qui facilite l'ajout d'animations.


### 4. Gestion de Formulaires

- **React Hook Form** : Une bibliothèque performante pour gérer les états, la validation et la soumission des formulaires dans React.
- **Zod** : Une bibliothèque de validation de schémas. Nous l'utilisons avec React Hook Form pour définir la "forme" attendue des données d'un formulaire et valider les entrées de l'utilisateur de manière très claire et concise.

### 5. Utilitaires et Autres

- **`clsx` & `tailwind-merge`** : Deux petits utilitaires qui fonctionnent ensemble. `clsx` permet de construire des chaînes de classes CSS de manière conditionnelle, et `tailwind-merge` résout intelligemment les conflits entre les classes Tailwind. Ils sont combinés dans notre fonction `cn()` (dans `src/lib/utils.ts`).
- **`date-fns`** : Une bibliothèque moderne et légère pour la manipulation des dates.
- **`html2canvas` & `jspdf`** : Utilisées pour l'export en PDF. `html2canvas` prend une "capture d'écran" d'une partie de la page, et `jspdf` l'insère dans un fichier PDF.
- **`xlsx`** : Permet de lire et d'écrire des fichiers Excel (`.xlsx`), utilisée pour la fonctionnalité d'export.

---

## Compatibilité des Éléments

La pile technique de ce projet a été choisie pour sa **compatibilité et son intégration excellentes**.

- **Next.js + React + TypeScript** est le trio de base pour le développement web moderne. TypeScript s'intègre parfaitement avec React et Next.js, offrant une expérience de développement robuste.
- **ShadCN + Radix + Tailwind CSS** est une combinaison très populaire pour la construction d'interfaces. Radix gère la logique complexe et l'accessibilité des composants, Tailwind s'occupe du style, et ShadCN orchestre le tout pour fournir des composants prêts à l'emploi mais entièrement personnalisables. C'est un système très flexible.
- **React Hook Form + Zod** est le duo standard pour la gestion de formulaires. Zod définit les règles de validation côté TypeScript, et React Hook Form les applique efficacement dans l'interface React.
- **Genkit** est conçu pour s'intégrer dans des backends JavaScript/TypeScript, ce qui le rend parfaitement compatible avec les actions serveur de Next.js.

En conclusion, toutes les pièces de ce puzzle technologique sont conçues pour fonctionner ensemble. C'est une pile moderne, performante et maintenable, largement adoptée par la communauté des développeurs web.
