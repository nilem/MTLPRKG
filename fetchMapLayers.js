const config = {
    identityBaseUrl: 'https://java-us01.vulog.com/auth/realms/BCAA-CAYVR/protocol/openid-connect/token',
    anonymousClientId: 'BCAA-CAYVR_anon',
    anonymousClientSecret: 'dbe490f4-2f4a-4bef-8c0b-52c0ecedb6c8',
    anonymousBaseUrl: 'https://aima-us.vulog.net/apiv5',
    anonymousApiKey: 'f52e5e56-c7db-4af0-acf5-0d8b13ac4bfc',
    userAgent: 'MonApp/1.0'
};

/**
 * Récupère un nouveau jeton d'accès depuis le service d'identité.
 * @returns {Promise<string>} Le jeton d'accès formaté pour l'en-tête d'autorisation.
 */
async function fetchNewToken() {
    const params = new URLSearchParams();
    params.append('scope', '');
    params.append('client_id', config.anonymousClientId);
    params.append('client_secret', config.anonymousClientSecret);
    params.append('grant_type', 'client_credentials');

    const options = {
        method: 'POST',
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
            'user-agent': config.userAgent
        },
        data: params,
        url: config.identityBaseUrl
    };

    try {
        const response = await axios(options);
        const token = response.data;
        console.log("Nouveau jeton obtenu.");
        return `${token.token_type} ${token.access_token}`;
    } catch (error) {
        console.error("Erreur lors de la récupération du jeton :", error.response ? error.response.data : error.message);
        throw error;
    }
}

/**
 * Récupère les données de "mapping layers" en utilisant un jeton d'authentification.
 */
async function getMappingLayers() {
    try {
        // Comme dans l'exemple de index.ts, nous demandons un jeton deux fois.
        await fetchNewToken();
        const tokenString = await fetchNewToken();

        console.log("Récupération des données de '/mapping/layers'...");

        const options = {
            method: 'GET',
            url: `${config.anonymousBaseUrl}/mapping/layers`,
            headers: {
                'authorization': tokenString,
                'user-agent': config.userAgent,
                'X-API-Key': config.anonymousApiKey,
                'accept': 'application/json'
            }
        };

        const response = await axios(options);
        console.log("Données de '/mapping/layers' récupérées avec succès :");
        console.log(JSON.stringify(response.data, null, 2));
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la récupération des données de '/mapping/layers' :", error.response ? error.response.data : error.message);
    }
}

export { getMappingLayers };
