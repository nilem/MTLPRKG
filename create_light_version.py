import json

# Properties to remove
properties_to_remove = [
    "POTEAU_ID_POT", "PANNEAU_ID_PAN", "PANNEAU_ID_RPA", "TOPONYME_PAN",
    "DESCRIPTION_CAT", "POTEAU_VERSION_POT", "DATE_CONCEPTION_POT",
    "PAS_SUR_RUE", "DESCRIPTION_RTP", "X", "Y", "NOM_ARROND",
    "Longitude", "Latitude"
]

# Read the original GeoJSON file
with open('assets/signalisation_stationnement_full.json', 'r') as f:
    data = json.load(f)

# Iterate over features and remove specified properties
if 'features' in data:
    for feature in data['features']:
        if 'properties' in feature:
            properties = feature['properties']
            for prop in properties_to_remove:
                if prop in properties:
                    del properties[prop]

# Write the modified data to a new file
with open('assets/signalisation_stationnement_light.json', 'w') as f:
    json.dump(data, f)

print("Lighter version of the GeoJSON file created as assets/signalisation_stationnement_light.json")
