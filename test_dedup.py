import json
import re

def jaccard_similarity(str1, str2):
    words1 = set(re.findall(r'\b\w{4,}\b', str1.lower()))
    words2 = set(re.findall(r'\b\w{4,}\b', str2.lower()))
    
    if not words1 or not words2: return 0.0
    
    intersection = words1.intersection(words2)
    union = words1.union(words2)
    return len(intersection) / len(union)

def deduplicate(incidents):
    status_priority = {"Garda Confirmed": 3, "Media Reported": 2, "Under Investigation": 1}
    
    unique_incidents = []
    
    for inc in incidents:
        is_duplicate = False
        
        for i, existing in enumerate(unique_incidents):
            if inc["id"] == existing["id"]:
                is_duplicate = True
                break
                
            date_inc_str = inc.get("date", "")[:10]
            date_ex_str = existing.get("date", "")[:10]
            
            try:
                from datetime import datetime
                d1 = datetime.strptime(date_inc_str, "%Y-%m-%d")
                d2 = datetime.strptime(date_ex_str, "%Y-%m-%d")
                date_diff = abs((d1 - d2).days)
            except Exception as e:
                print(f"Exception: {e}")
                date_diff = 999
                
            county_match = (inc["county"] == existing["county"] or 
                            inc["county"] == "Unknown" or 
                            existing["county"] == "Unknown")
            
            print(f"Comparing {inc['id']} vs {existing['id']}: diff={date_diff}, match={county_match}")
            if date_diff <= 4 and county_match:
                sim = jaccard_similarity(inc["description"], existing["description"])
                print(f"   Sim: {sim}")
                if sim > 0.18:
                    is_duplicate = True
                    p1 = status_priority.get(inc["status"], 0)
                    p2 = status_priority.get(existing["status"], 0)
                    if p1 > p2:
                        unique_incidents[i] = inc
                    break
        
        if not is_duplicate:
            print(f"Adding {inc['id']}")
            unique_incidents.append(inc)
            
    return unique_incidents

data = [
    {
    "id": "INC-F6B47F0C",
    "date": "2026-05-18T07:00:00+00:00",
    "county": "Antrim",
    "location": "",
    "description": "Three arrested and man hospitalised following early-morning stabbing incident in Belfast - Irish Mirror",
    "status": "Media Reported",
  },
  {
    "id": "INC-BCB2AA0A",
    "date": "2026-05-17T10:53:36+00:00",
    "county": "Antrim",
    "location": "",
    "description": "West Belfast: Three men arrested after stabbing released on bail - BBC",
    "status": "Media Reported",
  },
  {
    "id": "INC-DD34E52D",
    "date": "2026-05-16T13:25:54+00:00",
    "county": "Antrim",
    "location": "West",
    "description": "Man Stabbed in Both Legs During Violent Assault in West Belfast - vocal.media",
    "status": "Media Reported",
  },
  {
    "id": "INC-AFA4E881",
    "date": "2026-05-16T12:21:01+00:00",
    "county": "Antrim",
    "location": "",
    "description": "Man treated in hospital after being stabbed in both legs in Belfast - BreakingNews.ie",
    "status": "Media Reported",
  },
  {
    "id": "INC-4E4C214B",
    "date": "2026-05-16T10:40:00+00:00",
    "county": "Antrim",
    "location": "",
    "description": "West Belfast: Man taken to hospital after stabbing in Lenadoon Avenue - BBC",
    "status": "Media Reported",
  },
  {
    "id": "INC-4AB3B2BC",
    "date": "2026-05-16T09:42:10+00:00",
    "county": "Antrim",
    "location": "",
    "description": "Three arrested & man stabbed in 'ongoing fight' in Belfast - as area sealed off - The Irish Sun",
    "status": "Media Reported",
  }
]

res = deduplicate(data)
print(f"Final count: {len(res)}")
