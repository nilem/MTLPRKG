import {
    DEFAULT_MOVEMENT_DISTANCE_METERS,
    calculateDistanceMeters,
    hasVehicleMoved
} from '../vehicle-movement.js';

describe('vehicle movement detection', () => {
    test('treats small GPS drift as not moved (FTK7086 case)', () => {
        const previousState = {
            position: {
                lat: 45.465438,
                lon: -73.579525
            },
            lastEnergyLevel: 342
        };

        const currentState = {
            position: {
                lat: 45.465375,
                lon: -73.579537
            },
            lastEnergyLevel: 342
        };

        const distanceMeters = calculateDistanceMeters(previousState.position, currentState.position);

        expect(distanceMeters).toBeLessThan(DEFAULT_MOVEMENT_DISTANCE_METERS);
        expect(hasVehicleMoved(previousState, currentState)).toBe(false);
    });

    test('treats small GPS drift as not moved (FTL1383 case)', () => {
        const previousState = {
            position: {
                lat: 45.464384,
                lon: -73.564781
            },
            lastEnergyLevel: 487
        };

        const currentState = {
            position: {
                lat: 45.464457,
                lon: -73.564827
            },
            lastEnergyLevel: 487
        };

        const distanceMeters = calculateDistanceMeters(previousState.position, currentState.position);

        expect(distanceMeters).toBeLessThan(DEFAULT_MOVEMENT_DISTANCE_METERS);
        expect(hasVehicleMoved(previousState, currentState)).toBe(false);
    });

    test('detects movement when energy level changes', () => {
        const previousState = {
            position: {
                lat: 45.5000,
                lon: -73.5000
            },
            lastEnergyLevel: 220
        };

        const currentState = {
            position: {
                lat: 45.50001,
                lon: -73.50001
            },
            lastEnergyLevel: 218
        };

        expect(hasVehicleMoved(previousState, currentState)).toBe(true);
    });

    test('is conservative when history is missing to avoid false positives', () => {
        const currentState = {
            position: {
                lat: 45.5000,
                lon: -73.5000
            },
            lastEnergyLevel: 200
        };

        expect(hasVehicleMoved(null, currentState)).toBe(false);
        expect(hasVehicleMoved(currentState, null)).toBe(false);
    });
});
