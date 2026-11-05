// Built-in agronomy engine — answers the AI Pest Finder with zero API cost.
// Decision logic distilled from Telangana/AP crop protection recommendations.
// Crop keys: rice, cotton, chilli, groundnut, jowar, redgram, maize, tomato, vegetables, fruits

const LIBRARY = [
  {
    match: { crops: ['rice'], keywords: ['stem', 'borer', 'dead heart', 'dhanthulu', 'deadhearts'] },
    diagnosis: 'Rice stem borer (yellow stem borer / Scirpophaga incertulas)',
    severity: 'moderate',
    action: 'Cartap hydrochloride 4% GR broadcast in standing water, or Emamectin benzoate 0.4 g/L spray at egg-hatch stage.',
    productIds: ['agx-in08', 'agx-in03'],
    ipm: ['Clipping of affected seedlings at transplanting', 'Install pheromone traps @ 5/ha to monitor moth flights', 'Avoid dense fertiliser top-dressing during peak moth activity', 'Conserve natural enemies (spiders, Trichogramma releases @ 5 cc/ha)'],
    dosing: 'Cartap GR: 8–10 kg/acre broadcast uniformly on water surface; OR Emamectin 5% SG 80 g/acre in 200 L water. Wet hands before GR handling.',
    safety: 'Wear gloves + mask during granule application. Maintain standing water until uptake (48h). Keep children and livestock away for 24h.',
    residual: 'Do not enter the field for 12 hours after spraying. Observe a 14-day pre-harvest interval.',
    tips: 'If >5% dead hearts are visible, act immediately — one generation can wipe 15–20% of yield. Repeat spray only after pest reaches economic threshold again (2 egg masses/m²).',
  },
  {
    match: { crops: ['rice'], keywords: ['hopper', 'planthopper', 'bph', 'brown plant', 'sucking', 'yellowing patches'] },
    diagnosis: 'Brown planthopper (Nilaparvata lugens) infestation',
    severity: 'high',
    action: 'Fipronil 5% SC or Acetamiprid 20% SP spray directed at the basal portion of plants.',
    productIds: ['agx-in07', 'agx-in06'],
    ipm: ['Drain field and open canopy for 3 days (apparent hopper burn)', 'Leave 15–20 cm row spacing at transplanting', 'Conserve mirid bugs and spiders — avoid broad-spectrum pyrethroid sprays', 'Yellow sticky traps @ 10/acre'],
    dosing: 'Fipronil 5% SC: 600–800 ml/acre in 200 L water, spray directed towards stem base with high-volume nozzle.',
    safety: 'Do not spray against wind direction. Cover nose-mouth-mask. Fipronil is toxic to fish — stop flow-out from the field.',
    residual: 'Observe a 14-day pre-harvest interval after spraying.',
    tips: 'Hopper burn starts as yellowing patches in the field centre — walk the field diagonally before deciding. Avoid urea overuse; BPH thrives on lush crops.',
  },
  {
    match: { crops: ['cotton'], keywords: ['bollworm', 'pink', 'ball', 'larva', 'hole in boll', 'kapu purugu'] },
    diagnosis: 'Bollworm complex (pink bollworm / spotted / American bollworm)',
    severity: 'high',
    action: 'Emamectin benzoate 5% SG or Chlorantraniliprole 18.5% SC spray at first-instar stage.',
    productIds: ['agx-in03', 'agx-in04'],
    ipm: ['Install pink bollworm pheromone traps @ 5/acre from 45 DAS', 'Destroy affected/rosette flowers early in the season', 'Collect and bury affected bolls', 'Encourage Chrysoperla carnea and Trichogramma releases', 'Avoid pyrethroid over-sprays which flare sucking pests'],
    dosing: 'Emamectin 5% SG: 80–100 g/acre in 200 L water, OR Chlorantraniliprole 18.5% SC: 150–180 ml/acre. Shake sprayer well between loads.',
    safety: 'Full PPE: gloves, mask, full sleeves. Do not spray during bloom hours (bees). 14-day pre-harvest interval.',
    residual: 'Repeat only after 10–12 days if re-infestation crosses the ETL (2 moths/trap/night for PBW).',
    tips: 'Do sprays at egg-hatch — once larvae enter bolls, contact sprays fail. Quick rotation: Emamectin → Chlorantraniliprole next generation to manage resistance.',
  },
  {
    match: { crops: ['cotton', 'chilli'], keywords: ['whitefly', 'sucking', 'curl leaf', 'yellowing', 'jassid', 'aphid', 'thrips', 'hopper burn leaf edge'] },
    diagnosis: 'Sucking pest complex (whitefly / jassids / thrips / aphids)',
    severity: 'moderate',
    action: 'Imidacloprid 17.8% SL or Acetamiprid 20% SP foliar spray.',
    productIds: ['agx-in02', 'agx-in06'],
    ipm: ['Yellow sticky traps @ 8–10/acre', 'Neem oil 10000 ppm @ 2 ml/L weekly as repellent barrier', 'Avoid repeated neonicotinoid sprays to prevent resistance', 'Remove and destroy heavily infested lower leaves'],
    dosing: 'Imidacloprid 17.8% SL: 120–150 ml/acre in 200 L water; cover leaf undersides.',
    safety: 'Spray with mask + gloves during low sun hours. Keep away from neighbouring bee-attracting crops.',
    residual: '14-day pre-harvest interval; repeat only after 12 days if sucking pressure persists.',
    tips: 'Check 5 upper and 5 lower leaves from 20 random plants. If >50% leaf curl visible, spray; otherwise start with neem and monitor 3 days.',
  },
  {
    match: { crops: ['chilli'], keywords: ['thrips', 'leaf curl', 'murda', 'die back', 'fruit drop'] },
    diagnosis: 'Chilli thrips (Scirtothrips dorsalis) causing leaf curl / murda',
    severity: 'high',
    action: 'Imidacloprid 17.8% SL spray + weekly 2 ml/L neem oil schedule.',
    productIds: ['agx-in02', 'agx-bio01'],
    ipm: ['Sticky blue traps @ 10/acre', 'Intercrop with coriander to encourage thrips predators', 'Start vigorous plants with base neem + Beauveria programme', 'Do not let infested plants be moved between fields on clothing/tools'],
    dosing: 'Imidacloprid 17.8% SL: 120–150 ml/acre in 200 L water; alternate with Fipronil 5% SC only after 3 rounds to prevent resistance.',
    safety: 'Spray in evening when bees are inactive; wear gloves, mask, goggles.',
    residual: '14-day pre-harvest interval; keep monitoring weekly after first spray.',
    tips: 'Leaf curl starts 2–3 weeks after thrips settle into flower stage — act at the first sign of upward curving new leaves; remission becomes impossible after murda symptom spread.',
  },
  {
    match: { crops: ['cotton', 'chilli'], keywords: ['blight', 'leaf spot', 'wilt', 'yellow brown', 'disease', 'spots'] },
    diagnosis: 'Fungal leaf spot / early blight complex',
    severity: 'moderate',
    action: 'Mancozeb 75% WP protectant spray now, shift to Propiconazole if spots multiply.',
    productIds: ['agx-fn01', 'agx-fn03'],
    ipm: ['Wider row spacing + drip rather than overhead irrigation', 'Remove and burn lower infected leaves after spray', 'Balanced potassium to strengthen leaf walls', 'Crop rotation to break disease cycle'],
    dosing: 'Mancozeb 75% WP: 600–800 g/acre (2 g/L) in 200 L water; repeat at 10–12 day intervals during high humidity.',
    safety: 'Avoid spraying in extreme heat to prevent leaf scorch. Gloves + goggles mandatory.',
    residual: '7-day re-spray interval; pre-harvest interval 14 days.',
    tips: 'Disease risk rises fast when night humidity >90% with 25–30°C — expect 1 protective spray in each such spell.',
  },
  {
    match: { crops: ['groundnut', 'pulses', 'redgram', 'chilli'], keywords: ['tikka', 'rust', 'rusty', 'orange spots leaf'] },
    diagnosis: 'Groundnut tikka leaf spot / leaf rust complex',
    severity: 'moderate',
    action: 'Tebuconazole 10% SL or Propiconazole 25% EC spray.',
    productIds: ['agx-fn07', 'agx-fn03'],
    ipm: ['Early sowing to escape peak rust weather', 'Harvest promptly — rust builds post-maturity', 'Inter-crop with cereals at 4:2 ratio', 'Do seed treatment with Trichoderma to strengthen soil health'],
    dosing: 'Tebuconazole 10% SL: 400 ml/acre (1 ml/L) in 200 L water; 2 rounds max at 12-day interval.',
    safety: 'Spray with full PPE; do not spray on windy days to protect neighbouring crops.',
    residual: 'Pre-harvest interval 21 days for groundnut.',
    tips: 'Check leaf undersides for raised brown pustules — rust spreads within a week in late-season humidity.',
  },
  {
    match: { crops: ['tomato', 'vegetables'], keywords: ['borer', 'worm in fruit', 'hole fruit', 'caterpillar', 'pod borer'] },
    diagnosis: 'Fruit/pod borer (Helicoverpa armigera)',
    severity: 'high',
    action: 'Emamectin benzoate 80 g/acre or Chlorantraniliprole 150–180 ml/acre.',
    productIds: ['agx-in03', 'agx-in04'],
    ipm: ['Pheromone traps @ 5/acre for Helicoverpa monitoring', 'Bird perches @ 20/acre', 'Release Trichogramma egg parasitoids weekly at peak flights', 'Hand-pick big larvae during early evening inspection']
    ,
    dosing: 'Emamectin 5% SG: 80–100 g/acre in 200 L water, concentrated on fruiting branches.',
    safety: 'Full PPE; spray only during low wind (below 10 km/h).',
    residual: 'Pre-harvest interval 14 days for tomato — do not pick sprayed fruit for that period.',
    tips: 'Repeat only after 10–12 days if trap catch stays above ETL. Never spray more than twice with the same active ingredient.',
  },
  {
    match: { crops: ['maize', 'jowar'], keywords: ['fall armyworm', 'army worm', 'whorl damage', 'windowing leaf'] },
    diagnosis: 'Fall armyworm (Spodoptera frugiperda)',
    severity: 'high',
    action: 'Emamectin benzoate or Chlorantraniliprole whorl-directed spray.',
    productIds: ['agx-in03', 'agx-in04'],
    ipm: ['Scout 5 whorls per 100 plants twice weekly', 'Sand+lime apply into whorls for young larvae (cultural level)', 'Conserve earwigs, ladybirds, and parasitoids', 'Early uniform sowing to escape peak flights'],
    dosing: 'Emamectin 5% SG: 80 g/acre, direct nozzle into whorl; OR Chlorantraniliprole 150–180 ml/acre.',
    safety: 'Handle with gloves; keep livestock away from sprayed fields for 24h.',
    residual: 'Repeat whorl spray only after 12 days; rotate actives between generations.',
    tips: 'FAW migrates nightly across fields — treat the whole village block together when scouting shows >20% windowing.',
  },
  {
    match: { crops: ['all', 'redgram', 'groundnut', 'maize', 'jowar', 'cotton'], keywords: ['weeds', 'grass', 'weedy', 'parthenium', 'sedges'] },
    diagnosis: 'Weed pressure in standing crop',
    severity: 'moderate',
    action: 'Choose a selective herbicide by crop (Atrazine for maize/jowar, Quizalofop for cotton/groundnut, Butachlor for paddy).',
    productIds: ['agx-hb03', 'agx-hb06'],
    ipm: ['Critical period of weed control: first 20–40 days after sowing', 'Manual weeding at 20 & 40 DAS as primary round', 'Stale seedbed technique 10 days before sowing', 'Mulch between rows in wider-spaced crops'],
    dosing: 'Maize/jowar — Atrazine 50% WP 800 g/acre pre-emergence; cotton/groundnut grass weeds — Quizalofop 5% EC 300–400 ml/acre post-emergence.',
    safety: 'Herbicide sprays need gloves, mask, apron; never spray with rough/worn nozzles that produce fine haze.',
    residual: 'Keep 7 days between herbicide and any other crop operation.',
    tips: 'Mis-identified weeds waste money — confirm whether problem is grassy, broadleaf, or sedge before buying.',
  },
  {
    match: { crops: ['all'], keywords: ['blast', 'rice blast', 'neck blast', 'grain discolor', 'sheath blight'] },
    diagnosis: 'Rice blast / sheath blight complex',
    severity: 'moderate',
    action: 'Tricyclazole or Propiconazole 25% EC spray.',
    productIds: ['agx-fn03', 'agx-fn07'],
    ipm: ['Avoid excess nitrogen + split dose', 'Maintain 5 cm standing water (lows blast pressure)', 'Trichoderma seed treatment', 'Better drainage at late tillering'],
    dosing: 'Propiconazole 25% EC: 400 ml/acre (1 ml/L) at heading stage; 2 sprays at 12-day interval for blast peaks.',
    safety: 'PPE: mask, gloves, full sleeves. Do not spray into open water canals.',
    residual: 'Pre-harvest interval 14 days.',
    tips: 'Neck blast is the yield-killer — protect at 50% flowering with a systemic; a contact spray then is wasted money.',
  },
  {
    match: { crops: ['all'], keywords: ['root rot', 'wilt', 'damping off', 'soil fungus', 'collar rot', 'stem rot'] },
    diagnosis: 'Soil-borne fungal disease complex',
    severity: 'moderate',
    action: 'Trichoderma viride soil incorporation + Copper oxychloride or Pseudomonas foliar support.',
    productIds: ['agx-bio03', 'agx-bio06'],
    ipm: ['5-day chemical-bio gap (never mix Trichoderma with fungicides)', 'Green manuring with sunhemp or dhaincha before the crop', 'Well-decomposed FYM enriched with Trichoderma', 'Raised-bed planting in wet soils'],
    dosing: 'Trichoderma 1% WP: 4 g/kg seed or 500 g/acre mixed with 100 kg FYM, incorporated 5–7 days before sowing.',
    safety: 'Bio-agent safe to handle without PPE; keep away from midday heat in transport and storage.',
    residual: 'No waiting period after bio-agent application.',
    tips: 'Trichoderma works as prevention (before the disease), not as a cure once drenching symptoms are visible.',
  },
];

const FALLBACK = {
  diagnosis: 'Mixed / early-stage pest or disease stress (needs closer look)',
  severity: 'moderate',
  action: 'Start with a biological IPM programme (neem oil + Trichoderma/Pseudomonas) and inspect daily; escalate to a targeted chemical spray only if symptoms cross threshold.',
  productIds: ['agx-bio01', 'agx-bio03'],
  ipm: [
    'Walk the field at sunrise — photograph leaf tops and undersides from 10 random plants',
    'Start with neem oil 10000 ppm @ 2 ml/L as a zero-residue first step',
    'Check soil moisture — many "diseases" are water stress in disguise',
    'Send clear photos to AGREXA via WhatsApp (90147 91483) for free identification',
  ],
  dosing: 'Neem oil 10000 ppm EC: 400 ml/acre in 200 L water, spray at evening; Trichoderma 500 g/acre with FYM for soil health.',
  safety: 'PPE: gloves, mask, full sleeves. Spray in low-sun hours; never against wind.',
  residual: 'Neem carries no residual restrictions; chemical products do — 14 days typical pre-harvest interval.',
  tips: 'A single clearly-identified pest with a labelled product almost always beats a broad-spectrum spray. If unsure of the ID, one free photo-consultation can save a full spray cost.',
};

function diagnose({ crop = 'all', symptoms = '', language = 'en' } = {}) {
  const text = `${symptoms} ${crop}`.toLowerCase();
  const chosen = crop === 'all' ? LIBRARY : [crop, 'all'].map((c) => LIBRARY.filter((e) => e.match.crops.includes(c))).flat();
  const scored = chosen
    .map((e) => {
      const kw = e.match.keywords.filter((k) => text.includes(k));
      let score = kw.length * 2;
      if (e.match.crops[0] !== 'all') score += 1;
      return { ...e, score };
    })
    .filter((e) => e.score > 1);
  scored.sort((a, b) => b.score - a.score);
  const hit = scored[0] || { ...FALLBACK, productIds: FALLBACK.productIds };
  const rec = {
    diagnosis: hit.diagnosis,
    severity: hit.severity || 'moderate',
    action: hit.action,
    dosing: hit.dosing,
    safety: hit.safety,
    residual: hit.residual,
    ipm: hit.ipm,
    tips: hit.tips,
    product_ids: hit.productIds || [],
  };
  return rec;
}

module.exports = { diagnose };
