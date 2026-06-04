/**
 * Threshold to classify a movement as real and not GPS jitter.
 */
export const DEFAULT_MOVEMENT_DISTANCE_METERS = 20;

function isFiniteNumber(value) {
    return typeof value === 'number' && Number.isFinite(value);
}

/**
 * Returns the distance between two GPS points in meters.
 */
export function calculateDistanceMeters(position1, position2) {
    if (!position1 || !position2) {
        return Number.POSITIVE_INFINITY;
    }

    const { lat: lat1, lon: lon1 } = position1;
    const { lat: lat2, lon: lon2 } = position2;

    if (!isFiniteNumber(lat1) || !isFiniteNumber(lon1) || !isFiniteNumber(lat2) || !isFiniteNumber(lon2)) {
        return Number.POSITIVE_INFINITY;
    }

    const earthRadiusMeters = 6371000;
    const toRadians = (degrees) => (degrees * Math.PI) / 180;

    const phi1 = toRadians(lat1);
    const phi2 = toRadians(lat2);
    const deltaPhi = toRadians(lat2 - lat1);
    const deltaLambda = toRadians(lon2 - lon1);

    const haversineA =
        Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
        Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);

    const haversineC = 2 * Math.atan2(Math.sqrt(haversineA), Math.sqrt(1 - haversineA));

    return earthRadiusMeters * haversineC;
}

/**
 * Detects vehicle movement using both battery variation and geographic displacement.
 * Missing historical data is treated as "not enough evidence of movement" to avoid false positives.
 */
export function hasVehicleMoved(vehicleState1, vehicleState2, options = {}) {
    if (!vehicleState1 || !vehicleState2) {
        return false;
    }

    const energy1 = vehicleState1.lastEnergyLevel;
    const energy2 = vehicleState2.lastEnergyLevel;
    const energyChanged = isFiniteNumber(energy1) && isFiniteNumber(energy2) && energy1 !== energy2;

    if (energyChanged) {
        return true;
    }

    const distanceThresholdMeters = isFiniteNumber(options.distanceThresholdMeters)
        ? options.distanceThresholdMeters
        : DEFAULT_MOVEMENT_DISTANCE_METERS;

    const distanceMeters = calculateDistanceMeters(vehicleState1.position, vehicleState2.position);

    if (!Number.isFinite(distanceMeters)) {
        return false;
    }

    return distanceMeters >= distanceThresholdMeters;
}
