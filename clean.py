import json
import re
import sys
import os

# Copying EXCLUDE_KEYWORDS from scraper.py
EXCLUDE_KEYWORDS = [
    "sentenced", "jailed", "pleaded guilty", "pleads guilty", "found guilty",
    "remanded in custody", "remanded on bail", "verdict", "convicted", "conviction", "acquitted",
    "due in court", "appears in court", "appeared in court", "court appearance", "brought before court",
    "hoax", "fake threat", "false alarm",
    "tribute to", "anniversary of", "vigil for", "memorial for",
    "released from hospital", "stable condition",
    "previous convictions", "prior convictions",
    "historic abuse", "historical",
    "court", "trial", "trials", "judge", "jury", "prosecution", "sentence", "sentences", "sentencing"
]

def load_existing(path):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    match = re.search(r'export const mockIncidents\s*=\s*(\[.*\]);', content, re.DOTALL)
    if match:
        return json.loads(match.group(1))
    return []

def write_data_js(incidents, path):
    js_content = f"""// Irish Stabbings & Crime Tracker - Database of Confirmed/Reported Incidents
// Automatically updated by GitHub Actions scraper bot.
// Total incidents: {len(incidents)}

export const countiesList = [
  "Carlow", "Cavan", "Clare", "Cork", "Donegal", "Dublin", "Galway", "Kerry",
  "Kildare", "Kilkenny", "Laois", "Leitrim", "Limerick", "Longford", "Louth",
  "Mayo", "Meath", "Monaghan", "Offaly", "Roscommon", "Sligo", "Tipperary",
  "Waterford", "Westmeath", "Wexford", "Wicklow"
];

export const mockIncidents = {json.dumps(incidents, indent=2)};
"""
    with open(path, 'w', encoding='utf-8') as f:
        f.write(js_content)

def clean():
    path = 'data.js'
    incidents = load_existing(path)
    clean_incidents = []
    
    for inc in incidents:
        # Don't filter original manual entries
        if str(inc.get('id', '')).islower() and inc.get('id', '').startswith('inc-'):
            clean_incidents.append(inc)
            continue
            
        text_lower = (inc.get("description", "") + " " + (inc.get("source", {}).get("title", "") if isinstance(inc.get("source"), dict) else inc.get("source", ""))).lower()
        
        # Exclude keyword check
        if any(kw in text_lower for kw in EXCLUDE_KEYWORDS):
            continue
            
        clean_incidents.append(inc)
        
    print(f"Cleaned {len(incidents) - len(clean_incidents)} false positives.")
    write_data_js(clean_incidents, path)

if __name__ == "__main__":
    clean()
