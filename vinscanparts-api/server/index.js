/**
 * VinScanParts Backend Server
 *
 * Handles:
 *   POST /api/decode-vin     — VIN decode via NHTSA (free) + apiprofile.com vehicle match
 *   POST /api/parts          — Parts lookup via apiprofile.com
 *   GET  /api/ebay-parts     — Live in-stock eBay listings via Browse API (with affiliate URLs)
 *   GET  /api/status         — Credential status
 *   GET  /api/history        — Scan history (SQLite)
 *   GET  /api/garage         — Saved vehicles (SQLite)
 *   POST /api/garage         — Save vehicle
 *   DELETE /api/garage/:id   — Remove vehicle
 */

require('dotenv').config();

const express  = require('express');
const cors     = require('cors');
const Database = require('better-sqlite3');
const path     = require('path');
const fetch    = (...args) => import('node-fetch').then(({ default: f }) => f(...args));

const app  = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ── SQLITE SETUP ──────────────────────────────────────────────────────────────
const db = new Database(path.join(__dirname, 'vsp.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS scan_history (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    vin       TEXT NOT NULL,
    year      TEXT,
    make      TEXT,
    model     TEXT,
    engine    TEXT,
    trim      TEXT,
    source    TEXT DEFAULT 'nhtsa',
    scannedAt TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS garage (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    nickname  TEXT NOT NULL,
    vin       TEXT NOT NULL,
    year      TEXT,
    make      TEXT,
    model     TEXT,
    engine    TEXT,
    trim      TEXT,
    source    TEXT DEFAULT 'nhtsa',
    kType     TEXT,
    savedAt   TEXT DEFAULT (datetime('now'))
  );
`);

// ── APIPROFILE.COM HELPERS ────────────────────────────────────────────────────
const AUTOPARTS_KEY  = process.env.AUTOPARTS_API_KEY || '';
const AUTOPARTS_BASE = process.env.AUTOPARTS_BASE_URL || 'https://auto-parts-catalog.apiprofile.com/api';
const LANG_EN        = 4;   // English
const COUNTRY_GLOBAL = 63;  // Germany = global default per docs
const TYPE_PASSENGER = 1;   // Passenger Car

function autopartsHeaders() {
  return { 'x-apiprofile-key': AUTOPARTS_KEY, 'Content-Type': 'application/json' };
}

async function autopartsGet(endpoint) {
  const url = `${AUTOPARTS_BASE}${endpoint}`;
  const res = await fetch(url, { headers: autopartsHeaders() });
  if (!res.ok) throw new Error(`autoparts ${res.status}: ${endpoint}`);
  return res.json();
}

// Map our category IDs → apiprofile.com search keyword
const CATEGORY_SEARCH_MAP = {
  oil_filter:              'Oil Filter',
  air_filter:              'Air Filter',
  cabin_filter:            'Cabin Air Filter',
  fuel_filter:             'Fuel Filter',
  transmission_filter:     'Transmission Filter',
  hydraulic_filter:        'Hydraulic Filter',
  brake_pads:              'Brake Pads',
  brake_rotors:            'Brake Disc',
  brake_calipers:          'Brake Caliper',
  brake_drums:             'Brake Drum',
  brake_shoes:             'Brake Shoes',
  brake_lines:             'Brake Hose',
  brake_master_cyl:        'Master Cylinder',
  brake_booster:           'Brake Booster',
  abs_sensor:              'ABS Sensor',
  brake_hardware:          'Brake Hardware',
  brake_fluid:             'Brake Fluid',
  spark_plugs:             'Spark Plug',
  ignition_coil:           'Ignition Coil',
  ignition_wire_set:       'Ignition Wire',
  distributor_cap:         'Distributor Cap',
  serpentine_belt:         'V-Ribbed Belt',
  timing_belt:             'Timing Belt',
  timing_chain:            'Timing Chain',
  water_pump:              'Water Pump',
  thermostat:              'Thermostat',
  head_gasket:             'Head Gasket',
  valve_cover_gasket:      'Valve Cover Gasket',
  oil_pan_gasket:          'Oil Pan Gasket',
  intake_manifold_gasket:  'Intake Manifold Gasket',
  engine_mount:            'Engine Mount',
  oil_pump:                'Oil Pump',
  piston_rings:            'Piston Ring',
  crankshaft_seal:         'Crankshaft Seal',
  alternator:              'Alternator',
  starter_motor:           'Starter Motor',
  battery:                 'Battery',
  radiator:                'Radiator',
  radiator_hose:           'Radiator Hose',
  coolant_reservoir:       'Coolant Reservoir',
  heater_core:             'Heater Core',
  ac_compressor:           'Air Conditioning Compressor',
  ac_condenser:            'Air Conditioning Condenser',
  ac_filter_drier:         'Air Conditioning Dryer',
  ac_expansion_valve:      'Expansion Valve',
  blower_motor:            'Fan Motor',
  shock_absorber:          'Shock Absorber',
  strut_assembly:          'Strut Assembly',
  control_arm:             'Control Arm',
  ball_joint:              'Ball Joint',
  tie_rod_end:             'Tie Rod End',
  sway_bar_link:           'Sway Bar Link',
  wheel_bearing:           'Wheel Bearing',
  cv_axle:                 'CV Joint',
  cv_boot:                 'CV Boot',
  power_steering_pump:     'Steering Pump',
  steering_rack:           'Steering Rack',
  tie_rod_assembly:        'Tie Rod',
  transmission_solenoid:   'Transmission Solenoid',
  clutch_kit:              'Clutch Kit',
  flywheel:                'Flywheel',
  fuel_pump:               'Fuel Pump',
  fuel_injector:           'Fuel Injector',
  fuel_pressure_regulator: 'Fuel Pressure Regulator',
  oxygen_sensor:           'Lambda Sensor',
  mass_airflow_sensor:     'Air Flow Meter',
  map_sensor:              'Intake Pressure Sensor',
  throttle_body:           'Throttle Body',
  egr_valve:               'EGR Valve',
  pcv_valve:               'PCV Valve',
  idle_air_valve:          'Idle Control Valve',
  crankshaft_sensor:       'RPM Sensor',
  camshaft_sensor:         'Camshaft Position Sensor',
  knock_sensor:            'Knock Sensor',
  coolant_temp_sensor:     'Coolant Temperature Sensor',
  headlight_bulb:          'Headlight Bulb',
  tail_light:              'Tail Light',
  fog_light:               'Fog Light',
  window_regulator:        'Window Regulator',
  wiper_blade:             'Wiper Blade',
  wiper_motor:             'Wiper Motor',
  turn_signal_switch:      'Turn Signal Switch',
  horn:                    'Horn',
  exhaust_manifold:        'Exhaust Manifold',
  catalytic_converter:     'Catalytic Converter',
  muffler:                 'Silencer',
  oxygen_sensor_exhaust:   'Lambda Sensor',
  exhaust_gasket:          'Exhaust Gasket',
  door_handle:             'Door Handle',
  mirror:                  'Mirror',
  bumper:                  'Bumper',
  fender:                  'Wing',
  hood:                    'Bonnet',
};

async function findVehicleId(make, model, year) {
  try {
    const manuData = await autopartsGet(`/manufacturers/list/type-id/${TYPE_PASSENGER}`);
    const makers = manuData?.manufacturers || manuData?.data || [];
    const makeLower = make.toLowerCase();

    const manufacturer = makers.find(m =>
      (m.manufacturerName || m.manuName || m.name || '').toLowerCase() === makeLower
    ) || makers.find(m =>
      (m.manufacturerName || m.manuName || m.name || '').toLowerCase().includes(makeLower) &&
      !(m.manufacturerName || m.manuName || m.name || '').includes('(')
    );
    if (!manufacturer) return null;

    const manufacturerId = manufacturer.manufacturerId || manufacturer.manuId || manufacturer.id;

    const modelData = await autopartsGet(
      `/models/list/type-id/${TYPE_PASSENGER}/manufacturer-id/${manufacturerId}/lang-id/${LANG_EN}/country-filter-id/${COUNTRY_GLOBAL}`
    );
    const models = modelData?.models || modelData?.data || [];
    const modelLower = model.toLowerCase();

    const modelMatch = models.find(m =>
      (m.modelName || m.name || '').toLowerCase().includes(modelLower)
    );
    if (!modelMatch) {
      const firstWord = modelLower.split(' ')[0];
      const partial = models.find(m =>
        (m.modelName || m.name || '').toLowerCase().includes(firstWord)
      );
      if (!partial) return null;
      return { modelId: partial.modelId || partial.id, manufacturerId };
    }

    return { modelId: modelMatch.modelId || modelMatch.id, manufacturerId };
  } catch (e) {
    console.error('findVehicleId error:', e.message);
    return null;
  }
}

function findCategoryId(obj, keyword) {
  if (!obj || typeof obj !== 'object') return null;
  const kw = keyword.toLowerCase();

  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (!val || typeof val !== 'object') continue;
    if (key.toLowerCase() === kw && val.categoryId) return val.categoryId;
  }

  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (!val || typeof val !== 'object') continue;
    if (key.includes(',')) continue;
    if (key.toLowerCase().includes(kw) && val.categoryId) return val.categoryId;
  }

  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (!val || typeof val !== 'object') continue;
    const result = findCategoryId(val, keyword);
    if (result) return result;
  }

  return null;
}

async function fetchPartsFromApi(vehicleId, categoryKeyword) {
  try {
    const catData = await autopartsGet(
      `/category/search-for-the-commodity-group-tree-by-description/type-id/${TYPE_PASSENGER}/lang-id/${LANG_EN}/search-text/${encodeURIComponent(categoryKeyword)}`
    );

    console.log('Category search response keys:', Object.keys(catData || {}).slice(0, 5));

    const categoryId = findCategoryId(catData, categoryKeyword);
    console.log('Resolved categoryId:', categoryId, 'for keyword:', categoryKeyword);

    if (!categoryId) {
      console.warn('No categoryId found for keyword:', categoryKeyword);
      return [];
    }

    const artData = await autopartsGet(
      `/articles/list/type-id/${TYPE_PASSENGER}/vehicle-id/${vehicleId}/category-id/${categoryId}/lang-id/${LANG_EN}`
    );

    console.log('Articles response keys:', Object.keys(artData || {}).slice(0, 5));

    const articles = artData?.articles || artData?.data || [];
    console.log('Articles count:', articles.length);

    return articles.slice(0, 20).map(art => ({
      partNumber: art.articleNumber || art.articleNo || '',
      partName:   art.description   || art.articleProductName || art.name || categoryKeyword,
      imageUrl:   art.s3image       || art.imageUrl           || '',
      oemNumbers: art.oemNumbers    || [],
    }));
  } catch (e) {
    console.error('fetchPartsFromApi error:', e.message);
    return [];
  }
}

// ── EBAY BROWSE API ───────────────────────────────────────────────────────────
const EBAY_APP_ID      = process.env.EBAY_APP_ID      || '';
const EBAY_CERT_ID     = process.env.EBAY_CERT_ID     || '';
const EBAY_CAMPAIGN_ID = process.env.EBAY_CAMPAIGN_ID || '5339155596';

// Token cache — eBay tokens last 2 hours, cache for 100 minutes to be safe
let ebayTokenCache = { token: null, expiresAt: 0 };

async function getEbayToken() {
  const now = Date.now();
  if (ebayTokenCache.token && now < ebayTokenCache.expiresAt) {
    return ebayTokenCache.token;
  }

  const credentials = Buffer.from(`${EBAY_APP_ID}:${EBAY_CERT_ID}`).toString('base64');

  const res = await fetch('https://api.ebay.com/identity/v1/oauth2/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type':  'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials&scope=https%3A%2F%2Fapi.ebay.com%2Foauth%2Fapi_scope',
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`eBay OAuth failed: ${res.status} ${err}`);
  }

  const data = await res.json();
  ebayTokenCache = {
    token:     data.access_token,
    expiresAt: now + 100 * 60 * 1000, // 100 minutes
  };

  console.log('eBay token refreshed');
  return ebayTokenCache.token;
}

/**
 * Search eBay Browse API for in-stock parts compatible with the given vehicle.
 * Returns up to 10 in-stock listings with affiliate URLs pre-built.
 */
async function searchEbayParts(partQuery, year, make, model) {
  const token = await getEbayToken();

  // Build compatibility filter — eBay uses this to surface vehicle-compatible listings
  const compatFilter = `Year:${year};Make:${make};Model:${model}`;

  // eBay Motors Parts & Accessories category = 6030
  const params = new URLSearchParams({
    q:              partQuery,
    category_ids:   '6030',
    compatibility_filter: compatFilter,
    limit:          '20',
    filter:         'buyingOptions:{FIXED_PRICE}', // Buy It Now only — no auctions
  });

  const res = await fetch(
    `https://api.ebay.com/buy/browse/v1/item_summary/search?${params}`,
    {
      headers: {
        'Authorization':           `Bearer ${token}`,
        'Content-Type':            'application/json',
        'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
        // Pass campaign ID so eBay returns itemAffiliateWebUrl per listing
        'X-EBAY-C-ENDUSERCTX':    `affiliateCampaignId=${EBAY_CAMPAIGN_ID},affiliateReferenceId=vinscanparts`,
      },
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`eBay Browse API error: ${res.status} ${err}`);
  }

  const data = await res.json();
  const items = data.itemSummaries || [];

  // Filter to in-stock only and shape into our standard format
  return items
    .filter(item => {
      const avail = item.estimatedAvailabilities?.[0]?.estimatedAvailabilityStatus;
      // Keep IN_STOCK and LIMITED_STOCK, drop OUT_OF_STOCK
      return avail !== 'OUT_OF_STOCK';
    })
    .slice(0, 10)
    .map(item => ({
      ebayItemId:   item.itemId,
      title:        item.title,
      price:        item.price?.value    ? `$${parseFloat(item.price.value).toFixed(2)}` : null,
      currency:     item.price?.currency || 'USD',
      condition:    item.condition       || 'Unknown',
      imageUrl:     item.image?.imageUrl || '',
      seller:       item.seller?.username || '',
      // itemAffiliateWebUrl is pre-built by eBay with our campaign ID embedded
      affiliateUrl: item.itemAffiliateWebUrl || item.itemWebUrl || '',
    }));
}

// ── NHTSA VIN DECODE ──────────────────────────────────────────────────────────
async function decodeVinNhtsa(vin) {
  const url  = `https://vpic.nhtsa.dot.gov/api/vehicles/decodevinvalues/${vin}?format=json`;
  const res  = await fetch(url);
  const data = await res.json();
  const r    = data?.Results?.[0];
  if (!r) throw new Error('NHTSA returned no result');

  return {
    vin,
    year:   r.ModelYear   || '',
    make:   r.Make        || '',
    model:  r.Model       || '',
    engine: r.DisplacementL
              ? `${parseFloat(r.DisplacementL).toFixed(1)}L ${r.FuelTypePrimary || ''} ${r.EngineCylinders ? r.EngineCylinders + '-cyl' : ''}`.trim()
              : r.EngineConfiguration || '',
    trim:   r.Trim        || '',
    source: 'nhtsa',
  };
}

// ── ROUTES ────────────────────────────────────────────────────────────────────

// POST /api/decode-vin
app.post('/api/decode-vin', async (req, res) => {
  try {
    const { vin } = req.body;
    if (!vin || vin.length !== 17) return res.status(400).json({ error: 'Invalid VIN' });

    const vehicle = await decodeVinNhtsa(vin.toUpperCase());

    if (AUTOPARTS_KEY) {
      try {
        const match = await findVehicleId(vehicle.make, vehicle.model, vehicle.year);
        if (match) {
          vehicle.kType = String(match.modelId);
        }
      } catch (e) {
        console.warn('apiprofile VIN enrich failed:', e.message);
      }
    }

    db.prepare(`
      INSERT INTO scan_history (vin, year, make, model, engine, trim, source)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(vehicle.vin, vehicle.year, vehicle.make, vehicle.model, vehicle.engine, vehicle.trim, vehicle.source);

    res.json(vehicle);
  } catch (err) {
    console.error('decode-vin error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/parts
app.post('/api/parts', async (req, res) => {
  try {
    const { vehicle, category } = req.body;
    if (!vehicle || !category) return res.status(400).json({ error: 'Missing vehicle or category' });

    let parts = [];

    if (AUTOPARTS_KEY) {
      let vehicleId = vehicle.kType ? parseInt(vehicle.kType, 10) : null;

      if (!vehicleId) {
        const match = await findVehicleId(vehicle.make, vehicle.model, vehicle.year);
        if (match) {
          vehicleId = match.modelId;
        }
      }

      console.log('Using vehicleId:', vehicleId);

      if (vehicleId) {
        const keyword  = CATEGORY_SEARCH_MAP[category] || category.replace(/_/g, ' ');
        const rawParts = await fetchPartsFromApi(vehicleId, keyword);

        parts = rawParts.map(p => {
          const displayPartNumber = p.oemNumbers?.[0] || p.partNumber;
          return {
            partNumber:      displayPartNumber,
            partName:        p.partName,
            imageUrl:        p.imageUrl || '',
            category,
            amazonUrl:       '',
            affiliateUrl2:   '',
            affiliateLabel2: 'Search on eBay',
            isFeatured:      false,
          };
        });
      }
    }

    res.json(parts);
  } catch (err) {
    console.error('parts error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/ebay-parts?partNumber=XX&partName=XX&year=XX&make=XX&model=XX
app.get('/api/ebay-parts', async (req, res) => {
  try {
    const { partNumber, partName, year, make, model } = req.query;

    if (!partName || !year || !make || !model) {
      return res.status(400).json({ error: 'partName, year, make, and model are required' });
    }

    // Build search query — part number gives more precise results when available
    const query = partNumber
      ? `${partNumber} ${partName}`.trim()
      : partName;

    console.log(`eBay parts search: "${query}" for ${year} ${make} ${model}`);

    const listings = await searchEbayParts(query, year, make, model);

    console.log(`eBay returned ${listings.length} in-stock listings`);

    res.json(listings);
  } catch (err) {
    console.error('ebay-parts error:', err.message);
    // Return empty array rather than 500 — app degrades gracefully
    res.json([]);
  }
});

// GET /api/status
app.get('/api/status', (req, res) => {
  res.json({
    autoparts: !!AUTOPARTS_KEY,
    nhtsa:     true,
    ebay:      !!(EBAY_APP_ID && EBAY_CERT_ID),
  });
});

// GET /api/history
app.get('/api/history', (req, res) => {
  const rows = db.prepare('SELECT * FROM scan_history ORDER BY scannedAt DESC LIMIT 100').all();
  res.json(rows);
});

// GET /api/garage
app.get('/api/garage', (req, res) => {
  const rows = db.prepare('SELECT * FROM garage ORDER BY savedAt DESC').all();
  res.json(rows);
});

// POST /api/garage
app.post('/api/garage', (req, res) => {
  const { nickname, vin, year, make, model, engine, trim, source, kType } = req.body;
  if (!nickname || !vin) return res.status(400).json({ error: 'nickname and vin required' });
  const result = db.prepare(`
    INSERT INTO garage (nickname, vin, year, make, model, engine, trim, source, kType)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(nickname, vin, year, make, model, engine, trim, source || 'nhtsa', kType || null);
  res.json({ id: result.lastInsertRowid });
});

// DELETE /api/garage/:id
app.delete('/api/garage/:id', (req, res) => {
  db.prepare('DELETE FROM garage WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

// ── START ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`VinScanParts backend running on port ${PORT}`);
  console.log(`AutoParts API: ${AUTOPARTS_KEY ? 'ACTIVE' : 'NOT CONFIGURED'}`);
  console.log(`eBay Browse API: ${EBAY_APP_ID && EBAY_CERT_ID ? 'ACTIVE' : 'NOT CONFIGURED'}`);
});
