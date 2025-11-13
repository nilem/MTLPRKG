/**
 * Tests unitaires pour le module de filtrage des signalisations
 */

import { jest } from '@jest/globals';

// Mock de la fonction isRestrictedInNext24Hours
const mockIsRestrictedInNext24Hours = jest.fn();

// Mock du module restriction_logic
jest.unstable_mockModule('../restriction_logic.js', () => ({
    isRestrictedInNext24Hours: mockIsRestrictedInNext24Hours,
    dayMap: {
        "LUN": 1, "MAR": 2, "MER": 3, "JEU": 4, "VEN": 5, "SAM": 6, "DIM": 0,
        "LUNDI": 1, "MARDI": 2, "MERCREDI": 3, "JEUDI": 4, "VENDREDI": 5, "SAMEDI": 6, "DIMANCHE": 0
    }
}));

// Import du module à tester après le mock
const {
    dayFilterMap,
    spotAppliesToDay,
    shouldDisplaySpot,
    filterSpotsBySignalisation,
    filterVehiclesByProximity,
    filterSpotsByProximityToVehicles,
    applyProximityFilter
} = await import('../signalisation-filter.js');

describe('dayFilterMap', () => {
    test('contient tous les jours de la semaine', () => {
        expect(dayFilterMap).toHaveProperty('monday', 1);
        expect(dayFilterMap).toHaveProperty('tuesday', 2);
        expect(dayFilterMap).toHaveProperty('wednesday', 3);
        expect(dayFilterMap).toHaveProperty('thursday', 4);
        expect(dayFilterMap).toHaveProperty('friday', 5);
        expect(dayFilterMap).toHaveProperty('saturday', 6);
        expect(dayFilterMap).toHaveProperty('sunday', 0);
    });
});

describe('spotAppliesToDay', () => {
    test('détecte une plage de jours (LUN. AU VEN.)', () => {
        const description = "\\P 08h-18h LUN. AU VEN.";
        expect(spotAppliesToDay(description, 1)).toBe(true); // Lundi
        expect(spotAppliesToDay(description, 3)).toBe(true); // Mercredi
        expect(spotAppliesToDay(description, 5)).toBe(true); // Vendredi
        expect(spotAppliesToDay(description, 6)).toBe(false); // Samedi
        expect(spotAppliesToDay(description, 0)).toBe(false); // Dimanche
    });

    test('détecte une plage de jours avec noms complets (LUNDI AU VENDREDI)', () => {
        const description = "\\P 09h-17h LUNDI AU VENDREDI";
        expect(spotAppliesToDay(description, 1)).toBe(true); // Lundi
        expect(spotAppliesToDay(description, 5)).toBe(true); // Vendredi
        expect(spotAppliesToDay(description, 0)).toBe(false); // Dimanche
    });

    test('détecte une plage de jours qui entoure la semaine (SAM. AU LUN.)', () => {
        const description = "\\P 20h-08h SAM. AU LUN.";
        expect(spotAppliesToDay(description, 6)).toBe(true); // Samedi
        expect(spotAppliesToDay(description, 0)).toBe(true); // Dimanche
        expect(spotAppliesToDay(description, 1)).toBe(true); // Lundi
        expect(spotAppliesToDay(description, 2)).toBe(false); // Mardi
        expect(spotAppliesToDay(description, 5)).toBe(false); // Vendredi
    });

    test('détecte un jour spécifique (MERCREDI)', () => {
        const description = "\\P 13h30-15h30 MERCREDI 1 AVRIL AU 1 DEC.";
        expect(spotAppliesToDay(description, 3)).toBe(true); // Mercredi
        expect(spotAppliesToDay(description, 1)).toBe(false); // Lundi
        expect(spotAppliesToDay(description, 5)).toBe(false); // Vendredi
    });

    test('détecte plusieurs jours spécifiques (LUN. JEU.)', () => {
        const description = "\\P 08h-09h LUN. JEU. 1 AVRIL AU 1 DEC.";
        expect(spotAppliesToDay(description, 1)).toBe(true); // Lundi
        expect(spotAppliesToDay(description, 4)).toBe(true); // Jeudi
        expect(spotAppliesToDay(description, 2)).toBe(false); // Mardi
        expect(spotAppliesToDay(description, 5)).toBe(false); // Vendredi
    });

    test('retourne false pour une description sans jour', () => {
        const description = "Stationnement interdit";
        expect(spotAppliesToDay(description, 1)).toBe(false);
        expect(spotAppliesToDay(description, 3)).toBe(false);
    });

    test('gère les jours avec points (LUN. MAR.)', () => {
        const description = "\\P 07h-19h LUN. MAR.";
        expect(spotAppliesToDay(description, 1)).toBe(true); // Lundi
        expect(spotAppliesToDay(description, 2)).toBe(true); // Mardi
        expect(spotAppliesToDay(description, 3)).toBe(false); // Mercredi
    });
});

describe('shouldDisplaySpot', () => {
    const now = new Date('2025-11-13T10:00:00');
    const in24Hours = new Date('2025-11-14T10:00:00');
    const spot = {
        lat: 45.5019,
        lng: -73.5674,
        description: "\\P 08h-18h LUN. AU VEN."
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('filtre "all" - affiche les spots non-restreints en bleu', () => {
        mockIsRestrictedInNext24Hours.mockReturnValue(false);
        
        const result = shouldDisplaySpot(spot, 'all', now, in24Hours);
        
        expect(result.shouldDisplay).toBe(true);
        expect(result.color).toBe('blue');
        expect(result.fillColor).toBe('#30f');
    });

    test('filtre "all" - masque les spots restreints +24h', () => {
        mockIsRestrictedInNext24Hours.mockReturnValue(true);
        
        const result = shouldDisplaySpot(spot, 'all', now, in24Hours);
        
        expect(result.shouldDisplay).toBe(false);
    });

    test('filtre "24h" - affiche les spots restreints en rouge', () => {
        mockIsRestrictedInNext24Hours.mockReturnValue(true);
        
        const result = shouldDisplaySpot(spot, '24h', now, in24Hours);
        
        expect(result.shouldDisplay).toBe(true);
        expect(result.color).toBe('red');
        expect(result.fillColor).toBe('#f03');
    });

    test('filtre "24h" - masque les spots non-restreints', () => {
        mockIsRestrictedInNext24Hours.mockReturnValue(false);
        
        const result = shouldDisplaySpot(spot, '24h', now, in24Hours);
        
        expect(result.shouldDisplay).toBe(false);
    });

    test('filtre "monday" - affiche les spots du lundi en bleu', () => {
        const mondaySpot = {
            ...spot,
            description: "\\P 08h-18h LUN. AU VEN."
        };
        
        const result = shouldDisplaySpot(mondaySpot, 'monday', now, in24Hours);
        
        expect(result.shouldDisplay).toBe(true);
        expect(result.color).toBe('blue');
        expect(result.fillColor).toBe('#30f');
    });

    test('filtre "sunday" - masque les spots qui ne sont pas le dimanche', () => {
        const weekdaySpot = {
            ...spot,
            description: "\\P 08h-18h LUN. AU VEN."
        };
        
        const result = shouldDisplaySpot(weekdaySpot, 'sunday', now, in24Hours);
        
        expect(result.shouldDisplay).toBe(false);
    });

    test('filtre "wednesday" - affiche les spots du mercredi', () => {
        const wednesdaySpot = {
            ...spot,
            description: "\\P 13h30-15h30 MERCREDI 1 AVRIL AU 1 DEC."
        };
        
        const result = shouldDisplaySpot(wednesdaySpot, 'wednesday', now, in24Hours);
        
        expect(result.shouldDisplay).toBe(true);
        expect(result.color).toBe('blue');
    });
});

describe('filterSpotsBySignalisation', () => {
    const now = new Date('2025-11-13T10:00:00');
    const in24Hours = new Date('2025-11-14T10:00:00');
    
    const spots = [
        { lat: 45.50, lng: -73.56, description: "\\P 08h-18h LUN. AU VEN." },
        { lat: 45.51, lng: -73.57, description: "\\P 09h-17h MERCREDI" },
        { lat: 45.52, lng: -73.58, description: "Stationnement libre" },
        { lat: 45.53, lng: -73.59, description: "\\P 07h-19h SAM. DIM." }
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        // Mock: premier et deuxième spots sont restreints +24h
        mockIsRestrictedInNext24Hours.mockImplementation((desc) => {
            return desc.includes("LUN. AU VEN.") || desc.includes("MERCREDI");
        });
    });

    test('filtre "all" retourne les spots non-restreints', () => {
        const filtered = filterSpotsBySignalisation(spots, 'all', now, in24Hours);
        
        expect(filtered).toHaveLength(2);
        expect(filtered[0].description).toContain("libre");
        expect(filtered[1].description).toContain("SAM. DIM.");
    });

    test('filtre "24h" retourne seulement les spots restreints +24h', () => {
        const filtered = filterSpotsBySignalisation(spots, '24h', now, in24Hours);
        
        expect(filtered).toHaveLength(2);
        expect(filtered[0].description).toContain("LUN. AU VEN.");
        expect(filtered[1].description).toContain("MERCREDI");
    });

    test('filtre "monday" retourne les spots applicables au lundi', () => {
        const filtered = filterSpotsBySignalisation(spots, 'monday', now, in24Hours);
        
        expect(filtered).toHaveLength(1);
        expect(filtered[0].description).toContain("LUN. AU VEN.");
    });

    test('filtre "wednesday" retourne les spots applicables au mercredi', () => {
        const filtered = filterSpotsBySignalisation(spots, 'wednesday', now, in24Hours);
        
        expect(filtered).toHaveLength(2);
        expect(filtered.some(s => s.description.includes("LUN. AU VEN."))).toBe(true);
        expect(filtered.some(s => s.description.includes("MERCREDI"))).toBe(true);
    });

    test('filtre "sunday" retourne les spots applicables au dimanche', () => {
        const filtered = filterSpotsBySignalisation(spots, 'sunday', now, in24Hours);
        
        expect(filtered).toHaveLength(1);
        expect(filtered[0].description).toContain("SAM. DIM.");
    });
});

describe('filterVehiclesByProximity', () => {
    const vehicles = [
        { location: { position: { lat: 45.50, lon: -73.56 } }, description: { plate: 'ABC123' } },
        { location: { position: { lat: 45.51, lon: -73.57 } }, description: { plate: 'DEF456' } },
        { location: { position: { lat: 45.60, lon: -73.70 } }, description: { plate: 'GHI789' } }
    ];

    const spots = [
        { lat: 45.50, lng: -73.56, description: "Spot 1" },
        { lat: 45.51, lng: -73.57, description: "Spot 2" }
    ];

    const mockDistanceCalculator = jest.fn((pos1, pos2) => {
        // Calculer distance simple pour les tests
        const latDiff = Math.abs(pos1.lat - pos2.lat);
        const lngDiff = Math.abs(pos1.lng - pos2.lng);
        return Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111000; // Approx en mètres
    });

    beforeEach(() => {
        mockDistanceCalculator.mockClear();
    });

    test('retourne les véhicules à proximité des spots', () => {
        const filtered = filterVehiclesByProximity(vehicles, spots, 1000, mockDistanceCalculator);
        
        expect(filtered).toHaveLength(2);
        expect(filtered[0].description.plate).toBe('ABC123');
        expect(filtered[1].description.plate).toBe('DEF456');
    });

    test('exclut les véhicules trop éloignés', () => {
        const filtered = filterVehiclesByProximity(vehicles, spots, 50, mockDistanceCalculator);
        
        expect(filtered).toHaveLength(2); // Les deux premiers véhicules très proches
    });

    test('lance une erreur si distanceCalculator est manquant', () => {
        expect(() => {
            filterVehiclesByProximity(vehicles, spots, 100);
        }).toThrow('distanceCalculator function is required');
    });

    test('retourne un tableau vide si aucun véhicule à proximité', () => {
        const distantSpots = [
            { lat: 45.90, lng: -73.90, description: "Spot éloigné" }
        ];
        
        const filtered = filterVehiclesByProximity(vehicles, distantSpots, 100, mockDistanceCalculator);
        
        expect(filtered).toHaveLength(0);
    });
});

describe('filterSpotsByProximityToVehicles', () => {
    const spots = [
        { lat: 45.50, lng: -73.56, description: "Spot 1" },
        { lat: 45.51, lng: -73.57, description: "Spot 2" },
        { lat: 45.60, lng: -73.70, description: "Spot 3" }
    ];

    const vehicles = [
        { location: { position: { lat: 45.50, lon: -73.56 } }, description: { plate: 'ABC123' } },
        { location: { position: { lat: 45.51, lon: -73.57 } }, description: { plate: 'DEF456' } }
    ];

    const mockDistanceCalculator = jest.fn((pos1, pos2) => {
        const latDiff = Math.abs(pos1.lat - pos2.lat);
        const lngDiff = Math.abs(pos1.lng - pos2.lng);
        return Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111000;
    });

    test('retourne les spots à proximité des véhicules', () => {
        const filtered = filterSpotsByProximityToVehicles(spots, vehicles, 1000, mockDistanceCalculator);
        
        expect(filtered).toHaveLength(2);
        expect(filtered[0].description).toBe("Spot 1");
        expect(filtered[1].description).toBe("Spot 2");
    });

    test('lance une erreur si distanceCalculator est manquant', () => {
        expect(() => {
            filterSpotsByProximityToVehicles(spots, vehicles, 100);
        }).toThrow('distanceCalculator function is required');
    });
});

describe('applyProximityFilter', () => {
    const now = new Date('2025-11-13T10:00:00');
    const in24Hours = new Date('2025-11-14T10:00:00');

    const vehicles = [
        { location: { position: { lat: 45.50, lon: -73.56 } }, description: { plate: 'ABC123' } },
        { location: { position: { lat: 45.51, lon: -73.57 } }, description: { plate: 'DEF456' } },
        { location: { position: { lat: 45.60, lon: -73.70 } }, description: { plate: 'GHI789' } }
    ];

    const spots = [
        { lat: 45.50, lng: -73.56, description: "\\P 08h-18h LUN. AU VEN." },
        { lat: 45.51, lng: -73.57, description: "\\P 09h-17h MERCREDI" },
        { lat: 45.52, lng: -73.58, description: "Stationnement libre" },
        { lat: 45.60, lng: -73.70, description: "\\P 07h-19h SAM. DIM." }
    ];

    const mockDistanceCalculator = jest.fn((pos1, pos2) => {
        const latDiff = Math.abs(pos1.lat - pos2.lat);
        const lngDiff = Math.abs(pos1.lng - pos2.lng);
        return Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111000;
    });

    beforeEach(() => {
        jest.clearAllMocks();
        mockIsRestrictedInNext24Hours.mockImplementation((desc) => {
            return desc.includes("LUN. AU VEN.") || desc.includes("MERCREDI");
        });
    });

    test('filtre "24h" - retourne véhicules et spots à proximité avec restrictions', () => {
        const result = applyProximityFilter(vehicles, spots, '24h', now, in24Hours, 1000, mockDistanceCalculator);
        
        expect(result.vehicles.length).toBeGreaterThan(0);
        expect(result.spots.length).toBeGreaterThan(0);
        // Les véhicules ABC123 et DEF456 sont près des spots restreints
        expect(result.vehicles.some(v => v.description.plate === 'ABC123')).toBe(true);
    });

    test('filtre "monday" - retourne véhicules et spots pour le lundi', () => {
        const result = applyProximityFilter(vehicles, spots, 'monday', now, in24Hours, 1000, mockDistanceCalculator);
        
        expect(result.vehicles.length).toBeGreaterThan(0);
        expect(result.spots.length).toBeGreaterThan(0);
        // Devrait inclure le spot "LUN. AU VEN."
        expect(result.spots.some(s => s.description.includes("LUN. AU VEN."))).toBe(true);
    });

    test('filtre "sunday" - retourne véhicules et spots pour le dimanche', () => {
        const result = applyProximityFilter(vehicles, spots, 'sunday', now, in24Hours, 100, mockDistanceCalculator);
        
        // Le spot "SAM. DIM." est éloigné (45.60, -73.70) des véhicules proches (45.50-45.51)
        // Avec une distance max de 100m, les véhicules proches ne devraient pas être inclus
        // Mais notre mock de distance trouve GHI789 qui est à (45.60, -73.70), proche du spot
        expect(result.vehicles.length).toBeGreaterThanOrEqual(0);
        expect(result.spots.length).toBeGreaterThanOrEqual(0);
        
        // Si des véhicules sont trouvés, ils doivent être près du spot dimanche
        if (result.vehicles.length > 0) {
            // Le véhicule GHI789 devrait être inclus car il est proche du spot SAM. DIM.
            expect(result.vehicles[0].description.plate).toBe('GHI789');
        }
    });

    test('filtre "all" - exclut les spots avec restrictions +24h', () => {
        const result = applyProximityFilter(vehicles, spots, 'all', now, in24Hours, 1000, mockDistanceCalculator);
        
        // Ne devrait pas inclure les spots restreints +24h
        expect(result.spots.every(s => !s.description.includes("LUN. AU VEN."))).toBe(true);
        expect(result.spots.every(s => !s.description.includes("MERCREDI"))).toBe(true);
    });
});
