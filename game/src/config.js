// Sizzle & Serve — shared constants for the whole kitchen.
// One canvas, one coordinate system: the game is drawn at 1280x720 and the
// page scales it to fit the window, so every hit test uses canvas pixels.
export const CANVAS_W = 1280;
export const CANVAS_H = 720;

export const DAY_LENGTH_S = 90;
export const DAYS = [
  { day: 1, target: 60, spawnEveryS: 14, maxOrders: 2, patienceS: 45, recipes: ['burger', 'salad'] },
  { day: 2, target: 110, spawnEveryS: 11, maxOrders: 3, patienceS: 40, recipes: ['burger', 'salad', 'pasta'] },
  { day: 3, target: 170, spawnEveryS: 8, maxOrders: 3, patienceS: 35, recipes: ['burger', 'salad', 'pasta', 'deluxe'] },
];

export const MOOD_MAX = 3;
export const PLATE_MAX = 6;

// Layout rectangles (canvas pixels). The order board lives on the left,
// the stations fill the middle, the ingredient bins run along the bottom.
export const LAYOUT = {
  header: { x: 0, y: 0, w: 1280, h: 70 },
  board: { x: 20, y: 90, w: 310, h: 610 },
  chopping: { x: 360, y: 100, w: 200, h: 190 },
  grill: { x: 580, y: 100, w: 200, h: 190 },
  pot: { x: 800, y: 100, w: 200, h: 190 },
  plate: { x: 1020, y: 100, w: 240, h: 190 },
  serve: { x: 360, y: 320, w: 260, h: 150 },
  trash: { x: 640, y: 320, w: 120, h: 150 },
  recipeBook: { x: 800, y: 320, w: 460, h: 150 },
  bins: { x: 360, y: 500, w: 900, h: 190 },
};

// Warm diner palette: cream walls, terracotta counters, teal accents.
export const COLORS = {
  wall: '#f7ead7',
  wallDark: '#efe0c6',
  counter: '#c96f3f',
  counterDark: '#a8562c',
  counterTop: '#e8b48a',
  boardWood: '#d9a066',
  steel: '#b8c4cc',
  steelDark: '#8fa0ab',
  teal: '#2a9d8f',
  tealDark: '#1f7a6e',
  cream: '#fff8ec',
  ink: '#3a2a1e',
  inkSoft: '#6b543d',
  red: '#e4572e',
  gold: '#f2b705',
  green: '#5da24a',
  ticket: '#fffdf5',
  ticketEdge: '#e8d9b8',
};
