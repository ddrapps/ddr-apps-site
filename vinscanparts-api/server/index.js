/**
 * VinScanParts Backend Server
 *
 * Handles:
 *   POST /api/decode-vin     — VIN decode via NHTSA (free) + apiprofile.com vehicle match
 *   POST /api/parts          — Parts lookup via apiprofile.com
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

// ── HARDCODED CATEGORY MAP ────────────────────────────────────────────────────
// categoryIds verified directly from apiprofile.com API-GCA-009 for vehicleId 4963
const CATEGORY_MAP = {
  oil_filter:           100259,
  air_filter:           706695,
  cabin_filter:         706695,
  fuel_filter:          103781,
  spark_plug:           103935,
  spark_plugs:          103935,
  brake_pad:            104083,
  brake_pads:           104083,
  brake_disc:           104082,
  brake_rotors:         104082,
  brake_drum:           100579,
  brake_drums:          100579,
  brake_caliper:        104084,
  brake_calipers:       104084,
  brake_shoe:           104083,
  brake_shoes:          104083,
  brake_fluid:          706537,
  brake_hose:           104087,
  brake_lines:          104087,
  brake_master_cyl:     100026,
  shock_absorber:       103897,
  strut_assembly:       103982,
  suspension_strut:     103982,
  ball_joint:           100581,
  tie_rod:              100603,
  tie_rod_end:          100603,
  tie_rod_assembly:     100603,
  wheel_bearing:        100839,
  alternator:           104330,
  starter:              103955,
  starter_motor:        103955,
  ignition_coil:        103938,
  water_pump:           706706,
  thermostat:           104063,
  radiator_hose:        104072,
  timing_chain:         103278,
  clutch_kit:           104245,
  oxygen_sensor:        104264,
  mass_airflow_sensor:  103856,
  mass_air_flow_sensor: 103856,
  fuel_pump:            104956,
  exhaust_system:       103984,
  wiper_blade:          100597,
  wiper_motor:          100134,
  battery:              103966,
  engine_oil:           706539,
  transmission_fluid:   706536,
  power_steering_fluid: 706233,
  antifreeze:           104080,
  coil_spring:          100113,
  control_arm:          706384,
  stabiliser_bar:       100590,
  sway_bar_link:        100590,
  cv_axle:              706379,
  drive_shaft:          706379,
  egr_valve:            100811,
  serpentine_belt:      104329,
  v_ribbed_belt:        104329,
  radiator:             706212,
  coolant_reservoir:    104070,
  ac_compressor:        100354,
  oil_pump:             100492,
  window_regulator:     102691,
  ignition_wire_set:    103935,
  headlight_bulb:       104024,
  tail_light:           104027,
  fog_light:            104282,
  horn:                 104019,
  exhaust_manifold:     103833,
  catalytic_converter:  100047,
};

function getCategoryId(categoryKey) {
  const key = (categoryKey || '').toLowerCase().replace(/[\s-]/g, '_');
  return CATEGORY_MAP[key] || null;
}

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

async function fetchPartsFromApi(vehicleId, categoryKey) {
  try {
    const categoryId = getCategoryId(categoryKey);
    console.log('Category key:', categoryKey, '→ categoryId:', categoryId);

    if (!categoryId) {
      console.warn('No categoryId found for key:', categoryKey);
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
      partName:   art.description   || art.articleProductName || art.name || categoryKey,
      imageUrl:   art.s3image       || art.imageUrl           || '',
      oemNumbers: art.oemNumbers    || [],
    }));
  } catch (e) {
    console.error('fetchPartsFromApi error:', e.message);
    return [];
  }
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
        const rawParts = await fetchPartsFromApi(vehicleId, category);

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

// GET /api/status
app.get('/api/status', (req, res) => {
  res.json({
    autoparts: !!AUTOPARTS_KEY,
    nhtsa:     true,
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
});
