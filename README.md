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
├── map-utils.js                            # Fonctions utilitaires pour la carte
├── restriction_logic.js                    # Logique de traitement des restrictions
├── create_light_version.py                 # Script de traitement des données
├── generatedEmail.html                     # Template d'email
├── package.json                            # Configuration Node.js
├── jest.config.json                        # Configuration Jest
├── tests/                                  # Suite de tests complète
│   ├── dom-integration.test.js            # Tests d'intégration DOM
│   ├── map-functionality.test.js          # Tests des fonctionnalités principales
│   ├── map-utils.test.js                  # Tests des fonctions utilitaires
│   ├── restriction_logic.test.js          # Tests de la logique de restrictions
│   └── utf8-check.test.js                 # Tests de protection UTF-8
└── assets/
    ├── signalisation_stationnement_full.json
    └── signalisation_stationnement_light.json
```

### Installation et Utilisation

1. **Installation des dépendances**
   ```bash
   npm install
   ```

2. **Lancement des tests**
   ```bash
   npm test                  # Tous les tests
   npm run test:utf8         # Tests UTF-8 uniquement
   npm run test:functionality # Tests de fonctionnalité
   npm run test:dom          # Tests d'intégration DOM
   npm run test:utils        # Tests d'utilitaires
   ```

   ### Serveur HTTP local (Python)

   Vous pouvez lancer un serveur HTTP simple depuis la racine du projet pour servir les fichiers statiques.

   - **Python 3** (recommandé) :

   ```bash
   python3 -m http.server 8000
   ```

   - **Python 2** :

   ```bash
   python -m SimpleHTTPServer 8000
   ```

   Ouvrez ensuite `http://localhost:8000` dans votre navigateur. Changez le numéro de port si nécessaire.


### Tests et Qualité

Le projet inclut une **suite complète de 50 tests** automatisés qui vérifient :

✅ **Encodage UTF-8** - Détection automatique de problèmes d'encodage  
✅ **Mise à l'échelle des marqueurs** - Adaptation selon le niveau de zoom  
✅ **Affichage des véhicules** - Marqueurs violets et indicateurs de carburant faible  
✅ **Restrictions de stationnement** - Marqueurs colorés selon les restrictions  
✅ **Interactions utilisateur** - Clics et popups fonctionnels  
✅ **Filtres** - Fonctionnalité 24h et proximité  
✅ **Intégration DOM** - Structure HTML et CSS correcte

**Note :** Tous les tests sont organisés dans le dossier `/tests/` pour une meilleure structure du projet.

### Fonctionnement

L'application utilise l'API Vulog pour récupérer les véhicules disponibles en temps réel et affiche les données de stationnement à partir de fichiers JSON locaux. Elle analyse les règles de stationnement complexes de Montréal et détermine quelles zones seront restreintes dans les prochaines 24 heures.

### Limitations

- Code généré par IA sans optimisations manuelles
- Peut contenir des pratiques de développement non optimales
- Interface utilisateur basique
- Gestion d'erreurs minimale

---

**Rappel** : Ce projet est uniquement à des fins de démonstration des capacités de l'IA en génération de code et ne reflète pas mes standards professionnels de développement.
