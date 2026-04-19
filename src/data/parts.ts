/**
 * Part catalog — the single source of truth for assembly, UI, and education.
 *
 * Per design doc §3.1 / §3.2 the MVP ships with exactly 12 tray cards. Cards
 * with an instance count > 1 (Pistons x4, Conrods x4, Valves x8, Plugs x4)
 * place *all* their instances at once when snapped — this matches §4.1.1
 * ("Clicking a card picks up the part"), the 7/12 progress bar in §4.1.3,
 * and keeps the assembly sequence tight.
 *
 * ALL tooltip copy lives here (§8.3 non-negotiable — never hardcoded in
 * components).
 */

export type PartCategory =
  | 'Structure'
  | 'Motion'
  | 'ValveTrain'
  | 'Ignition'
  | 'Sealing'
  | 'Lubrication'
  | 'Sync';

export interface Tooltip {
  title: string;
  body: string;
  funFact: string;
}

export interface EnginePart {
  id: string;
  name: string;
  category: PartCategory;
  snapZoneId: string;
  assemblyOrder: number;
  tooltip: Tooltip;
  color: string;
  soundOnSnap: 'click';
  /** Hard gating — tray card stays greyed out until these are placed. */
  requiresParts: string[];
  /** How many physical instances this card represents (e.g. 4 pistons). */
  instanceCount: number;
}

export const CATEGORY_COLOR: Record<PartCategory, string> = {
  Structure: '#7fb2ff',
  Motion: '#ff7a1a',
  ValveTrain: '#f7c948',
  Ignition: '#ff5d5d',
  Sealing: '#b78bff',
  Lubrication: '#6fd27a',
  Sync: '#4ad6c7',
};

export const PARTS: EnginePart[] = [
  {
    id: 'engine-block',
    name: 'Engine Block',
    category: 'Structure',
    snapZoneId: 'zone-block',
    assemblyOrder: 1,
    color: '#7fb2ff',
    soundOnSnap: 'click',
    requiresParts: [],
    instanceCount: 1,
    tooltip: {
      title: 'Engine Block',
      body:
        'The engine block is the cast-metal skeleton of the engine. It houses the four cylinders and carries the coolant passages and oil channels that keep everything from overheating or seizing. Every other part bolts to it.',
      funFact: 'Modern blocks are mostly aluminium — a full V8 block can weigh less than 40kg.',
    },
  },
  {
    id: 'crankshaft',
    name: 'Crankshaft',
    category: 'Motion',
    snapZoneId: 'zone-crankshaft',
    assemblyOrder: 2,
    color: '#ff7a1a',
    soundOnSnap: 'click',
    requiresParts: ['engine-block'],
    instanceCount: 1,
    tooltip: {
      title: 'Crankshaft',
      body:
        'A heavy, precisely balanced steel shaft running the length of the engine. It takes the up-and-down punching motion of the pistons and converts it into the smooth rotation that eventually turns your wheels. If a crankshaft fails, the engine is destroyed beyond economical repair.',
      funFact: 'A 6000rpm engine crankshaft rotates 100 times every second.',
    },
  },
  {
    id: 'connecting-rods',
    name: 'Connecting Rods x4',
    category: 'Motion',
    snapZoneId: 'zone-conrods',
    assemblyOrder: 3,
    color: '#ff9b55',
    soundOnSnap: 'click',
    requiresParts: ['crankshaft'],
    instanceCount: 4,
    tooltip: {
      title: 'Connecting Rods',
      body:
        'Four forged-steel links that bolt to the crankshaft\u2019s throws. Each one will eventually connect a piston to the crank, translating straight-line motion into rotation. Rods endure enormous compressive loads on every power stroke.',
      funFact: 'A single rod sees loads of several tonnes during combustion — many times a second.',
    },
  },
  {
    id: 'pistons',
    name: 'Pistons x4',
    category: 'Motion',
    snapZoneId: 'zone-pistons',
    assemblyOrder: 4,
    color: '#d8dde5',
    soundOnSnap: 'click',
    requiresParts: ['connecting-rods'],
    instanceCount: 4,
    tooltip: {
      title: 'Pistons',
      body:
        'Aluminium slugs that slide up and down inside each cylinder. When the compressed mixture ignites above them, they are driven down — producing the power stroke. Piston rings seal the tiny gap to the cylinder wall so pressure cannot escape.',
      funFact: 'A piston can accelerate at 3000g, reversing direction thousands of times per minute.',
    },
  },
  {
    id: 'head-gasket',
    name: 'Head Gasket',
    category: 'Sealing',
    snapZoneId: 'zone-head-gasket',
    assemblyOrder: 5,
    color: '#b78bff',
    soundOnSnap: 'click',
    requiresParts: ['pistons'],
    instanceCount: 1,
    tooltip: {
      title: 'Head Gasket',
      body:
        'A thin, multi-layer metal sheet that seals the joint between the block and the cylinder head. It must simultaneously contain combustion pressure, coolant, and oil — all at different pressures. A blown head gasket is one of the most common serious engine faults.',
      funFact: 'A head gasket is typically under 2mm thick but seals pressures over 100 bar.',
    },
  },
  {
    id: 'cylinder-head',
    name: 'Cylinder Head',
    category: 'Structure',
    snapZoneId: 'zone-cylinder-head',
    assemblyOrder: 6,
    color: '#7fb2ff',
    soundOnSnap: 'click',
    requiresParts: ['head-gasket'],
    instanceCount: 1,
    tooltip: {
      title: 'Cylinder Head',
      body:
        'The precision-cast lid that closes off the top of each cylinder, forming the combustion chamber. It holds the valve seats, valve guides, and spark-plug threads. Its combustion-chamber geometry directly determines how efficiently the engine burns fuel.',
      funFact: 'A performance cylinder head is hand-ported — reshaping passages by millimetres can add double-digit horsepower.',
    },
  },
  {
    id: 'camshaft',
    name: 'Camshaft',
    category: 'ValveTrain',
    snapZoneId: 'zone-camshaft',
    assemblyOrder: 7,
    color: '#f7c948',
    soundOnSnap: 'click',
    requiresParts: ['cylinder-head'],
    instanceCount: 1,
    tooltip: {
      title: 'Camshaft',
      body:
        'A rotating shaft with egg-shaped lobes machined along its length. As it spins, each lobe pushes a valve open at precisely the right moment, then lets a spring snap it shut. Its lobe profile is what makes one engine mellow and another aggressive.',
      funFact: 'The camshaft always turns at exactly half crankshaft speed — one valve cycle per two piston strokes.',
    },
  },
  {
    id: 'valves',
    name: 'Valves x8',
    category: 'ValveTrain',
    snapZoneId: 'zone-valves',
    assemblyOrder: 8,
    color: '#f7c948',
    soundOnSnap: 'click',
    requiresParts: ['camshaft'],
    instanceCount: 8,
    tooltip: {
      title: 'Valves',
      body:
        'Eight precisely-ground discs — four intake and four exhaust. Intakes open to let the fresh air-fuel charge rush in; exhausts vent the burnt gases out. They are pushed open by the camshaft and snapped shut by stiff springs.',
      funFact: 'An exhaust valve glows cherry-red at full load — routinely over 700°C.',
    },
  },
  {
    id: 'timing-belt',
    name: 'Timing Belt',
    category: 'Sync',
    snapZoneId: 'zone-timing-belt',
    assemblyOrder: 9,
    color: '#4ad6c7',
    soundOnSnap: 'click',
    requiresParts: ['valves'],
    instanceCount: 1,
    tooltip: {
      title: 'Timing Belt',
      body:
        'A reinforced rubber belt that locks the crankshaft and the camshaft into precise synchronisation. If it slips or snaps, the valves meet the pistons at the wrong moment and the engine is finished. Most manufacturers specify replacement every 60,000 to 100,000 miles.',
      funFact: 'A snapped timing belt is one of the most catastrophic — and entirely preventable — engine failures.',
    },
  },
  {
    id: 'spark-plugs',
    name: 'Spark Plugs x4',
    category: 'Ignition',
    snapZoneId: 'zone-spark-plugs',
    assemblyOrder: 10,
    color: '#ff5d5d',
    soundOnSnap: 'click',
    requiresParts: ['timing-belt'],
    instanceCount: 4,
    tooltip: {
      title: 'Spark Plugs',
      body:
        'Four ceramic-insulated electrodes that screw into the cylinder head. At precisely the right instant, each one fires a tiny arc that ignites the compressed air-fuel mixture — kicking off the power stroke. Their tip gap is a critical tuning parameter.',
      funFact: 'A spark plug fires at around 20,000 volts — enough to jump a 1mm gap in a fraction of a millisecond.',
    },
  },
  {
    id: 'oil-pan',
    name: 'Oil Pan',
    category: 'Lubrication',
    snapZoneId: 'zone-oil-pan',
    assemblyOrder: 11,
    color: '#6fd27a',
    soundOnSnap: 'click',
    requiresParts: ['engine-block'],
    instanceCount: 1,
    tooltip: {
      title: 'Oil Pan',
      body:
        'The stamped-steel reservoir bolted to the bottom of the block. It holds a few litres of oil and feeds the pump that pressurises every bearing in the engine. Starve it of oil and metal parts weld themselves together in seconds.',
      funFact: 'The oil pan has internal baffles — without them, hard cornering would let the pickup suck air instead of oil.',
    },
  },
  {
    id: 'valve-cover',
    name: 'Valve Cover',
    category: 'Sealing',
    snapZoneId: 'zone-valve-cover',
    assemblyOrder: 12,
    color: '#b78bff',
    soundOnSnap: 'click',
    requiresParts: ['spark-plugs'],
    instanceCount: 1,
    tooltip: {
      title: 'Valve Cover',
      body:
        'The top-most sculpted cover on an engine. It seals oil inside the valve train and is usually the most decorative piece — many manufacturers use it as a badge. A leaking valve-cover gasket is an annoyance, not a disaster.',
      funFact: 'On many cars the valve cover is the only engine part most people ever actually see.',
    },
  },
];

export const PART_BY_ID: Record<string, EnginePart> = Object.fromEntries(
  PARTS.map((p) => [p.id, p]),
);

export const TOTAL_PART_COUNT = PARTS.length; // 12 per §3.1

/** Category display order in the tray (§4.1.1). */
export const CATEGORY_ORDER: PartCategory[] = [
  'Structure',
  'Motion',
  'Sealing',
  'ValveTrain',
  'Sync',
  'Ignition',
  'Lubrication',
];
