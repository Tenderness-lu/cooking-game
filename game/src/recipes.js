// Sizzle & Serve — ingredients and recipes.
// Every dish is a multiset of prepared ingredients. Raw ingredients that
// need work (lettuce, tomato, patty, noodles) become their prepared form
// at a station; sauce and bun are ready straight from the bin.

export const INGREDIENTS = {
  bun: { id: 'bun', name: 'Bun', key: '1', prep: 'ready', color: '#e8b06a', dark: '#c98d45', price: 2 },
  patty: { id: 'patty', name: 'Patty', key: '2', prep: 'grill', color: '#8a5a3b', dark: '#6b4229', price: 4 },
  lettuce: { id: 'lettuce', name: 'Lettuce', key: '3', prep: 'chop', color: '#7bc96f', dark: '#4f9e3e', price: 2 },
  tomato: { id: 'tomato', name: 'Tomato', key: '4', prep: 'chop', color: '#e4572e', dark: '#b93a1a', price: 2 },
  noodles: { id: 'noodles', name: 'Noodles', key: '5', prep: 'boil', color: '#f2c94c', dark: '#d9a91f', price: 3 },
  sauce: { id: 'sauce', name: 'Sauce', key: '6', prep: 'ready', color: '#d64550', dark: '#a82e38', price: 2 },
};

// Prepared forms: what an ingredient becomes after its station work.
export const PREPARED = {
  bun: 'bun',
  patty: 'pattyCooked',
  lettuce: 'lettuceChopped',
  tomato: 'tomatoChopped',
  noodles: 'noodlesCooked',
  sauce: 'sauce',
};

export const PREPARED_INFO = {
  bun: { name: 'Bun', color: '#e8b06a', dark: '#c98d45' },
  pattyCooked: { name: 'Grilled Patty', color: '#9c6b45', dark: '#7a4e2e' },
  lettuceChopped: { name: 'Chopped Lettuce', color: '#7bc96f', dark: '#4f9e3e' },
  tomatoChopped: { name: 'Sliced Tomato', color: '#e4572e', dark: '#b93a1a' },
  noodlesCooked: { name: 'Cooked Noodles', color: '#f2c94c', dark: '#d9a91f' },
  sauce: { name: 'Sauce', color: '#d64550', dark: '#a82e38' },
};

export const RECIPES = {
  burger: {
    id: 'burger', name: 'Classic Burger', price: 14, color: '#e8b06a',
    needs: ['bun', 'pattyCooked', 'lettuceChopped', 'tomatoChopped'],
  },
  salad: {
    id: 'salad', name: 'Garden Salad', price: 10, color: '#7bc96f',
    needs: ['lettuceChopped', 'tomatoChopped', 'sauce'],
  },
  pasta: {
    id: 'pasta', name: 'Tomato Pasta', price: 12, color: '#f2c94c',
    needs: ['noodlesCooked', 'sauce'],
  },
  deluxe: {
    id: 'deluxe', name: 'Deluxe Burger', price: 20, color: '#d64550',
    needs: ['bun', 'pattyCooked', 'lettuceChopped', 'tomatoChopped', 'sauce'],
  },
};

export const RECIPE_LIST = ['burger', 'salad', 'pasta', 'deluxe'];

// Time (seconds) each station job takes, and how long a patty survives
// on the grill before it burns.
export const STATION_TIME = {
  chopClicks: 3,
  grillS: 6,
  burnAfterS: 11,
  boilS: 5,
};

// Compare a plate (array of prepared ids) with a recipe's needs as multisets.
export function plateMatchesRecipe(plate, recipe) {
  if (plate.length !== recipe.needs.length) return false;
  const have = [...plate].sort();
  const want = [...recipe.needs].sort();
  return have.every((item, i) => item === want[i]);
}
