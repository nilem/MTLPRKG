import json

# Properties to remove
properties_to_remove = [
    "POTEAU_ID_POT", "PANNEAU_ID_PAN", "PANNEAU_ID_RPA", "TOPONYME_PAN",
    "DESCRIPTION_CAT", "POTEAU_VERSION_POT", "DATE_CONCEPTION_POT",
    "PAS_SUR_RUE", "DESCRIPTION_RTP", "X", "Y", "NOM_ARROND",
    "Longitude", "Latitude", "DESCRIPTION_REP", "POSITION_POP", "CODE_RPA", "FLECHE_PAN"
]

# Properties to rename
properties_to_rename = {
    "DESCRIPTION_RPA": "D"
}

# Read the original GeoJSON file
with open('assets/signalisation_stationnement_full.json', 'r') as f:
    data = json.load(f)

# Filter features and modify properties
if 'features' in data:
    # Filter out features where DESCRIPTION_REP is "Enlevé"
    filtered_features = [
        feature for feature in data['features']
        if feature.get('properties', {}).get('DESCRIPTION_REP') != 'Enlevé'
    ]
    
    for feature in filtered_features:
        if 'properties' in feature:
            properties = feature['properties']
            
            # Remove specified properties
            for prop in properties_to_remove:
                if prop in properties:
                    del properties[prop]
            
            # Rename specified properties
            props_to_add = {}
            props_to_delete = []
            for old_name, new_name in properties_to_rename.items():
                if old_name in properties:
                    props_to_add[new_name] = properties[old_name]
                    props_to_delete.append(old_name)
            
            for prop in props_to_delete:
                del properties[prop]
            
            properties.update(props_to_add)
    
    data['features'] = filtered_features

# Write the modified data to a new file
with open('assets/signalisation_stationnement_light.json', 'w') as f:
    json.dump(data, f)

print("Lighter version of the GeoJSON file created as assets/signalisation_stationnement_light.json")
