#!/usr/bin/env python3
"""
Multi-Exchange Price Scanner for 5LLM Trading Challenge
=========================================================

Pulls live prices, funding rates, and volumes from 12 exchanges:

  DEX (perp futures):
    - Aster DEX
    - Hyperliquid
    - dYdX v4
    - Drift Protocol

  CEX (perp futures):
    - Binance Futures
    - Bybit
    - OKX
    - MEXC
    - Gate.io
    - KuCoin Futures

  CEX (spot):
    - Coinbase
    - Kraken

Outputs MARKET_DATA.json for trading bots to consume.

No API keys required — all endpoints are public.
Uses ONLY Python stdlib (urllib, json, concurrent.futures).

Usage:
    python3 multi-exchange-scanner.py
    python3 multi-exchange-scanner.py --output /path/to/MARKET_DATA.json
"""

import json
import os
import ssl
import sys
import time
import argparse
import urllib.request
import urllib.parse
import urllib.error
from datetime import datetime, timezone
from concurrent.futures import ThreadPoolExecutor, as_completed

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

REQUEST_TIMEOUT = 12  # seconds per request
MAX_WORKERS = 12      # parallel threads for fetching

# Assets tradeable on Aster DEX that we want to track
# Maps: canonical name -> symbol used on Aster/Binance (USDT-quoted perps)
TRACKED_ASSETS = {
    "BTC":   "BTCUSDT",
    "ETH":   "ETHUSDT",
    "SOL":   "SOLUSDT",
    "ADA":   "ADAUSDT",
    "AVAX":  "AVAXUSDT",
    "XRP":   "XRPUSDT",
    "DOGE":  "DOGEUSDT",
    "LINK":  "LINKUSDT",
    "ARB":   "ARBUSDT",
    "OP":    "OPUSDT",
    "SUI":   "SUIUSDT",
    "APT":   "APTUSDT",
    "INJ":   "INJUSDT",
    "TIA":   "TIAUSDT",
    "SEI":   "SEIUSDT",
    "WIF":   "WIFUSDT",
    "JUP":   "JUPUSDT",
    "POL":   "POLUSDT",    # formerly MATIC
    "NEAR":  "NEARUSDT",
    "FIL":   "FILUSDT",
}

# Coinbase uses BASE-USD format for spot
COINBASE_SYMBOLS = {
    "BTC": "BTC-USD", "ETH": "ETH-USD", "SOL": "SOL-USD", "ADA": "ADA-USD",
    "AVAX": "AVAX-USD", "XRP": "XRP-USD", "DOGE": "DOGE-USD", "LINK": "LINK-USD",
    "ARB": "ARB-USD", "OP": "OP-USD", "SUI": "SUI-USD", "APT": "APT-USD",
    "INJ": "INJ-USD", "TIA": "TIA-USD", "SEI": "SEI-USD", "WIF": "WIF-USD",
    "JUP": "JUP-USD", "POL": "POL-USD", "NEAR": "NEAR-USD", "FIL": "FIL-USD",
}

# Kraken uses its own pair naming.
KRAKEN_SYMBOLS = {
    "BTC":  ("XBTUSD",   ["XXBTZUSD", "XBTUSD"]),
    "ETH":  ("ETHUSD",   ["XETHZUSD", "ETHUSD"]),
    "SOL":  ("SOLUSD",   ["SOLUSD"]),
    "ADA":  ("ADAUSD",   ["ADAUSD"]),
    "AVAX": ("AVAXUSD",  ["AVAXUSD"]),
    "XRP":  ("XRPUSD",   ["XXRPZUSD", "XRPUSD"]),
    "DOGE": ("DOGEUSD",  ["XDGUSD", "DOGEUSD"]),
    "LINK": ("LINKUSD",  ["LINKUSD"]),
    "ARB":  ("ARBUSD",   ["ARBUSD"]),
    "OP":   ("OPUSD",    ["OPUSD"]),
    "SUI":  ("SUIUSD",   ["SUIUSD"]),
    "APT":  ("APTUSD",   ["APTUSD"]),
    "INJ":  ("INJUSD",   ["INJUSD"]),
    "TIA":  ("TIAUSD",   ["TIAUSD"]),
    "SEI":  ("SEIUSD",   ["SEIUSD"]),
    "WIF":  ("WIFUSD",   ["WIFUSD"]),
    "JUP":  ("JUPUSD",   ["JUPUSD"]),
    "POL":  ("POLUSD",   ["POLUSD"]),
    "NEAR": ("NEARUSD",  ["NEARUSD"]),
    "FIL":  ("FILUSD",   ["FILUSD"]),
}

# Hyperliquid uses bare asset names
HYPERLIQUID_NAME_MAP = {
    "POL": ["POL", "MATIC"],
}

# ---------------------------------------------------------------------------
# All exchange names (for iteration)
# ---------------------------------------------------------------------------

ALL_EXCHANGES = [
    "aster", "binance", "coinbase", "kraken", "hyperliquid",
    "dydx", "drift", "bybit", "okx", "mexc", "gateio", "kucoin",
]

PERP_EXCHANGES = [
    "aster", "binance", "hyperliquid",
    "dydx", "drift", "bybit", "okx", "mexc", "gateio", "kucoin",
]

# ---------------------------------------------------------------------------
# API Endpoints
# ---------------------------------------------------------------------------

ASTER_PRICE_URL     = "https://fapi.asterdex.com/fapi/v1/ticker/price"
ASTER_FUNDING_URL   = "https://fapi.asterdex.com/fapi/v1/premiumIndex"
ASTER_24HR_URL      = "https://fapi.asterdex.com/fapi/v1/ticker/24hr"

BINANCE_PRICE_URL   = "https://fapi.binance.com/fapi/v1/ticker/price"
BINANCE_FUNDING_URL = "https://fapi.binance.com/fapi/v1/premiumIndex"
BINANCE_24HR_URL    = "https://fapi.binance.com/fapi/v1/ticker/24hr"

COINBASE_TICKER_URL = "https://api.exchange.coinbase.com/products/{product_id}/ticker"

KRAKEN_TICKER_URL   = "https://api.kraken.com/0/public/Ticker"

HYPERLIQUID_INFO_URL = "https://api.hyperliquid.xyz/info"

DYDX_MARKETS_URL    = "https://indexer.dydx.trade/v4/perpetualMarkets"

DRIFT_PRICES_URL    = "https://price-api-mainnet.drift.trade/v2/prices"

BYBIT_TICKERS_URL   = "https://api.bybit.com/v5/market/tickers?category=linear"

OKX_TICKERS_URL     = "https://www.okx.com/api/v5/market/tickers?instType=SWAP"

MEXC_TICKERS_URL    = "https://contract.mexc.com/api/v1/contract/ticker"

GATEIO_TICKERS_URL  = "https://api.gateio.ws/api/v4/futures/usdt/tickers"

KUCOIN_CONTRACTS_URL = "https://api-futures.kucoin.com/api/v1/allTickers"


# ---------------------------------------------------------------------------
# SSL context (some exchanges need it)
# ---------------------------------------------------------------------------

_ssl_ctx = ssl.create_default_context()


# ---------------------------------------------------------------------------
# Generic HTTP fetch using urllib (stdlib only)
# ---------------------------------------------------------------------------

def fetch_json(url, params=None, method="GET", json_body=None, label=""):
    """Generic fetch with timeout and error handling. Uses urllib only."""
    try:
        if method == "GET" and params:
            query = urllib.parse.urlencode(params)
            full_url = f"{url}?{query}" if "?" not in url else f"{url}&{query}"
        else:
            full_url = url

        if method == "POST" and json_body is not None:
            data = json.dumps(json_body).encode("utf-8")
            req = urllib.request.Request(
                full_url, data=data, method="POST",
                headers={"Content-Type": "application/json"}
            )
        else:
            req = urllib.request.Request(full_url, method=method)

        req.add_header("User-Agent", "5LLM-Scanner/2.0")
        req.add_header("Accept", "application/json")

        with urllib.request.urlopen(req, timeout=REQUEST_TIMEOUT, context=_ssl_ctx) as resp:
            raw = resp.read()
            return json.loads(raw)

    except urllib.error.HTTPError as e:
        print(f"  [HTTP {e.code}] {label or url}")
        return None
    except urllib.error.URLError as e:
        reason = str(e.reason) if hasattr(e, 'reason') else str(e)
        if "timed out" in reason.lower() or "timeout" in reason.lower():
            print(f"  [TIMEOUT] {label or url}")
        else:
            print(f"  [CONN_ERR] {label or url}: {reason}")
        return None
    except Exception as e:
        print(f"  [ERROR] {label or url}: {e}")
        return None


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def safe_float(val):
    """Convert to float safely, returning None on failure."""
    if val is None:
        return None
    try:
        f = float(val)
        return f if f == f else None  # NaN check
    except (ValueError, TypeError):
        return None


def calc_spread_pct(price_a, price_b):
    """Calculate spread as percentage: (a - b) / b * 100."""
    if price_a is None or price_b is None or price_b == 0:
        return None
    return round(((price_a - price_b) / price_b) * 100, 5)


# ---------------------------------------------------------------------------
# Symbol mapping helpers for new exchanges
# ---------------------------------------------------------------------------

def canonical_from_usdt(sym):
    """BTCUSDT -> BTC"""
    if sym.endswith("USDT"):
        return sym[:-4]
    return None


def usdt_sym_for(canonical):
    """BTC -> BTCUSDT"""
    return TRACKED_ASSETS.get(canonical)


# Reverse lookup: BTCUSDT -> BTC
_USDT_TO_CANONICAL = {v: k for k, v in TRACKED_ASSETS.items()}


# ---------------------------------------------------------------------------
# Fetchers — Original 5 exchanges (converted from requests to urllib)
# ---------------------------------------------------------------------------

def fetch_aster_data():
    """Fetch Aster DEX prices, funding rates, and 24h data in batch."""
    prices_raw = fetch_json(ASTER_PRICE_URL, label="Aster prices")
    funding_raw = fetch_json(ASTER_FUNDING_URL, label="Aster funding")
    ticker_24h_raw = fetch_json(ASTER_24HR_URL, label="Aster 24hr")

    result = {}
    wanted = set(TRACKED_ASSETS.values())

    if prices_raw:
        for item in prices_raw:
            sym = item.get("symbol", "")
            if sym in wanted:
                result.setdefault(sym, {})["price"] = safe_float(item.get("price"))

    if funding_raw:
        for item in funding_raw:
            sym = item.get("symbol", "")
            if sym in wanted:
                result.setdefault(sym, {})["funding"] = safe_float(item.get("lastFundingRate"))
                result[sym]["mark_price"] = safe_float(item.get("markPrice"))
                result[sym]["index_price"] = safe_float(item.get("indexPrice"))

    if ticker_24h_raw:
        items = ticker_24h_raw if isinstance(ticker_24h_raw, list) else [ticker_24h_raw]
        for item in items:
            sym = item.get("symbol", "")
            if sym in wanted:
                result.setdefault(sym, {})["volume_24h"] = safe_float(item.get("quoteVolume"))
                result[sym]["price_change_pct_24h"] = safe_float(item.get("priceChangePercent"))

    return result


def fetch_binance_data():
    """Fetch Binance Futures prices, funding rates, and 24h data in batch."""
    prices_raw = fetch_json(BINANCE_PRICE_URL, label="Binance prices")
    funding_raw = fetch_json(BINANCE_FUNDING_URL, label="Binance funding")
    ticker_24h_raw = fetch_json(BINANCE_24HR_URL, label="Binance 24hr")

    result = {}
    wanted = set(TRACKED_ASSETS.values())
    wanted.add("MATICUSDT")

    if prices_raw:
        for item in prices_raw:
            sym = item.get("symbol", "")
            if sym in wanted:
                key = "POLUSDT" if sym == "MATICUSDT" else sym
                result.setdefault(key, {})["price"] = safe_float(item.get("price"))

    if funding_raw:
        for item in funding_raw:
            sym = item.get("symbol", "")
            if sym in wanted:
                key = "POLUSDT" if sym == "MATICUSDT" else sym
                result.setdefault(key, {})["funding"] = safe_float(item.get("lastFundingRate"))
                result[key]["mark_price"] = safe_float(item.get("markPrice"))

    if ticker_24h_raw:
        items = ticker_24h_raw if isinstance(ticker_24h_raw, list) else [ticker_24h_raw]
        for item in items:
            sym = item.get("symbol", "")
            if sym in wanted:
                key = "POLUSDT" if sym == "MATICUSDT" else sym
                result.setdefault(key, {})["volume_24h"] = safe_float(item.get("quoteVolume"))
                result[key]["price_change_pct_24h"] = safe_float(item.get("priceChangePercent"))

    return result


def fetch_coinbase_data():
    """Fetch Coinbase spot prices for tracked assets (per-product, parallelized)."""
    result = {}

    def fetch_one(canonical, product_id):
        data = fetch_json(
            COINBASE_TICKER_URL.format(product_id=product_id),
            label=f"Coinbase {product_id}"
        )
        if data and "price" in data:
            return canonical, {
                "price": safe_float(data["price"]),
                "volume_24h": safe_float(data.get("volume")),
                "bid": safe_float(data.get("bid")),
                "ask": safe_float(data.get("ask")),
            }
        return canonical, None

    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as pool:
        futures = {
            pool.submit(fetch_one, canon, pid): canon
            for canon, pid in COINBASE_SYMBOLS.items()
        }
        for future in as_completed(futures):
            canon, data = future.result()
            if data:
                usdt_sym = TRACKED_ASSETS[canon]
                result[usdt_sym] = data

    return result


def fetch_kraken_data():
    """Fetch Kraken spot prices in a single batch request."""
    query_pairs = ",".join(info[0] for info in KRAKEN_SYMBOLS.values())
    raw = fetch_json(KRAKEN_TICKER_URL, params={"pair": query_pairs}, label="Kraken batch")

    result = {}
    if not raw or "result" not in raw:
        return result

    kraken_result = raw["result"]

    for canonical, (query_pair, response_keys) in KRAKEN_SYMBOLS.items():
        ticker = None
        for key in response_keys:
            if key in kraken_result:
                ticker = kraken_result[key]
                break

        if ticker:
            usdt_sym = TRACKED_ASSETS[canonical]
            last_price = safe_float(ticker.get("c", [None])[0])
            volume_24h = safe_float(ticker.get("v", [None])[0])
            open_price = safe_float(ticker.get("o"))
            pct_change = None
            if last_price and open_price and open_price > 0:
                pct_change = round(((last_price - open_price) / open_price) * 100, 4)

            result[usdt_sym] = {
                "price": last_price,
                "volume_24h": volume_24h,
                "price_change_pct_24h": pct_change,
                "bid": safe_float(ticker.get("b", [None])[0]),
                "ask": safe_float(ticker.get("a", [None])[0]),
            }

    return result


def fetch_hyperliquid_data():
    """Fetch Hyperliquid perp data via metaAndAssetCtxs (POST)."""
    raw = fetch_json(
        HYPERLIQUID_INFO_URL,
        method="POST",
        json_body={"type": "metaAndAssetCtxs"},
        label="Hyperliquid metaAndAssetCtxs"
    )

    result = {}
    if not raw or not isinstance(raw, list) or len(raw) < 2:
        return result

    meta = raw[0]
    asset_ctxs = raw[1]
    universe = meta.get("universe", [])

    name_to_idx = {}
    for i, asset_def in enumerate(universe):
        name = asset_def.get("name", "")
        name_to_idx[name] = i

    for canonical, usdt_sym in TRACKED_ASSETS.items():
        hl_names = HYPERLIQUID_NAME_MAP.get(canonical, [canonical])
        ctx = None
        for hl_name in hl_names:
            idx = name_to_idx.get(hl_name)
            if idx is not None and idx < len(asset_ctxs):
                ctx = asset_ctxs[idx]
                break

        if ctx:
            mid_px = safe_float(ctx.get("midPx"))
            mark_px = safe_float(ctx.get("markPx"))
            prev_day_px = safe_float(ctx.get("prevDayPx"))
            pct_change = None
            price = mid_px or mark_px
            if price and prev_day_px and prev_day_px > 0:
                pct_change = round(((price - prev_day_px) / prev_day_px) * 100, 4)

            result[usdt_sym] = {
                "price": price,
                "mark_price": mark_px,
                "funding": safe_float(ctx.get("funding")),
                "volume_24h": safe_float(ctx.get("dayNtlVlm")),
                "open_interest": safe_float(ctx.get("openInterest")),
                "price_change_pct_24h": pct_change,
            }

    return result


# ---------------------------------------------------------------------------
# Fetchers — NEW exchanges
# ---------------------------------------------------------------------------

def fetch_dydx_data():
    """Fetch dYdX v4 perpetual market data.
    GET https://indexer.dydx.trade/v4/perpetualMarkets
    Symbols: BTC-USD, ETH-USD, etc.
    """
    raw = fetch_json(DYDX_MARKETS_URL, label="dYdX v4 markets")
    result = {}

    if not raw or "markets" not in raw:
        return result

    markets = raw["markets"]

    # dYdX symbol mapping: BTC -> BTC-USD
    for canonical, usdt_sym in TRACKED_ASSETS.items():
        dydx_sym = f"{canonical}-USD"
        market = markets.get(dydx_sym)
        if market:
            price = safe_float(market.get("oraclePrice"))
            result[usdt_sym] = {
                "price": price,
                "funding": safe_float(market.get("nextFundingRate")),
                "volume_24h": safe_float(market.get("volume24H")),
                "open_interest": safe_float(market.get("openInterest")),
            }

    return result


def fetch_drift_data():
    """Fetch Drift Protocol price data.
    GET https://price-api-mainnet.drift.trade/v2/prices
    Returns a dict of market names to price info.
    """
    raw = fetch_json(DRIFT_PRICES_URL, label="Drift prices")
    result = {}

    if not raw:
        return result

    # Drift may return various formats. Try to handle dict keyed by symbol.
    # Common keys: "BTC", "ETH", "SOL" or "BTC-PERP", "ETH-PERP"
    for canonical, usdt_sym in TRACKED_ASSETS.items():
        # Try different key formats
        for key_format in [canonical, f"{canonical}-PERP", f"{canonical}-USD"]:
            if key_format in raw:
                entry = raw[key_format]
                if isinstance(entry, dict):
                    price = safe_float(entry.get("price") or entry.get("oraclePrice"))
                    result[usdt_sym] = {
                        "price": price,
                        "funding": safe_float(entry.get("fundingRate")),
                    }
                elif isinstance(entry, (int, float, str)):
                    result[usdt_sym] = {
                        "price": safe_float(entry),
                    }
                break

    return result


def fetch_bybit_data():
    """Fetch Bybit linear perp tickers.
    GET https://api.bybit.com/v5/market/tickers?category=linear
    Symbol: BTCUSDT, ETHUSDT
    """
    raw = fetch_json(BYBIT_TICKERS_URL, label="Bybit linear tickers")
    result = {}

    if not raw or "result" not in raw:
        return result

    tickers = raw["result"].get("list", [])
    wanted = set(TRACKED_ASSETS.values())
    wanted.add("MATICUSDT")

    for item in tickers:
        sym = item.get("symbol", "")
        if sym in wanted:
            key = "POLUSDT" if sym == "MATICUSDT" else sym
            price = safe_float(item.get("lastPrice"))
            funding = safe_float(item.get("fundingRate"))
            volume = safe_float(item.get("volume24h"))
            # Bybit volume24h is in base currency; turnover24h is in quote
            turnover = safe_float(item.get("turnover24h"))
            pct_change = safe_float(item.get("price24hPcnt"))
            if pct_change is not None:
                pct_change = round(pct_change * 100, 4)  # convert from decimal to %

            result.setdefault(key, {})
            result[key]["price"] = price
            result[key]["funding"] = funding
            result[key]["volume_24h"] = turnover  # quote volume
            result[key]["price_change_pct_24h"] = pct_change
            result[key]["open_interest"] = safe_float(item.get("openInterestValue"))

    return result


def fetch_okx_data():
    """Fetch OKX swap tickers.
    GET https://www.okx.com/api/v5/market/tickers?instType=SWAP
    Symbol: BTC-USDT-SWAP, ETH-USDT-SWAP
    """
    raw = fetch_json(OKX_TICKERS_URL, label="OKX swap tickers")
    result = {}

    if not raw or "data" not in raw:
        return result

    # Build mapping: BTC-USDT-SWAP -> BTCUSDT
    okx_map = {}
    for canonical, usdt_sym in TRACKED_ASSETS.items():
        okx_map[f"{canonical}-USDT-SWAP"] = usdt_sym
    # Also handle MATIC for POL
    okx_map["MATIC-USDT-SWAP"] = "POLUSDT"

    for item in raw["data"]:
        inst_id = item.get("instId", "")
        usdt_sym = okx_map.get(inst_id)
        if usdt_sym:
            price = safe_float(item.get("last"))
            # OKX fundingRate is returned from a separate endpoint,
            # but the tickers endpoint may include it
            funding = safe_float(item.get("fundingRate"))
            # volCcy24h is in base, vol24h is in contracts
            vol_ccy = safe_float(item.get("volCcy24h"))
            vol_quote = None
            if vol_ccy and price:
                vol_quote = round(vol_ccy * price, 2)

            result[usdt_sym] = {
                "price": price,
                "funding": funding,
                "volume_24h": vol_quote,
                "price_change_pct_24h": None,  # OKX doesn't include this directly here
            }

    return result


def fetch_mexc_data():
    """Fetch MEXC contract tickers.
    GET https://contract.mexc.com/api/v1/contract/ticker
    Symbol: BTC_USDT, ETH_USDT
    """
    raw = fetch_json(MEXC_TICKERS_URL, label="MEXC contract tickers")
    result = {}

    if not raw or "data" not in raw:
        return result

    # Build mapping: BTC_USDT -> BTCUSDT
    mexc_map = {}
    for canonical, usdt_sym in TRACKED_ASSETS.items():
        mexc_map[f"{canonical}_USDT"] = usdt_sym
    mexc_map["MATIC_USDT"] = "POLUSDT"

    tickers = raw["data"]
    if not isinstance(tickers, list):
        return result

    for item in tickers:
        sym = item.get("symbol", "")
        usdt_sym = mexc_map.get(sym)
        if usdt_sym:
            result[usdt_sym] = {
                "price": safe_float(item.get("lastPrice")),
                "funding": safe_float(item.get("fundingRate")),
                "volume_24h": safe_float(item.get("volume24")),
                "price_change_pct_24h": safe_float(item.get("riseFallRate")),
            }

    return result


def fetch_gateio_data():
    """Fetch Gate.io USDT futures tickers.
    GET https://api.gateio.ws/api/v4/futures/usdt/tickers
    Symbol: BTC_USDT, ETH_USDT
    """
    raw = fetch_json(GATEIO_TICKERS_URL, label="Gate.io futures tickers")
    result = {}

    if not raw or not isinstance(raw, list):
        return result

    # Build mapping: BTC_USDT -> BTCUSDT
    gateio_map = {}
    for canonical, usdt_sym in TRACKED_ASSETS.items():
        gateio_map[f"{canonical}_USDT"] = usdt_sym
    gateio_map["MATIC_USDT"] = "POLUSDT"

    for item in raw:
        contract = item.get("contract", "")
        usdt_sym = gateio_map.get(contract)
        if usdt_sym:
            price = safe_float(item.get("last"))
            funding = safe_float(item.get("funding_rate"))
            vol_quote = safe_float(item.get("volume_24h_quote"))

            result[usdt_sym] = {
                "price": price,
                "funding": funding,
                "volume_24h": vol_quote,
                "price_change_pct_24h": safe_float(item.get("change_percentage")),
            }

    return result


def fetch_kucoin_data():
    """Fetch KuCoin Futures tickers.
    GET https://api-futures.kucoin.com/api/v1/allTickers
    Symbol: XBTUSDTM, ETHUSDTM
    """
    raw = fetch_json(KUCOIN_CONTRACTS_URL, label="KuCoin futures tickers")
    result = {}

    if not raw or "data" not in raw:
        return result

    tickers = raw["data"]
    if not isinstance(tickers, list):
        return result

    # KuCoin uses XBTUSDTM for BTC, others are like ETHUSDTM
    kucoin_map = {}
    for canonical, usdt_sym in TRACKED_ASSETS.items():
        if canonical == "BTC":
            kucoin_map["XBTUSDTM"] = usdt_sym
        else:
            kucoin_map[f"{canonical}USDTM"] = usdt_sym
    kucoin_map["MATICUSDTM"] = "POLUSDT"

    for item in tickers:
        sym = item.get("symbol", "")
        usdt_sym = kucoin_map.get(sym)
        if usdt_sym:
            result[usdt_sym] = {
                "price": safe_float(item.get("price")),
                "volume_24h": safe_float(item.get("volumeOf24h")),
            }

    return result


# ---------------------------------------------------------------------------
# Opportunity finder
# ---------------------------------------------------------------------------

def find_best_opportunities(assets_data, top_n=10):
    """Analyze all assets across all exchanges and return top N signals.

    Signal types:
      - funding_divergence: large difference in funding rates between exchanges
      - cross_exchange_spread: large price gap between any two exchanges
    """
    opportunities = []

    for usdt_sym, data in assets_data.items():
        # Collect all prices and funding rates across exchanges
        prices = {}
        fundings = {}
        for exch in ALL_EXCHANGES:
            exch_data = data.get(exch, {})
            p = exch_data.get("price")
            if p is not None and p > 0:
                prices[exch] = p
            f = exch_data.get("funding")
            if f is not None:
                fundings[exch] = f

        # --- Funding divergence: all pairs of perp exchanges ---
        funding_exchanges = [e for e in PERP_EXCHANGES if e in fundings]
        for i in range(len(funding_exchanges)):
            for j in range(i + 1, len(funding_exchanges)):
                e1, e2 = funding_exchanges[i], funding_exchanges[j]
                divergence = fundings[e1] - fundings[e2]
                if abs(divergence) > 0.00005:
                    if divergence < 0:
                        direction = f"LONG on {e1}, SHORT on {e2}"
                    else:
                        direction = f"SHORT on {e1}, LONG on {e2}"
                    opportunities.append({
                        "asset": usdt_sym,
                        "type": "funding_divergence",
                        "magnitude": round(abs(divergence), 8),
                        "direction": direction,
                        "detail": f"{e1} FR={fundings[e1]:.6f}, {e2} FR={fundings[e2]:.6f}",
                    })

        # --- Cross-exchange spread: all pairs ---
        price_exchanges = list(prices.keys())
        for i in range(len(price_exchanges)):
            for j in range(i + 1, len(price_exchanges)):
                e1, e2 = price_exchanges[i], price_exchanges[j]
                spread = calc_spread_pct(prices[e1], prices[e2])
                if spread is not None and abs(spread) > 0.08:  # > 8 bps
                    if spread > 0:
                        direction = f"BUY on {e2}, SELL on {e1}"
                    else:
                        direction = f"BUY on {e1}, SELL on {e2}"
                    opportunities.append({
                        "asset": usdt_sym,
                        "type": "cross_exchange_spread",
                        "magnitude": round(abs(spread), 5),
                        "direction": direction,
                        "detail": f"{e1}=${prices[e1]:.4f} vs {e2}=${prices[e2]:.4f} ({spread:+.4f}%)",
                    })

    # Sort by magnitude descending, return top N
    opportunities.sort(key=lambda x: x["magnitude"], reverse=True)
    return opportunities[:top_n]


# ---------------------------------------------------------------------------
# Main assembly
# ---------------------------------------------------------------------------

def build_market_data():
    """Fetch from all exchanges in parallel and assemble the output structure."""
    t_start = time.time()

    print("=" * 70)
    print("  Multi-Exchange Price Scanner v2.0 — 5LLM Challenge")
    print("  12 Exchanges | 20 Assets | stdlib only (urllib)")
    print("=" * 70)
    print()

    exchange_fetchers = {
        "aster":       fetch_aster_data,
        "binance":     fetch_binance_data,
        "coinbase":    fetch_coinbase_data,
        "kraken":      fetch_kraken_data,
        "hyperliquid": fetch_hyperliquid_data,
        "dydx":        fetch_dydx_data,
        "drift":       fetch_drift_data,
        "bybit":       fetch_bybit_data,
        "okx":         fetch_okx_data,
        "mexc":        fetch_mexc_data,
        "gateio":      fetch_gateio_data,
        "kucoin":      fetch_kucoin_data,
    }

    for i, name in enumerate(exchange_fetchers, 1):
        print(f"  [{i:>2}/{len(exchange_fetchers)}] Fetching {name}...")

    print()

    exchange_data = {}
    exchange_errors = []

    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as pool:
        future_map = {
            pool.submit(fn): name
            for name, fn in exchange_fetchers.items()
        }
        for future in as_completed(future_map):
            name = future_map[future]
            try:
                exchange_data[name] = future.result(timeout=30)
            except Exception as e:
                exchange_errors.append(f"{name}: {e}")
                exchange_data[name] = {}

    if exchange_errors:
        print("  Warnings:")
        for err in exchange_errors:
            print(f"    - {err}")
        print()

    # Report fetch status
    for exch in ALL_EXCHANGES:
        data = exchange_data.get(exch, {})
        count = len(data)
        status = "OK" if count > 0 else "EMPTY"
        print(f"  {exch:>14s}: {count:>2d} assets [{status}]")
    print()

    # ---------------------------------------------------------------------------
    # Assemble per-asset data
    # ---------------------------------------------------------------------------
    assets_output = {}

    for canonical, usdt_sym in TRACKED_ASSETS.items():
        asset_entry = {}

        # --- Populate each exchange ---
        for exch in ALL_EXCHANGES:
            exch_info = exchange_data.get(exch, {}).get(usdt_sym, {})

            entry = {"price": exch_info.get("price")}

            # Add funding rate for perp exchanges
            if exch in PERP_EXCHANGES:
                entry["funding"] = exch_info.get("funding")

            # Add volume if available
            if exch_info.get("volume_24h") is not None:
                entry["volume_24h"] = exch_info.get("volume_24h")

            # Add any extra fields present
            for extra_key in ["mark_price", "index_price", "open_interest",
                              "price_change_pct_24h", "bid", "ask"]:
                if exch_info.get(extra_key) is not None:
                    entry[extra_key] = exch_info[extra_key]

            asset_entry[exch] = entry

        # --- Calculate spreads (all pairwise between exchanges that have prices) ---
        spreads = {}
        priced_exchanges = []
        for exch in ALL_EXCHANGES:
            p = asset_entry[exch].get("price")
            if p is not None and p > 0:
                priced_exchanges.append((exch, p))

        max_abs_spread = 0
        max_spread_val = None
        max_spread_pair = ""

        # Compute aster_vs_X spreads for backwards compatibility + all pairwise max
        aster_price = asset_entry.get("aster", {}).get("price")
        for exch in ALL_EXCHANGES:
            if exch == "aster":
                continue
            exch_price = asset_entry.get(exch, {}).get("price")
            spread = calc_spread_pct(aster_price, exch_price)
            spreads[f"aster_vs_{exch}"] = spread
            if spread is not None and abs(spread) > max_abs_spread:
                max_abs_spread = abs(spread)
                max_spread_val = spread
                max_spread_pair = f"aster_vs_{exch}"

        # Also check all non-aster pairs for max spread
        for i in range(len(priced_exchanges)):
            for j in range(i + 1, len(priced_exchanges)):
                e1, p1 = priced_exchanges[i]
                e2, p2 = priced_exchanges[j]
                spread = calc_spread_pct(p1, p2)
                if spread is not None and abs(spread) > max_abs_spread:
                    max_abs_spread = abs(spread)
                    max_spread_val = spread
                    max_spread_pair = f"{e1}_vs_{e2}"

        spreads["max_spread"] = max_spread_val
        spreads["max_spread_pair"] = max_spread_pair

        # Funding divergences (all perp exchange pairs)
        for i, e1 in enumerate(PERP_EXCHANGES):
            f1 = asset_entry.get(e1, {}).get("funding")
            if f1 is None:
                continue
            for e2 in PERP_EXCHANGES[i + 1:]:
                f2 = asset_entry.get(e2, {}).get("funding")
                if f2 is None:
                    continue
                spreads[f"funding_div_{e1}_{e2}"] = round(f1 - f2, 8)

        asset_entry["spreads"] = spreads

        # --- Volume ranking across exchanges ---
        volumes = {}
        for exch in ALL_EXCHANGES:
            v = asset_entry[exch].get("volume_24h")
            if v is not None and v > 0:
                volumes[exch] = v
        volume_ranking = sorted(volumes.items(), key=lambda x: x[1], reverse=True)
        asset_entry["volume_ranking"] = [
            {"exchange": exch, "volume_24h": vol} for exch, vol in volume_ranking
        ]

        assets_output[usdt_sym] = asset_entry

    # --- Best opportunities ---
    best_opps = find_best_opportunities(assets_output, top_n=10)

    # --- Assemble final output ---
    now = datetime.now(timezone.utc)
    output = {
        "timestamp": now.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "scanner_version": "2.0.0",
        "exchanges_queried": ALL_EXCHANGES,
        "exchange_count": len(ALL_EXCHANGES),
        "assets_tracked": len(TRACKED_ASSETS),
        "fetch_time_seconds": round(time.time() - t_start, 2),
        "errors": exchange_errors if exchange_errors else None,
        "assets": assets_output,
        "best_opportunities": best_opps,
    }

    # --- Print summary to stdout ---
    print("-" * 70)
    print(f"  Scan completed in {output['fetch_time_seconds']}s")
    print(f"  Timestamp: {output['timestamp']}")
    print(f"  Exchanges: {len(ALL_EXCHANGES)} queried")
    print("-" * 70)
    print()

    # ---------------------------------------------------------------------------
    # Price comparison table — show all 12 exchanges
    # Split into two tables for readability
    # ---------------------------------------------------------------------------

    # Table 1: Original 5 + dYdX + Drift
    group1 = ["aster", "binance", "coinbase", "kraken", "hyperliquid", "dydx", "drift"]
    group1_labels = ["Aster", "Binance", "Coinbase", "Kraken", "Hyperl.", "dYdX", "Drift"]

    header1 = f"  {'Asset':<10}"
    for lbl in group1_labels:
        header1 += f" {lbl:>11}"
    print(header1)
    print("  " + "-" * (len(header1) - 2))

    for canonical in sorted(TRACKED_ASSETS.keys()):
        usdt_sym = TRACKED_ASSETS[canonical]
        a = assets_output.get(usdt_sym, {})

        def fmt_price(p):
            if p is None:
                return "---"
            if p >= 1000:
                return f"{p:,.0f}"
            elif p >= 10:
                return f"{p:.2f}"
            elif p >= 1:
                return f"{p:.4f}"
            else:
                return f"{p:.5f}"

        line = f"  {canonical:<10}"
        for exch in group1:
            p = a.get(exch, {}).get("price")
            line += f" {fmt_price(p):>11}"
        print(line)

    print()

    # Table 2: CEX perps (Bybit, OKX, MEXC, Gate.io, KuCoin) + MaxSprd
    group2 = ["bybit", "okx", "mexc", "gateio", "kucoin"]
    group2_labels = ["Bybit", "OKX", "MEXC", "Gate.io", "KuCoin"]

    header2 = f"  {'Asset':<10}"
    for lbl in group2_labels:
        header2 += f" {lbl:>11}"
    header2 += f" {'MaxSprd':>10}"
    print(header2)
    print("  " + "-" * (len(header2) - 2))

    for canonical in sorted(TRACKED_ASSETS.keys()):
        usdt_sym = TRACKED_ASSETS[canonical]
        a = assets_output.get(usdt_sym, {})
        max_spr = a.get("spreads", {}).get("max_spread")

        def fmt_price(p):
            if p is None:
                return "---"
            if p >= 1000:
                return f"{p:,.0f}"
            elif p >= 10:
                return f"{p:.2f}"
            elif p >= 1:
                return f"{p:.4f}"
            else:
                return f"{p:.5f}"

        def fmt_spread(s):
            if s is None:
                return "---"
            return f"{s:+.3f}%"

        line = f"  {canonical:<10}"
        for exch in group2:
            p = a.get(exch, {}).get("price")
            line += f" {fmt_price(p):>11}"
        line += f" {fmt_spread(max_spr):>10}"
        print(line)

    # Funding rate comparison (all perp exchanges)
    print()
    funding_exchs = ["aster", "binance", "hyperl.", "dydx", "bybit", "okx", "mexc", "gateio"]
    funding_keys  = ["aster", "binance", "hyperliquid", "dydx", "bybit", "okx", "mexc", "gateio"]
    funding_labels = ["Aster", "Binance", "Hyperl.", "dYdX", "Bybit", "OKX", "MEXC", "Gate.io"]

    fheader = f"  {'Asset':<10}"
    for lbl in funding_labels:
        fheader += f" {lbl:>10}"
    print(fheader)
    print("  " + "-" * (len(fheader) - 2))

    for canonical in sorted(TRACKED_ASSETS.keys()):
        usdt_sym = TRACKED_ASSETS[canonical]
        a = assets_output.get(usdt_sym, {})

        def fmt_fr(f):
            if f is None:
                return "---"
            return f"{f:+.5f}"

        line = f"  {canonical:<10}"
        for fk in funding_keys:
            fr = a.get(fk, {}).get("funding")
            line += f" {fmt_fr(fr):>10}"
        print(line)

    # Best opportunities
    if best_opps:
        print()
        print("  TOP OPPORTUNITIES (across all 12 exchanges):")
        print("  " + "-" * 60)
        for i, opp in enumerate(best_opps, 1):
            print(f"  {i:>2}. [{opp['type']}] {opp['asset']}")
            print(f"      Magnitude: {opp['magnitude']}")
            print(f"      Direction: {opp['direction']}")
            print(f"      {opp['detail']}")
            print()

    return output


def run_once(output_path):
    output = build_market_data()
    with open(output_path, "w") as f:
        json.dump(output, f, indent=2, default=str)

    print(f"  Output written to: {output_path}")
    print(f"  File size: {os.path.getsize(output_path):,} bytes")
    print()
    print("=" * 70)
    print("  Done. Trading bots can now read MARKET_DATA.json")
    print("=" * 70)


def main():
    parser = argparse.ArgumentParser(description="Multi-Exchange Price Scanner v2.0 for 5LLM Challenge")
    parser.add_argument(
        "--output", "-o",
        default=os.path.join(os.path.dirname(os.path.abspath(__file__)), "MARKET_DATA.json"),
        help="Output JSON file path (default: MARKET_DATA.json in script directory)"
    )
    parser.add_argument(
        "--interval",
        type=int,
        default=0,
        help="If > 0, run continuously with this many seconds between scans (e.g., 60)."
    )
    args = parser.parse_args()

    if args.interval and args.interval > 0:
        print(f"Running in loop mode: every {args.interval}s")
        while True:
            try:
                run_once(args.output)
            except Exception as e:
                print(f"  [LOOP ERROR] {e}")
            time.sleep(args.interval)
    else:
        run_once(args.output)


if __name__ == "__main__":
    main()
