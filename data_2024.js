// Irish Stabbings & Crime Tracker - Year 2024
// Total incidents: 28

export const countiesList = [
  "Carlow", "Cavan", "Clare", "Cork", "Donegal", "Dublin", "Galway", "Kerry",
  "Kildare", "Kilkenny", "Laois", "Leitrim", "Limerick", "Longford", "Louth",
  "Mayo", "Meath", "Monaghan", "Offaly", "Roscommon", "Sligo", "Tipperary",
  "Waterford", "Westmeath", "Wexford", "Wicklow"
];

export const mockIncidents = [
  {
    "id": "INC-E46EA4DB",
    "date": "2024-12-27T08:00:00+00:00",
    "county": "Dublin",
    "location": "",
    "description": "'She was in the wrong place at the wrong time': Mother of five-year-old Dublin stabbing victim speaks out - Irish Examiner",
    "source": {
      "title": "Google News",
      "url": "https://news.google.com/rss/articles/CBMicEFVX3lxTE1CM3dsaG9YaFdlSGxuNUp2cWZZNGhqc3JhSTZfUk9yZ3kyMUdZcTcxRTlQNHNLbkx6Z0xXbjc5WGItcUQ4LWpYdlFFcmQ0YjhCVmxzVVJVOVFWdElmbkJWdm9idkl3cE55c0JLWTJCdDQ?oc=5"
    },
    "status": "Media Reported",
    "addedAt": "2026-05-21T14:58:48.800565+00:00"
  },
  {
    "id": "INC-C0F4D256",
    "date": "2024-12-03T08:00:00+00:00",
    "county": "Cork",
    "location": "",
    "description": "Little girl tragically stabbed in Wexford died while protecting her mother from a late-night knife attack - Cork Beo",
    "source": {
      "title": "Google News",
      "url": "https://news.google.com/rss/articles/CBMijwFBVV95cUxPT0RjV2EtZ1ZPTEtnSTF2X2h3T0psZ0xERzloQk1id3hWZGRPZV84WWJZSnNHcXBvU3lJelZ3TzU4MHp5WVpYVWRIc3FUUHY4UndaYUZzd2xmeFFPRlZGaFpCZndIOEZDbjI0djhQRDhKcTVmZ3dTSV8wWTB5MzhrMVRmWS0zOE45SHNZSXcwSdIBlAFBVV95cUxQME1DWUtScVRSOENzUUptWnFKWFJ1TDNLN1JCcjBlaUtiQUExd0tUME1XYWNkeTQ5QlNobDN5c1VRd1Q2bHRXMnZ0NHQtWkxXNFNxTktVR0t3QURlNmNNVUgwMXYtTWY0bzRvT2lYOGJOa2prUHN0RWJrZ3NMY1JaSUJLRXY2QVh1WFdwejJJWE01aGt6?oc=5"
    },
    "status": "Media Reported",
    "addedAt": "2026-05-21T14:58:31.292152+00:00"
  },
  {
    "id": "INC-65C5E18A",
    "date": "2024-11-09T08:00:00+00:00",
    "county": "Galway",
    "location": "",
    "description": "Military chaplain stabbed outside Galway barracks making 'very steady recovery' - Irish Mirror",
    "source": {
      "title": "Google News",
      "url": "https://news.google.com/rss/articles/CBMilwFBVV95cUxNbmhMOFpyT09oemJJbDJidmRFMHhUVGVvZzBkUUpfRW0yNVdKOGlHWDYtcEV3aGp4SnRyVXdSMGtfbks3ZzBvcG93aFRBamFUc3ZsTFZHRW9OSWxXNG1CUnRPMHFOOGUtY3piX0tadGpCa2RVaUZPV3BlR2llaHlVSjdhNkRGME9IN3kzYk1QWEhUbDU3aWw40gGcAUFVX3lxTE5mTGlXUkFFd0EwZ0tvTnRNbkJPaGZ6VU44Uk1Oa3dHQk1NUDE2SlBRYjJKU0xEUzVkdERva1NEZUdmMnlzTllWZmttODI0RnNFcEpFOUlsTEJTdG5xbnZUbWctZjNLU0pyTDJKRDRpVDRybnI0VHBOd1otOWViNVlhQWM2NkdtQzkzYXQwNW9RWEVCQTB1ZS1iOXBEcA?oc=5"
    },
    "status": "Media Reported",
    "addedAt": "2026-05-21T14:58:39.023350+00:00"
  },
  {
    "id": "INC-59BFAE2A",
    "date": "2024-11-01T07:00:00+00:00",
    "county": "Cork",
    "location": "",
    "description": "Book of evidence served to man accused of knife attack outside Cork hotel - echo live",
    "source": {
      "title": "Google News",
      "url": "https://news.google.com/rss/articles/CBMiYEFVX3lxTFBqSHU5N1NncU9wUTc5NnU0SHl5dHdweDRvNHE5VVdoSHlmeTdCS1BDUkxUcUJtQ3VyM0JGeUZhMU93ejd1REoyN3RtLWZ0QmUydXAyOWpsUWN0LVZFdTkyYw?oc=5"
    },
    "status": "Media Reported",
    "addedAt": "2026-05-21T14:58:31.271488+00:00"
  },
  {
    "id": "INC-50239C12",
    "date": "2024-10-29T07:00:00+00:00",
    "county": "Unknown",
    "location": "",
    "description": "Idris Elba fronts knife crime documentary featuring King and Keir Starmer - CorkLive.ie",
    "source": {
      "title": "Google News",
      "url": "https://news.google.com/rss/articles/CBMi0gFBVV95cUxNYXo5M3lScGRpQThhZWxyTkJUdTBMNzJZcklqcVRBMmtYY0FudGRqQ1I3NjNmOHRaRmdwVjI1dWJqYmpJbjM2UHE2aUZ0bHlnNHI2RDFhUDhKeWRHOXJfS1R1cVhfNm1IVG0xTk9mZm13NTJnbGQzLXRUaHEzeEVrTGFDekVKVWxGSXg2dVgxTVRud3owaFBDWFZkR3BSWlBDV0R2VE9sZ2pGaUwxMk94NDJwcGt6RXd6elBxUnFJYnZoQkJod3NNTnZ3RTcyRGZudFE?oc=5"
    },
    "status": "Media Reported",
    "addedAt": "2026-05-21T14:58:31.288079+00:00"
  },
  {
    "id": "INC-1DC6F0B2",
    "date": "2024-10-15T07:00:00+00:00",
    "county": "Cork",
    "location": "",
    "description": "Cork man accused of knife attack on neighbour refused bail - echo live",
    "source": {
      "title": "Google News",
      "url": "https://news.google.com/rss/articles/CBMiYEFVX3lxTE1MNGJTR0JyUVRDV3Zlcl9qeEI3WkFuaTl5T0l3aTc4WUdQV1BRSXpaSWtRNzE3dU5KSFdBUmVheU44Z3lUZURKQ3lOMlY2ZDdIcmJEX3kyLUFRUkJDR3ZsUA?oc=5"
    },
    "status": "Media Reported",
    "addedAt": "2026-05-21T14:58:31.282140+00:00"
  },
  {
    "id": "INC-B199D315",
    "date": "2024-09-25T02:19:02+00:00",
    "county": "Galway",
    "location": "",
    "description": "Man Dies After Galway Stabbing - Clare FM",
    "source": {
      "title": "Google News",
      "url": "https://news.google.com/rss/articles/CBMiY0FVX3lxTE1TTDFZbWx3TEdoWlBadGZKRXI1aDBORGF3bTQzVFpWSjVIemljNUdsS1o5eE90aTkwY1ZGX0dkNWZrQmlCZWhmN05uWWNfY1ZzbTI1Rl8tX3Bhc19vLW9QYlM4QQ?oc=5"
    },
    "status": "Media Reported",
    "addedAt": "2026-05-21T14:58:38.988845+00:00"
  },
  {
    "id": "INC-C25C6E41",
    "date": "2024-09-23T07:00:00+00:00",
    "county": "Antrim",
    "location": "",
    "description": "West Belfast: Two men in hospital after bar stabbing - BBC",
    "source": {
      "title": "Google News",
      "url": "https://news.google.com/rss/articles/CBMiXEFVX3lxTE5xdmhlMzVSTDlyaWFST3VlZjJWNXFHTWdzLVVWUmhuOHoyRlhYZ1EzQkJtTEx0cHROMVpuRXZwNFJBQldNbUlRSXo0N3JMbFl6bjdESG9US1pHRFFp?oc=5"
    },
    "status": "Media Reported",
    "addedAt": "2026-05-21T14:58:42.949900+00:00"
  },
  {
    "id": "INC-C366B5A6",
    "date": "2024-09-08T07:00:00+00:00",
    "county": "Cork",
    "location": "",
    "description": "Volatile criminal Gavin Sheehan came within inches of death during Cork knife attack - Sunday World",
    "source": {
      "title": "Google News",
      "url": "https://news.google.com/rss/articles/CBMi0gFBVV95cUxQOVpCRnptbUpQWG0yc1lqZnNGWGtLVi1NT29QV2NKZlUzVGtyeEMxVW5udGNoRWJ5bFktenVKUlA0emEtaDVWRWhFVDNzdWNjNFE1Y0pCVnROdWt0MVRPNkpHN21kVlRFTEZpaGFYeE1qWXNPdTRSRWU3ckNBY3RVbnJfVGdkWmplSHprZUdzTDMzWUpKM2tZU1FOa1NkRmh2RmtnSjZvUG9KUXpkUWVuZWE5T21GUlR2d08wdFBKRDlFMHR1V3BNS1E0RGVzakNEeUE?oc=5"
    },
    "status": "Media Reported",
    "addedAt": "2026-05-21T14:58:31.266186+00:00"
  },
  {
    "id": "INC-39426413",
    "date": "2024-09-07T07:00:00+00:00",
    "county": "Limerick",
    "location": "England after",
    "description": "Tanaiste asked to intervene in England after Limerick man stabbed to death - Limerick Leader",
    "source": {
      "title": "Google News",
      "url": "https://news.google.com/rss/articles/CBMi1gFBVV95cUxNSDRQZ0pDM3hud1ZzWGJlblpiSnp4QWZRM1pMcmVsVktrOGIzWHZnZnJSNnZQbkpwbGNLUVd1dGZUaTNmV1VXR25QaGF3RXVvY0xuMmZYZmp2eFFaY3Nva1NVZzluLXNuNVprTDM3UW01TXhnX19vU3plQmtIQ0llX2FYb3AyZmNTWkt1cFJ5Y3NjVjRlai1uWmdPWGpHb2pxLVhJR21KeUplM3FRdHF6NFhYOHlGd1RkQk9NNGU5WDEtM3k5ZlEweUpVbVBlcDlfSENnV1Zn?oc=5"
    },
    "status": "Media Reported",
    "addedAt": "2026-05-21T14:58:41.019467+00:00"
  },
  {
    "id": "INC-1B230197",
    "date": "2024-09-03T07:00:00+00:00",
    "county": "Dublin",
    "location": "",
    "description": "Dublin: Girl injured in knife attack in November leaves hospital - BBC",
    "source": {
      "title": "Google News",
      "url": "https://news.google.com/rss/articles/CBMiWkFVX3lxTE5EajNiUjB0X2xiWmhodmtlc3ZLUWkzS3ZtTW01SGdGWmZna3RkMzNjOTlXMndkeGs3eWpZUXNSR2Y5TWtuOGF0T21CSHlqeldReFlFUWloZF81dw?oc=5"
    },
    "status": "Media Reported",
    "addedAt": "2026-05-21T14:58:29.436963+00:00"
  },
  {
    "id": "INC-9E87F1FB",
    "date": "2024-08-24T07:00:00+00:00",
    "county": "Antrim",
    "location": "",
    "description": "North Belfast: Man charged with attempted murder after stabbing - BBC",
    "source": {
      "title": "Google News",
      "url": "https://news.google.com/rss/articles/CBMiXEFVX3lxTE01SXl6b05zbG9uM2QtYjBEblpIaWxUZTlFTWpTcnRDVERyM3ozVmh2ZDNtRmhQQmdNNXlhdkRlZ2tVYlVtQTMtZEtaYmNqMDQ1cnp6bnlWT2FyMUZD?oc=5"
    },
    "status": "Media Reported",
    "addedAt": "2026-05-21T14:58:42.939848+00:00"
  },
  {
    "id": "INC-C8E78131",
    "date": "2024-08-19T07:00:00+00:00",
    "county": "Cork",
    "location": "West Cork -",
    "description": "Father and son charged after stabbing of two brothers in West Cork - Cork Beo",
    "source": {
      "title": "Google News",
      "url": "https://news.google.com/rss/articles/CBMiiAFBVV95cUxNOHpwQlZ5cl85bHRiMXNsOEY5NXVKLW5ocmNKdTk0MGRoakdwSjR6MGFRVjQ1TkFLUmI0T2NhdUVMaWFWdDQwSlZnNGZ1RkcxSDdQQnVFZHAwUHp6MHBzNXZjeE4zOUU5QlpmUnVZYzBtazhkWkhadUpWQkxuR3RSbHpJbElTcGxr0gGOAUFVX3lxTE12dEVQWm1LWW95MmhJWUdRSER2Mi1HS3dRcUN2d3RKeHFUcVVvSEY2N0lGbEVtT2wtSzdZSmstLUFlVDJwMHRiRUhobE5mUUg3NEVGN3Y2OFVtOFRxbE9ydU55OXk2eTZOSUdEXzhrQzM0Mi1ZSDEzUHg1clRLMzdCZmw2cElsend0RF9Zc3c?oc=5"
    },
    "status": "Media Reported",
    "addedAt": "2026-05-21T14:58:31.279763+00:00"
  },
  {
    "id": "INC-2A39CBD1",
    "date": "2024-08-17T07:00:00+00:00",
    "county": "Galway",
    "location": "",
    "description": "Teenager charged in connection with Galway stabbing - RTE.ie",
    "source": {
      "title": "Google News",
      "url": "https://news.google.com/rss/articles/CBMidkFVX3lxTE5iQjF2a1U4MTRkcU1tZ19TSFJYS0F4NElKMy1PTEs5bG9pTC1LUURESk9GNFIxd2tEUFJQRTI1NldZWjNDVEIxZVFnemF4cThvZUNTc2cwMFB3ek1DZHNTUmdyaGFMWG5MXzJNcW1QTjg0S1M3QXc?oc=5"
    },
    "status": "Media Reported",
    "addedAt": "2026-05-21T14:58:39.001572+00:00"
  },
  {
    "id": "INC-1B2F4FC2",
    "date": "2024-08-17T07:00:00+00:00",
    "county": "Galway",
    "location": "",
    "description": "Bishops express shock at stabbing of priest in Galway - Vatican News",
    "source": {
      "title": "Google News",
      "url": "https://news.google.com/rss/articles/CBMirAFBVV95cUxNaUNwYmx5RVUwTHlOM0w5UFhpSUl5a1VjeDdiOWZtQ0VuUG0zbUtYcFdKMURjd1hRaHZ3bjg5VTNNYW5oRkExVFlfTU5yMkJxRUg0MFhtMTlRNkhtMklaUV8wdFJvb3ZVU201cFp4NDB6RE5Dc01IdjVFdk1yZUNBeFczOGxNOVdXczhzWFZiWEZhNVlwa2FBOVdLUmV4aGp2dGR1TU95OWlodTU5?oc=5"
    },
    "status": "Media Reported",
    "addedAt": "2026-05-21T14:58:39.002427+00:00"
  },
  {
    "id": "INC-A55439F7",
    "date": "2024-08-16T07:00:00+00:00",
    "county": "Galway",
    "location": "",
    "description": "Galway: Teen arrested after stabbing at Irish army barracks - BBC",
    "source": {
      "title": "Google News",
      "url": "https://news.google.com/rss/articles/CBMiWkFVX3lxTE9hOXM0MXZVVE04WGdYLTRocVJWVl9DQXJEUWtFUU95N0Q5ZmNPQ19RT3lRR0gyX09HZGgzeUtxM2NlQnZHTW4ybmx1ZlZPQ3Z3RDFpcmQxVnV6QQ?oc=5"
    },
    "status": "Media Reported",
    "addedAt": "2026-05-21T14:58:38.995464+00:00"
  },
  {
    "id": "INC-60818E53",
    "date": "2024-08-16T07:00:00+00:00",
    "county": "Galway",
    "location": "",
    "description": "Terrorism probe launched as Renmore barracks chaplain injured in Galway knife attack - Irish Mirror",
    "source": {
      "title": "Google News",
      "url": "https://news.google.com/rss/articles/CBMimAFBVV95cUxNd3ZsWVNENmRYMVZta19CZUozRjNrODdob01jU2owM2E1UUxGWVJFa0kwNHVKRlo5a2pVWW1qeHVQa3J3enUxNTYxQnhGamJkQ2l1UlhHbkh5UlFVX1A2X05pUTVsYTlWeVRiUThMbVlEUUxmNGZXbHNpalJlbm1RUzFqSVlVZWRKY0VjOXR6U3ktbVZoTFZjT9IBngFBVV95cUxNZzlfYVlaUUpES21oOV9CYmRTWWZwS3h3X1RibHowUEdoeGNzVUtmeEV1Z1htaE1pa3ZTTElpamw4R1JQVm5Mdm4weERYS3JnekZsdXlfVGwxa1NwYnlqSnFYakJMMGM5VEFGZENVeUZtdjhnRUx1V3V3bmRKeTl5YzlXWUJlVVkwMTlQVzFycUJnSWNVUzVjdjlWR0VzUQ?oc=5"
    },
    "status": "Media Reported",
    "addedAt": "2026-05-21T14:58:39.050756+00:00"
  },
  {
    "id": "INC-0E8B576F",
    "date": "2024-06-25T07:00:00+00:00",
    "county": "Unknown",
    "location": "",
    "description": "Idris Elba and Keir Starmer meet families of knife crime victims - CorkLive.ie",
    "source": {
      "title": "Google News",
      "url": "https://news.google.com/rss/articles/CBMixgFBVV95cUxOYzVwd1hyeVhCUzJxbmJOcXUzMnhTTGl6Z2NaYzk4a1NmTGk4X2p0dkJlNjZOZVZzSF9uNksxXzVicEdVUFJ4cUJmWm94LW1RQWdpVFB4X2ZxM0VJRmN2MExuOElqLTdRTF8yNU5OWUxiRDltVDhuN1JQZG0yOEt3Ymlfa0hkdGRGYTUxNmR3X0R6VEQ0OGZ3ejl3VmQzWlNBUjNYcWVuTU5vajBzVF9IS0xLQkhUSmVmSF94QUJJcjY1cC1Zdnc?oc=5"
    },
    "status": "Media Reported",
    "addedAt": "2026-05-21T14:58:31.291013+00:00"
  },
  {
    "id": "INC-3C9058CE",
    "date": "2024-06-22T07:00:00+00:00",
    "county": "Limerick",
    "location": "",
    "description": "BREAKING: Man charged over carving knife stabbing during burglary at Limerick home - Limerick Leader",
    "source": {
      "title": "Google News",
      "url": "https://news.google.com/rss/articles/CBMizwFBVV95cUxNaGZLYXZULU1kM3A0cUVLLTNfemVsZ0lNbHRkWWFndnlXeV9iM25EZzlMMHlFVHJDekJhQ1ZVTVZYZDNIeUpUQU5lZUIzRzJEUmx4TWJZblBKNUUxS1pDQi1WNkVvdGdYRzU0STRmTEl5bk5vWXBfdEV0VlppcHd1X2R0VXhCbV9JcHQzUlg3OE9mRDBoaWFOYWpqOVNJU2NEWkFBbWVBaGhLTnlYSVVTWndWZ0dFU0pPd2RWa3hHNGNvVXBxdTh0ZDlCdURGZjA?oc=5"
    },
    "status": "Media Reported",
    "addedAt": "2026-05-21T14:58:41.012429+00:00"
  },
  {
    "id": "INC-CBFD98BF",
    "date": "2024-04-30T07:00:00+00:00",
    "county": "Dublin",
    "location": "",
    "description": "Man seriously injured in suspected knife attack at homeless tents in Dublin city centre - The Irish Times",
    "source": {
      "title": "Google News",
      "url": "https://news.google.com/rss/articles/CBMi0gFBVV95cUxPSVBrQkxMaXBHeXQ3UEtBaG5BQUJRZzVLUDkybmVlV2xMUXBxaW44RDh4Y0VCdEZRQVljQm5rM21hVGlzT0tuVmtIQkpvZTZPM0JHSmhxNFV0U1NrRHpCZG5HbWI2cVpKbjJLQUZkLU1xM1p6amVlVHF2WVR6OTZZTXpLOEJpbmVNTklkOXp2OTJXeGhwMXAyb18yZmMxNmxpSzFLYlQ4YlVOel9pUENVZ01EeFMwT1ZaRHVBMnowbExPelZsTmFKM2ZNa2Z0N1BqSHc?oc=5"
    },
    "status": "Media Reported",
    "addedAt": "2026-05-21T14:58:27.287732+00:00"
  },
  {
    "id": "INC-E5D23C49",
    "date": "2024-04-15T07:00:00+00:00",
    "county": "Unknown",
    "location": "",
    "description": "Concern over scale of knife crime in Ireland - BreakingNews.ie",
    "source": {
      "title": "Google News",
      "url": "https://news.google.com/rss/articles/CBMimAFBVV95cUxNMm5VRTJqQ2I5QzR2cXJnMnZma05Demp6M3Q5RHJYUDBXNzZfWTRUdG5YbDdXZ19WRkNuemF4dGs2SUpCUExHbWFYQXhvWHZ1bEZzTjF5VXh5TTA4YXVEMW5KQWozYkJWNEpzQzRNa1Z4YnJMM3ZJQlV4SzlTdVlxbFc5My1aMEFrN01HQVJlMTI2WG10eW9xdA?oc=5"
    },
    "status": "Media Reported",
    "addedAt": "2026-05-21T14:58:29.438084+00:00"
  },
  {
    "id": "INC-A0B4E374",
    "date": "2024-04-11T07:00:00+00:00",
    "county": "Antrim",
    "location": "",
    "description": "West Belfast: Man and woman released on bail following stabbing - BBC",
    "source": {
      "title": "Google News",
      "url": "https://news.google.com/rss/articles/CBMiZkFVX3lxTFA4NmhvNU5hNXZwVWd3d2thMjFDdzFINC1yZjlUd1c5VzhvSXRBUUJxOXB4ZERoVjlHRWM3MkZ4SGVtX0JCN3doa0FXUUNWNlhVZmFMRkVnNFpoMmZtSjhoWjBST2Zhdw?oc=5"
    },
    "status": "Media Reported",
    "addedAt": "2026-05-21T14:58:42.943776+00:00"
  },
  {
    "id": "INC-563EED37",
    "date": "2024-04-08T07:00:00+00:00",
    "county": "Longford",
    "location": "",
    "description": "Killing of Sarah McNally \u2018stopped us in our tracks\u2019, funeral of Longford woman stabbed in New York told - The Irish Times",
    "source": {
      "title": "Google News",
      "url": "https://news.google.com/rss/articles/CBMi3gFBVV95cUxPWkJBZTBaeFpYTlhiRUNya2E4X1h6STNKVVdPVVRwN1VPN3VrRU5hYm5FaDM1cWNVcV9hdmgtSUxSalpJM0JtWVBGYnFpLXZSY2xPakJfWTcyal9mMmxrQXZOdUZwVjZlSDF1U1JxWlFpT2VFNkdZWnlwbHk4U0ttSEVHX3NDdWw5NXFhZWh1MFdXQmswbHltOU8yS2NyMEo5YUxoM09WSHcxelJlZDh3RGJ5aC15UEpDSWRDTkR2NWhvLVFwWGlzSjQxRWlTMlRHbmJ6QmFXYmlqc2tnSUE?oc=5"
    },
    "status": "Media Reported",
    "addedAt": "2026-05-21T14:58:48.806821+00:00"
  },
  {
    "id": "INC-2FE0B66D",
    "date": "2024-04-01T07:00:00+00:00",
    "county": "Longford",
    "location": "",
    "description": "Longford Woman Stabbed to Death in Queens - Irish Echo Newspaper",
    "source": {
      "title": "Google News",
      "url": "https://news.google.com/rss/articles/CBMif0FVX3lxTE9Mb1czZFdCWW1FV3NlRno0LXJLNnRuSGFoWlV4aXZVdE5YU3hmMUY2VmxydFkyX1RUT205aDVtbjdvOGdWZXJESkFBdy00VW9Bd0hya2pqMmFDd2lLRlZSZjYzZkZOZ3ozV3o5Ymp6ZUsxTkVwelVWVmlDVDkxdk0?oc=5"
    },
    "status": "Media Reported",
    "addedAt": "2026-05-21T14:58:48.799061+00:00"
  },
  {
    "id": "INC-C3746EDA",
    "date": "2024-02-26T08:00:00+00:00",
    "county": "Cork",
    "location": "",
    "description": "Man feared he would be stabbed as Cork man held knife to his throat - echo live",
    "source": {
      "title": "Google News",
      "url": "https://news.google.com/rss/articles/CBMiYEFVX3lxTFBrMm5uUWRiSzc2LVZBUDZ6eTRrLTRlNW9XLW1Rc3BoSHNVWGRxNTUxWHh1NWl3cHNYMHVWeDFEZTE2b3I5aTBDblpsdXF4NmtGSkxDQURVbTNWak1NM09mTw?oc=5"
    },
    "status": "Media Reported",
    "addedAt": "2026-05-21T14:58:31.268852+00:00"
  },
  {
    "id": "INC-446E9B0B",
    "date": "2024-01-12T08:00:00+00:00",
    "county": "Cork",
    "location": "",
    "description": "Garda\u00ed issue appeal after man armed with knife steals cash from Cork business - Sunday World",
    "source": {
      "title": "Google News",
      "url": "https://news.google.com/rss/articles/CBMiyAFBVV95cUxPUG9wak5wanM5X3NLek5Zd3dWZFMwNXl5ZmhkaTdXUG5iSUtCbm1uckpGeExsLWNYcE9vWXh6WFBRR0tEVGVLRTBYUV9sb1d2VmdrT2lzeS1NU3lvRzY5Y2lxZi05X2ZUUDZYNFR2QWI5WEhCQW0wMlh3S2Y3WHUtLVFjaV8yS1dEZVR0Vkk1SEc3YzFzd2FNUmgzVmVuMFZCUjBseTJ3SE95RjM4aGtOQ3JyR2VkZWRWOXRydmk1dlUxekpocEhGOA?oc=5"
    },
    "status": "Media Reported",
    "addedAt": "2026-05-21T14:58:31.293891+00:00"
  },
  {
    "id": "INC-10CC6F6F",
    "date": "2024-01-08T08:00:00+00:00",
    "county": "Cork",
    "location": "Cork -",
    "description": "Three teens rushed to hospital after knife attack in Cork - Cork Beo",
    "source": {
      "title": "Google News",
      "url": "https://news.google.com/rss/articles/CBMiiAFBVV95cUxQZHF2dHA2TXZzRzFuM0xHRUhlRUh3ODgyeDg5SHJxVFd1MkhqSjN2emNod3FlVlo2WjBKczBCVnRmZDdEcjd5TVZEYnVCYk9JYmtDS0RmM2R2YjhoTlNzWm9ycEIxMl83M1BPTVBKaXNpOHlaS3YycVZHRjYwM1BpWFlHV0V1Vzdt0gGOAUFVX3lxTE1HMGJHUy00QkotSFVJankwZWZpbmFMSVdwbU9kY3k2X2UxRlh1WF9HMWQ5akV5N04zZ3ZMRm8xTXlUVWtyc0U5NkRCQXp5dEV6dUZtMS1vd1laX2ZIM0Z5akY0R0FYVklYb210bDY4TEwyLTY0M01kVU85RHNHZ3puSXFsVER1ZXJrSklVbGc?oc=5"
    },
    "status": "Media Reported",
    "addedAt": "2026-05-21T14:58:31.269898+00:00"
  },
  {
    "id": "INC-5A790131",
    "date": "2024-01-07T08:00:00+00:00",
    "county": "Dublin",
    "location": "",
    "description": "Girl, 5, stabbed outside Dublin school will need to 'relearn everything', family says - Sky News",
    "source": {
      "title": "Google News",
      "url": "https://news.google.com/rss/articles/CBMitwFBVV95cUxPZk1DMHpmVzJsa3N6SExEZ3l1azlLeWdHeXRrWFRzZ0N1a0ZvNE5QeU1aTEpJVUI5VGRrbkloRDB0R0tMaHREeTdkMWJUblIwZmJ6Ry1tc3JoYkYtdVY1SGdzTklCVWV3T0hrdmlHRW1ycGZZUkRfV1NScjdrTkY3MEdMOGRxUXZfY0tkMmJrbWpaVVJHN3JTUlFtS1NNd0JKYkhNZzlOZUJfR091cWFJaFVjczh6Q2s?oc=5"
    },
    "status": "Media Reported",
    "addedAt": "2026-05-21T14:58:48.820980+00:00"
  }
];
