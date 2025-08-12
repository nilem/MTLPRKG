# Instructions pour GitHub Copilot : MTLPRKG

## À propos de cette application

MTLPRKG est une application web interactive qui affiche une carte de Montréal avec les informations suivantes :

- **Véhicules disponibles en libre-service** (Leo) avec leur localisation, modèle, plaque d'immatriculation et niveau d'énergie
- **Zones de stationnement** avec leurs restrictions de stationnement en temps réel
- **Signalisation de stationnement** en fonction des réglementations municipales

L'application met en évidence les véhicules à faible autonomie (< 100 km) avec un indicateur visuel ⛽ et affiche les zones de stationnement avec des couleurs différentes selon les restrictions.

## Architecture technique

- **Frontend** : HTML5, CSS3, JavaScript (ES6+)
- **Cartographie** : Leaflet.js pour l'affichage des cartes et des marqueurs
- **HTTP** : Axios pour les requêtes API
- **Tests** : Jest avec environnement jsdom pour tester tous les aspects de l'application

## Règles importantes de développement

### 1. Exécution des tests

**⚠️ IMPORTANT : Après toute modification des fonctionnalités, TOUJOURS exécuter les tests appropriés.**

```bash
# Tests spécifiques à la fonctionnalité modifiée
npm run test:utils          # Pour les fonctions utilitaires (map-utils.js)
npm run test:functionality  # Pour les fonctionnalités de carte
npm run test:dom            # Pour l'intégration DOM
npm run test:utf8           # Pour la vérification de l'encodage UTF-8

# Tous les tests
npm test
```

### 2. Tests concernés selon le fichier modifié

| Fichier modifié | Tests à exécuter |
|-----------------|------------------|
| `map-utils.js` | `npm run test:utils` |
| `restriction_logic.js` | `npm test` |
| `fetchMapLayers.js` | `npm run test:functionality` |
| `index.html` | `npm run test:dom` et `npm run test:utf8` |
| CSS (dans HTML) | `npm run test:dom` |

### 3. Points d'attention particuliers

- **Encodage UTF-8** : Crucial pour l'affichage correct des caractères français
- **Indicateurs de carburant** : Ne pas casser la logique du seuil de 100 km
- **Marqueurs dynamiques** : Vérifier leur mise à l'échelle selon le zoom
- **Popups des marqueurs** : Doit contenir les informations complètes des véhicules/stationnements

### 4. Structure du projet

- `/tests` - Contient tous les tests unitaires et d'intégration
- `map-utils.js` - Fonctions utilitaires essentielles pour la carte
- `restriction_logic.js` - Logique pour analyser les restrictions de stationnement
- `fetchMapLayers.js` - Communication API pour récupérer les données

## Bonnes pratiques de modification

1. **Comprendre d'abord** : Assure-toi de bien comprendre la fonctionnalité avant de la modifier
2. **Tests avant et après** : Exécute les tests avant et après tes modifications
3. **Encodage UTF-8** : Préserve l'encodage UTF-8 dans tous les fichiers modifiés
4. **Commentaires** : Maintiens ou améliore les commentaires existants
5. **Style de code** : Respecte le style existant (indentation, nommage des variables)

## Conseils spécifiques pour l'intégration avec Leaflet

- Les marqueurs sont créés avec `L.marker()` ou `L.divIcon()`
- Les popups sont liés aux marqueurs via `bindPopup()`
- Le zoom de la carte est géré via l'événement `zoomend`
- Les filtres modifient la visibilité des marqueurs sans recréer la carte

## Pour toute aide supplémentaire

Se référer au README.md pour une vue d'ensemble du projet et au code source commenté pour les détails d'implémentation.
