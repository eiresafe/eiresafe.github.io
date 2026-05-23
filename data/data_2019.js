// Irish Stabbings & Crime Tracker - Year 2019
// Total incidents: 5

export const countiesList = [
  "Carlow", "Cavan", "Clare", "Cork", "Donegal", "Dublin", "Galway", "Kerry",
  "Kildare", "Kilkenny", "Laois", "Leitrim", "Limerick", "Longford", "Louth",
  "Mayo", "Meath", "Monaghan", "Offaly", "Roscommon", "Sligo", "Tipperary",
  "Waterford", "Westmeath", "Wexford", "Wicklow"
];

export const mockIncidents = [
  {
    "id": "INC-1A5E8390",
    "date": "2019-11-15T08:00:00+00:00",
    "county": "Cork",
    "location": "",
    "description": "Woman put knife to the throat of work colleague at a Cork company - echo live",
    "source": {
      "title": "Google News",
      "url": "https://news.google.com/rss/articles/CBMiYEFVX3lxTE5aWVcwMV85VzNCSUdNZEFiUV9jUWJQc2dBc3MzOGs5eTJhNWhWV1VieDVZZXVzWTdBUlFTMEdqWkZYbU5fekpzOFFOVFZpa09oVGNkNzRoSVgyYUtHZWZDWg?oc=5"
    },
    "status": "Media Reported",
    "addedAt": "2026-05-21T14:58:31.278706+00:00"
  },
  {
    "id": "INC-C078B0F3",
    "date": "2019-07-13T07:00:00+00:00",
    "county": "Antrim",
    "location": "",
    "description": "Belfast schoolgirl quizzes MPs over rising knife crime - Belfast Telegraph",
    "source": {
      "title": "Google News",
      "url": "https://news.google.com/rss/articles/CBMixwFBVV95cUxNR3dUZ243Qnczb3FvdnZkZXRtZE9xSzZBTlFjQUF4Zmt2THBqRFg2UkNGU0c1WVViQTYyS1BiYWo0S2ZDa2hfTDZ4eTc4VXFwSEU3U1AwWUR6cFFKZHljQXpJUGU3RlppR1BhMUgtV29jSzZMc1ZGTGRDNElhcktFZzV6MzAzaXpTZzdoZU8xMU1VVVVvU1hXY3A4b3lmY3JuTGpQbndubnBRS1pQcjNjeFpVemFMLUxEeUJ2OU5FR2ctWlhqc3ZJ?oc=5"
    },
    "status": "Media Reported",
    "addedAt": "2026-05-21T14:58:33.238737+00:00"
  },
  {
    "id": "INC-0FD20FE7",
    "date": "2019-04-10T07:00:00+00:00",
    "county": "Dublin",
    "location": "",
    "description": "Man turns up at Finglas Garda Station in Dublin with stab wounds - Irish Mirror",
    "source": {
      "title": "Google News",
      "url": "https://news.google.com/rss/articles/CBMijAFBVV95cUxQbjdOem0xMlVnTzdJd2pqWnh2Zm0yV1NFbjJWUnRnLWpoTGhhenN3cmlrU21WWDZXVnU2bWZ1QXViU2twSTNIeVJycFl6MkhQSWxTZWxUUE5MLUJOTTViY295Y05GeXhURU44My04cjdkVThtS1hmeXB6SnZpd1JaZUk3Y3ZTUHg4OEZoRtIBkgFBVV95cUxQbEZ6SUFmWE5FTEtqN3RvY2d6a2N0LTNmaVhkaW1ZZnZNSmp6Q01IeUt1aFpqZG5DbHctaEQwNElsYTcxdElFVk1YSWZNdHQzY2wyVXM4Sms0bWUtMFNuektyZGY4dV9ybWZMc0ZKNHYyYl85ZV9sbkJYVGxvT1dJcUdDQVB6SGhSLWtpTk5zMlJ1Zw?oc=5"
    },
    "status": "Media Reported",
    "addedAt": "2026-05-21T14:58:44.879013+00:00"
  },
  {
    "id": "INC-B79B2158",
    "date": "2019-03-23T07:00:00+00:00",
    "county": "Limerick",
    "location": "Limerick -",
    "description": "Stabbing accused charged with attempted murder in Limerick - Limerick Leader",
    "source": {
      "title": "Google News",
      "url": "https://news.google.com/rss/articles/CBMirwFBVV95cUxQaG5HQ3haN19meWhnWExsa09aUFhucFlpZUt2MnVUWDR4V0ZjNHdYWERabzlxVlBVZ0Q5d1JGUEhjVl9NS1VEOVNnemdqY3BySlRnRXByQThRcDBnUTF1UE9HM0FWYWVKYjdJUF9VS29pcHAzVkpmemJsZ05RV0g5U3lIdFBaQ2dOXzJSbWE1eWFkMkU1NVhiUjVOX29TaE8tdkwtazc1M3pid2NuaVlR?oc=5"
    },
    "status": "Media Reported",
    "addedAt": "2026-05-21T14:58:41.011478+00:00"
  },
  {
    "id": "INC-1AEE69D6",
    "date": "2019-02-26T08:00:00+00:00",
    "county": "Limerick",
    "location": "",
    "description": "Gardai following 'definite lines of enquiry' on Limerick city stabbing - Limerick Leader",
    "source": {
      "title": "Google News",
      "url": "https://news.google.com/rss/articles/CBMizAFBVV95cUxNS1BZdlNUN093NEtiTEFLZnRhYkRtLUtZZmdNUGVvM3NlUHlRX1dpMkR5YXBabG1ZRkotM0otUDBUN0o5SUpfcTVHUUdZMHBfZXZCUmgxQVB2SmRHdTBEYjFVS29xZV96Sm5tNDdWWkZadnRVYzhlZG43cHQ1Mm51UHJhaVZzMTJxNFdyYkd5TGFzb0NHaEF4MVBlaE9YdGttLThJUFV6T3FSVUdOSWF0ZnpFaUU2eVhOVnduRUhnbXU1dHE1T1BjT19NXzE?oc=5"
    },
    "status": "Media Reported",
    "addedAt": "2026-05-21T14:58:41.014480+00:00"
  }
];
