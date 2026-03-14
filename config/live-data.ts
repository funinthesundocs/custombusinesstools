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
      { signal: AbortSignal.timeout(4000) }
    )
    const d = await res.json()
    const r = d.results?.[0]
    if (!r) return null
    return {
      lat: r.latitude,
      lon: r.longitude,
      display: r.country_code ? `${r.name}, ${r.admin1 || r.country}` : r.name
    }
  } catch {
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
      { signal: AbortSignal.timeout(5000) }
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
      { signal: AbortSignal.timeout(5000) }
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
    return `ISS currently at ${Math.abs(parseFloat(lat))}°${ns}, ${Math.abs(parseFloat(lon))}°${ew}, altitude ${alt} km (${vis})`
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
      { signal: AbortSignal.timeout(4000) }
    )
    const d = await res.json()
    if (!d.results) return ''
    return `Today (${location}): sunrise ${d.results.sunrise}, sunset ${d.results.sunset}, golden hour ${d.results.golden_hour}`
  } catch {
    return ''
  }
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
}

export async function fetchAllFeeds(cfg: DataFeedsConfig = {}): Promise<Record<string, string>> {
  const location = cfg.defaultLocation || ''
  const base = cfg.baseCurrency || 'USD'
  const assets = cfg.cryptoAssets || ['bitcoin', 'ethereum', 'solana']
  const minMag = cfg.earthquakeMinMagnitude || 4.0

  const [weather, airQuality, forex, crypto, earthquakes, naturalEvents, recalls, news, iss, sunrise] =
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
  check('earthquakes',    /earthquake|quake|seismic|tremor|magnitude|richter|fault|aftershock|tsunami/)
  check('natural_events', /wildfire|fire|hurricane|typhoon|cyclone|volcano|flood|disaster|natural event|storm surge/)
  check('recalls',        /recall|fda|food safety|contamination|drug recall|warning label|safety alert|listeria|salmonella/)
  check('news',           /news|headline|today|current events|latest|happening|trending|breaking/)
  check('iss',            /\biss\b|space station|astronaut|orbit|nasa mission/)
  check('sunrise',        /sunrise|sunset|golden hour|dusk|dawn|daylight|sun rise|sun set/)

  return selected.filter(Boolean).join('\n')
}
