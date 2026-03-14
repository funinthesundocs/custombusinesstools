/**
 * RAG Factory — Universal Live Data Feeds
 *
 * Zero-dependency TypeScript module. Uses fetch() only.
 * Works in Netlify Edge, Node.js, Vercel, and any modern runtime.
 *
 * DATA HIERARCHY (enforced in chat.mts):
 *   1. Embeddings (Pinecone RAG) — knowledge base, always first
 *   2. Live data feeds (this module) — real-time structured data, free APIs
 *   3. web_search — last resort for unstructured/novel questions
 *
 * Each fetcher returns a compact plain-English summary string (50-150 tokens).
 * Feeds are keyword-matched at read time — only relevant feeds reach the agent.
 */

const WEATHER_CODES: Record<number, string> = {
  0: 'Clear', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
  45: 'Foggy', 48: 'Rime fog', 51: 'Light drizzle', 53: 'Moderate drizzle',
  55: 'Dense drizzle', 61: 'Light rain', 63: 'Moderate rain', 65: 'Heavy rain',
  71: 'Light snow', 73: 'Moderate snow', 75: 'Heavy snow',
  80: 'Light showers', 81: 'Moderate showers', 82: 'Heavy showers',
  95: 'Thunderstorm', 96: 'Thunderstorm with hail', 99: 'Thunderstorm with heavy hail'
}

function wcode(code: number): string {
  return WEATHER_CODES[code] || 'Unknown'
}

// ---------------------------------------------------------------------------
// Geocoding — Open-Meteo geocoding API (free, no key)
// ---------------------------------------------------------------------------

export async function geocodeLocation(name: string): Promise<{ lat: number; lon: number; display: string } | null> {
  try {
    const res = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=1&language=en&format=json`,
      { signal: AbortSignal.timeout(8000) }
    )
    const d = await res.json()
    const r = d.results?.[0]
    if (!r) return null
    return {
      lat: r.latitude,
      lon: r.longitude,
      display: r.country_code ? `${r.name}, ${r.admin1 || r.country}` : r.name
    }
  } catch (e) {
    console.error('[live-data] geocodeLocation failed:', e)
    return null
  }
}

// ---------------------------------------------------------------------------
// Weather — Open-Meteo (free, no key, 10,000 req/day)
// Accepts city name (geocoded) or "lat,lon" string
// ---------------------------------------------------------------------------

export async function fetchWeather(location: string): Promise<string> {
  if (!location?.trim()) return ''
  try {
    let lat: number, lon: number, display: string
    const coord = location.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/)
    if (coord) {
      lat = parseFloat(coord[1]); lon = parseFloat(coord[2]); display = location
    } else {
      const geo = await geocodeLocation(location)
      if (!geo) return ''
      lat = geo.lat; lon = geo.lon; display = geo.display
    }
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      `&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m` +
      `&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code` +
      `&timezone=auto&forecast_days=3`,
      { signal: AbortSignal.timeout(8000) }
    )
    const d = await res.json()
    const c = d.current
    if (!c) return ''
    let out = `Weather (${display}): ${c.temperature_2m}°C, ${wcode(c.weather_code)}, humidity ${c.relative_humidity_2m}%, wind ${c.wind_speed_10m} km/h`
    if (c.precipitation > 0) out += `, ${c.precipitation}mm precipitation`
    const dd = d.daily
    if (dd?.time?.length) {
      const forecasts = dd.time.slice(0, 3).map((date: string, i: number) =>
        `${date}: ${wcode(dd.weather_code[i])}, ${dd.temperature_2m_min[i]}–${dd.temperature_2m_max[i]}°C, ${dd.precipitation_probability_max[i]}% rain`
      )
      out += '. Forecast: ' + forecasts.join(' | ')
    }
    return out
  } catch {
    return ''
  }
}

// ---------------------------------------------------------------------------
// Air Quality — Open-Meteo Air Quality API (free, no key, global)
// ---------------------------------------------------------------------------

export async function fetchAirQuality(location: string): Promise<string> {
  if (!location?.trim()) return ''
  try {
    let lat: number, lon: number, display: string
    const coord = location.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/)
    if (coord) {
      lat = parseFloat(coord[1]); lon = parseFloat(coord[2]); display = location
    } else {
      const geo = await geocodeLocation(location)
      if (!geo) return ''
      lat = geo.lat; lon = geo.lon; display = geo.display
    }
    const res = await fetch(
      `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}` +
      `&current=european_aqi,pm10,pm2_5,nitrogen_dioxide,ozone`,
      { signal: AbortSignal.timeout(8000) }
    )
    const d = await res.json()
    const c = d.current
    if (!c) return ''
    const aqi = c.european_aqi
    const label = aqi <= 20 ? 'Good' : aqi <= 40 ? 'Fair' : aqi <= 60 ? 'Moderate' : aqi <= 80 ? 'Poor' : 'Very Poor'
    return `Air quality (${display}): AQI ${aqi} (${label}), PM2.5: ${c.pm2_5} μg/m³, PM10: ${c.pm10} μg/m³`
  } catch {
    return ''
  }
}

// ---------------------------------------------------------------------------
// Forex — ExchangeRate-API open endpoint (free, no key, 160+ currencies, daily)
// ---------------------------------------------------------------------------

export async function fetchForex(base = 'USD'): Promise<string> {
  try {
    const res = await fetch(
      `https://open.er-api.com/v6/latest/${base}`,
      { signal: AbortSignal.timeout(5000) }
    )
    const d = await res.json()
    if (!d.rates) return ''
    const pairs = ['EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR', 'MXN', 'BRL', 'KRW', 'SGD']
    const rates = pairs
      .filter(p => d.rates[p])
      .map(p => `${p}: ${Number(d.rates[p]).toFixed(4)}`)
      .join(', ')
    const updated = d.time_last_update_utc?.split(' 00')[0] || 'today'
    return `Forex rates (${base} base, ${updated}): ${rates}`
  } catch {
    return ''
  }
}

// ---------------------------------------------------------------------------
// Crypto — CoinGecko (free, no key, ~30 req/min)
// ---------------------------------------------------------------------------

export async function fetchCrypto(assets = ['bitcoin', 'ethereum', 'solana']): Promise<string> {
  if (!assets?.length) return ''
  try {
    const ids = assets.slice(0, 10).join(',')
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`,
      { signal: AbortSignal.timeout(6000) }
    )
    const d = await res.json()
    if (!d || typeof d !== 'object') return ''
    const parts = Object.entries(d).map(([id, v]) => {
      const val = v as { usd: number; usd_24h_change?: number }
      const name = id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
      const price = val.usd >= 1000
        ? `$${Math.round(val.usd).toLocaleString('en-US')}`
        : val.usd >= 1 ? `$${val.usd.toFixed(2)}`
        : `$${val.usd.toFixed(4)}`
      const chg = typeof val.usd_24h_change === 'number'
        ? ` (${val.usd_24h_change > 0 ? '+' : ''}${val.usd_24h_change.toFixed(1)}% 24h)`
        : ''
      return `${name}: ${price}${chg}`
    })
    return `Crypto prices: ${parts.join(', ')}`
  } catch {
    return ''
  }
}

// ---------------------------------------------------------------------------
// Earthquakes — USGS (free, no key, real-time global)
// ---------------------------------------------------------------------------

export async function fetchEarthquakes(minMag = 4.0): Promise<string> {
  try {
    const res = await fetch(
      `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&limit=5&minmagnitude=${minMag}&orderby=time`,
      { signal: AbortSignal.timeout(5000) }
    )
    const d = await res.json()
    const features: Array<{ properties: { mag: number; place: string; time: number } }> = d.features || []
    if (features.length === 0) return `No earthquakes M${minMag}+ recorded in recent period.`
    const parts = features.slice(0, 3).map(f => {
      const p = f.properties
      const ago = Math.round((Date.now() - p.time) / 3600000)
      return `M${p.mag?.toFixed(1)} ${p.place} (${ago}h ago)`
    })
    return `Recent earthquakes (M${minMag}+): ${parts.join('; ')}`
  } catch {
    return ''
  }
}

// ---------------------------------------------------------------------------
// Natural Events — NASA EONET (free, no key, global)
// ---------------------------------------------------------------------------

export async function fetchNaturalEvents(): Promise<string> {
  try {
    const res = await fetch(
      'https://eonet.gsfc.nasa.gov/api/v3/events?limit=5&status=open',
      { signal: AbortSignal.timeout(5000) }
    )
    const d = await res.json()
    const events: Array<{ categories?: Array<{ title: string }>; title: string }> = d.events || []
    if (events.length === 0) return 'No active natural events reported by NASA EONET.'
    const parts = events.slice(0, 3).map(e =>
      `${e.categories?.[0]?.title || 'Event'}: ${e.title}`
    )
    return `Active natural events (NASA EONET): ${parts.join('; ')}`
  } catch {
    return ''
  }
}

// ---------------------------------------------------------------------------
// FDA Recalls — OpenFDA (free, no key, 1,000 req/day)
// ---------------------------------------------------------------------------

export async function fetchRecalls(): Promise<string> {
  try {
    const res = await fetch(
      'https://api.fda.gov/food/enforcement.json?limit=3&sort=report_date:desc',
      { signal: AbortSignal.timeout(5000) }
    )
    const d = await res.json()
    const results: Array<{ brand_name?: string; product_description?: string; reason_for_recall?: string }> = d.results || []
    if (results.length === 0) return 'No recent FDA food recalls.'
    const parts = results.map(r => {
      const brand = r.brand_name || r.product_description?.split(' ').slice(0, 3).join(' ') || 'Product'
      const reason = r.reason_for_recall?.substring(0, 100) || 'See FDA website'
      return `${brand}: ${reason}`
    })
    return `Recent FDA food recalls: ${parts.join('; ')}`
  } catch {
    return ''
  }
}

// ---------------------------------------------------------------------------
// Tech News — HackerNews (free, no key, unlimited, real-time)
// ---------------------------------------------------------------------------

export async function fetchNews(): Promise<string> {
  try {
    const topRes = await fetch(
      'https://hacker-news.firebaseio.com/v0/topstories.json',
      { signal: AbortSignal.timeout(5000) }
    )
    const ids: number[] = await topRes.json()
    const top5 = ids.slice(0, 5)
    const stories = await Promise.all(
      top5.map(id =>
        fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`, { signal: AbortSignal.timeout(3000) })
          .then(r => r.json())
          .catch(() => null)
      )
    )
    const titles = (stories as Array<{ title?: string } | null>)
      .filter((s): s is { title: string } => s !== null && typeof s?.title === 'string')
      .map(s => s.title)
    if (titles.length === 0) return ''
    return `Top tech news (HackerNews): ${titles.join(' | ')}`
  } catch {
    return ''
  }
}

// ---------------------------------------------------------------------------
// ISS Location — Open Notify (free, no key, real-time)
// ---------------------------------------------------------------------------

export async function fetchIss(): Promise<string> {
  try {
    const res = await fetch('https://api.wheretheiss.at/v1/satellites/25544', { signal: AbortSignal.timeout(8000) })
    if (!res.ok) return ''
    const d = await res.json()
    // API returns latitude/longitude as numbers (can be 0 on equator, so use 'in' check)
    if (typeof d.latitude !== 'number' || typeof d.longitude !== 'number') return ''
    const lat = d.latitude.toFixed(1)
    const lon = d.longitude.toFixed(1)
    const alt = Math.round(d.altitude)
    const ns = d.latitude >= 0 ? 'N' : 'S'
    const ew = d.longitude >= 0 ? 'E' : 'W'
    const vis = d.visibility === 'daylight' ? 'in daylight' : 'in eclipse'
    return `International Space Station (ISS) currently at ${Math.abs(parseFloat(lat))}°${ns}, ${Math.abs(parseFloat(lon))}°${ew}, altitude ${alt} km (${vis})`
  } catch {
    return ''
  }
}

// ---------------------------------------------------------------------------
// Sunrise/Sunset — SunriseSunset.io (free, no key, global)
// ---------------------------------------------------------------------------

export async function fetchSunrise(location: string): Promise<string> {
  if (!location?.trim()) return ''
  try {
    let lat: number, lon: number
    const coord = location.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/)
    if (coord) {
      lat = parseFloat(coord[1]); lon = parseFloat(coord[2])
    } else {
      const geo = await geocodeLocation(location)
      if (!geo) return ''
      lat = geo.lat; lon = geo.lon
    }
    const res = await fetch(
      `https://api.sunrisesunset.io/json?lat=${lat}&lng=${lon}&timezone=auto`,
      { signal: AbortSignal.timeout(8000) }
    )
    const d = await res.json()
    if (!d.results) return ''
    return `Today (${location}): sunrise ${d.results.sunrise}, sunset ${d.results.sunset}, golden hour ${d.results.golden_hour}`
  } catch {
    return ''
  }
}

// ---------------------------------------------------------------------------
// Commodities — Yahoo Finance unofficial endpoint (free, no key)
// Tickers: GC=F gold, SI=F silver, CL=F WTI oil, BZ=F Brent, NG=F nat gas, HG=F copper
// ---------------------------------------------------------------------------

const COMMODITY_SYMBOLS = [
  { ticker: 'GC=F',  name: 'Gold',        unit: '/oz' },
  { ticker: 'SI=F',  name: 'Silver',      unit: '/oz' },
  { ticker: 'PL=F',  name: 'Platinum',    unit: '/oz' },
  { ticker: 'PA=F',  name: 'Palladium',   unit: '/oz' },
  { ticker: 'CL=F',  name: 'WTI Oil',     unit: '/bbl' },
  { ticker: 'BZ=F',  name: 'Brent Oil',   unit: '/bbl' },
  { ticker: 'NG=F',  name: 'Nat Gas',     unit: '/MMBtu' },
  { ticker: 'HG=F',  name: 'Copper',      unit: '/lb' },
]

async function yahooPrice(ticker: string): Promise<{ price: number; change: number; changePct: number } | null> {
  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=2d`,
      {
        signal: AbortSignal.timeout(6000),
        headers: { 'User-Agent': 'Mozilla/5.0' }
      }
    )
    if (!res.ok) return null
    const d = await res.json()
    const meta = d?.chart?.result?.[0]?.meta
    if (!meta?.regularMarketPrice) return null
    const price = meta.regularMarketPrice as number
    const prev = (meta.chartPreviousClose ?? meta.previousClose ?? price) as number
    const change = price - prev
    const changePct = prev !== 0 ? (change / prev) * 100 : 0
    return { price, change, changePct }
  } catch {
    return null
  }
}

export async function fetchCommodities(): Promise<string> {
  const results = await Promise.all(
    COMMODITY_SYMBOLS.map(async ({ ticker, name, unit }) => {
      const q = await yahooPrice(ticker)
      if (!q) return null
      const sign = q.change >= 0 ? '+' : ''
      const price = q.price < 10
        ? q.price.toFixed(3)
        : q.price >= 1000 ? Math.round(q.price).toLocaleString('en-US') : q.price.toFixed(2)
      return `${name}: $${price}${unit} (${sign}${q.changePct.toFixed(1)}%)`
    })
  )
  const parts = results.filter(Boolean) as string[]
  if (!parts.length) return ''
  return `Commodity prices: ${parts.join(', ')}`
}

// ---------------------------------------------------------------------------
// Stock indices + configurable stocks — Yahoo Finance unofficial
// Default indices: S&P 500, Nasdaq, Dow Jones
// ---------------------------------------------------------------------------

const DEFAULT_INDICES = [
  { ticker: '^GSPC', name: 'S&P 500' },
  { ticker: '^IXIC', name: 'Nasdaq' },
  { ticker: '^DJI',  name: 'Dow' },
]

export async function fetchStocks(extraSymbols: string[] = []): Promise<string> {
  const symbols = [
    ...DEFAULT_INDICES,
    ...extraSymbols.map(s => ({ ticker: s.toUpperCase(), name: s.toUpperCase() })),
  ]
  const results = await Promise.all(
    symbols.map(async ({ ticker, name }) => {
      const q = await yahooPrice(ticker)
      if (!q) return null
      const sign = q.change >= 0 ? '+' : ''
      const price = q.price >= 1000 ? Math.round(q.price).toLocaleString('en-US') : q.price.toFixed(2)
      return `${name}: ${price} (${sign}${q.changePct.toFixed(1)}%)`
    })
  )
  const parts = results.filter(Boolean) as string[]
  if (!parts.length) return ''
  return `Stock markets: ${parts.join(', ')}`
}

// ---------------------------------------------------------------------------
// Moon phase — pure math, no API, no network call
// ---------------------------------------------------------------------------

export function fetchMoonPhase(): string {
  const KNOWN_NEW_MOON_MS = new Date('2000-01-06T18:14:00Z').getTime()
  const SYNODIC_MS = 29.530589 * 24 * 60 * 60 * 1000
  const now = Date.now()
  const elapsed = now - KNOWN_NEW_MOON_MS
  const cyclePos = ((elapsed % SYNODIC_MS) + SYNODIC_MS) % SYNODIC_MS
  const dayInCycle = cyclePos / (24 * 60 * 60 * 1000)
  const pct = cyclePos / SYNODIC_MS

  let phase: string
  if (pct < 0.0625)       phase = 'New Moon'
  else if (pct < 0.1875)  phase = 'Waxing Crescent'
  else if (pct < 0.3125)  phase = 'First Quarter'
  else if (pct < 0.4375)  phase = 'Waxing Gibbous'
  else if (pct < 0.5625)  phase = 'Full Moon'
  else if (pct < 0.6875)  phase = 'Waning Gibbous'
  else if (pct < 0.8125)  phase = 'Last Quarter'
  else if (pct < 0.9375)  phase = 'Waning Crescent'
  else                     phase = 'New Moon'

  const illumination = Math.round((1 - Math.cos(2 * Math.PI * pct)) / 2 * 100)
  return `Moon phase: ${phase} (${illumination}% illuminated, day ${Math.floor(dayInCycle) + 1}/29 of cycle)`
}

// ---------------------------------------------------------------------------
// Space launches — The Space Devs Launch Library 2 (free, no key, live data)
// Rate limit: 15 req/hour on free tier (fine with TTL caching)
// ---------------------------------------------------------------------------

export async function fetchSpaceX(): Promise<string> {
  try {
    const [upcomingRes, previousRes] = await Promise.all([
      fetch('https://ll.thespacedevs.com/2.3.0/launches/upcoming/?limit=1&format=json', { signal: AbortSignal.timeout(6000) }),
      fetch('https://ll.thespacedevs.com/2.3.0/launches/previous/?limit=1&format=json', { signal: AbortSignal.timeout(6000) }),
    ])

    const parts: string[] = []

    if (upcomingRes.ok) {
      const d = await upcomingRes.json()
      const launch = d?.results?.[0]
      if (launch?.name) {
        const date = launch.net ? new Date(launch.net).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD'
        const pad = launch.pad?.location?.country_code ? ` (${launch.pad.location.country_code})` : ''
        parts.push(`Next: "${launch.name}" on ${date}${pad}`)
      }
    }

    if (previousRes.ok) {
      const d = await previousRes.json()
      const launch = d?.results?.[0]
      if (launch?.name) {
        const date = launch.net ? new Date(launch.net).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''
        const status = launch.status?.abbrev === 'Success' ? 'success' : launch.status?.abbrev === 'Failure' ? 'failure' : (launch.status?.name || 'unknown')
        parts.push(`Last: "${launch.name}" on ${date} (${status})`)
      }
    }

    if (!parts.length) return ''
    return `Space launches — ${parts.join(' | ')}`
  } catch {
    return ''
  }
}

// ---------------------------------------------------------------------------
// Sports scores — ESPN unofficial API (free, no key, live scores)
// Supported leagues: nfl, nba, nhl, mlb, mls, soccer/usa.1
// ---------------------------------------------------------------------------

const LEAGUE_LABEL: Record<string, string> = {
  nfl: 'NFL', nba: 'NBA', nhl: 'NHL', mlb: 'MLB', mls: 'MLS'
}

export async function fetchSports(leagues: string[] = ['nfl', 'nba']): Promise<string> {
  const parts: string[] = []

  await Promise.all(
    leagues.slice(0, 4).map(async (league) => {
      try {
        const sport = ['nfl', 'nba', 'nhl', 'mlb'].includes(league)
          ? (league === 'nfl' ? 'football/nfl' : league === 'nba' ? 'basketball/nba' : league === 'nhl' ? 'hockey/nhl' : 'baseball/mlb')
          : `soccer/${league}`
        const res = await fetch(
          `https://site.api.espn.com/apis/site/v2/sports/${sport}/scoreboard`,
          { signal: AbortSignal.timeout(5000) }
        )
        if (!res.ok) return
        const d = await res.json()
        const events: Array<{
          name: string
          status: { type: { state: string; shortDetail: string } }
          competitions: Array<{ competitors: Array<{ team: { abbreviation: string }; score: string; winner?: boolean }> }>
        }> = d.events || []
        if (!events.length) {
          parts.push(`${LEAGUE_LABEL[league] || league}: No games today`)
          return
        }
        const scores = events.slice(0, 3).map(e => {
          const teams = e.competitions?.[0]?.competitors || []
          const away = teams.find((_, i) => i === 0)
          const home = teams.find((_, i) => i === 1)
          const state = e.status?.type?.state
          if (!away || !home) return e.name
          const detail = e.status?.type?.shortDetail || ''
          if (state === 'pre') return `${away.team.abbreviation} @ ${home.team.abbreviation} (${detail})`
          return `${away.team.abbreviation} ${away.score}-${home.score} ${home.team.abbreviation} (${detail})`
        })
        parts.push(`${LEAGUE_LABEL[league] || league}: ${scores.join(', ')}`)
      } catch {
        // skip failed league
      }
    })
  )

  if (!parts.length) return ''
  return `Sports scores: ${parts.join(' | ')}`
}

// ---------------------------------------------------------------------------
// Fetch all feeds in parallel — called by update-market-data.mts
// Returns a Record<string, string> of feed name → summary string
// ---------------------------------------------------------------------------

export interface DataFeedsConfig {
  defaultLocation?: string
  baseCurrency?: string
  cryptoAssets?: string[]
  earthquakeMinMagnitude?: number
  stockSymbols?: string[]
  sportsLeagues?: string[]
}

export async function fetchAllFeeds(cfg: DataFeedsConfig = {}): Promise<Record<string, string>> {
  const location = cfg.defaultLocation || ''
  const base = cfg.baseCurrency || 'USD'
  const assets = cfg.cryptoAssets || ['bitcoin', 'ethereum', 'solana']
  const minMag = cfg.earthquakeMinMagnitude || 4.0
  const stockSymbols = cfg.stockSymbols || []
  const sportsLeagues = cfg.sportsLeagues || ['nfl', 'nba']

  const [weather, airQuality, forex, crypto, earthquakes, naturalEvents, recalls, news, iss, sunrise,
         commodities, stocks, spacex, sports] =
    await Promise.allSettled([
      location ? fetchWeather(location) : Promise.resolve(''),
      location ? fetchAirQuality(location) : Promise.resolve(''),
      fetchForex(base),
      fetchCrypto(assets),
      fetchEarthquakes(minMag),
      fetchNaturalEvents(),
      fetchRecalls(),
      fetchNews(),
      fetchIss(),
      location ? fetchSunrise(location) : Promise.resolve(''),
      fetchCommodities(),
      fetchStocks(stockSymbols),
      fetchSpaceX(),
      fetchSports(sportsLeagues),
    ])

  const get = (r: PromiseSettledResult<string>) => r.status === 'fulfilled' ? r.value : ''

  return {
    weather: get(weather),
    air_quality: get(airQuality),
    forex: get(forex),
    crypto: get(crypto),
    earthquakes: get(earthquakes),
    natural_events: get(naturalEvents),
    recalls: get(recalls),
    news: get(news),
    iss: get(iss),
    sunrise: get(sunrise),
    commodities: get(commodities),
    stocks: get(stocks),
    moon_phase: fetchMoonPhase(),
    spacex: get(spacex),
    sports: get(sports),
  }
}

// ---------------------------------------------------------------------------
// Keyword matcher — called by chat.mts at conversation time
// Returns only the feed summaries relevant to the user's question
// ---------------------------------------------------------------------------

export function selectFeedsForQuestion(question: string, feeds: Record<string, string>): string {
  const q = question.toLowerCase()
  const selected: string[] = []

  const check = (key: string, pattern: RegExp) => {
    if (feeds[key] && pattern.test(q)) selected.push(feeds[key])
  }

  check('weather',        /weather|temperature|temp|rain|forecast|degrees?|hot|cold|storm|sunny|overcast|humid|wind|celsius|fahrenheit|climate|snow|freeze|freezing/)
  check('air_quality',    /air quality|aqi|pollution|pm2\.?5|pm10|smog|haze|particulate|ozone|air/)
  check('forex',          /forex|exchange rate|currency|dollar|euro|pound|yen|convert|usd|eur|gbp|jpy|cny|aud|cad|rate|fx /)
  check('crypto',         /bitcoin|btc|ethereum|eth|crypto|solana|sol|coin|defi|blockchain|nft|altcoin|trading|binance|coinbase/)
  check('commodities',    /gold|silver|platinum|palladium|oil|crude|brent|wti|natural gas|copper|commodity|commodities|precious metal|barrel|spot price/)
  check('stocks',         /stock|s&p|nasdaq|dow|market|equit|share price|nyse|index|indices|wall street|sp500|stonk/)
  check('earthquakes',    /earthquake|quake|seismic|tremor|magnitude|richter|fault|aftershock|tsunami/)
  check('natural_events', /wildfire|fire|hurricane|typhoon|cyclone|volcano|flood|disaster|natural event|storm surge/)
  check('recalls',        /recall|fda|food safety|contamination|drug recall|warning label|safety alert|listeria|salmonella/)
  check('news',           /news|headline|today|current events|latest|happening|trending|breaking/)
  check('iss',            /\biss\b|space station|astronaut|orbit|nasa mission/)
  check('sunrise',        /sunrise|sunset|golden hour|dusk|dawn|daylight|sun rise|sun set/)
  check('moon_phase',     /moon|lunar|crescent|full moon|new moon|gibbous|waxing|waning|moonrise|tide/)
  check('spacex',         /spacex|rocket|launch|falcon|starship|elon musk.*space|space.*launch|crew dragon/)
  check('sports',         /score|game|nfl|nba|nhl|mlb|football|basketball|hockey|baseball|match|standings|playoff|touchdown|goal/)

  return selected.filter(Boolean).join('\n')
}
