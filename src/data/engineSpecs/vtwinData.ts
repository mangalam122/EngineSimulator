/**
 * Harley 45° V-twin — parts catalog, snap-zone placements, firing events.
 *
 * Layout:
 *   The crankshaft runs along Z, with a SINGLE crankpin in the middle.
 *   Two cylinders ("jugs") are arranged in an X-Y plane V:
 *     • Front cylinder — tilts +22.5° around Z axis (bore points up-and-forward-X)
 *     • Rear cylinder  — tilts -22.5° around Z axis (bore points up-and-backward-X)
 *   Both connecting rods share the one crankpin (fork-and-blade rod design).
 *   The valvetrain is OHV: cam in the crankcase pushes lifters → pushrods →
 *   rocker arms on top of each head → valves. No timing belt.
 *   Firing order is 1 (front), wait 315°, 2 (rear), wait 405°, repeat —
 *   this is the famous "potato-potato" lope.
 *
 * Cylinder numbering: 1 = front, 2 = rear (so they map to front/rear heads).
 */
import type { EnginePart, SnapZone } from './types';

/* ------------------ Geometry constants (V-twin only) ------------------ */
export const VTW_BANK_HALF_DEG = 22.5;
export const VTW_BANK_HALF_RAD = (VTW_BANK_HALF_DEG * Math.PI) / 180;

export const VTW_CRANK_CENTER_Y = -0.1;  // slightly higher than inline-4 (shorter engine)
export const VTW_DECK_Y = 0.9;           // top of each cylinder barrel
export const VTW_HEAD_TOP_Y = 1.55;      // top of rocker boxes
export const VTW_CAM_Y = -0.35;          // cam lives in crankcase, below crank
export const VTW_PAN_Y = -0.78;

export const VTW_CRANK_RADIUS = 0.26;    // longer stroke than inline-4
export const VTW_ROD_LENGTH = 0.85;
export const VTW_CYLINDER_RADIUS = 0.28; // Harley bore is notably fat

/** Case dimensions (a box containing the V). */
export const VTW_CASE = {
  width: 1.4,   // X
  height: 0.9,  // Y
  length: 1.2,  // Z (shorter than inline-4)
};

/** Bank rotation for a given cylinder (rad about Z axis).
 *  Cyl 1 (front) tilts +X, cyl 2 (rear) tilts -X. */
export function vtwBankRotation(cyl: 1 | 2): number {
  return cyl === 1 ? VTW_BANK_HALF_RAD : -VTW_BANK_HALF_RAD;
}

/** Local vertical offset along each bank's axis to a named feature.
 *  Returns world position given the bank angle and vertical rise. */
export function vtwCylinderAnchor(cyl: 1 | 2, verticalAlongBank: number): [number, number, number] {
  const angle = vtwBankRotation(cyl);
  // Bank axis: (sin(angle), cos(angle), 0). Offset from crank center.
  const x = Math.sin(angle) * verticalAlongBank;
  const y = VTW_CRANK_CENTER_Y + Math.cos(angle) * verticalAlongBank;
  return [x, y, 0];
}

/* ------------------ Firing cycle ------------------ */
/** Front cyl fires at 0°, rear cyl fires at 315° later. Next front-cyl
 *  fire comes 405° after the rear (total = 720°). This produces the
 *  characteristic uneven "potato-potato" idle. */
export const VTW_FIRING_CYCLE = [
  { cyl: 1, crankAngle: 0 },
  { cyl: 2, crankAngle: (315 * Math.PI) / 180 },
];

/** Crank offsets per cylinder — both rods share the SAME crankpin, so both
 *  pistons reach TDC at the same crank rotation (index 0). The 315° / 405°
 *  firing interval is produced purely by which piston is on its power
 *  stroke vs its intake stroke at that moment — handled in animation. */
export const VTW_CRANK_OFFSETS = [0, 0];

/* ------------------ Snap zones ------------------ */
/** All 12 V-twin snap zones. Dependency chain enforced via part.requiresParts. */
export const VTW_SNAP_ZONES: SnapZone[] = [
  { id: 'vtw-zone-crankcase',     partId: 'vtw-crankcase',       position: [0, 0, 0],                         radius: 0.6 },
  { id: 'vtw-zone-crankshaft',    partId: 'vtw-crankshaft',      position: [0, VTW_CRANK_CENTER_Y, 0],        radius: 0.35 },
  { id: 'vtw-zone-conrods',       partId: 'vtw-connecting-rods', position: [0, VTW_CRANK_CENTER_Y + 0.25, 0], radius: 0.35 },
  { id: 'vtw-zone-pistons',       partId: 'vtw-pistons',         position: [0, VTW_CRANK_CENTER_Y + 0.55, 0], radius: 0.35 },
  { id: 'vtw-zone-cylinders',     partId: 'vtw-cylinders',       position: [0, VTW_DECK_Y - 0.15, 0],         radius: 0.45 },
  { id: 'vtw-zone-head-gaskets',  partId: 'vtw-head-gaskets',    position: [0, VTW_DECK_Y + 0.02, 0],         radius: 0.4 },
  { id: 'vtw-zone-heads',         partId: 'vtw-cylinder-heads',  position: [0, VTW_DECK_Y + 0.25, 0],         radius: 0.45 },
  { id: 'vtw-zone-camshaft',      partId: 'vtw-camshaft',        position: [0, VTW_CAM_Y, 0.2],               radius: 0.35 },
  { id: 'vtw-zone-pushrods',      partId: 'vtw-pushrods',        position: [0, VTW_DECK_Y - 0.05, 0.22],      radius: 0.4 },
  { id: 'vtw-zone-valves',        partId: 'vtw-valves',          position: [0, VTW_DECK_Y + 0.3, 0],          radius: 0.35 },
  { id: 'vtw-zone-spark-plugs',   partId: 'vtw-spark-plugs',     position: [0, VTW_DECK_Y + 0.35, 0],         radius: 0.35 },
  { id: 'vtw-zone-rocker-boxes',  partId: 'vtw-rocker-boxes',    position: [0, VTW_HEAD_TOP_Y, 0],            radius: 0.45 },
];

/* ------------------ Parts catalog (12 cards) ------------------ */
export const VTW_PARTS: EnginePart[] = [
  {
    id: 'vtw-crankcase',
    name: 'Crankcase',
    category: 'Structure',
    snapZoneId: 'vtw-zone-crankcase',
    assemblyOrder: 1,
    color: '#7fb2ff',
    soundOnSnap: 'click',
    requiresParts: [],
    instanceCount: 1,
    tooltip: {
      title: 'Crankcase',
      body:
        'The central casting that houses the crankshaft, camshaft, and primary drive. On a Harley V-twin the case is split into two halves bolted together along the crankshaft axis. Cylinders bolt up on top; the oil pan hangs below.',
      funFact: 'Harley-Davidson cast their first aluminium crankcase in 1936 with the Knucklehead — still the same basic architecture today.',
    },
  },
  {
    id: 'vtw-crankshaft',
    name: 'Crankshaft',
    category: 'Motion',
    snapZoneId: 'vtw-zone-crankshaft',
    assemblyOrder: 2,
    color: '#ff7a1a',
    soundOnSnap: 'click',
    requiresParts: ['vtw-crankcase'],
    instanceCount: 1,
    tooltip: {
      title: 'Crankshaft (Flywheel Assembly)',
      body:
        'A V-twin crankshaft has a SINGLE crankpin that BOTH connecting rods share. In traditional Harleys this is called a "flywheel assembly" — two heavy flywheels press-fit onto a crankpin, bolted together. Short and stout compared to an inline-4 crank.',
      funFact: 'Because both rods share one crankpin, V-twin pistons don\'t reach top dead centre together — the rear piston trails the front by 45°.',
    },
  },
  {
    id: 'vtw-connecting-rods',
    name: 'Connecting Rods x2',
    category: 'Motion',
    snapZoneId: 'vtw-zone-conrods',
    assemblyOrder: 3,
    color: '#ff9b55',
    soundOnSnap: 'click',
    requiresParts: ['vtw-crankshaft'],
    instanceCount: 2,
    tooltip: {
      title: 'Connecting Rods (Fork & Blade)',
      body:
        'Two rods on ONE crankpin. The front-cylinder rod is the "fork" — it\'s forked at the big end to straddle the rear rod. The rear rod slots between the fork like a blade. Both rods turn together on the same pin.',
      funFact: 'The fork-and-blade design lets both cylinders sit in exactly the same plane — the V is "straight" rather than staggered like most V-twins.',
    },
  },
  {
    id: 'vtw-pistons',
    name: 'Pistons x2',
    category: 'Motion',
    snapZoneId: 'vtw-zone-pistons',
    assemblyOrder: 4,
    color: '#d8dde5',
    soundOnSnap: 'click',
    requiresParts: ['vtw-connecting-rods'],
    instanceCount: 2,
    tooltip: {
      title: 'Pistons',
      body:
        'Two forged aluminium pistons — bigger and heavier than inline-4 pistons because Harleys run long strokes at low RPM. Each slides inside its own cylinder (the "jug") at a 22.5° angle from vertical.',
      funFact: 'A Harley Milwaukee-Eight piston is over 100mm across — roughly the size of a softball.',
    },
  },
  {
    id: 'vtw-cylinders',
    name: 'Cylinders x2',
    category: 'Structure',
    snapZoneId: 'vtw-zone-cylinders',
    assemblyOrder: 5,
    color: '#4e5a6b',
    soundOnSnap: 'click',
    requiresParts: ['vtw-pistons'],
    instanceCount: 2,
    tooltip: {
      title: 'Cylinders ("Jugs")',
      body:
        'Unlike a car engine, a Harley has SEPARATE cylinder barrels that bolt onto the crankcase. Each has deep cooling fins running across it. The front one leans forward 22.5°, rear one leans back 22.5° — forming the 45° V.',
      funFact: 'Those cooling fins are why Harley engines are called air-cooled — no radiator, the fins shed combustion heat straight into the airstream.',
    },
  },
  {
    id: 'vtw-head-gaskets',
    name: 'Head Gaskets x2',
    category: 'Sealing',
    snapZoneId: 'vtw-zone-head-gaskets',
    assemblyOrder: 6,
    color: '#b78bff',
    soundOnSnap: 'click',
    requiresParts: ['vtw-cylinders'],
    instanceCount: 2,
    tooltip: {
      title: 'Head Gaskets',
      body:
        'A gasket for each cylinder — seals the combustion chamber between cylinder barrel and head. V-twins have two separate gaskets (one per jug) rather than one big gasket across the block.',
      funFact: 'Blown head gasket on a Harley means pulling the top end apart — a weekend job for anyone with a factory service manual.',
    },
  },
  {
    id: 'vtw-cylinder-heads',
    name: 'Cylinder Heads x2',
    category: 'Structure',
    snapZoneId: 'vtw-zone-heads',
    assemblyOrder: 7,
    color: '#7fb2ff',
    soundOnSnap: 'click',
    requiresParts: ['vtw-head-gaskets'],
    instanceCount: 2,
    tooltip: {
      title: 'Cylinder Heads',
      body:
        'A separate head bolts on top of each cylinder. Each houses the combustion chamber, two valve seats, and the spark-plug threads. On modern Twin-Cams each head has TWO intake valves and one exhaust — but we use a simpler 2-valve-per-head setup here.',
      funFact: 'The head names in Harley-land tell a history: Knucklehead, Panhead, Shovelhead, Evolution, Twin Cam, Milwaukee-Eight — each era named for its head shape.',
    },
  },
  {
    id: 'vtw-camshaft',
    name: 'Camshaft',
    category: 'ValveTrain',
    snapZoneId: 'vtw-zone-camshaft',
    assemblyOrder: 8,
    color: '#f7c948',
    soundOnSnap: 'click',
    requiresParts: ['vtw-crankcase'],
    instanceCount: 1,
    tooltip: {
      title: 'Camshaft (In Crankcase)',
      body:
        'Unlike the inline-4\'s overhead cam, a Harley V-twin (classic style) puts a SINGLE camshaft down in the crankcase. It has 4 lobes — one per valve — and it drives the valves through lifters, pushrods and rocker arms far above it.',
      funFact: 'Harley ran a single cam with 4 lobes for decades; the Twin Cam era (1999–2016) briefly used two cams, now the Milwaukee-Eight is back to one.',
    },
  },
  {
    id: 'vtw-pushrods',
    name: 'Pushrods x4',
    category: 'ValveTrain',
    snapZoneId: 'vtw-zone-pushrods',
    assemblyOrder: 9,
    color: '#c8d0d8',
    soundOnSnap: 'click',
    requiresParts: ['vtw-camshaft', 'vtw-cylinder-heads'],
    instanceCount: 4,
    tooltip: {
      title: 'Pushrods',
      body:
        'Four thin steel tubes, running between cam lifters (in the crankcase) and rocker arms (up on top of the heads). One intake + one exhaust per cylinder. The whole valvetrain reciprocates up and down tens of times per second.',
      funFact: 'Those chrome pushrod tubes on a Harley\'s right side? They\'re literally the characteristic external element of the engine\'s silhouette.',
    },
  },
  {
    id: 'vtw-valves',
    name: 'Valves x4',
    category: 'ValveTrain',
    snapZoneId: 'vtw-zone-valves',
    assemblyOrder: 10,
    color: '#f7c948',
    soundOnSnap: 'click',
    requiresParts: ['vtw-pushrods'],
    instanceCount: 4,
    tooltip: {
      title: 'Valves (2 per head)',
      body:
        'Four valves total — one intake + one exhaust per head. Each is pushed open by a rocker arm (above) and returned by a spring. Intake is larger than exhaust so the cylinder breathes better on the induction stroke.',
      funFact: 'On some racing Harleys intake valves glow cherry-red at sustained high RPM — over 700 °C.',
    },
  },
  {
    id: 'vtw-spark-plugs',
    name: 'Spark Plugs x2',
    category: 'Ignition',
    snapZoneId: 'vtw-zone-spark-plugs',
    assemblyOrder: 11,
    color: '#ff5d5d',
    soundOnSnap: 'click',
    requiresParts: ['vtw-valves'],
    instanceCount: 2,
    tooltip: {
      title: 'Spark Plugs',
      body:
        'One plug per head. Each fires at a precise moment to ignite its cylinder\'s charge. The two plugs fire 315° / 405° apart — that uneven interval is literally what gives a Harley its iconic lumpy idle.',
      funFact: 'The "potato-potato-potato" idle is so iconic Harley tried (and eventually dropped) a trademark on the sound in the late 1990s.',
    },
  },
  {
    id: 'vtw-rocker-boxes',
    name: 'Rocker Boxes x2',
    category: 'Sealing',
    snapZoneId: 'vtw-zone-rocker-boxes',
    assemblyOrder: 12,
    color: '#b78bff',
    soundOnSnap: 'click',
    requiresParts: ['vtw-spark-plugs'],
    instanceCount: 2,
    tooltip: {
      title: 'Rocker Boxes',
      body:
        'The stamped/cast covers that sit on top of each head, over the rocker arms. They\'re a V-twin\'s equivalent of a valve cover — seal oil in, keep dirt out. Harleys finish them in chrome or black wrinkle.',
      funFact: 'Twin-Cam rocker boxes are a three-layer stack, designed to be removable without pulling the head — service-friendly.',
    },
  },
];
