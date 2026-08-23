[LISEZ-MOI.md](https://github.com/user-attachments/files/31348030/LISEZ-MOI.md)
# GRA Locator — mise en ligne sur GitHub Pages (gratuit, sans compte pour vos amis)

Ce dossier contient tout le nécessaire : la page (`index.html`), la mise en cache
hors-ligne (`sw.js`), les icônes et le fichier de description de l'appli
(`manifest.json`). Aucune ligne de commande n'est nécessaire — tout se fait sur
le site github.com, à la souris.

## Étape 1 — Créer un compte GitHub (si vous n'en avez pas)

Allez sur **github.com** → "Sign up" → un email, un mot de passe, un nom
d'utilisateur. Gratuit.

## Étape 2 — Créer le dépôt

1. Une fois connecté, cliquez sur le **+** en haut à droite → **"New repository"**.
2. Nom du dépôt : par exemple `gra-locator` (pas d'espace, pas d'accent).
3. Laissez le dépôt en **Public**.
4. Cliquez **"Create repository"**.

## Étape 3 — Déposer les fichiers

1. Sur la page du dépôt tout neuf, cliquez **"uploading an existing file"**
   (ou le bouton "Add file" → "Upload files").
2. Ouvrez ce dossier sur votre ordinateur et **glissez-déposez les 6 fichiers**
   (`index.html`, `manifest.json`, `sw.js`, `icon-192.png`, `icon-512.png`,
   `icon-maskable-512.png`) dans la zone de dépôt.
3. En bas de page, cliquez **"Commit changes"**.

## Étape 4 — Activer GitHub Pages

1. Dans le dépôt, allez dans l'onglet **"Settings"**.
2. Dans le menu de gauche, cliquez **"Pages"**.
3. Sous "Build and deployment" → "Branch", choisissez **"main"** et le dossier
   **"/ (root)"**, puis **"Save"**.
4. Attendez ~1 minute, rafraîchissez la page : une adresse apparaît en haut,
   du type :

   `https://votre-nom-utilisateur.github.io/gra-locator/`

C'est cette adresse (ajoutez `index.html` à la fin si elle ne s'ouvre pas
directement) qu'il faut partager avec votre club — elle fonctionne pour tout
le monde, sans compte, gratuitement, et hors-ligne après une première visite
avec réseau.

## Vérifier que le mode hors-ligne fonctionne

1. Ouvrez l'adresse ci-dessus dans Chrome (avec du réseau), autorisez la
   localisation.
2. Activez le mode avion.
3. Fermez et rouvrez la page (ou l'icône, si vous l'avez ajoutée à l'écran
   d'accueil via le menu ⋮ de Chrome → "Ajouter à l'écran d'accueil").
4. Elle doit s'ouvrir et fonctionner normalement, sans réseau.

## Mettre à jour les données plus tard

Si vous avez un fichier d'émetteurs mis à jour, revenez sur cette conversation
avec Claude, envoyez le nouveau fichier, et demandez de régénérer `index.html`
— vous n'aurez qu'à re-déposer ce seul fichier sur GitHub (bouton "Add file" →
"Upload files", il proposera de remplacer l'ancien).
