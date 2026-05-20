// Node.js Helper Scraper - fetch_press_releases.js
// Fetches Garda press releases and analyzes them for knife-related incidents

const https = require('https');
const fs = require('fs');
const path = require('path');

// Keywords to scan for
const SEARCH_KEYWORDS = [
  'stab', 'stabbing', 'knife', 'knives', 'blade', 
  'blades', 'offensive weapon', 'slashed', 'slashing'
];

// List of Irish counties to match in text
const COUNTIES = [
  'Carlow', 'Cavan', 'Clare', 'Cork', 'Donegal', 'Dublin', 'Galway', 'Kerry',
  'Kildare', 'Kilkenny', 'Laois', 'Leitrim', 'Limerick', 'Longford', 'Louth',
  'Mayo', 'Meath', 'Monaghan', 'Offaly', 'Roscommon', 'Sligo', 'Tipperary',
  'Waterford', 'Westmeath', 'Wexford', 'Wicklow', 'Antrim', 'Armagh', 'Down',
  'Fermanagh', 'Londonderry', 'Derry', 'Tyrone'
];

// Target URL: Garda RSS Feed or News Index
// Garda.ie uses RSS feeds for various categories
const RSS_FEED_URL = 'https://www.garda.ie/en/garda-press-office/garda-press-releases/feed/';
const ALTERNATIVE_NEWS_URL = 'https://www.garda.ie/en/garda-press-office/press-releases/';

// Main function
async function main() {
  console.log('----------------------------------------------------');
  console.log('Éire Safe - Garda Press Releases Scraper');
  console.log('----------------------------------------------------');
  console.log(`Checking RSS Feed: ${RSS_FEED_URL}\n`);

  fetchFeed(RSS_FEED_URL)
    .then(xmlData => {
      const items = parseRssItems(xmlData);
      processItems(items);
    })
    .catch(err => {
      console.warn(`Could not fetch RSS feed: ${err.message}`);
      console.log('Attempting backup scraping of Garda News Index HTML...\n');
      
      fetchFeed(ALTERNATIVE_NEWS_URL)
        .then(htmlData => {
          const items = parseHtmlItems(htmlData);
          processItems(items);
        })
        .catch(htmlErr => {
          console.error(`Backup scraper failed: ${htmlErr.message}`);
          console.log('\nRunning with local offline demo mode to show parsing capabilities...\n');
          const mockGardaXml = generateMockGardaFeed();
          const items = parseRssItems(mockGardaXml);
          processItems(items);
        });
    });
}

// Fetch helper using native https module, with redirect following
function fetchFeed(url, redirectCount = 0) {
  if (redirectCount > 5) {
    return Promise.reject(new Error('Too many redirects'));
  }
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
      }
    }, (res) => {
      // Follow redirects (301, 302, 307, 308)
      if ([301, 302, 307, 308].includes(res.statusCode)) {
        const redirectUrl = res.headers.location;
        if (redirectUrl) {
          const absoluteUrl = redirectUrl.startsWith('http') ? redirectUrl : new URL(redirectUrl, url).href;
          resolve(fetchFeed(absoluteUrl, redirectCount + 1));
          return;
        }
      }
      
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP Status Code: ${res.statusCode}`));
        return;
      }
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => resolve(data));
    }).on('error', err => reject(err));
  });
}

// Basic XML parser for RSS feed structure
function parseRssItems(xml) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;
  
  while ((match = itemRegex.exec(xml)) !== null) {
    const itemContent = match[1];
    
    const titleMatch = itemContent.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/i) || itemContent.match(/<title>([\s\S]*?)<\/title>/i);
    const linkMatch = itemContent.match(/<link>([\s\S]*?)<\/link>/i);
    const pubDateMatch = itemContent.match(/<pubDate>([\s\S]*?)<\/pubDate>/i);
    const descMatch = itemContent.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/i) || itemContent.match(/<description>([\s\S]*?)<\/description>/i);
    
    items.push({
      title: titleMatch ? titleMatch[1].trim() : 'Unknown Title',
      link: linkMatch ? linkMatch[1].trim() : '',
      pubDate: pubDateMatch ? pubDateMatch[1].trim() : new Date().toUTCString(),
      description: descMatch ? descMatch[1].trim() : ''
    });
  }
  
  return items;
}

// Basic HTML parser for news article items
function parseHtmlItems(html) {
  // Simplistic extract of article headlines, summaries and links
  const items = [];
  const articleRegex = /<article[^>]*>([\s\S]*?)<\/article>/gi;
  let match;
  
  while ((match = articleRegex.exec(html)) !== null) {
    const artContent = match[1];
    
    const titleMatch = artContent.match(/<h[2-4][^>]*>([\s\S]*?)<\/h[2-4]>/i) || artContent.match(/title="([^"]+)"/i);
    const linkMatch = artContent.match(/href="([^"]+)"/i);
    const descMatch = artContent.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
    
    if (titleMatch) {
      // Clean tags from title
      const cleanTitle = titleMatch[1].replace(/<[^>]*>/g, '').trim();
      const relativeLink = linkMatch ? linkMatch[1] : '';
      const link = relativeLink.startsWith('http') ? relativeLink : `https://www.garda.ie${relativeLink}`;
      
      items.push({
        title: cleanTitle,
        link: link,
        pubDate: new Date().toUTCString(),
        description: descMatch ? descMatch[1].replace(/<[^>]*>/g, '').trim() : ''
      });
    }
  }
  return items;
}

// Analyze items and output potential knife crime records
function processItems(items) {
  const matches = [];
  
  console.log(`Analyzing ${items.length} press releases...`);
  
  items.forEach(item => {
    const fullText = `${item.title} ${item.description}`.toLowerCase();
    
    // Check keywords
    const containsKeyword = SEARCH_KEYWORDS.some(kw => fullText.includes(kw));
    if (containsKeyword) {
      // Identify county
      let detectedCounty = 'Dublin'; // Fallback
      for (const county of COUNTIES) {
        if (fullText.includes(county.toLowerCase())) {
          detectedCounty = county;
          // Normalize Derry
          if (detectedCounty === 'Derry') detectedCounty = 'Londonderry';
          break;
        }
      }
      
      // Determine specific location (naive extract)
      let location = detectedCounty;
      const locationMatch = item.title.match(/in ([A-Z][a-zA-Z\s]+),/);
      if (locationMatch && locationMatch[1]) {
        location = locationMatch[1].trim();
      }
      
      matches.push({
        id: `garda-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        date: new Date(item.pubDate).toISOString(),
        county: detectedCounty,
        location: location,
        status: 'Garda Confirmed',
        description: item.description || item.title,
        source: {
          title: 'An Garda Síochána Press Office',
          url: item.link || 'https://www.garda.ie'
        }
      });
    }
  });
  
  console.log(`Found ${matches.length} relevant knife-related entries.`);
  
  if (matches.length > 0) {
    const outputPath = path.join(__dirname, '..', 'proposed_incidents.json');
    fs.writeFileSync(outputPath, JSON.stringify(matches, null, 2), 'utf8');
    console.log(`Successfully saved potential incidents to: proposed_incidents.json`);
    console.log('You can review these and add them to your data.js file via the admin panel.\n');
    console.log(JSON.stringify(matches, null, 2));
  } else {
    console.log('No new knife-related incidents detected in the current stream.');
  }
}

// Generate offline fallback XML feed for demonstration
function generateMockGardaFeed() {
  return `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
<channel>
  <title>Garda Press Office News Feed</title>
  <link>https://www.garda.ie</link>
  <description>Official News Releases from An Garda Síochána</description>
  <item>
    <title><![CDATA[Gardaí investigate serious assault in Dundalk, County Louth]]></title>
    <link>https://www.garda.ie/en/garda-press-office/press-releases/2026/may/gardai-investigate-assault-dundalk-louth.html</link>
    <pubDate>Wed, 20 May 2026 14:30:00 GMT</pubDate>
    <description><![CDATA[Gardaí at Dundalk are appealing for witnesses following an assault incident that occurred in Dundalk, Co. Louth this morning. A male in his late 20s sustained a knife wound during the altercation and has been taken to Our Lady of Lourdes Hospital. Investigations are ongoing.]]></description>
  </item>
  <item>
    <title><![CDATA[Public Safety Campaign Launch: Community Engagement]]></title>
    <link>https://www.garda.ie/en/garda-press-office/press-releases/2026/may/public-safety-campaign-launch.html</link>
    <pubDate>Tue, 19 May 2026 10:00:00 GMT</pubDate>
    <description><![CDATA[An Garda Síochána have launched a new community engagement strategy aimed at promoting bicycle security and safety awareness in urban centers.]]></description>
  </item>
  <item>
    <title><![CDATA[Appeal for witnesses to stabbing incident in Galway City]]></title>
    <link>https://www.garda.ie/en/garda-press-office/press-releases/2026/may/appeal-for-witnesses-stabbing-galway.html</link>
    <pubDate>Mon, 18 May 2026 21:15:00 GMT</pubDate>
    <description><![CDATA[Gardaí are investigating a stabbing incident that occurred in the Eyre Square area of Galway City. A man was treated at University Hospital Galway for non-life-threatening lacerations to his arm. Anyone with information is asked to contact Galway Garda Station.]]></description>
  </item>
</channel>
</rss>`;
}

// Execute
main();
