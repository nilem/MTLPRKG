// Utility functions extracted from main application for better testability

/**
 * Calculate marker sizes based on zoom level
 */
function getMarkerSizes(currentZoom) {
    let newRadius, newIconSize;

    if (currentZoom < 13) {
        newRadius = 2;
        newIconSize = [12, 20];
    } else if (currentZoom < 15) {
        newRadius = 4;
        newIconSize = [18, 30];
    } else {
        newRadius = 6;
        newIconSize = [25, 41];
    }
    
    const newIconAnchor = [newIconSize[0] / 2, newIconSize[1]];
    const newPopupAnchor = [1, -newIconSize[1] + 5];
    const newShadowSize = [41, 41];

    return { newRadius, newIconSize, newIconAnchor, newPopupAnchor, newShadowSize };
}

/**
 * Create vehicle description with energy level
 */
function createVehicleDescription(vehicle) {
    const energyLevel = vehicle.status?.energyLevel || 0;
    return `${vehicle.description.model} - ${vehicle.description.plate}<br>Essence: ${energyLevel} km`;
}

/**
 * Check if vehicle has low fuel
 */
function isLowFuelVehicle(energyLevel) {
    return energyLevel < 100;
}

/**
 * Create custom icon for low fuel vehicles
 */
function createLowFuelIcon(iconSize, iconAnchor, popupAnchor) {
    return {
        html: `<div class="vehicle-marker-container" style="width: ${iconSize[0]}px; height: ${iconSize[1]}px;">
            <img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-violet.png" 
                 class="main-marker-icon" style="width: ${iconSize[0]}px; height: ${iconSize[1]}px;">
            <div class="fuel-warning-overlay">⛽</div>
        </div>`,
        iconSize: iconSize,
        iconAnchor: iconAnchor,
        popupAnchor: popupAnchor,
        className: 'custom-vehicle-marker'
    };
}

/**
 * Create standard purple icon for regular vehicles
 */
function createPurpleIcon(iconSize, iconAnchor, popupAnchor, shadowSize) {
    return {
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-violet.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: iconSize,
        iconAnchor: iconAnchor,
        popupAnchor: popupAnchor,
        shadowSize: shadowSize
    };
}

/**
 * Get parking marker options based on restriction status
 */
function getParkingMarkerOptions(isRestricted) {
    const markerOptions = {
        radius: 5,
        fillOpacity: 0.5
    };

    if (isRestricted) {
        markerOptions.color = 'red';
        markerOptions.fillColor = '#f03';
    } else {
        markerOptions.color = 'blue';
        markerOptions.fillColor = '#30f';
    }

    return markerOptions;
}

/**
 * Day and month mappings for restriction parsing
 */
const dayMap = {
    "LUN": 1, "MAR": 2, "MER": 3, "JEU": 4, "VEN": 5, "SAM": 6, "DIM": 0,
    "LUNDI": 1, "MARDI": 2, "MERCREDI": 3, "JEUDI": 4, "VENDREDI": 5, "SAMEDI": 6, "DIMANCHE": 0
};

const monthMap = {
    "JAN": 0, "FEV": 1, "MARS": 2, "AVR": 3, "MAI": 4, "JUIN": 5, "JUI": 6, "AOU": 7, 
    "SEP": 8, "OCT": 9, "NOV": 10, "DEC": 11,
    "JANVIER": 0, "FÉVRIER": 1, "MARS": 2, "AVRIL": 3, "MAI": 4, "JUIN": 5, 
    "JUILLET": 6, "AOÛT": 7, "SEPTEMBRE": 8, "OCTOBRE": 9, "NOVEMBRE": 10, "DÉCEMBRE": 11
};

/**
 * Simplified restriction checker for testing
 */
function isRestrictedSimplified(description) {
    // Basic patterns that indicate parking restrictions
    const restrictionPatterns = [
        /P\s+\d{1,2}H/i,  // P 09H format
        /\d{1,2}h\d{2}-\d{1,2}h\d{2}/i,  // 13h30-15h30 format
        /LUN\s+A\s+VEN/i,  // Monday to Friday
        /AVRIL\s+AU\s+DEC/i,  // April to December
        /interdit/i,  // Stationnement interdit
        /remorquage/i,  // Zone de remorquage
        /autobus/i,  // Arrêt d'autobus
        /défense/i  // Défense de stationner
    ];

    return restrictionPatterns.some(pattern => pattern.test(description));
}

/**
 * Filter vehicles based on proximity to restricted parking
 */
function filterVehiclesByProximity(vehicles, restrictedSpots, maxDistance = 100) {
    return vehicles.filter(vehicle => {
        const vehiclePos = { lat: vehicle.location.position.lat, lng: vehicle.location.position.lon };
        
        return restrictedSpots.some(spot => {
            const distance = calculateDistance(vehiclePos, spot);
            return distance < maxDistance;
        });
    });
}

/**
 * Simple distance calculation (Haversine formula approximation for testing)
 */
function calculateDistance(pos1, pos2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = pos1.lat * Math.PI/180;
    const φ2 = pos2.lat * Math.PI/180;
    const Δφ = (pos2.lat-pos1.lat) * Math.PI/180;
    const Δλ = (pos2.lng-pos1.lng) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
}

/**
 * Validate marker has required properties
 */
function validateMarkerProperties(marker, expectedType) {
    const requiredProps = {
        vehicle: ['bindPopup', 'position', 'description'],
        parking: ['bindPopup', 'position', 'restriction']
    };

    return requiredProps[expectedType] ? 
        requiredProps[expectedType].every(prop => marker.hasOwnProperty(prop)) : 
        false;
}

/**
 * Test helper: Create mock vehicle data
 */
function createMockVehicle(model, plate, energyLevel, lat, lon) {
    return {
        location: { position: { lat, lon } },
        description: { model, plate },
        status: { energyLevel }
    };
}

/**
 * Test helper: Create mock parking spot data  
 */
function createMockParkingSpot(lat, lng, description) {
    return { lat, lng, description };
}

export {
    getMarkerSizes,
    createVehicleDescription,
    isLowFuelVehicle,
    createLowFuelIcon,
    createPurpleIcon,
    getParkingMarkerOptions,
    dayMap as getDayMapping,
    monthMap as getMonthMapping,
    isRestrictedSimplified as isRestrictedParking,
    filterVehiclesByProximity,
    calculateDistance as distance,
    validateMarkerProperties,
    createMockVehicle,
    createMockParkingSpot
};
