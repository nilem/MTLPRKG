const config = {
    identityBaseUrl: 'https://aima-us.vulog.net/auth/realms/LEO-CAMTR/protocol/openid-connect/token',
    anonymousClientId: 'LEO-CAMTR_anon',
    anonymousClientSecret: '8600ffa0-2304-46fb-8017-d5da7d0fa4f9',
    anonymousBaseUrl: 'https://aima-us.vulog.net/apiv5',
    anonymousApiKey: '18aed9af-ba0f-41de-b4b8-a65aa7fe9c14',
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
