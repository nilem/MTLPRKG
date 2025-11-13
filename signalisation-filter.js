/**
 * Module pour gérer le filtrage des signalisations de stationnement
 * Encapsule la logique de filtrage par type de signalisation et jour de la semaine
 */

import { isRestrictedInNext24Hours, dayMap } from './restriction_logic.js';

/**
 * Map des filtres de jour vers les numéros de jour de la semaine
 */
export const dayFilterMap = {
    'monday': 1,
    'tuesday': 2,
    'wednesday': 3,
    'thursday': 4,
    'friday': 5,
    'saturday': 6,
    'sunday': 0
};

/**
 * Vérifie si une signalisation s'applique à un jour spécifique de la semaine
 * @param {string} description - La description de la signalisation
 * @param {number} targetDay - Le numéro du jour cible (0=dimanche, 1=lundi, etc.)
 * @returns {boolean} true si la signalisation s'applique au jour cible
 */
export function spotAppliesToDay(description, targetDay) {
    // Vérifier les formats de restriction par jour
    
    // Format: "LUN. AU VEN." ou "LUNDI AU VENDREDI"
    const regexDayRange = /(LUN|MAR|MER|JEU|VEN|SAM|DIM|LUNDI|MARDI|MERCREDI|JEUDI|VENDREDI|SAMEDI|DIMANCHE)\.?\s+AU\s+(LUN|MAR|MER|JEU|VEN|SAM|DIM|LUNDI|MARDI|MERCREDI|JEUDI|VENDREDI|SAMEDI|DIMANCHE)/i;
    const matchDayRange = description.match(regexDayRange);
    
    if (matchDayRange) {
        const startDayStr = matchDayRange[1].toUpperCase().replace('.', '');
        const endDayStr = matchDayRange[2].toUpperCase().replace('.', '');
        const startDay = dayMap[startDayStr];
        const endDay = dayMap[endDayStr];
        
        if (startDay !== undefined && endDay !== undefined) {
            // Vérifier si targetDay est dans la plage
            if (startDay <= endDay) {
                return targetDay >= startDay && targetDay <= endDay;
            } else {
                // Plage qui entoure la semaine (ex: SAM à LUN)
                return targetDay >= startDay || targetDay <= endDay;
            }
        }
    }
    
    // Format: jours multiples "LUN. JEU." ou spécifique "MERCREDI"
    const daysInDescription = [];
    for (const [dayName, dayNum] of Object.entries(dayMap)) {
        // Créer un regex pour chaque jour avec des limites de mots
        const dayRegex = new RegExp(`\\b${dayName}\\.?\\b`, 'i');
        if (dayRegex.test(description)) {
            daysInDescription.push(dayNum);
        }
    }
    
    if (daysInDescription.length > 0) {
        return daysInDescription.includes(targetDay);
    }
    
    return false;
}

/**
 * Détermine si un spot doit être affiché selon le filtre de signalisation sélectionné
 * @param {Object} spot - Le spot de stationnement {lat, lng, description}
 * @param {string} filterValue - La valeur du filtre ('all', '24h', ou un jour)
 * @param {Date} now - La date/heure actuelle
 * @param {Date} in24Hours - La date/heure dans 24 heures
 * @returns {Object} {shouldDisplay: boolean, color: string, fillColor: string}
 */
export function shouldDisplaySpot(spot, filterValue, now, in24Hours) {
    const isRestricted = isRestrictedInNext24Hours(spot.description, now, in24Hours);
    
    let shouldDisplay = false;
    let color = 'blue';
    let fillColor = '#30f';
    
    if (filterValue === 'all') {
        // Afficher tous les points SAUF les restrictions +24h
        shouldDisplay = !isRestricted;
        color = 'blue';
        fillColor = '#30f';
    } else if (filterValue === '24h') {
        // Afficher seulement les restrictions +24h en rouge
        shouldDisplay = isRestricted;
        color = 'red';
        fillColor = '#f03';
    } else if (dayFilterMap[filterValue] !== undefined) {
        // Filtrage par jour spécifique - afficher en bleu
        const targetDay = dayFilterMap[filterValue];
        shouldDisplay = spotAppliesToDay(spot.description, targetDay);
        color = 'blue';
        fillColor = '#30f';
    }
    
    return { shouldDisplay, color, fillColor };
}

/**
 * Filtre les spots de stationnement selon le type de filtre sélectionné
 * @param {Array} allSpots - Tous les spots de stationnement
 * @param {string} filterValue - La valeur du filtre ('all', '24h', ou un jour)
 * @param {Date} now - La date/heure actuelle
 * @param {Date} in24Hours - La date/heure dans 24 heures
 * @returns {Array} Les spots filtrés
 */
export function filterSpotsBySignalisation(allSpots, filterValue, now, in24Hours) {
    return allSpots.filter(spot => {
        const { shouldDisplay } = shouldDisplaySpot(spot, filterValue, now, in24Hours);
        return shouldDisplay;
    });
}

/**
 * Filtre les véhicules selon leur proximité aux spots affichés
 * @param {Array} allVehicles - Tous les véhicules
 * @param {Array} filteredSpots - Les spots filtrés à afficher
 * @param {number} maxDistance - Distance maximale en mètres (défaut: 100m)
 * @param {Function} distanceCalculator - Fonction pour calculer la distance (doit accepter deux L.latLng)
 * @returns {Array} Les véhicules à proximité des spots filtrés
 */
export function filterVehiclesByProximity(allVehicles, filteredSpots, maxDistance = 100, distanceCalculator) {
    if (!distanceCalculator) {
        throw new Error('distanceCalculator function is required');
    }
    
    const filteredSpotLatLngs = filteredSpots.map(s => ({ lat: s.lat, lng: s.lng }));
    
    return allVehicles.filter(v => {
        const vehicleLatLng = { lat: v.location.position.lat, lng: v.location.position.lon };
        return filteredSpotLatLngs.some(spotLatLng => {
            const distance = distanceCalculator(vehicleLatLng, spotLatLng);
            return distance < maxDistance;
        });
    });
}

/**
 * Filtre les spots selon leur proximité aux véhicules affichés
 * @param {Array} allSpots - Tous les spots de stationnement
 * @param {Array} filteredVehicles - Les véhicules filtrés
 * @param {number} maxDistance - Distance maximale en mètres (défaut: 100m)
 * @param {Function} distanceCalculator - Fonction pour calculer la distance
 * @returns {Array} Les spots à proximité des véhicules filtrés
 */
export function filterSpotsByProximityToVehicles(allSpots, filteredVehicles, maxDistance = 100, distanceCalculator) {
    if (!distanceCalculator) {
        throw new Error('distanceCalculator function is required');
    }
    
    const vehicleLatLngs = filteredVehicles.map(v => ({ 
        lat: v.location.position.lat, 
        lng: v.location.position.lon 
    }));
    
    return allSpots.filter(spot => {
        const spotLatLng = { lat: spot.lat, lng: spot.lng };
        return vehicleLatLngs.some(vehicleLatLng => {
            const distance = distanceCalculator(spotLatLng, vehicleLatLng);
            return distance < maxDistance;
        });
    });
}

/**
 * Applique le filtre de proximité complet (véhicules <-> spots)
 * @param {Array} allVehicles - Tous les véhicules
 * @param {Array} allSpots - Tous les spots
 * @param {string} filterValue - La valeur du filtre de signalisation
 * @param {Date} now - La date/heure actuelle
 * @param {Date} in24Hours - La date/heure dans 24 heures
 * @param {number} maxDistance - Distance maximale en mètres
 * @param {Function} distanceCalculator - Fonction pour calculer la distance
 * @returns {Object} {vehicles: Array, spots: Array}
 */
export function applyProximityFilter(allVehicles, allSpots, filterValue, now, in24Hours, maxDistance = 100, distanceCalculator) {
    // 1. Filtrer les spots selon le filtre de signalisation
    const filteredSpots = filterSpotsBySignalisation(allSpots, filterValue, now, in24Hours);
    
    // 2. Trouver les véhicules à proximité de ces spots
    const vehiclesToDisplay = filterVehiclesByProximity(allVehicles, filteredSpots, maxDistance, distanceCalculator);
    
    // 3. Filtrer les spots pour ne garder que ceux à proximité des véhicules trouvés
    const spotsToDisplay = filterSpotsByProximityToVehicles(allSpots, vehiclesToDisplay, maxDistance, distanceCalculator);
    
    return { vehicles: vehiclesToDisplay, spots: spotsToDisplay };
}
