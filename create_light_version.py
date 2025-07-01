import json

# Read the original GeoJSON file
with open('assets/signalisation_stationnement_full.json', 'r') as f:
    data = json.load(f)

output_array = []

# Filter features and modify properties
if 'features' in data:
    # Filter out features where DESCRIPTION_REP is "Enlevé"
    # and features where DESCRIPTION_RPA contains "EN TOUT TEMPS"
    filtered_features = [
        feature for feature in data['features']
        if (feature.get('properties', {}).get('DESCRIPTION_REP') != 'Enlevé' and
            "EN TOUT TEMPS" not in feature.get('properties', {}).get('DESCRIPTION_RPA', ''))
    ]
    
    for feature in filtered_features:
        if 'properties' in feature and 'geometry' in feature:
            properties = feature['properties']
            geometry = feature['geometry']
            
            if 'DESCRIPTION_RPA' in properties and geometry and 'coordinates' in geometry:
                # GeoJSON coordinates are [longitude, latitude]
                longitude, latitude = geometry['coordinates']
                output_array.append([latitude, longitude, properties['DESCRIPTION_RPA']])

# Write the modified data to a new file
with open('assets/signalisation_stationnement_light.json', 'w') as f:
    json.dump(output_array, f)

print("Lighter version of the GeoJSON file created as assets/signalisation_stationnement_light.json")
