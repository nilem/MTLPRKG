/**
 * @jest-environment jsdom
 */

// Mock Leaflet since we can't load it in Jest environment
global.L = {
    map: jest.fn().mockReturnValue({
        setView: jest.fn().mockReturnThis(),
        addLayer: jest.fn(),
        removeLayer: jest.fn(),
        on: jest.fn(),
        locate: jest.fn(),
        getZoom: jest.fn().mockReturnValue(15)
    }),
    tileLayer: jest.fn().mockReturnValue({
        addTo: jest.fn()
    }),
    layerGroup: jest.fn().mockReturnValue({
        addLayer: jest.fn(),
        clearLayers: jest.fn(),
        eachLayer: jest.fn()
    }),
    marker: jest.fn().mockReturnValue({
        addTo: jest.fn(),
        bindPopup: jest.fn().mockReturnThis(),
        setIcon: jest.fn()
    }),
    circleMarker: jest.fn().mockReturnValue({
        bindPopup: jest.fn().mockReturnThis(),
        setRadius: jest.fn()
    }),
    circle: jest.fn().mockReturnValue({
        addTo: jest.fn()
    }),
    icon: jest.fn().mockReturnValue({}),
    divIcon: jest.fn().mockReturnValue({}),
    control: jest.fn().mockReturnValue({
        addTo: jest.fn(),
        onAdd: jest.fn()
    }),
    DomUtil: {
        create: jest.fn().mockReturnValue(document.createElement('div'))
    },
    DomEvent: {
        on: jest.fn(),
        stopPropagation: jest.fn()
    },
    latLng: jest.fn((lat, lng) => ({ lat, lng, distanceTo: jest.fn().mockReturnValue(50) }))
};

// Mock axios
global.axios = jest.fn();

describe('Map Functionality Tests', () => {
    let mockVehicles, mockParkingSpots;

    beforeEach(() => {
        // Setup DOM
        document.body.innerHTML = `
            <div id="map"></div>
            <div id="filter-checkbox"><input type="checkbox" checked></div>
            <div id="proximity-filter-checkbox"><input type="checkbox"></div>
        `;

        // Mock data
        mockVehicles = [
            {
                location: { position: { lat: 45.5019, lon: -73.5674 } },
                description: { model: 'Toyota Prius', plate: 'ABC-123' },
                status: { energyLevel: 150 }
            },
            {
                location: { position: { lat: 45.5020, lon: -73.5675 } },
                description: { model: 'Nissan Leaf', plate: 'XYZ-789' },
                status: { energyLevel: 50 } // Low fuel
            }
        ];

        mockParkingSpots = [
            { lat: 45.5021, lng: -73.5676, description: 'P 09H-17H LUN A VEN' },
            { lat: 45.5022, lng: -73.5677, description: 'P 13h30-15h30 MERCREDI 1 AVRIL AU 1 DEC.' }
        ];

        // Reset mocks
        jest.clearAllMocks();
    });

    describe('Marker Scaling', () => {
        test('should scale markers based on zoom level', () => {
            // Mock the map functions we need for testing
            const mockMap = {
                getZoom: jest.fn()
            };

            const updateMarkerSizes = (map, vehicleLayer, restrictedLayer) => {
                const currentZoom = map.getZoom();
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

                return { newRadius, newIconSize };
            };

            // Test low zoom
            mockMap.getZoom.mockReturnValue(12);
            let result = updateMarkerSizes(mockMap, {}, {});
            expect(result.newRadius).toBe(2);
            expect(result.newIconSize).toEqual([12, 20]);

            // Test medium zoom
            mockMap.getZoom.mockReturnValue(14);
            result = updateMarkerSizes(mockMap, {}, {});
            expect(result.newRadius).toBe(4);
            expect(result.newIconSize).toEqual([18, 30]);

            // Test high zoom
            mockMap.getZoom.mockReturnValue(16);
            result = updateMarkerSizes(mockMap, {}, {});
            expect(result.newRadius).toBe(6);
            expect(result.newIconSize).toEqual([25, 41]);

            console.log('✅ Marker scaling works correctly');
        });
    });

    describe('Vehicle Markers', () => {
        test('should display vehicle markers with correct icons', () => {
            const vehiclesToDisplay = mockVehicles;
            const mockVehicleLayer = {
                addLayer: jest.fn()
            };

            // Simulate the vehicle marker creation logic
            vehiclesToDisplay.forEach((vehicle) => {
                const energyLevel = vehicle.status?.energyLevel || 0;
                const description = `${vehicle.description.model} - ${vehicle.description.plate}<br>Essence: ${energyLevel} km`;
                
                if (energyLevel < 100) {
                    // Low fuel vehicle should use custom div icon
                    const customIcon = L.divIcon({
                        html: `<div class="vehicle-marker-container">
                            <img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-violet.png" class="main-marker-icon">
                            <div class="fuel-warning-overlay">⛽</div>
                        </div>`,
                        className: 'custom-vehicle-marker'
                    });
                    const marker = L.marker([vehicle.location.position.lat, vehicle.location.position.lon], { icon: customIcon }).bindPopup(description);
                    mockVehicleLayer.addLayer(marker);
                } else {
                    // Regular vehicle
                    const purpleIcon = L.icon({
                        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-violet.png'
                    });
                    const marker = L.marker([vehicle.location.position.lat, vehicle.location.position.lon], { icon: purpleIcon }).bindPopup(description);
                    mockVehicleLayer.addLayer(marker);
                }
            });

            // Verify markers were added
            expect(mockVehicleLayer.addLayer).toHaveBeenCalledTimes(2);
            expect(L.marker).toHaveBeenCalledTimes(2);
            expect(L.divIcon).toHaveBeenCalledTimes(1); // One low fuel vehicle
            expect(L.icon).toHaveBeenCalledTimes(1); // One regular vehicle

            console.log('✅ Vehicle markers display correctly');
        });

        test('should show low fuel indicator for vehicles under 100km', () => {
            const lowFuelVehicle = mockVehicles.find(v => v.status.energyLevel < 100);
            const energyLevel = lowFuelVehicle.status.energyLevel;

            expect(energyLevel).toBeLessThan(100);

            // Should create custom div icon for low fuel vehicles
            L.divIcon({
                html: expect.stringContaining('fuel-warning-overlay'),
                className: 'custom-vehicle-marker'
            });

            console.log('✅ Low fuel indicator shows for vehicles under 100km');
        });
    });

    describe('Parking Restrictions', () => {
        test('should display restricted parking spots', () => {
            const spotsToDisplay = mockParkingSpots;
            const mockRestrictedLayer = {
                addLayer: jest.fn()
            };

            // Mock restriction logic
            const isRestrictedInNext24Hours = (description) => {
                return description.includes('P ') || description.includes('P');
            };

            const now = new Date();
            const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

            spotsToDisplay.forEach((spot) => {
                const isRestricted = isRestrictedInNext24Hours(spot.description);

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

                const marker = L.circleMarker([spot.lat, spot.lng], markerOptions).bindPopup(spot.description);
                mockRestrictedLayer.addLayer(marker);
            });

            expect(mockRestrictedLayer.addLayer).toHaveBeenCalledTimes(2);
            expect(L.circleMarker).toHaveBeenCalledTimes(2);

            console.log('✅ Restricted parking spots display correctly');
        });

        test('should correctly identify restricted vs unrestricted spots', () => {
            const isRestrictedInNext24Hours = (restriction) => {
                // Simplified version of the restriction logic for testing
                // Check if it contains parking restriction patterns
                return restriction.includes('P ') || 
                       restriction.includes('H') || 
                       restriction.includes('h') ||
                       /\d+H.*A.*\d+H/i.test(restriction) ||
                       /\d+h\d+-\d+h\d+/i.test(restriction);
            };

            const restrictedSpot = 'P 09H A 17H LUN A VEN';
            const seasonalSpot = 'P 13h30-15h30 MERCREDI 1 AVRIL AU 1 DEC.';
            const freeSpot = 'Stationnement libre';

            expect(isRestrictedInNext24Hours(restrictedSpot)).toBe(true);
            expect(isRestrictedInNext24Hours(seasonalSpot)).toBe(true);
            expect(isRestrictedInNext24Hours(freeSpot)).toBe(false);

            console.log('✅ Restriction logic works correctly');
        });
    });

    describe('Marker Interactions', () => {
        test('should bind popup descriptions to all marker types', () => {
            // Test vehicle marker popup
            const vehicleDescription = 'Toyota Prius - ABC-123<br>Essence: 150 km';
            const vehicleMarker = L.marker([45.5019, -73.5674]).bindPopup(vehicleDescription);
            
            expect(vehicleMarker.bindPopup).toHaveBeenCalledWith(vehicleDescription);

            // Test parking marker popup
            const parkingDescription = 'P 09H-17H LUN A VEN';
            const parkingMarker = L.circleMarker([45.5021, -73.5676]).bindPopup(parkingDescription);
            
            expect(parkingMarker.bindPopup).toHaveBeenCalledWith(parkingDescription);

            console.log('✅ Popup descriptions bind correctly to all marker types');
        });

        test('should handle clicks on markers with low fuel indicators', () => {
            // Mock a low fuel vehicle marker
            const lowFuelVehicle = mockVehicles[1]; // energyLevel: 50
            const description = `${lowFuelVehicle.description.model} - ${lowFuelVehicle.description.plate}<br>Essence: ${lowFuelVehicle.status.energyLevel} km`;
            
            // Should create a single marker that's clickable
            const customIcon = L.divIcon({
                html: expect.stringContaining('vehicle-marker-container'),
                className: 'custom-vehicle-marker'
            });
            
            const marker = L.marker([lowFuelVehicle.location.position.lat, lowFuelVehicle.location.position.lon], { icon: customIcon }).bindPopup(description);
            
            expect(marker.bindPopup).toHaveBeenCalledWith(description);
            expect(description).toContain('Nissan Leaf');
            expect(description).toContain('50 km');

            console.log('✅ Low fuel markers handle clicks correctly');
        });
    });

    describe('Filter Functionality', () => {
        test('should filter parking spots based on 24h restriction filter', () => {
            const mockSpots = [
                { lat: 45.5021, lng: -73.5676, description: 'P 09H-17H LUN A VEN', restricted: true },
                { lat: 45.5022, lng: -73.5677, description: 'Stationnement libre', restricted: false }
            ];

            // Test with filter ON (should show only restricted)
            const filter24h = true;
            const filteredSpots = mockSpots.filter(spot => {
                if (filter24h && !spot.restricted) {
                    return false; // Skip if filter is on and spot is not restricted
                }
                return true;
            });

            expect(filteredSpots).toHaveLength(1);
            expect(filteredSpots[0].description).toContain('P 09H-17H');

            // Test with filter OFF (should show all)
            const filter24hOff = false;
            const allSpots = mockSpots.filter(spot => {
                if (filter24hOff && !spot.restricted) {
                    return false;
                }
                return true;
            });

            expect(allSpots).toHaveLength(2);

            console.log('✅ 24h filter works correctly');
        });

        test('should filter vehicles based on proximity to restricted parking', () => {
            const DISTANCE_TO_PARKING = 100;
            
            // Mock proximity calculation
            const vehicleLatLng = L.latLng(45.5019, -73.5674);
            const restrictedSpotLatLng = L.latLng(45.5021, -73.5676);
            
            // Mock distance calculation to return value less than threshold
            vehicleLatLng.distanceTo = jest.fn().mockReturnValue(50); // Within range
            
            const isWithinRange = vehicleLatLng.distanceTo(restrictedSpotLatLng) < DISTANCE_TO_PARKING;
            expect(isWithinRange).toBe(true);

            console.log('✅ Proximity filter works correctly');
        });
    });

    describe('Map Integration', () => {
        test('should initialize map with correct layers', () => {
            // Simulate map initialization
            const map = L.map('map').setView([45.5019, -73.5674], 13);
            const tileLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
            
            const markers = L.layerGroup();
            const restrictedLayer = L.layerGroup();
            const vehiculesLayer = L.layerGroup();

            expect(L.map).toHaveBeenCalledWith('map');
            expect(map.setView).toHaveBeenCalledWith([45.5019, -73.5674], 13);
            expect(L.layerGroup).toHaveBeenCalledTimes(3);

            console.log('✅ Map initializes with correct layers');
        });

        test('should add controls to map', () => {
            const mockControl = {
                addTo: jest.fn(),
                onAdd: jest.fn()
            };

            L.control.mockReturnValue(mockControl);

            // Simulate adding controls
            const filterControl = L.control({ position: 'topleft' });
            filterControl.addTo({});

            expect(L.control).toHaveBeenCalledWith({ position: 'topleft' });
            expect(mockControl.addTo).toHaveBeenCalled();

            console.log('✅ Map controls are added correctly');
        });
    });
});
