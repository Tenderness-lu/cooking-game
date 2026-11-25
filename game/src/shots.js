// Sizzle & Serve — deterministic scenes for screenshots.
// ?shot=kitchen | assembly | serve | menu freezes a staged kitchen so the
// screenshots show the game at its best: orders on the board, a dish
// mid-assembly, a timer running, a plate ready to serve. No timers advance
// in shot mode; the frame is rendered exactly as staged.
export function applyShot(kitchen, shot) {
  const k = kitchen;
  k.mode = 'shot';
  k.day = 1;
  k.cfg = k.cfg || { target: 60 };
  k.mood = 3;
  k.combo = 3;
  k.bestCombo = 4;
  k.servedToday = 5;
  k.missedToday = 0;
  k.popups = [];

  if (shot === 'menu') {
    k.mode = 'menu';
    return;
  }
  if (shot === 'assembly') {
    k.dayTimeLeft = 58;
    k.money = 74;
    k.orders = [
      { id: 911, recipeId: 'burger', timeLeft: 31, patience: 45 },
      { id: 912, recipeId: 'deluxe', timeLeft: 22, patience: 45 },
    ];
    k.board = { item: 'lettuce', chops: 2 };
    k.grill = { item: 'patty', t: 6.5, burnt: false };
    k.pot = { item: 'noodles', t: 3.2 };
    k.plate = ['bun', 'pattyCooked', 'lettuceChopped', 'tomatoChopped'];
    k.carried = 'sauce';
    return;
  }
  if (shot === 'serve') {
    k.dayTimeLeft = 44;
    k.money = 102;
    k.combo = 4;
    k.orders = [
      { id: 921, recipeId: 'burger', timeLeft: 26, patience: 45 },
      { id: 922, recipeId: 'salad', timeLeft: 14, patience: 45 },
      { id: 923, recipeId: 'pasta', timeLeft: 33, patience: 40 },
    ];
    k.board = null;
    k.grill = null;
    k.pot = null;
    k.plate = ['bun', 'pattyCooked', 'lettuceChopped', 'tomatoChopped'];
    k.carried = null;
    k.popups = [{ x: 640, y: 305, text: '+$19  x4 combo!', color: '#f2b705', t: 0.3 }];
    return;
  }
  // Default: kitchen — the cover. Everything in one frame.
  k.dayTimeLeft = 62;
  k.money = 86;
  k.orders = [
    { id: 931, recipeId: 'burger', timeLeft: 28, patience: 45 },
    { id: 932, recipeId: 'salad', timeLeft: 18, patience: 45 },
    { id: 933, recipeId: 'pasta', timeLeft: 9, patience: 40 },
  ];
  k.board = { item: 'tomato', chops: 2 };
  k.grill = { item: 'patty', t: 4.5, burnt: false };
  k.pot = { item: 'noodles', t: 2.5 };
  k.plate = ['bun', 'pattyCooked', 'lettuceChopped'];
  k.carried = 'tomatoChopped';
}
