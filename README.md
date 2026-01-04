# MySmash - Plateforme de Capture Vidéo Intelligente pour le Padel

MySmash est une application web moderne permettant aux joueurs de padel d'enregistrer, analyser et partager leurs matchs avec des fonctionnalités d'intelligence artificielle.

## 🎯 Fonctionnalités Principales

### 📹 Gestion des Vidéos
- **Enregistrement de matchs** - Démarrez et arrêtez des enregistrements via QR code ou interface
- **Bibliothèque vidéo** - Consultez toutes vos vidéos avec aperçus et métadonnées
- **Téléchargement** - Téléchargez vos vidéos pour les conserver localement
- **Partage** - Partagez vos meilleurs moments avec d'autres joueurs

### ✂️ Création de Clips
- **Éditeur de clips** - Créez des clips de vos meilleurs moments
- **Timeline interactive** - Sélectionnez précisément le moment à extraire
- **Aperçu en temps réel** - Visualisez votre clip avant de l'enregistrer
- **Bibliothèque de clips** - Gérez tous vos clips dans une interface dédiée

### 💳 Système de Crédits
- **Packages de crédits** - 1, 5, 10, ou 25 crédits
- **Paiement sécurisé** - Intégration Konnect / Carte bancaire / Flouci
- **Historique** - Suivez vos achats et consommation de crédits
- **Crédit de bienvenue** - Crédits gratuits à l'inscription

### 💬 Support Client
- **Système de tickets** - Contactez l'équipe support
- **Upload d'images** - Joignez des captures d'écran (max 3 images, 5MB)
- **Suivi des demandes** - Consultez l'historique et les réponses admin
- **Niveaux de priorité** - Basse, Moyenne, Haute

### 👤 Profil Utilisateur
- **Gestion du profil** - Modifiez nom, email, téléphone
- **Changement de mot de passe** - Sécurité renforcée
- **Avatar personnalisé** - Ajoutez votre photo de profil
- **Synchronisation API** - Données en temps réel depuis le backend

## 🛠️ Technologies Utilisées

### Frontend
- **React 18** - Bibliothèque UI moderne
- **TypeScript** - Typage statique pour plus de robustesse
- **Vite** - Build tool ultra-rapide
- **TailwindCSS** - Framework CSS utilitaire
- **Shadcn/ui** - Composants UI réutilisables
- **Framer Motion** - Animations fluides
- **React Router** - Navigation côté client
- **Axios** - Client HTTP

### State Management & Auth
- **Context API** - Gestion d'état globale
- **AuthContext** - Authentification centralisée
- **JWT** - Tokens d'authentification sécurisés

### UI/UX
- **Design System** - Palette de couleurs cohérente
- **Glassmorphism** - Effets de verre moderne
- **Responsive** - Adaptation mobile/tablette/desktop
- **Dark Mode** - Thème sombre par défaut
- **Animations** - Transitions et micro-interactions

## 🚀 Installation

### Prérequis
- Node.js 18+ 
- npm ou pnpm
- Backend MySmash en cours d'exécution

### Installation des dépendances
```bash
npm install
```

### Configuration
Créez un fichier `.env` à la racine :
```env
VITE_API_URL=http://localhost:5000
```

### Démarrage en développement
```bash
npm run dev
```

L'application sera disponible sur `http://localhost:8080`

### Build de production
```bash
npm run build
```

Les fichiers de production seront dans le dossier `dist/`

## 📁 Structure du Projet

```
src/
├── components/         # Composants réutilisables
│   ├── dashboard/     # Composants du dashboard
│   ├── support/       # Composants du support
│   └── ui/            # Composants UI de base
├── contexts/          # Contexts React (Auth, etc.)
├── hooks/             # Custom hooks
├── lib/               # Utilitaires et configurations
│   └── api.ts         # Client API centralisé
├── pages/             # Pages de l'application
│   ├── Dashboard.tsx  # Page d'accueil
│   ├── MyClips.tsx    # Gestion des clips
│   ├── Credits.tsx    # Achat de crédits
│   ├── Support.tsx    # Support client
│   └── Profile.tsx    # Profil utilisateur
└── main.tsx           # Point d'entrée
```

## 🔐 Authentification

L'application utilise un système d'authentification complet :
- **Inscription** - Création de compte joueur/club
- **Connexion** - Email + mot de passe
- **JWT** - Tokens stockés en localStorage
- **Routes protégées** - Redirection automatique si non connecté
- **Refresh user** - Mise à jour automatique des données

## 🎨 Design System

### Palette de Couleurs
- **Primary** - Bleu cyan (#00D9FF)
- **Accent** - Vert néon (#00FF94)  
- **Background** - Noir profond (#0A0A0F)
- **Card** - Gris foncé (#1A1A24)

### Typographie
- **Orbitron** - Titres et éléments importants
- **Inter** - Corps de texte

### Composants Personnalisés
- Buttons avec effet néon
- Cards avec glassmorphism
- Inputs avec bordures animées
- Modals avec backdrop blur

## 📡 API Integration

Toutes les requêtes API passent par `/src/lib/api.ts` :

```typescript
import api from '@/lib/api';

// Exemple d'utilisation
const videos = await api.videoService.getMyVideos();
const clips = await api.clipService.getMyClips();
```

### Services Disponibles
- `authService` - Authentification
- `videoService` - Gestion vidéos
- `clipService` - Gestion clips
- `recordingService` - Enregistrements
- `clubService` - Gestion clubs
- `supportService` - Support client

## 🐛 Corrections Récentes

### UTF-8 Encoding
- ✅ Correction affichage accents français
- ✅ Configuration backend `charset=utf-8`
- ✅ Conversion fichiers source en UTF-8

### Fonctionnalités
- ✅ Bouton play MyClips fonctionnel
- ✅ Format durée vidéo (mm:ss)
- ✅ Profil connecté à l'API
- ✅ Support avec upload d'images
- ✅ Nom utilisateur dynamique

## 📝 Contribution

Pour contribuer au projet :
1. Fork le repository
2. Créez une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est propriétaire. Tous droits réservés.

## 👥 Équipe

Développé par l'équipe MySmash pour révolutionner l'expérience du padel.

## 🔗 Liens Utiles

- **Backend Repository** - [wael22/Spovio-backend](https://github.com/wael22/Spovio-backend)
- **Documentation API** - Disponible via Swagger sur le backend
- **Support** - Utilisez le système de support intégré

---

**Version:** 1.0.0  
**Dernière mise à jour:** Janvier 2026
