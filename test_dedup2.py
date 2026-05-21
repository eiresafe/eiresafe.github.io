import json
import sys
sys.path.append('b:\\WebApps\\stab\\scripts')
from scraper import deduplicate

def test():
    with open('b:\\WebApps\\stab\\data_2026.js', 'r', encoding='utf-8') as f:
        content = f.read()
    import re
    match = re.search(r'export const mockIncidents\s*=\s*(\[.*\]);', content, re.DOTALL)
    if not match:
        print("No match")
        return
    data = json.loads(match.group(1))
    
    antrim_incs = [i for i in data if i.get('county') == 'Antrim']
    print(f"Total Antrim incidents in data: {len(antrim_incs)}")
    
    # Run the scraper's deduplicate on JUST the Antrim ones
    res = deduplicate(antrim_incs)
    print(f"After deduplicate: {len(res)}")
    for r in res:
        print(r['description'])

test()
