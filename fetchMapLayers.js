const config = {
    availableVehiclesUrl: 'https://mtlprkg-vulog-proxy.nicolaslemay.workers.dev/availableVehicles',
};

async function getAvailableVehicules() {
    try {
        const options = {
            method: 'GET',
            url: config.availableVehiclesUrl,
            headers: {
                'accept': 'application/json',
            }
        };

        const response = await axios(options);
        console.log("Données de '/availableVehicles' récupérées avec succès depuis le proxy Cloudflare :");
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la récupération des données de '/availableVehicles' :", error.response ? error.response.data : error.message);
    }
}

export { getAvailableVehicules };
