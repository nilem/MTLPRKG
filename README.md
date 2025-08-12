# MTLPRKG - Application de Stationnement Montréal

## ⚠️ Avertissement Important

**Ce code a été entièrement généré par intelligence artificielle et ne représente pas la qualité de code que je produis habituellement.** Ce projet est un exercice d'exploration des capacités de l'IA en développement logiciel et ne doit pas être considéré comme un exemple de mes compétences en programmation ou de mes standards de qualité de code.

## Description du Projet

MTLPRKG est une application web interactive qui affiche une carte de Montréal avec des informations sur :

- **Véhicules disponibles en libre-service** (Communauto/BIXI)
- **Zones de stationnement et leurs restrictions**
- **Signalisation de stationnement en temps réel**

### Fonctionnalités Principales

🚗 **Affichage des Véhicules**
- Localisation des véhicules disponibles sur la carte
- Informations détaillées : modèle, plaque d'immatriculation, niveau d'énergie
- Indicateur visuel pour les véhicules à faible autonomie (< 100 km)

🅿️ **Gestion du Stationnement**
- Visualisation des zones de stationnement réglementées
- Différenciation visuelle entre les zones restreintes et libres
- Analyse des restrictions dans les prochaines 24 heures

🔧 **Outils Interactifs**
- Filtre pour masquer la signalisation de plus de 24h
- Filtre de proximité entre véhicules et zones de stationnement
- Géolocalisation de l'utilisateur
- Générateur de courriel automatique

### Technologies Utilisées

- **Frontend** : HTML5, CSS3, JavaScript (ES6+)
- **Cartographie** : Leaflet.js
- **API** : Axios pour les requêtes HTTP
- **Données** : API Vulog pour les véhicules, données JSON pour le stationnement

### Structure du Projet

```
MTLPRKG/
├── index.html                              # Interface principale
├── index.prod.html                         # Version production
├── fetchMapLayers.js                       # Gestion des API et données
├── restriction_logic.js                    # Logique de traitement des restrictions
├── restriction_logic.test.js               # Tests unitaires
├── create_light_version.py                 # Script de traitement des données
├── generatedEmail.html                     # Template d'email
├── package.json                            # Configuration Node.js
└── assets/
    ├── signalisation_stationnement_full.json
    └── signalisation_stationnement_light.json
```

### Installation et Utilisation

1. **Cloner le repository**
   ```bash
   git clone [URL_DU_REPO]
   cd MTLPRKG
   ```

2. **Installer les dépendances** (pour les tests)
   ```bash
   npm install
   ```

3. **Lancer l'application**
   - Ouvrir `index.html` dans un navigateur web
   - Ou utiliser un serveur local pour éviter les problèmes CORS

4. **Exécuter les tests**
   ```bash
   npm test
   ```

### Fonctionnement

L'application utilise l'API Vulog pour récupérer les véhicules disponibles en temps réel et affiche les données de stationnement à partir de fichiers JSON locaux. Elle analyse les règles de stationnement complexes de Montréal et détermine quelles zones seront restreintes dans les prochaines 24 heures.

### Limitations

- Code généré par IA sans optimisations manuelles
- Peut contenir des pratiques de développement non optimales
- Interface utilisateur basique
- Gestion d'erreurs minimale

---

**Rappel** : Ce projet est uniquement à des fins de démonstration des capacités de l'IA en génération de code et ne reflète pas mes standards professionnels de développement.
