/**
 * @jest-environment jsdom
 */

// Mock jest functions for non-jsdom environment
const mockJest = {
    fn: () => () => {}
};

const {
    getMarkerSizes,
    createVehicleDescription,
    isLowFuelVehicle,
    createLowFuelIcon,
    createPurpleIcon,
    getParkingMarkerOptions,
    getDayMapping,
    getMonthMapping,
    isRestrictedParking,
    distance,
    filterVehiclesByProximity,
    validateMarkerProperties,
    createMockVehicle,
    createMockParkingSpot
} = require('../map-utils.js');

describe('Map Utilities Tests', () => {
    
    describe('Marker Scaling', () => {
        test('should return correct sizes for different zoom levels', () => {
            // Test low zoom
            const lowZoom = getMarkerSizes(10);
            expect(lowZoom.newRadius).toBe(2);
            expect(lowZoom.newIconSize).toEqual([12, 20]);
            expect(lowZoom.newIconAnchor).toEqual([6, 20]); // [iconSize[0]/2, iconSize[1]]

            // Test medium zoom
            const mediumZoom = getMarkerSizes(14);
            expect(mediumZoom.newRadius).toBe(4);
            expect(mediumZoom.newIconSize).toEqual([18, 30]);
            expect(mediumZoom.newIconAnchor).toEqual([9, 30]); // [iconSize[0]/2, iconSize[1]]

            // Test high zoom
            const highZoom = getMarkerSizes(16);
            expect(highZoom.newRadius).toBe(6);
            expect(highZoom.newIconSize).toEqual([25, 41]);
            expect(highZoom.newIconAnchor).toEqual([12.5, 41]); // [iconSize[0]/2, iconSize[1]]

            console.log('✅ Marker scaling functions correctly for all zoom levels');
        });

        test('should calculate popup anchor correctly', () => {
            const result = getMarkerSizes(15);
            expect(result.newPopupAnchor).toEqual([1, -36]); // 1, -iconSize[1] + 5 = 1, -41 + 5
            console.log('✅ Popup anchor calculation is correct');
        });
    });

    describe('Vehicle Functions', () => {
        test('should create correct vehicle descriptions', () => {
            const vehicle1 = createMockVehicle('Toyota Prius', 'ABC-123', 150, 45.5, -73.5);
            const vehicle2 = createMockVehicle('Nissan Leaf', 'XYZ-789', 50, 45.6, -73.6);

            const desc1 = createVehicleDescription(vehicle1);
            const desc2 = createVehicleDescription(vehicle2);

            expect(desc1).toBe('Toyota Prius - ABC-123<br>Essence: 150 km');
            expect(desc2).toBe('Nissan Leaf - XYZ-789<br>Essence: 50 km');

            console.log('✅ Vehicle descriptions are created correctly');
        });

        test('should handle vehicles with missing energy data', () => {
            const vehicleNoEnergy = {
                location: { position: { lat: 45.5, lon: -73.5 } },
                description: { model: 'Unknown Car', plate: 'NO-DATA' },
                status: {} // No energyLevel
            };

            const description = createVehicleDescription(vehicleNoEnergy);
            expect(description).toBe('Unknown Car - NO-DATA<br>Essence: 0 km');

            console.log('✅ Handles missing energy data gracefully');
        });

        test('should correctly identify low fuel vehicles', () => {
            expect(isLowFuelVehicle(150)).toBe(false);
            expect(isLowFuelVehicle(100)).toBe(false);
            expect(isLowFuelVehicle(99)).toBe(true);
            expect(isLowFuelVehicle(50)).toBe(true);
            expect(isLowFuelVehicle(0)).toBe(true);

            console.log('✅ Low fuel identification works correctly');
        });
    });

    describe('Icon Creation', () => {
        test('should create low fuel icon with correct properties', () => {
            const iconSize = [25, 41];
            const iconAnchor = [12, 20];
            const popupAnchor = [1, -34];

            const lowFuelIcon = createLowFuelIcon(iconSize, iconAnchor, popupAnchor);

            expect(lowFuelIcon.iconSize).toEqual(iconSize);
            expect(lowFuelIcon.iconAnchor).toEqual(iconAnchor);
            expect(lowFuelIcon.popupAnchor).toEqual(popupAnchor);
            expect(lowFuelIcon.className).toBe('custom-vehicle-marker');
            expect(lowFuelIcon.html).toContain('fuel-warning-overlay');
            expect(lowFuelIcon.html).toContain('⛽');

            console.log('✅ Low fuel icon creation works correctly');
        });

        test('should create purple icon with correct properties', () => {
            const iconSize = [25, 41];
            const iconAnchor = [12, 20];
            const popupAnchor = [1, -34];
            const shadowSize = [41, 41];

            const purpleIcon = createPurpleIcon(iconSize, iconAnchor, popupAnchor, shadowSize);

            expect(purpleIcon.iconSize).toEqual(iconSize);
            expect(purpleIcon.iconAnchor).toEqual(iconAnchor);
            expect(purpleIcon.popupAnchor).toEqual(popupAnchor);
            expect(purpleIcon.shadowSize).toEqual(shadowSize);
            expect(purpleIcon.iconUrl).toContain('marker-icon-violet.png');

            console.log('✅ Purple icon creation works correctly');
        });
    });

    describe('Parking Functions', () => {
        test('should create correct parking marker options', () => {
            const restrictedOptions = getParkingMarkerOptions(true);
            const unrestricted = getParkingMarkerOptions(false);

            expect(restrictedOptions.color).toBe('red');
            expect(restrictedOptions.fillColor).toBe('#f03');
            expect(restrictedOptions.radius).toBe(5);
            expect(restrictedOptions.fillOpacity).toBe(0.5);

            expect(unrestricted.color).toBe('blue');
            expect(unrestricted.fillColor).toBe('#30f');
            expect(unrestricted.radius).toBe(5);

            console.log('✅ Parking marker options are correct');
        });

        test('should correctly map days and months', () => {
            expect(getDayMapping["LUN"]).toBe(1);
            expect(getDayMapping["DIMANCHE"]).toBe(0);
            expect(getDayMapping["VEN"]).toBe(5);
            
            expect(getMonthMapping["JANVIER"]).toBe(0);
            expect(getMonthMapping["DÉCEMBRE"]).toBe(11);
            
            console.log('✅ Day and month mappings are correct');
        });

        test('should identify restricted parking spots', () => {
            const restricted1 = 'Stationnement interdit en tout temps';
            const restricted2 = 'Zone de remorquage';  
            const restricted3 = 'Arrêt d\'autobus';
            const free = 'Stationnement libre';

            expect(isRestrictedParking(restricted1)).toBe(true);
            expect(isRestrictedParking(restricted2)).toBe(true);
            expect(isRestrictedParking(restricted3)).toBe(true);
            expect(isRestrictedParking(free)).toBe(false);
            
            console.log('✅ Parking restriction identification works correctly');
        });
    });

    describe('Proximity Filtering', () => {
        test('should calculate distance between two points', () => {
            const montreal1 = { lat: 45.5017, lng: -73.5673 };
            const montreal2 = { lat: 45.5020, lng: -73.5675 };

            const calculatedDistance = distance(montreal1, montreal2);
            
            // Distance should be small (about 10-20 meters for such close coordinates)
            expect(calculatedDistance).toBeGreaterThan(5);
            expect(calculatedDistance).toBeLessThan(100);
            
            console.log('✅ Distance calculation works correctly');
        });        test('should filter vehicles by proximity to restricted spots', () => {
            const vehicles = [
                createMockVehicle('Car1', 'ABC-123', 100, 45.5019, -73.5674),
                createMockVehicle('Car2', 'DEF-456', 100, 45.6000, -73.6000), // Far away
                createMockVehicle('Car3', 'GHI-789', 100, 45.5020, -73.5675)  // Close
            ];

            const restrictedSpots = [
                createMockParkingSpot(45.5019, -73.5674, 'P 09H-17H'),
                createMockParkingSpot(45.5021, -73.5676, 'P 13H-15H')
            ];

            const nearbyVehicles = filterVehiclesByProximity(vehicles, restrictedSpots, 200);
            
            expect(nearbyVehicles).toHaveLength(2); // Car1 and Car3 should be included
            expect(nearbyVehicles.find(v => v.description.plate === 'DEF-456')).toBeUndefined();

            console.log('✅ Proximity filtering works correctly');
        });
    });

    describe('Validation Functions', () => {
        test('should validate marker properties correctly', () => {
            const validVehicleMarker = {
                bindPopup: mockJest.fn(),
                position: { lat: 45.5, lng: -73.5 },
                description: 'Test vehicle'
            };

            const validParkingMarker = {
                bindPopup: mockJest.fn(),
                position: { lat: 45.5, lng: -73.5 },
                restriction: 'P 09H-17H'
            };

            const invalidMarker = {
                bindPopup: mockJest.fn()
                // Missing required properties
            };

            expect(validateMarkerProperties(validVehicleMarker, 'vehicle')).toBe(true);
            expect(validateMarkerProperties(validParkingMarker, 'parking')).toBe(true);
            expect(validateMarkerProperties(invalidMarker, 'vehicle')).toBe(false);

            console.log('✅ Marker property validation works correctly');
        });
    });

    describe('Mock Data Creation', () => {
        test('should create mock vehicle data correctly', () => {
            const vehicle = createMockVehicle('Tesla Model 3', 'ELC-001', 250, 45.5, -73.5);

            expect(vehicle.location.position.lat).toBe(45.5);
            expect(vehicle.location.position.lon).toBe(-73.5);
            expect(vehicle.description.model).toBe('Tesla Model 3');
            expect(vehicle.description.plate).toBe('ELC-001');
            expect(vehicle.status.energyLevel).toBe(250);

            console.log('✅ Mock vehicle creation works correctly');
        });

        test('should create mock parking spot data correctly', () => {
            const spot = createMockParkingSpot(45.5, -73.5, 'P 09H-17H LUN A VEN');

            expect(spot.lat).toBe(45.5);
            expect(spot.lng).toBe(-73.5);
            expect(spot.description).toBe('P 09H-17H LUN A VEN');

            console.log('✅ Mock parking spot creation works correctly');
        });
    });
});

// Integration test to verify all utilities work together
describe('Integration Tests', () => {
    test('should handle complete marker creation workflow', () => {
        // Create test data
        const vehicle = createMockVehicle('Toyota Prius', 'ABC-123', 50, 45.5, -73.5);
        const spot = createMockParkingSpot(45.5, -73.5, 'P 09H-17H LUN A VEN');

        // Test vehicle processing
        const description = createVehicleDescription(vehicle);
        const isLowFuel = isLowFuelVehicle(vehicle.status.energyLevel);
        
        expect(description).toContain('Toyota Prius');
        expect(description).toContain('50 km');
        expect(isLowFuel).toBe(true);

        // Test parking processing
        const isRestricted = isRestrictedParking(spot.description);
        const markerOptions = getParkingMarkerOptions(isRestricted);

        expect(isRestricted).toBe(true);
        expect(markerOptions.color).toBe('red');

        // Test scaling
        const sizes = getMarkerSizes(15);
        const lowFuelIcon = createLowFuelIcon(sizes.newIconSize, sizes.newIconAnchor, sizes.newPopupAnchor);
        
        expect(lowFuelIcon.iconSize).toEqual([25, 41]);
        expect(lowFuelIcon.html).toContain('⛽');

        console.log('✅ Complete marker creation workflow works correctly');
    });
});
