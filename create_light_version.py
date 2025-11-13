import json

# Read the original GeoJSON file
with open('assets/signalisation_stationnement_full.json', 'r') as f:
    data = json.load(f)

output_array = []

def should_exclude_sign(description):
    """
    Retourne True si la signalisation doit être exclue.
    On exclut les panneaux sans notion de temps (autobus, taxis, livraison, etc.)
    """
    if not description:
        return True
    
    desc_upper = description.upper()
    
    # Exclusions: panneaux sans notion de temps
    exclusion_keywords = [
        'AUTOBUS',
        'TAXI',
        'ARRÊT INTERDIT',
        'ARRET INTERDIT',
        'DEBARCADERE',
        'DÉBARCADÈRE',
        'LIVRAISON SEULEMENT',
        'RESERVE AUTOBUS',
        'ZONE D\'AUTOBUS',
        'DEBAR. AUTOBUS',
        'PANONCEAU TAXIS',
        'EN TOUT TEMPS',
        'RESERVE'
    ]
    
    for keyword in exclusion_keywords:
        if keyword in desc_upper:
            return True
    
    return False

# Filter features and modify properties
if 'features' in data:
    # Filter out features where:
    # - DESCRIPTION_REP is "Enlevé"
    # - DESCRIPTION_RPA starts with "\P RESERVE" (reserved parking, not useful for us)
    # - DESCRIPTION_RPA doesn't have time-based restrictions (autobus, taxis, etc.)
    filtered_features = [
        feature for feature in data['features']
        if (feature.get('properties', {}).get('DESCRIPTION_REP') != 'Enlevé' and
            not should_exclude_sign(feature.get('properties', {}).get('DESCRIPTION_RPA', '')))
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
