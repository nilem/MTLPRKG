// Configuration qui fonctionne en développement ET en production

let config;

try {
    // En développement : essaie d'importer config.local.js
    const localConfig = await import('./config.local.js');
    config = localConfig.default;
    console.log('Configuration locale chargée (développement)');
} catch (error) {
    // En production : utilise les variables d'environnement ou valeurs par défaut
    config = {
        identityBaseUrl: process.env.IDENTITY_BASE_URL || 'https://aima-us.vulog.net/auth/realms/LEO-CAMTR/protocol/openid-connect/token',
        anonymousClientId: process.env.ANONYMOUS_CLIENT_ID || 'LEO-CAMTR_anon',
        anonymousClientSecret: process.env.ANONYMOUS_CLIENT_SECRET || '',
        anonymousBaseUrl: process.env.ANONYMOUS_BASE_URL || 'https://aima-us.vulog.net/apiv5',
        anonymousApiKey: process.env.ANONYMOUS_API_KEY || '',
        userAgent: process.env.USER_AGENT || 'MonApp/1.0',
        montrealCityId: process.env.MONTREAL_CITY_ID || '81580773-9478-4d76-86c1-3128d13538cf',
    };
    console.log('Configuration d\'environnement chargée (production)');
}

export default config;
