/**
 * Formats the time elapsed since the last update
 * @param {string} lastUpdateStr - ISO date string of the last update
 * @returns {string} - Formatted time string (e.g., "2h", "1j 3h", "15min")
 */
function formatTimeSinceLastUpdate(lastUpdateStr) {
    console.log('formatTimeSinceLastUpdate', lastUpdateStr);
    if (!lastUpdateStr) {
        return 'Inconnu';
    }
    
    const lastUpdate = new Date(lastUpdateStr);
    const now = new Date();
    const diffMs = now - lastUpdate;
    
    if (diffMs < 0) {
        return 'Maintenant';
    }
    
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
        const remainingHours = diffHours % 24;
        if (remainingHours > 0) {
            return `${diffDays}j ${remainingHours}h`;
        } else {
            return `${diffDays}j`;
        }
    } else if (diffHours > 0) {
        return `${diffHours}h`;
    } else if (diffMinutes > 0) {
        return `${diffMinutes}min`;
    } else {
        return 'Maintenant';
    }
}

// Export for CommonJS (tests)
export { formatTimeSinceLastUpdate };
