import argparse
import datetime
import hashlib
import json
import logging
import os
import re
import time
import urllib.parse
from dateutil import parser
import requests
from bs4 import BeautifulSoup

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
    "Accept-Language": "en-IE,en;q=0.9",
}
REQUEST_TIMEOUT = 20
THROTTLE_SECS = 1.2

MIN_YEAR = datetime.datetime.now(datetime.timezone.utc).year - 30

REQUIRED_KEYWORDS = ["stab", "knife", "blade", "slash", "knifed", "knife attack", "knife crime", "knife wound", "stabbing"]

IRELAND_SIGNALS = [
    "ireland", "dublin", "cork", "limerick", "galway", "waterford", "belfast", "derry", "northern ireland",
    "garda", "an garda", "donegal", "kildare", "meath", "wicklow", "wexford", "kilkenny", "tipperary", "clare",
    "mayo", "sligo", "leitrim", "roscommon", "cavan", "monaghan", "louth", "longford", "westmeath", "offaly",
    "laois", "carlow", "drogheda", "dundalk", "bray", "navan", "ennis", "tralee", "killarney", "athlone",
    "mullingar", "psni", "northern irish"
]

EXCLUDE_KEYWORDS = [
    "sentenced", "jailed", "pleaded guilty", "pleads guilty", "found guilty",
    "remanded in custody", "remanded on bail", "verdict", "convicted", "conviction", "acquitted",
    "due in court", "appears in court", "appeared in court", "court appearance", "brought before court",
    "hoax", "fake threat", "false alarm",
    "tribute to", "anniversary of", "vigil for", "memorial for",
    "released from hospital", "stable condition",
    "previous convictions", "prior convictions",
    "historic abuse", "historical"
]

COUNTY_MAP = {
    "dublin": "Dublin", "cork": "Cork", "limerick": "Limerick", "galway": "Galway", "waterford": "Waterford",
    "belfast": "Antrim", "derry": "Derry", "londonderry": "Derry", "donegal": "Donegal", "kildare": "Kildare",
    "meath": "Meath", "wicklow": "Wicklow", "wexford": "Wexford", "kilkenny": "Kilkenny", "tipperary": "Tipperary",
    "clare": "Clare", "mayo": "Mayo", "sligo": "Sligo", "leitrim": "Leitrim", "roscommon": "Roscommon",
    "cavan": "Cavan", "monaghan": "Monaghan", "louth": "Louth", "longford": "Longford", "westmeath": "Westmeath",
    "offaly": "Offaly", "laois": "Laois", "carlow": "Carlow", "drogheda": "Louth", "dundalk": "Louth",
    "bray": "Wicklow", "navan": "Meath", "ennis": "Clare", "tralee": "Kerry", "killarney": "Kerry",
    "athlone": "Westmeath", "mullingar": "Westmeath", "antrim": "Antrim", "armagh": "Armagh", "tyrone": "Tyrone",
    "fermanagh": "Fermanagh", "down": "Down", "omagh": "Tyrone", "newry": "Down", "lisburn": "Antrim"
}

def get(url, **kwargs):
    time.sleep(THROTTLE_SECS)
    kwargs.setdefault("headers", HEADERS)
    kwargs.setdefault("timeout", REQUEST_TIMEOUT)
    
    for attempt in range(1, 4):
        try:
            response = requests.get(url, **kwargs)
            response.raise_for_status()
            return response
        except requests.RequestException as e:
            logger.debug(f"Request failed (attempt {attempt}/3): {url} - {e}")
            if attempt < 3:
                time.sleep(3 * attempt)
    return None

def is_relevant(text):
    text_lower = text.lower()
    
    # 1. Check for negative keywords
    if any(ex_kw in text_lower for ex_kw in EXCLUDE_KEYWORDS):
        return False
        
    # 2. Date-proximity check
    # Reject if it mentions any year from 1900 to (MIN_YEAR - 1).
    past_years = [str(y) for y in range(1900, MIN_YEAR)]
    if any(re.search(r'\b' + y + r'\b', text_lower) for y in past_years):
        return False
        
    has_keyword = any(kw in text_lower for kw in REQUIRED_KEYWORDS)
    has_signal = any(sig in text_lower for sig in IRELAND_SIGNALS)
    return has_keyword and has_signal

def extract_county(text):
    text_lower = text.lower()
    for key, county in COUNTY_MAP.items():
        if re.search(r'\b' + re.escape(key) + r'\b', text_lower):
            return county
    return "Unknown"

def extract_location_detail(text):
    patterns = [
        r'in ([A-Z][a-zA-Z\s\-]{2,30}),?\s(?:Co\.?\s)?(?:Dublin|Cork|Limerick|Galway|Waterford|Belfast|Derry)',
        r'(?:at|on|near|outside)\s([A-Z][a-zA-Z\s\-]{2,40}(?:Street|Road|Avenue|Lane|Square|Park|Court|Drive|Place|Close|Way|Gardens|Terrace))',
        r'in\s([A-Z][a-zA-Z\s\-]{2,25}),\s(?:Co\.|County\s)?([A-Z][a-zA-Z]+)'
    ]
    for p in patterns:
        match = re.search(p, text)
        if match:
            return match.group(1).strip()[:60]
    return ""

def parse_date(raw):
    try:
        dt = parser.parse(raw, fuzzy=True)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=datetime.timezone.utc)
        return dt.isoformat()
    except Exception:
        return None

def incident_id(date_iso, county, url):
    date_str = date_iso[:10] if date_iso else "unknown"
    raw = f"{date_str}-{county}-{url}"
    h = hashlib.sha1(raw.encode('utf-8')).hexdigest()
    return "INC-" + h[:8].upper()

def build_incident(date_iso, county, location, description, source, source_url, status="Media Reported"):
    return {
        "id": incident_id(date_iso, county, source_url),
        "date": date_iso,
        "county": county,
        "location": location,
        "description": description[:500] if description else "",
        "source": {
            "title": source,
            "url": source_url
        },
        "status": status,
        "addedAt": datetime.datetime.now(datetime.timezone.utc).isoformat()
    }

class GoogleNewsRSS:
    def scrape(self, since=None):
        incidents = []
        queries = [
            "stabbing Ireland", "knife attack Ireland", "knife crime Dublin",
            "knife crime Cork", "knife crime Belfast", "stabbing Dublin",
            "stabbing Cork", "stabbing Galway", "stabbing Limerick",
            "stabbing Northern Ireland", "knife wound Ireland",
            "man stabbed Ireland", "woman stabbed Ireland"
        ]
        
        base_url = "https://news.google.com/rss/search"
        
        for q in queries:
            url = f"{base_url}?q={urllib.parse.quote_plus(q)}&hl=en-IE&gl=IE&ceid=IE:en"
            logger.info(f"Fetching Google News: {q}")
            resp = get(url)
            if not resp: continue
            
            soup = BeautifulSoup(resp.content, "xml")
            items = soup.find_all("item")
            
            for item in items:
                try:
                    title = item.title.text if item.title else ""
                    desc = item.description.text if item.description else ""
                    link = item.link.text if item.link else ""
                    pub_date_raw = item.pubDate.text if item.pubDate else ""
                    
                    full_text = title + " " + desc
                    if not is_relevant(full_text):
                        continue
                        
                    date_iso = parse_date(pub_date_raw)
                    if since and date_iso:
                        dt = parser.parse(date_iso)
                        if dt < since:
                            continue
                            
                    county = extract_county(full_text)
                    location = extract_location_detail(full_text)
                    
                    inc = build_incident(date_iso, county, location, title, "Google News", link, "Media Reported")
                    incidents.append(inc)
                except Exception as e:
                    logger.debug(f"Error parsing Google News item: {e}")
        
        logger.info(f"Google News RSS found {len(incidents)} relevant items.")
        return incidents

class GardaPressReleaseScraper:
    def scrape(self, since=None):
        incidents = []
        base_url = "https://www.garda.ie"
        listing_url = f"{base_url}/en/media-centre/press-releases/"
        
        logger.info("Fetching Garda Press Releases...")
        resp = get(listing_url)
        if not resp: return []
        
        soup = BeautifulSoup(resp.content, "html.parser")
        links = []
        for a in soup.find_all("a", href=True):
            if "press-release" in a['href'] or "media-centre/news" in a['href']:
                href = a['href']
                if not href.startswith("http"):
                    href = base_url + href
                if href not in links:
                    links.append(href)
        
        # Limit to recent 20 to avoid over-scraping
        for link in links[:20]:
            try:
                page_resp = get(link)
                if not page_resp: continue
                
                page_soup = BeautifulSoup(page_resp.content, "html.parser")
                title_el = page_soup.find("h1")
                title = title_el.text.strip() if title_el else ""
                
                # Try to find main content
                content_div = page_soup.find("div", class_="content-body") or page_soup.find("div", id="main-content")
                body_text = content_div.text.strip() if content_div else ""
                
                full_text = title + " " + body_text
                if not is_relevant(full_text):
                    continue
                    
                # Find date (usually in a specific format or time tag)
                date_iso = None
                time_el = page_soup.find("time")
                if time_el and time_el.get("datetime"):
                    date_iso = parse_date(time_el["datetime"])
                else:
                    # try parsing from text (very basic fallback)
                    date_match = re.search(r'\b(\d{1,2}(?:st|nd|rd|th)? \w+ \d{4})\b', full_text)
                    if date_match:
                        date_iso = parse_date(date_match.group(1))
                
                if not date_iso:
                    date_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
                    
                if since and date_iso:
                    dt = parser.parse(date_iso)
                    if dt < since:
                        continue
                        
                county = extract_county(full_text)
                location = extract_location_detail(full_text)
                
                inc = build_incident(date_iso, county, location, title, "An Garda Síochána", link, "Garda Confirmed")
                incidents.append(inc)
            except Exception as e:
                logger.debug(f"Error parsing Garda press release {link}: {e}")
                
        logger.info(f"Garda Scraper found {len(incidents)} relevant items.")
        return incidents

class RedditIrelandScraper:
    def scrape(self, since=None):
        incidents = []
        subreddits = ["ireland", "Dublin", "northernireland", "cork", "galway"]
        terms = ["stabbing", "knife", "knife attack"]
        
        headers = HEADERS.copy()
        headers["User-Agent"] = "EireSafe-Bot/1.0 (public interest crime tracker)"
        
        for sub in subreddits:
            for term in terms:
                url = f"https://www.reddit.com/r/{sub}/search.json?q={urllib.parse.quote_plus(term)}&restrict_sr=1&sort=new&limit=50&t=year"
                logger.info(f"Fetching Reddit: r/{sub} for '{term}'")
                resp = get(url, headers=headers)
                if not resp: continue
                
                try:
                    data = resp.json()
                    children = data.get("data", {}).get("children", [])
                    for child in children:
                        post = child.get("data", {})
                        title = post.get("title", "")
                        selftext = post.get("selftext", "")
                        created_utc = post.get("created_utc")
                        permalink = "https://www.reddit.com" + post.get("permalink", "")
                        
                        full_text = title + " " + selftext
                        if not is_relevant(full_text):
                            continue
                            
                        date_iso = None
                        if created_utc:
                            dt = datetime.datetime.fromtimestamp(created_utc, tz=datetime.timezone.utc)
                            if since and dt < since:
                                continue
                            date_iso = dt.isoformat()
                            
                        county = extract_county(full_text)
                        if county == "Unknown": county = COUNTY_MAP.get(sub.lower(), "Unknown")
                        
                        location = extract_location_detail(full_text)
                        
                        inc = build_incident(date_iso, county, location, title, f"Reddit r/{sub}", permalink, "Under Investigation")
                        incidents.append(inc)
                except Exception as e:
                    logger.debug(f"Error parsing Reddit r/{sub}: {e}")
                    
        logger.info(f"Reddit Scraper found {len(incidents)} relevant items.")
        return incidents

class GDELTScraper:
    def scrape(self, since=None, is_backfill=False):
        # Very simplified GDELT hit. For backfill, you might want to query their actual API
        # but their API can be complex. We will use a basic GDELT DOC API call.
        incidents = []
        queries = ['"stabbed" sourcecountry:EI', '"stabbing" sourcecountry:EI', '"knife attack" sourcecountry:EI']
        
        if is_backfill:
            logger.info("Running GDELT Backfill for 2026...")
            
        base_url = "https://api.gdeltproject.org/api/v2/doc/doc"
        
        for q in queries:
            # timespan is 1 months for backfill to avoid timeouts, 3 days for normal
            timespan = "3M" if is_backfill else "3d" 
            url = f"{base_url}?query={urllib.parse.quote_plus(q)}&mode=artlist&maxrecords=250&format=json&timespan={timespan}"
            logger.info(f"Fetching GDELT: {q}")
            resp = get(url)
            if not resp: continue
            
            try:
                data = resp.json()
                articles = data.get("articles", [])
                for art in articles:
                    url = art.get("url", "")
                    title = art.get("title", "")
                    seendate = art.get("seendate", "") # Format: 20260101T000000Z
                    domain = art.get("domain", "")
                    
                    if not is_relevant(title):
                        continue
                        
                    date_iso = None
                    if seendate:
                        try:
                            dt = datetime.datetime.strptime(seendate, "%Y%m%dT%H%M%SZ").replace(tzinfo=datetime.timezone.utc)
                            if since and not is_backfill and dt < since:
                                continue
                            date_iso = dt.isoformat()
                        except: pass
                        
                    county = extract_county(title)
                    location = extract_location_detail(title)
                    
                    inc = build_incident(date_iso, county, location, title, f"GDELT ({domain})", url, "Media Reported")
                    incidents.append(inc)
            except Exception as e:
                logger.debug(f"Error parsing GDELT response: {e}")
                
        logger.info(f"GDELT Scraper found {len(incidents)} relevant items.")
        return incidents

def jaccard_similarity(str1, str2):
    # simple tokenization (words > 3 chars)
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
            # Same ID check
            if inc["id"] == existing["id"]:
                is_duplicate = True
                break
                
            # Date + County + Jaccard similarity check
            date_inc = inc.get("date", "")[:10]
            date_ex = existing.get("date", "")[:10]
            
            if date_inc and date_ex and date_inc == date_ex and inc["county"] == existing["county"]:
                sim = jaccard_similarity(inc["description"], existing["description"])
                if sim > 0.40:
                    is_duplicate = True
                    # If duplicate, keep the one with higher priority
                    p1 = status_priority.get(inc["status"], 0)
                    p2 = status_priority.get(existing["status"], 0)
                    if p1 > p2:
                        unique_incidents[i] = inc # Replace with better one
                    break
        
        if not is_duplicate:
            unique_incidents.append(inc)
            
    return unique_incidents

def load_all_existing(output_dir):
    all_incidents = []
    if not os.path.exists(output_dir):
        return []
    
    for f in os.listdir(output_dir):
        if f.startswith("data_") and f.endswith(".js"):
            path = os.path.join(output_dir, f)
            try:
                with open(path, 'r', encoding='utf-8') as file:
                    content = file.read()
                match = re.search(r'export const mockIncidents\s*=\s*(\[.*\]);', content, re.DOTALL)
                if match:
                    json_str = match.group(1)
                    all_incidents.extend(json.loads(json_str))
            except Exception as e:
                logger.error(f"Error loading {path}: {e}")
                
    # Also try to load legacy data.js if it exists, to migrate it
    legacy_path = os.path.join(output_dir, "data.js")
    if os.path.exists(legacy_path):
        try:
            with open(legacy_path, 'r', encoding='utf-8') as file:
                content = file.read()
            match = re.search(r'export const mockIncidents\s*=\s*(\[.*\]);', content, re.DOTALL)
            if match:
                json_str = match.group(1)
                all_incidents.extend(json.loads(json_str))
        except Exception as e:
            logger.error(f"Error loading {legacy_path}: {e}")
            
    return all_incidents

def write_yearly_data(incidents, output_dir):
    by_year = {}
    for inc in incidents:
        dt_str = inc.get("date")
        if dt_str:
            try:
                dt = parser.parse(dt_str)
                year = dt.year
            except:
                year = datetime.datetime.now(datetime.timezone.utc).year
        else:
            year = datetime.datetime.now(datetime.timezone.utc).year
            
        by_year.setdefault(year, []).append(inc)
        
    for year, incs in by_year.items():
        incs.sort(key=lambda x: x.get("date", ""), reverse=True)
        path = os.path.join(output_dir, f"data_{year}.js")
        js_content = f"// Irish Stabbings & Crime Tracker - Year {year}\\n"
        js_content += f"// Total incidents: {len(incs)}\\n\\n"
        js_content += f'''export const countiesList = [
  "Carlow", "Cavan", "Clare", "Cork", "Donegal", "Dublin", "Galway", "Kerry",
  "Kildare", "Kilkenny", "Laois", "Leitrim", "Limerick", "Longford", "Louth",
  "Mayo", "Meath", "Monaghan", "Offaly", "Roscommon", "Sligo", "Tipperary",
  "Waterford", "Westmeath", "Wexford", "Wicklow"
];\\n\\n'''
        js_content += f"export const mockIncidents = {json.dumps(incs, indent=2)};\\n"
        
        with open(path, 'w', encoding='utf-8') as f:
            f.write(js_content)
        logger.info(f"Successfully wrote {len(incs)} incidents to {path}")

def main():
    global MIN_YEAR
    parser_args = argparse.ArgumentParser(description="EireSafe Multi-Source Scraper")
    parser_args.add_argument("--output-dir", default="..", help="Path to output directory")
    parser_args.add_argument("--backfill-2026", action="store_true", help="Run backfill for 2026")
    parser_args.add_argument("--start-year", type=int, default=MIN_YEAR, help="Earliest year to keep")
    parser_args.add_argument("--days", type=int, default=3, help="Days to look back (incremental mode)")
    
    args = parser_args.parse_args()
    
    MIN_YEAR = args.start_year
    
    if args.backfill_2026:
        since = datetime.datetime(args.start_year, 1, 1, tzinfo=datetime.timezone.utc)
    else:
        since = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=args.days)
        
    logger.info(f"Starting scraper (Since: {since.isoformat()})")
    
    existing_incidents = load_all_existing(args.output_dir)
    logger.info(f"Loaded {len(existing_incidents)} existing incidents from {args.output_dir}")
    
    scrapers = [
        GoogleNewsRSS(),
        GardaPressReleaseScraper(),
        RedditIrelandScraper(),
        GDELTScraper()
    ]
    
    all_incidents = list(existing_incidents)
    
    for scraper in scrapers:
        try:
            is_backfill = isinstance(scraper, GDELTScraper) and args.backfill_2026
            if isinstance(scraper, GDELTScraper):
                new_incs = scraper.scrape(since=since, is_backfill=is_backfill)
            else:
                new_incs = scraper.scrape(since=since)
            all_incidents.extend(new_incs)
        except Exception as e:
            logger.error(f"Scraper {scraper.__class__.__name__} failed: {e}")
            
    unique_incidents = deduplicate(all_incidents)
    
    # Final filter to ensure we don't grab super old unrelated stuff unless it's in the DB
    final_incidents = []
    for inc in unique_incidents:
        dt_str = inc.get("date")
        if dt_str:
            try:
                dt = parser.parse(dt_str)
                if dt.year >= args.start_year:
                    final_incidents.append(inc)
            except:
                final_incidents.append(inc) # keep if date is unparseable but somehow got in
                
    write_yearly_data(final_incidents, args.output_dir)
    
    logger.info("Done.")

if __name__ == "__main__":
    main()
