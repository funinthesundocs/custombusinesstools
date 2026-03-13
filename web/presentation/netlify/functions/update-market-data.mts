const WEATHER_CODES: Record<number, string> = {
  0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
  45: 'Foggy', 48: 'Depositing rime fog',
  51: 'Light drizzle', 53: 'Moderate drizzle', 55: 'Dense drizzle',
  61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain',
  71: 'Slight snow', 73: 'Moderate snow', 75: 'Heavy snow',
  80: 'Slight rain showers', 81: 'Moderate rain showers', 82: 'Violent rain showers',
  95: 'Thunderstorm', 96: 'Thunderstorm with slight hail', 99: 'Thunderstorm with heavy hail'
};

import config from '../../config.json'

async function fetchWeather(): Promise<Record<string, any> | null> {
  const { latitude, longitude, name } = config.market_data.weather_location;
  if (!latitude || !longitude) return null; // not configured — skip weather
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code&timezone=auto&forecast_days=3`
    );
    const data = await res.json();
    const current = data.current;
    const daily = data.daily;

    return {
      location: name || `${latitude},${longitude}`,
      current: {
        temperature_c: current.temperature_2m,
        humidity_pct: current.relative_humidity_2m,
        precipitation_mm: current.precipitation,
        condition: WEATHER_CODES[current.weather_code] || 'Unknown',
        wind_kmh: current.wind_speed_10m
      },
      forecast: daily ? daily.time.map((date: string, i: number) => ({
        date,
        high_c: daily.temperature_2m_max[i],
        low_c: daily.temperature_2m_min[i],
        rain_probability_pct: daily.precipitation_probability_max[i],
        condition: WEATHER_CODES[daily.weather_code[i]] || 'Unknown'
      })) : []
    };
  } catch {
    return null;
  }
}

async function fetchPrices(): Promise<Record<string, any> | null> {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return null;

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        system: 'You are a commodity price researcher. Return ONLY a JSON object. No explanation, no markdown backticks, no preamble. Just raw JSON.',
        messages: [{
          role: 'user',
          content: `Find current market prices for these commodities. Return JSON with this structure. Use null for any price you cannot confidently find:
{
  "iron_ore_mt": { "price": NUMBER_OR_NULL, "unit": "USD/MT", "benchmark": "62% Fe CFR China" },
  "iron_concentrate": { "price": NUMBER_OR_NULL, "unit": "USD/MT", "benchmark": "65% Fe" },
  "hot_rolled_coils": { "price": NUMBER_OR_NULL, "unit": "USD/MT", "benchmark": "HRC" },
  "copper_ore_mt": { "price": NUMBER_OR_NULL, "unit": "USD/MT" },
  "copper_concentrate": { "price": NUMBER_OR_NULL, "unit": "USD/MT" },
  "refined_copper": { "price": NUMBER_OR_NULL, "unit": "USD/MT", "benchmark": "LME" },
  "gold_oz": { "price": NUMBER_OR_NULL, "unit": "USD/oz", "benchmark": "spot" },
  "silver_oz": { "price": NUMBER_OR_NULL, "unit": "USD/oz", "benchmark": "spot" },
  "date": "YYYY-MM-DD"
}
ONLY the JSON object. Nothing else.`
        }]
      })
    });

    const response = await res.json();
    const textContent = response.content?.filter((c: any) => c.type === 'text').map((c: any) => c.text).join('') || '';
    const cleaned = textContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}

export default async (req: Request) => {
  try {
    const authHeader = req.headers.get('Authorization');
    const taskSecret = process.env.TASK_PROCESSOR_SECRET;
    const isScheduled = req.headers.get('X-NF-Event') === 'schedule';

    if (!isScheduled && authHeader !== `Bearer ${taskSecret}`) {
      return new Response('Unauthorized', { status: 401 });
    }

    const [prices, weather] = await Promise.all([fetchPrices(), fetchWeather()]);

    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return Response.json({ error: 'Missing Supabase config' }, { status: 500 });
    }

    const writeRes = await fetch(`${supabaseUrl}/rest/v1/market_data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        prices: prices || {},
        weather: weather || {},
        fetched_at: new Date().toISOString()
      })
    });

    if (!writeRes.ok) {
      const err = await writeRes.text();
      return Response.json({ error: 'DB write failed', details: err }, { status: 500 });
    }

    return Response.json({ success: true, prices, weather, fetched_at: new Date().toISOString() });
  } catch (error: any) {
    return Response.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
};

