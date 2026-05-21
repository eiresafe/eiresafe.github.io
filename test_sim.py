import json
import re

def jaccard_similarity(str1, str2):
    words1 = set(re.findall(r'\b\w{4,}\b', str1.lower()))
    words2 = set(re.findall(r'\b\w{4,}\b', str2.lower()))
    
    if not words1 or not words2: return 0.0
    
    intersection = words1.intersection(words2)
    union = words1.union(words2)
    return len(intersection) / len(union), words1, words2, intersection

titles = [
    "Three arrested and man hospitalised following early-morning stabbing incident in Belfast - Irish Mirror",
    "West Belfast: Three men arrested after stabbing released on bail - BBC",
    "Man Stabbed in Both Legs During Violent Assault in West Belfast - vocal.media",
    "Man treated in hospital after being stabbed in both legs in Belfast - BreakingNews.ie",
    "West Belfast: Man taken to hospital after stabbing in Lenadoon Avenue - BBC",
    "Three arrested & man stabbed in 'ongoing fight' in Belfast - as area sealed off - The Irish Sun"
]

for i in range(len(titles)):
    for j in range(i+1, len(titles)):
        sim, w1, w2, int = jaccard_similarity(titles[i], titles[j])
        print(f"Similarity between {i} and {j}: {sim}")
        print(f"Int: {int}")
