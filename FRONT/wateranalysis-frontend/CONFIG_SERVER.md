# Configuration du Déploiement GitHub vers Server

## 📋 Vue d'ensemble

Ce guide explique comment configurer la connexion automatique entre GitHub et votre serveur de production pour le déploiement Docker.

---

## 🔐 Étape 1 : Générer les clés SSH sur le Serveur

### 1.1 Connexion au serveur distant

```bash
# SSH au serveur (demander les identifiants au responsable)
ssh -p 22 user@SERVER_IP
# ou avec un port différent
ssh -p SSH_PORT user@SERVER_IP
```

### 1.2 Générer la paire de clés SSH sur le serveur

```bash
# Générer directement sur le serveur
ssh-keygen -t ed25519 -C "github-deployment@wateranalysis.mg"

# Appuyer sur Entrée pour accepter le chemin par défaut (~/.ssh/id_ed25519)
# Laisser vide pour la passphrase
```

### 1.3 Afficher et récupérer les clés

**Clé PUBLIQUE** (à ajouter à GitHub):
```bash
# Afficher la clé publique
cat ~/.ssh/id_ed25519.pub

# Copier tout le contenu (ssh-ed25519 AAAA...)
```

**Clé PRIVÉE** (pour les secrets GitHub):
```bash
# Afficher la clé privée
cat ~/.ssh/id_ed25519

# Copier TOUT le contenu (-----BEGIN OPENSSH PRIVATE KEY----- à -----END OPENSSH PRIVATE KEY-----)
```

> **⚠️ IMPORTANT:** Ne jamais partager la clé privée!

---

## 🖥️ Étape 2 : Autoriser le Serveur à Accéder à GitHub

### 2.1 Ajouter la clé publique à GitHub (Deploy Keys)

1. Aller sur: `https://github.com/Projet-Ticket/frontend/settings/keys`
2. Cliquer sur **"Add deploy key"**
3. Coller le contenu de `~/.ssh/id_ed25519.pub` du serveur
4. Options:
   - ✅ **"Allow write access"** (pour les déploiements)
   - Titre: "Server Deploy Key"
5. Cliquer **"Add key"**

### 2.2 Configurer Git sur le serveur pour cloner le repository

```bash
# Sur le serveur, configurer git
git config --global user.email "deployment@wateranalysis.mg"
git config --global user.name "Deployment User"

# Tester la connexion SSH à GitHub
ssh -T git@github.com

# Devrait répondre: Hi Projet-Ticket! You've successfully authenticated...
```

### 2.3 Cloner le repository sur le serveur

```bash
# Sur le serveur
cd ~
git clone git@github.com:Projet-Ticket/frontend.git waternetworkwebmapping
cd waternetworkwebmapping

# Vérifier que c'est bien cloné
git log --oneline | head -5
```

### 2.4 Installer Docker (si nécessaire)

```bash
# Vérifier si Docker est installé
docker --version

# Si non, installer Docker
curl -sSL https://get.docker.com | sh

# Ajouter votre utilisateur au groupe docker
sudo usermod -aG docker $USER

# Appliquer les changements
newgrp docker

# Vérifier
docker ps
```

### 2.5 Préparer les répertoires d'application

```bash
# Les répertoires sont déjà créés par le clone git
cd ~/waternetworkwebmapping

# Vérifier les permissions
ls -la ~/
```

---

## 🔑 Étape 3 : Configuration Automatique via GitHub Webhooks

### 3.1 Installer un script de déploiement sur le serveur

```bash
# Sur le serveur, créer le répertoire des scripts
mkdir -p ~/scripts
cd ~/scripts

# Créer le script de déploiement
cat > deploy.sh << 'EOF'
#!/bin/bash
set -e

APP_DIR=~/waternetworkwebmapping
CONTAINER_NAME=waternetworkwebmapping
IMAGE_NAME=wateranalysis-frontend
HOST_PORT=4787

cd $APP_DIR

# Récupérer les derniers changements
git pull origin main

# Récupérer les variables d'environnement
source .env.production

# Construire l'image Docker
docker build \
  --build-arg REACT_APP_API_URL="$REACT_APP_API_URL" \
  --build-arg REACT_APP_MAPBOX_TOKEN="$REACT_APP_MAPBOX_TOKEN" \
  -t ${IMAGE_NAME}:latest .

# Arrêter l'ancien conteneur
docker stop ${CONTAINER_NAME} || true
docker rm ${CONTAINER_NAME} || true

# Créer le réseau si nécessaire
docker network create waternetwork || true

# Lancer le nouveau conteneur
docker run -d \
  --name ${CONTAINER_NAME} \
  --restart unless-stopped \
  -p ${HOST_PORT}:80 \
  -e REACT_APP_API_URL="$REACT_APP_API_URL" \
  -e REACT_APP_MAPBOX_TOKEN="$REACT_APP_MAPBOX_TOKEN" \
  --network waternetwork \
  ${IMAGE_NAME}:latest

# Nettoyer les anciennes images
docker image prune -f --filter "until=240h"

echo "✅ Déploiement terminé sur le port ${HOST_PORT}"
EOF

# Rendre le script exécutable
chmod +x deploy.sh
```

### 3.2 Créer le fichier .env.production

```bash
# Sur le serveur, dans le répertoire de l'application
cd ~/waternetworkwebmapping

# Créer le fichier d'environnement
cat > .env.production << 'EOF'
REACT_APP_API_URL=https://api.wateranalysis.mg
REACT_APP_MAPBOX_TOKEN=pk_xxxxx...
EOF

# Protéger le fichier
chmod 600 .env.production
```

### 3.3 Configurer le Webhook GitHub (Automatique)

#### Option A: Utiliser un service de webhook (Recommended)

1. Aller sur: `https://github.com/Projet-Ticket/frontend/settings/hooks`
2. Cliquer **"Add webhook"**
3. **Payload URL**: `http://SERVER_IP:5000/webhook`
4. **Content type**: `application/json`
5. **Events**: `Just the push event`
6. ✅ **Active**
7. Cliquer **"Add webhook"**

#### Option B: Utiliser un script cron (Simple)

```bash
# Sur le serveur, éditer crontab
crontab -e

# Ajouter la ligne pour vérifier les mises à jour toutes les 5 minutes
*/5 * * * * cd ~/waternetworkwebmapping && git fetch origin && if ! git diff --quiet HEAD origin/main; then ~/scripts/deploy.sh; fi
```

### 3.4 Configurer un service webhook simple (Node.js)

```bash
# Sur le serveur
npm install express body-parser -g

# Créer le service webhook
cat > ~/scripts/webhook-server.js << 'EOF'
const express = require('express');
const { exec } = require('child_process');
const app = express();

app.use(express.json());

app.post('/webhook', (req, res) => {
  const { ref } = req.body;
  
  if (ref === 'refs/heads/main') {
    console.log('Webhook reçu, déploiement en cours...');
    exec('~/scripts/deploy.sh', (error, stdout, stderr) => {
      if (error) {
        console.error('Erreur:', stderr);
        return res.status(500).send(stderr);
      }
      console.log('Déploiement réussi');
      res.send('Deployment successful');
    });
  } else {
    res.send('Not the main branch, skipping deployment');
  }
});

app.listen(5000, () => {
  console.log('Webhook server running on port 5000');
});
EOF
```

### 3.5 Lancer le service webhook (avec PM2)

```bash
# Installer PM2
npm install -g pm2

# Lancer le webhook server
pm2 start ~/scripts/webhook-server.js --name webhook

# Vérifier
pm2 status

# Sauvegarder pour que ça redémarre au reboot
pm2 save
pm2 startup
```

---

## 🧪 Étape 4 : Tester la Configuration

### 4.1 Tester le script de déploiement manuellement

```bash
# Sur le serveur
cd ~/waternetworkwebmapping
~/scripts/deploy.sh

# Vérifier que tout s'est bien passé
docker ps
docker logs -f waternetworkwebmapping
```

### 4.2 Tester le webhook

```bash
# Depuis votre machine locale
curl -X POST http://SERVER_IP:5000/webhook \
  -H "Content-Type: application/json" \
  -d '{"ref":"refs/heads/main"}'

# Devrait répondre: "Deployment successful"
```

### 4.3 Tester via un push GitHub

1. Faire une petite modification dans le code
2. Commiter et pusher vers `main`
3. Voir le webhook se déclencher automatiquement
4. Vérifier que l'application a été mise à jour

---

## 📋 Étape 5 : Vérifier le Déploiement

### 5.1 Sur le serveur

```bash
# Accéder au serveur
ssh user@SERVER_IP

# Vérifier les conteneurs en cours d'exécution
docker ps

# Vérifier les logs du conteneur
docker logs -f waternetworkwebmapping

# Vérifier que l'application répond
curl http://localhost:4787/

# Ou depuis votre machine locale
curl http://SERVER_IP:4787/
```

### 5.2 Vérifier les logs du webhook

```bash
# Sur le serveur
pm2 logs webhook

# Ou voir les logs du déploiement
tail -f ~/deployment.log
```

### 5.3 URL d'accès

```
http://SERVER_IP:4787
```

Remplacer `SERVER_IP` par l'IP ou domaine de votre serveur.

---

## 🚀 Étape 6 : Tester le Déploiement Automatique avec Webhook

### 6.1 Créer une modification et pusher

```bash
# Sur votre machine locale
git checkout main
echo "test" >> test.txt
git add .
git commit -m "test deployment webhook"
git push origin main
```

### 6.2 Vérifier que le webhook s'est déclenché

1. Le serveur reçoit l'event push GitHub
2. Le script `deploy.sh` s'exécute automatiquement
3. L'application est mise à jour

Vérifier avec:
```bash
docker logs -f waternetworkwebmapping
```

### 6.3 Vérifier l'URL

Accéder à `http://SERVER_IP:4787` dans votre navigateur.

---

## 🔧 Dépannage

### Problème: "git pull" échoue avec permission denied

**Solution:**
```bash
# S'assurer que la clé SSH est correctement chargée
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

# Tester la connexion à GitHub
ssh -T git@github.com

# Devrait répondre: Hi Projet-Ticket! You've successfully authenticated...
```

### Problème: Webhook ne se déclenche pas

**Solution:**
```bash
# Vérifier que le webhook server est en cours d'exécution
pm2 status

# Relancer le webhook
pm2 restart webhook

# Vérifier les logs
pm2 logs webhook

# Vérifier que le port 5000 est ouvert
netstat -tuln | grep 5000
```

### Problème: "Docker command not found"

**Solution:**
```bash
# Sur le serveur
sudo apt-get update
sudo apt-get install docker.io -y
sudo usermod -aG docker $USER
newgrp docker
```

### Problème: "Port 4787 déjà utilisé"

**Solution:**
```bash
# Trouver le processus utilisant le port
sudo lsof -i :4787

# Ou arrêter le conteneur existant
docker stop waternetworkwebmapping
docker rm waternetworkwebmapping

# Puis relancer le deploy
~/scripts/deploy.sh
```

### Problème: "Webhook payload incorrect"

**Solution:**
```bash
# Vérifier que la payload GitHub est correcte
# Le serveur doit recevoir un JSON avec "ref": "refs/heads/main"

# Tester manuellement
curl -X POST http://localhost:5000/webhook \
  -H "Content-Type: application/json" \
  -d '{"ref":"refs/heads/main"}'
```

---

## 📊 Fichiers de Configuration

### Clés SSH GitHub (`~/.ssh/id_ed25519`)

- Générées sur le serveur
- La clé publique ajoutée à GitHub Deploy Keys
- Pour l'authentification auprès de GitHub

### Script de déploiement (`~/scripts/deploy.sh`)

- Clone/update du code depuis GitHub
- Construction de l'image Docker
- Gestion des conteneurs

### Webhook Server (`~/scripts/webhook-server.js`)

- Écoute les événements push GitHub
- Déclenche automatiquement le déploiement
- Service géré avec PM2

### Variables d'environnement (`.env.production`)

- `REACT_APP_API_URL` - URL de l'API
- `REACT_APP_MAPBOX_TOKEN` - Token Mapbox
- Chargées par le script deploy.sh

---

## 🔐 Bonnes pratiques de sécurité

✅ **À faire:**
- Utiliser des clés Ed25519 (plus sûres et légères)
- Rotationner les clés régulièrement
- Limiter les permissions SSH (`chmod 600` pour les clés)
- Utiliser des passages non-root si possible
- Activer firewall sur le serveur

❌ **À éviter:**
- Partager la clé privée
- Utiliser des passphrases faibles
- Stocker les clés en clair
- Utiliser l'utilisateur `root` pour SSH

---

## 📱 Commandes utiles

```bash
# Afficher les logs en temps réel
docker logs -f waternetworkwebmapping

# Arrêter le conteneur
docker stop waternetworkwebmapping

# Démarrer le conteneur
docker start waternetworkwebmapping

# Redémarrer
docker restart waternetworkwebmapping

# Supprimer
docker rm waternetworkwebmapping

# Nettoyer les images
docker image prune -a

# Vérifier l'espace disque
df -h
```

---

## 📞 Support

Pour plus d'informations:
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Documentation](https://docs.docker.com/)
- [SSH Keys Setup](https://docs.github.com/en/authentication/connecting-to-github-with-ssh)

---

**Créé:** 2026-03-17  
**Version:** 1.0
