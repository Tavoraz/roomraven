CREATE TABLE IF NOT EXISTS tenants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  default_locale TEXT NOT NULL,
  supported_locales_json TEXT NOT NULL,
  enabled_room_types_json TEXT NOT NULL,
  category_links_json TEXT NOT NULL,
  logo_data_url TEXT,
  primary_color TEXT NOT NULL,
  secondary_color TEXT NOT NULL,
  accent_color TEXT NOT NULL,
  surface_color TEXT NOT NULL,
  font_family TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS room_templates (
  id TEXT PRIMARY KEY,
  room_type TEXT NOT NULL,
  name TEXT NOT NULL,
  rules_json TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS layout_sessions (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  room_type TEXT NOT NULL,
  locale TEXT NOT NULL,
  input_json TEXT NOT NULL,
  option_ids_json TEXT NOT NULL,
  tournament_state_json TEXT NOT NULL,
  status TEXT NOT NULL,
  winner_option_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS layout_options (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  rank_index INTEGER NOT NULL,
  score REAL NOT NULL,
  render_mode TEXT NOT NULL,
  image_url TEXT,
  fallback_svg TEXT NOT NULL,
  prompt TEXT NOT NULL,
  layout_json TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS comparison_votes (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  round INTEGER NOT NULL,
  matchup_index INTEGER NOT NULL,
  left_option_id TEXT NOT NULL,
  right_option_id TEXT NOT NULL,
  winner_option_id TEXT NOT NULL,
  loser_option_id TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS saved_projects (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  locale TEXT NOT NULL,
  shopping_list_json TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS catalog_imports (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  raw_json TEXT NOT NULL,
  imported_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS analytics_events (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  session_id TEXT,
  room_type TEXT NOT NULL,
  locale TEXT NOT NULL,
  event_type TEXT NOT NULL,
  metadata_json TEXT NOT NULL,
  created_at TEXT NOT NULL
);

INSERT OR IGNORE INTO room_templates (
  id,
  room_type,
  name,
  rules_json,
  created_at
) VALUES (
  'bathroom-standard',
  'bathroom',
  'Bathroom Planner',
  '{"minimumWidthCm":180,"minimumDepthCm":180,"maximumWidthCm":520,"maximumDepthCm":520,"targetOptionCount":8}',
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
);

INSERT OR IGNORE INTO tenants (
  id,
  name,
  slug,
  default_locale,
  supported_locales_json,
  enabled_room_types_json,
  category_links_json,
  logo_data_url,
  primary_color,
  secondary_color,
  accent_color,
  surface_color,
  font_family,
  created_at,
  updated_at
) VALUES
  (
    'praxis-demo',
    'Praxis Demo',
    'praxis-demo',
    'en',
    '["en","nl"]',
    '["bathroom"]',
    '{"toilet":"https://www.praxis.nl/badkamer-sanitair/toiletten","sink":"https://www.praxis.nl/badkamer-sanitair/wastafels","shower":"https://www.praxis.nl/badkamer-sanitair/douches","bath":"https://www.praxis.nl/badkamer-sanitair/baden"}',
    NULL,
    '#f97316',
    '#082f49',
    '#facc15',
    '#fff7ed',
    'Space Grotesk, sans-serif',
    strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
    strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
  ),
  (
    'hornbach-demo',
    'Hornbach Demo',
    'hornbach-demo',
    'en',
    '["en","nl"]',
    '["bathroom"]',
    '{"toilet":"https://www.hornbach.nl/c/badkamer-sanitair/toiletten/S18622/","sink":"https://www.hornbach.nl/c/badkamer-sanitair/wastafels/S18637/","shower":"https://www.hornbach.nl/c/badkamer-sanitair/douches/S18630/","bath":"https://www.hornbach.nl/c/badkamer-sanitair/baden/S18624/"}',
    NULL,
    '#ea580c',
    '#111827',
    '#fb923c',
    '#fff7ed',
    'IBM Plex Sans, sans-serif',
    strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
    strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
  ),
  (
    'ikea-demo',
    'Ikea-Style Demo',
    'ikea-demo',
    'en',
    '["en","nl"]',
    '["bathroom"]',
    '{"toilet":"https://www.ikea.com/nl/en/cat/bathroom-toilets-49170/","sink":"https://www.ikea.com/nl/en/cat/bathroom-sinks-20724/","shower":"https://www.ikea.com/nl/en/cat/shower-accessories-20729/","bath":"https://www.ikea.com/nl/en/cat/bathroom-furniture-10464/"}',
    NULL,
    '#1d4ed8',
    '#0f172a',
    '#facc15',
    '#eff6ff',
    'Avenir Next, sans-serif',
    strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
    strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
  ),
  (
    'roomraven-consumer',
    'RoomRaven Free',
    'roomraven-free',
    'en',
    '["en","nl"]',
    '["bathroom","kitchen","living-room","office","bedroom"]',
    '{"toilet":"https://www.roomraven.com/ideas/bathroom","sink":"https://www.roomraven.com/ideas/bathroom","shower":"https://www.roomraven.com/ideas/bathroom","bath":"https://www.roomraven.com/ideas/bathroom"}',
    NULL,
    '#0f172a',
    '#1e293b',
    '#f59e0b',
    '#f8fafc',
    'Space Grotesk, sans-serif',
    strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
    strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
  );

INSERT OR IGNORE INTO catalog_imports (
  id,
  tenant_id,
  name,
  raw_json,
  imported_at
) VALUES
  (
    'praxis-demo-catalog',
    'praxis-demo',
    'Praxis Demo starter catalog',
    '{"mappings":{"toilet":{"label":"Toilet package","categoryUrl":"https://www.praxis.nl/badkamer-sanitair/toiletten","note":"Wall-hung or floorstanding toilet package."},"sink":{"label":"Vanity and sink set","categoryUrl":"https://www.praxis.nl/badkamer-sanitair/wastafels","note":"Vanity unit with sink and tap cut-out."},"shower":{"label":"Walk-in shower package","categoryUrl":"https://www.praxis.nl/badkamer-sanitair/douches","note":"Shower tray, enclosure, and mixer set."},"bath":{"label":"Bathtub package","categoryUrl":"https://www.praxis.nl/badkamer-sanitair/baden","note":"Bath shell with matching tapware options."}}}',
    strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
  ),
  (
    'hornbach-demo-catalog',
    'hornbach-demo',
    'Hornbach Demo starter catalog',
    '{"mappings":{"toilet":{"label":"Toilet package","categoryUrl":"https://www.hornbach.nl/c/badkamer-sanitair/toiletten/S18622/","note":"Wall-hung or floorstanding toilet package."},"sink":{"label":"Vanity and sink set","categoryUrl":"https://www.hornbach.nl/c/badkamer-sanitair/wastafels/S18637/","note":"Vanity unit with sink and tap cut-out."},"shower":{"label":"Walk-in shower package","categoryUrl":"https://www.hornbach.nl/c/badkamer-sanitair/douches/S18630/","note":"Shower tray, enclosure, and mixer set."},"bath":{"label":"Bathtub package","categoryUrl":"https://www.hornbach.nl/c/badkamer-sanitair/baden/S18624/","note":"Bath shell with matching tapware options."}}}',
    strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
  ),
  (
    'ikea-demo-catalog',
    'ikea-demo',
    'Ikea-Style Demo starter catalog',
    '{"mappings":{"toilet":{"label":"Toilet package","categoryUrl":"https://www.ikea.com/nl/en/cat/bathroom-toilets-49170/","note":"Wall-hung or floorstanding toilet package."},"sink":{"label":"Vanity and sink set","categoryUrl":"https://www.ikea.com/nl/en/cat/bathroom-sinks-20724/","note":"Vanity unit with sink and tap cut-out."},"shower":{"label":"Walk-in shower package","categoryUrl":"https://www.ikea.com/nl/en/cat/shower-accessories-20729/","note":"Shower tray, enclosure, and mixer set."},"bath":{"label":"Bathtub package","categoryUrl":"https://www.ikea.com/nl/en/cat/bathroom-furniture-10464/","note":"Bath shell with matching tapware options."}}}',
    strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
  ),
  (
    'roomraven-consumer-catalog',
    'roomraven-consumer',
    'RoomRaven Free starter catalog',
    '{"mappings":{"toilet":{"label":"Toilet package","categoryUrl":"https://www.roomraven.com/ideas/bathroom","note":"Wall-hung or floorstanding toilet package."},"sink":{"label":"Vanity and sink set","categoryUrl":"https://www.roomraven.com/ideas/bathroom","note":"Vanity unit with sink and tap cut-out."},"shower":{"label":"Walk-in shower package","categoryUrl":"https://www.roomraven.com/ideas/bathroom","note":"Shower tray, enclosure, and mixer set."},"bath":{"label":"Bathtub package","categoryUrl":"https://www.roomraven.com/ideas/bathroom","note":"Bath shell with matching tapware options."}}}',
    strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
  );

INSERT OR IGNORE INTO analytics_events (
  id,
  tenant_id,
  session_id,
  room_type,
  locale,
  event_type,
  metadata_json,
  created_at
) VALUES
  (
    'praxis-demo-seeded',
    'praxis-demo',
    NULL,
    'bathroom',
    'en',
    'seeded_demo',
    '{}',
    strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
  ),
  (
    'hornbach-demo-seeded',
    'hornbach-demo',
    NULL,
    'bathroom',
    'en',
    'seeded_demo',
    '{}',
    strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
  ),
  (
    'ikea-demo-seeded',
    'ikea-demo',
    NULL,
    'bathroom',
    'en',
    'seeded_demo',
    '{}',
    strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
  ),
  (
    'roomraven-consumer-seeded',
    'roomraven-consumer',
    NULL,
    'bathroom',
    'en',
    'seeded_demo',
    '{}',
    strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
  );
