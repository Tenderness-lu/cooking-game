// Sizzle & Serve — every pixel the player sees, drawn on one canvas.
// Food is drawn with canvas shapes only (no images): a bun is a dome with
// sesame dots, a patty a seared slab, lettuce a ruffle of green, and so on,
// so the kitchen reads at a glance even when the screenshot is shrunk.
import { CANVAS_W, CANVAS_H, LAYOUT, COLORS, MOOD_MAX } from './config.js';
import { INGREDIENTS, PREPARED_INFO, RECIPES, RECIPE_LIST } from './recipes.js';

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, s, x, y, size, color, align = 'left', bold = true) {
  ctx.fillStyle = color;
  ctx.font = `${bold ? '700' : '400'} ${size}px system-ui, -apple-system, "Segoe UI", sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(s, x, y);
}

// Draw one ingredient icon centred at (cx, cy) with radius r.
export function drawIngredient(ctx, id, cx, cy, r) {
  ctx.save();
  ctx.translate(cx, cy);
  const info = PREPARED_INFO[id] || INGREDIENTS[id];
  const col = info ? info.color : '#999';
  const dark = info ? info.dark : '#666';
  if (id === 'bun') {
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.arc(0, r * 0.15, r, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = dark;
    ctx.fillRect(-r, r * 0.1, r * 2, r * 0.25);
    ctx.fillStyle = '#fff3d0';
    for (const [dx, dy] of [[-0.45, -0.45], [0, -0.65], [0.45, -0.45], [-0.2, -0.3], [0.25, -0.3]]) {
      ctx.beginPath();
      ctx.ellipse(dx * r, dy * r, r * 0.09, r * 0.06, 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (id === 'patty' || id === 'pattyCooked') {
    ctx.fillStyle = id === 'pattyCooked' ? '#9c6b45' : '#8a5a3b';
    rr(ctx, -r, -r * 0.45, r * 2, r * 0.9, r * 0.35);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.25)';
    ctx.lineWidth = r * 0.12;
    for (const dx of [-0.5, 0, 0.5]) {
      ctx.beginPath();
      ctx.moveTo(dx * r, -r * 0.35);
      ctx.lineTo(dx * r, r * 0.35);
      ctx.stroke();
    }
  } else if (id === 'lettuce' || id === 'lettuceChopped') {
    ctx.fillStyle = col;
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(Math.cos(a) * r * 0.55, Math.sin(a) * r * 0.55, r * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = dark;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.35, 0, Math.PI * 2);
    ctx.fill();
  } else if (id === 'tomato' || id === 'tomatoChopped') {
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f28b6d';
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.55, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffd9c9';
    ctx.beginPath();
    ctx.arc(-r * 0.25, -r * 0.25, r * 0.18, 0, Math.PI * 2);
    ctx.fill();
  } else if (id === 'noodles' || id === 'noodlesCooked') {
    ctx.strokeStyle = col;
    ctx.lineWidth = r * 0.22;
    ctx.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
      const y = (i - 1) * r * 0.5;
      ctx.beginPath();
      ctx.moveTo(-r * 0.8, y);
      ctx.bezierCurveTo(-r * 0.4, y - r * 0.35, r * 0.4, y + r * 0.35, r * 0.8, y);
      ctx.stroke();
    }
  } else if (id === 'sauce') {
    ctx.fillStyle = '#fff';
    rr(ctx, -r * 0.35, -r * 0.7, r * 0.7, r * 1.1, r * 0.2);
    ctx.fill();
    ctx.fillStyle = dark;
    rr(ctx, -r * 0.45, -r * 0.95, r * 0.9, r * 0.35, r * 0.12);
    ctx.fill();
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.arc(0, r * 0.15, r * 0.28, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = `700 ${Math.round(r * 0.42)}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('S', 0, r * 0.15);
  }
  ctx.restore();
}

function drawStationBase(ctx, rect, label, sub) {
  ctx.fillStyle = COLORS.counterTop;
  rr(ctx, rect.x, rect.y, rect.w, rect.h, 14);
  ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.08)';
  rr(ctx, rect.x, rect.y + rect.h - 26, rect.w, 26, 12);
  ctx.fill();
  text(ctx, label, rect.x + rect.w / 2, rect.y + rect.h - 8, 15, COLORS.ink, 'center');
  if (sub) text(ctx, sub, rect.x + rect.w / 2, rect.y + 24, 12, COLORS.inkSoft, 'center', false);
}

function progressRing(ctx, cx, cy, r, frac, color) {
  ctx.strokeStyle = 'rgba(0,0,0,0.15)';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + frac * Math.PI * 2);
  ctx.stroke();
}

function drawOrderTicket(ctx, order, x, y, w, h) {
  const recipe = RECIPES[order.recipeId];
  const frac = Math.max(0, order.timeLeft / order.patience);
  ctx.fillStyle = COLORS.ticket;
  rr(ctx, x, y, w, h, 12);
  ctx.fill();
  ctx.strokeStyle = frac < 0.3 ? COLORS.red : COLORS.ticketEdge;
  ctx.lineWidth = frac < 0.3 ? 3 : 1.5;
  rr(ctx, x, y, w, h, 12);
  ctx.stroke();
  text(ctx, recipe.name, x + 14, y + 28, 17, COLORS.ink);
  text(ctx, `$${recipe.price}`, x + w - 14, y + 28, 17, COLORS.tealDark, 'right');
  let ix = x + 16;
  for (const need of recipe.needs) {
    drawIngredient(ctx, need, ix + 14, y + 56, 13);
    ix += 32;
  }
  // Patience bar.
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  rr(ctx, x + 14, y + h - 22, w - 28, 10, 5);
  ctx.fill();
  ctx.fillStyle = frac > 0.5 ? COLORS.teal : frac > 0.3 ? COLORS.gold : COLORS.red;
  rr(ctx, x + 14, y + h - 22, (w - 28) * frac, 10, 5);
  ctx.fill();
  text(ctx, `${Math.ceil(order.timeLeft)}s`, x + w - 14, y + h - 26, 12, COLORS.inkSoft, 'right', false);
}

function drawHeader(ctx, k) {
  const { header } = LAYOUT;
  ctx.fillStyle = COLORS.tealDark;
  ctx.fillRect(header.x, header.y, header.w, header.h);
  text(ctx, 'SIZZLE & SERVE', 24, 44, 28, '#fff8ec');
  text(ctx, `DAY ${k.day} / 3`, 300, 44, 20, '#ffd9a0');
  // Day timer bar.
  const barX = 420, barW = 300;
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  rr(ctx, barX, 22, barW, 26, 13);
  ctx.fill();
  const frac = Math.max(0, k.dayTimeLeft / 90);
  ctx.fillStyle = frac > 0.3 ? '#ffd9a0' : COLORS.red;
  rr(ctx, barX, 22, barW * frac, 26, 13);
  ctx.fill();
  text(ctx, `${Math.ceil(k.dayTimeLeft)}s`, barX + barW / 2, 41, 15, COLORS.ink, 'center');
  text(ctx, `$${k.money}`, 780, 44, 24, '#fff8ec');
  text(ctx, `/ $${k.cfg.target}`, 830, 44, 16, '#ffd9a0', 'left', false);
  // Mood hearts.
  for (let i = 0; i < MOOD_MAX; i++) {
    const hx = 900 + i * 34;
    ctx.fillStyle = i < k.mood ? COLORS.red : 'rgba(255,255,255,0.25)';
    ctx.beginPath();
    ctx.arc(hx, 30, 9, 0, Math.PI * 2);
    ctx.arc(hx + 14, 30, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(hx - 6, 32);
    ctx.lineTo(hx + 20, 32);
    ctx.lineTo(hx + 7, 50);
    ctx.closePath();
    ctx.fill();
  }
  if (k.combo > 1) text(ctx, `COMBO x${k.combo}`, 1115, 44, 18, COLORS.gold, 'right');
  // Pause / mute buttons.
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  rr(ctx, 1130, 12, 56, 46, 10);
  ctx.fill();
  rr(ctx, 1200, 12, 56, 46, 10);
  ctx.fill();
  text(ctx, 'II', 1158, 42, 18, '#fff8ec', 'center');
  text(ctx, k.muted ? 'MUTE' : 'SOUND', 1228, 42, 13, '#fff8ec', 'center');
}

function drawKitchenScene(ctx, k, mouse) {
  // Walls and floor.
  ctx.fillStyle = COLORS.wall;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.fillStyle = COLORS.wallDark;
  ctx.fillRect(0, 70, CANVAS_W, 8);
  drawHeader(ctx, k);

  // Order board.
  const b = LAYOUT.board;
  ctx.fillStyle = COLORS.counter;
  rr(ctx, b.x, b.y, b.w, b.h, 16);
  ctx.fill();
  text(ctx, 'ORDER BOARD', b.x + b.w / 2, b.y + 34, 20, '#fff8ec', 'center');
  if (!k.orders.length) text(ctx, 'No orders yet…', b.x + b.w / 2, b.y + 120, 15, '#ffd9a0', 'center', false);
  k.orders.forEach((o, i) => drawOrderTicket(ctx, o, b.x + 14, b.y + 52 + i * 132, b.w - 28, 118));
  text(ctx, `Served today: ${k.servedToday}   Missed: ${k.missedToday}`, b.x + b.w / 2, b.y + b.h - 14, 13, '#ffd9a0', 'center', false);

  // Chopping board.
  const ch = LAYOUT.chopping;
  drawStationBase(ctx, ch, 'CHOPPING BOARD', 'lettuce · tomato — click x3');
  ctx.fillStyle = COLORS.boardWood;
  rr(ctx, ch.x + 20, ch.y + 40, ch.w - 40, 90, 10);
  ctx.fill();
  if (k.board) {
    drawIngredient(ctx, k.board.item, ch.x + ch.w / 2, ch.y + 85, 34);
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = i < k.board.chops ? COLORS.teal : 'rgba(0,0,0,0.2)';
      ctx.beginPath();
      ctx.arc(ch.x + ch.w / 2 - 24 + i * 24, ch.y + 148, 8, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    text(ctx, 'drop lettuce / tomato here', ch.x + ch.w / 2, ch.y + 88, 13, COLORS.inkSoft, 'center', false);
  }

  // Grill.
  const g = LAYOUT.grill;
  drawStationBase(ctx, g, 'GRILL', 'patty — 6s, burns at 11s');
  ctx.fillStyle = COLORS.steelDark;
  rr(ctx, g.x + 20, g.y + 40, g.w - 40, 90, 10);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.35)';
  ctx.lineWidth = 3;
  for (let i = 1; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(g.x + 20 + i * ((g.w - 40) / 5), g.y + 44);
    ctx.lineTo(g.x + 20 + i * ((g.w - 40) / 5), g.y + 126);
    ctx.stroke();
  }
  if (k.grill) {
    drawIngredient(ctx, k.grill.burnt ? 'patty' : 'pattyCooked', g.x + g.w / 2, g.y + 85, 32);
    if (k.grill.burnt) text(ctx, 'BURNT!', g.x + g.w / 2, g.y + 160, 16, COLORS.red, 'center');
    else progressRing(ctx, g.x + g.w / 2, g.y + 85, 44, Math.min(1, k.grill.t / 6), k.grill.t >= 6 ? COLORS.teal : COLORS.gold);
    if (k.grill.t >= 6 && !k.grill.burnt) text(ctx, 'READY — click to take', g.x + g.w / 2, g.y + 160, 13, COLORS.tealDark, 'center');
  } else {
    text(ctx, 'drop a patty here', g.x + g.w / 2, g.y + 88, 13, COLORS.inkSoft, 'center', false);
  }

  // Pot.
  const p = LAYOUT.pot;
  drawStationBase(ctx, p, 'POT', 'noodles — 5s to boil');
  ctx.fillStyle = COLORS.steel;
  ctx.beginPath();
  ctx.arc(p.x + p.w / 2, p.y + 92, 52, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#7fb3d5';
  ctx.beginPath();
  ctx.arc(p.x + p.w / 2, p.y + 92, 42, 0, Math.PI * 2);
  ctx.fill();
  if (k.pot) {
    drawIngredient(ctx, 'noodlesCooked', p.x + p.w / 2, p.y + 92, 26);
    if (k.pot.t >= 5) text(ctx, 'READY — click to take', p.x + p.w / 2, p.y + 160, 13, COLORS.tealDark, 'center');
    else progressRing(ctx, p.x + p.w / 2, p.y + 92, 50, Math.min(1, k.pot.t / 5), COLORS.gold);
  } else {
    text(ctx, 'drop noodles here', p.x + p.w / 2, p.y + 92, 13, COLORS.inkSoft, 'center');
  }

  // Assembly plate.
  const pl = LAYOUT.plate;
  drawStationBase(ctx, pl, 'ASSEMBLY PLATE', 'click with an ingredient');
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.ellipse(pl.x + pl.w / 2, pl.y + 95, 95, 48, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#d8c9a8';
  ctx.lineWidth = 3;
  ctx.stroke();
  if (k.plate.length) {
    k.plate.forEach((item, i) => {
      drawIngredient(ctx, item, pl.x + pl.w / 2, pl.y + 118 - i * 20, 20);
    });
  } else {
    text(ctx, 'empty plate', pl.x + pl.w / 2, pl.y + 100, 13, COLORS.inkSoft, 'center', false);
  }
  ctx.fillStyle = 'rgba(0,0,0,0.16)';
  rr(ctx, pl.x, pl.y + 194, pl.w, 24, 8);
  ctx.fill();
  text(ctx, 'CLEAR PLATE', pl.x + pl.w / 2, pl.y + 194 + 17, 12, COLORS.ink, 'center');

  // Serve window.
  const s = LAYOUT.serve;
  ctx.fillStyle = '#8a5a3b';
  rr(ctx, s.x, s.y, s.w, s.h, 14);
  ctx.fill();
  ctx.fillStyle = '#f7ead7';
  rr(ctx, s.x + 12, s.y + 12, s.w - 24, s.h - 60, 10);
  ctx.fill();
  text(ctx, 'SERVE WINDOW', s.x + s.w / 2, s.y + 40, 16, COLORS.ink, 'center');
  // Bell.
  const bellX = s.x + s.w / 2, bellY = s.y + 88;
  const ready = k.plate.length > 0;
  ctx.fillStyle = ready ? COLORS.gold : '#c9b896';
  ctx.beginPath();
  ctx.arc(bellX, bellY, 26, Math.PI, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillRect(bellX - 30, bellY - 4, 60, 8);
  ctx.beginPath();
  ctx.arc(bellX, bellY - 28, 6, 0, Math.PI * 2);
  ctx.fill();
  text(ctx, ready ? 'CLICK TO SERVE!' : 'ring when a dish is ready', s.x + s.w / 2, s.y + s.h - 12, 13, ready ? COLORS.gold : '#ffd9a0', 'center');

  // Trash.
  const t = LAYOUT.trash;
  ctx.fillStyle = '#5d6d7e';
  rr(ctx, t.x + 20, t.y + 50, t.w - 40, 80, 10);
  ctx.fill();
  ctx.fillStyle = '#46586a';
  rr(ctx, t.x + 12, t.y + 38, t.w - 24, 16, 8);
  ctx.fill();
  text(ctx, 'TRASH', t.x + t.w / 2, t.y + 30, 14, COLORS.ink, 'center');
  text(ctx, 'drop item', t.x + t.w / 2, t.y + 148, 11, COLORS.inkSoft, 'center', false);

  // Recipe book.
  const rb = LAYOUT.recipeBook;
  ctx.fillStyle = COLORS.ticket;
  rr(ctx, rb.x, rb.y, rb.w, rb.h, 14);
  ctx.fill();
  ctx.strokeStyle = COLORS.ticketEdge;
  ctx.lineWidth = 1.5;
  rr(ctx, rb.x, rb.y, rb.w, rb.h, 14);
  ctx.stroke();
  text(ctx, 'RECIPES', rb.x + 16, rb.y + 26, 15, COLORS.ink);
  RECIPE_LIST.forEach((id, i) => {
    const r = RECIPES[id];
    const x = rb.x + 16 + i * 108;
    text(ctx, r.name, x, rb.y + 52, 12, COLORS.ink);
    text(ctx, `$${r.price}`, x, rb.y + 70, 12, COLORS.tealDark);
    r.needs.forEach((need, j) => drawIngredient(ctx, need, x + 12 + j * 22, rb.y + 96, 9));
  });

  // Ingredient bins.
  const bins = LAYOUT.bins;
  ctx.fillStyle = COLORS.counter;
  rr(ctx, bins.x, bins.y, bins.w, bins.h, 16);
  ctx.fill();
  text(ctx, 'INGREDIENTS  —  click a bin (or keys 1–6) to pick up', bins.x + 16, bins.y + 28, 15, '#fff8ec');
  Object.keys(INGREDIENTS).forEach((id, i) => {
    const ing = INGREDIENTS[id];
    const bw = bins.w / 6;
    const bx = bins.x + i * bw + 6;
    const by = bins.y + 40;
    ctx.fillStyle = k.carried === id ? '#ffe9b8' : COLORS.cream;
    rr(ctx, bx, by, bw - 12, 128, 12);
    ctx.fill();
    ctx.strokeStyle = k.carried === id ? COLORS.gold : 'rgba(0,0,0,0.12)';
    ctx.lineWidth = k.carried === id ? 3 : 1.5;
    rr(ctx, bx, by, bw - 12, 128, 12);
    ctx.stroke();
    drawIngredient(ctx, id, bx + (bw - 12) / 2, by + 52, 30);
    text(ctx, ing.name, bx + (bw - 12) / 2, by + 104, 14, COLORS.ink, 'center');
    const prep = ing.prep === 'ready' ? 'ready' : ing.prep === 'chop' ? 'chop x3' : ing.prep === 'grill' ? 'grill 6s' : 'boil 5s';
    text(ctx, `${prep} · [${ing.key}]`, bx + (bw - 12) / 2, by + 122, 11, COLORS.inkSoft, 'center', false);
  });

  // Carried item follows the cursor.
  if (k.carried && mouse.inside) {
    ctx.globalAlpha = 0.95;
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, 30, 0, Math.PI * 2);
    ctx.fill();
    drawIngredient(ctx, k.carried, mouse.x, mouse.y, 22);
    ctx.globalAlpha = 1;
  }

  // Floating score popups.
  for (const p of k.popups) {
    ctx.globalAlpha = Math.max(0, 1 - p.t / 1.2);
    text(ctx, p.text, p.x, p.y - p.t * 40, 22, p.color, 'center');
    ctx.globalAlpha = 1;
  }
}

function overlay(ctx, title, lines, buttons) {
  ctx.fillStyle = 'rgba(40,25,12,0.72)';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.fillStyle = COLORS.cream;
  rr(ctx, 340, 110, 600, 500, 20);
  ctx.fill();
  text(ctx, title, 640, 190, 40, COLORS.ink, 'center');
  let y = 250;
  for (const line of lines) {
    text(ctx, line, 640, y, 19, COLORS.inkSoft, 'center', false);
    y += 34;
  }
  for (const b of buttons) {
    ctx.fillStyle = b.primary ? COLORS.teal : '#e8d9b8';
    rr(ctx, b.x, b.y, b.w, b.h, 12);
    ctx.fill();
    text(ctx, b.label, b.x + b.w / 2, b.y + b.h / 2 + 7, 19, b.primary ? '#fff' : COLORS.ink, 'center');
  }
}

export function drawGame(ctx, k, mouse) {
  if (k.mode === 'menu') {
    drawKitchenScene(ctx, demoKitchen(k), mouse);
    overlay(ctx, 'SIZZLE & SERVE', [
      'Your own little diner. Orders roll in — chop, grill,',
      'boil and plate each dish before the ticket expires.',
      '',
      'Click bins (or keys 1–6) to pick up ingredients.',
      'Chop lettuce & tomato, grill patties, boil noodles,',
      'build the dish on the plate, ring the bell to serve.',
      '3 days, 3 hearts — miss an order and lose one.',
      '',
      `Best service so far: $${k.best}`,
    ], [{ label: 'START COOKING  ▶', x: 490, y: 540, w: 300, h: 64, primary: true }]);
    return;
  }
  if (k.mode === 'paused') {
    drawKitchenScene(ctx, k, mouse);
    overlay(ctx, 'PAUSED', ['Take a breath, chef.', 'The tickets are waiting — but not for long.'],
      [
        { label: 'RESUME', x: 490, y: 330, w: 300, h: 56, primary: true },
        { label: 'RESTART DAY', x: 490, y: 400, w: 300, h: 56, primary: false },
        { label: 'QUIT TO MENU', x: 490, y: 470, w: 300, h: 56, primary: false },
      ]);
    return;
  }
  if (k.mode === 'dayEnd') {
    drawKitchenScene(ctx, k, mouse);
    const met = k.dayEarned >= k.cfg.target;
    overlay(ctx, `DAY ${k.day} DONE`, [
      `Earned today: $${k.dayEarned}  (target $${k.cfg.target}) — ${met ? 'target smashed!' : 'short of target'}`,
      `Served: ${k.servedToday}   Missed: ${k.missedToday}   Best combo: x${k.bestCombo}`,
      `Total so far: $${k.totalEarned}`,
      '',
      `Tomorrow: orders come faster, patience runs shorter.`,
    ], [{ label: `START DAY ${k.day + 1}  ▶`, x: 490, y: 520, w: 300, h: 60, primary: true }]);
    return;
  }
  if (k.mode === 'gameOver') {
    drawKitchenScene(ctx, k, mouse);
    overlay(ctx, 'KITCHEN CLOSED', [
      k.mood <= 0 ? 'Three strikes — the diners walked out.' : `Day ${k.day} target missed: $${k.dayEarned} of $${k.cfg.target}.`,
      `Total earned: $${k.totalEarned}   Dishes served: ${k.servedTotal}`,
      `Best service: $${k.best}`,
    ], [
      { label: 'COOK AGAIN', x: 430, y: 520, w: 180, h: 56, primary: true },
      { label: 'MENU', x: 650, y: 520, w: 180, h: 56, primary: false },
    ]);
    return;
  }
  if (k.mode === 'win') {
    drawKitchenScene(ctx, k, mouse);
    overlay(ctx, 'THREE-STAR DINER!', [
      'Every day hit its target. The town is talking',
      'about your little kitchen.',
      '',
      `Total earned: $${k.totalEarned}   Dishes served: ${k.servedTotal}`,
      `Best combo: x${k.bestCombo}   Best service: $${k.best}`,
    ], [
      { label: 'COOK AGAIN', x: 430, y: 520, w: 180, h: 56, primary: true },
      { label: 'MENU', x: 650, y: 520, w: 180, h: 56, primary: false },
    ]);
    return;
  }
  drawKitchenScene(ctx, k, mouse);
}

// A lively kitchen behind the title screen: a fixed demo state, never timed.
function demoKitchen(k) {
  return {
    ...k,
    mode: 'playing',
    day: 1,
    cfg: k.cfg,
    dayTimeLeft: 62,
    money: 86,
    mood: 3,
    combo: 3,
    orders: [
      { id: 901, recipeId: 'burger', timeLeft: 28, patience: 45 },
      { id: 902, recipeId: 'salad', timeLeft: 18, patience: 45 },
      { id: 903, recipeId: 'pasta', timeLeft: 9, patience: 40 },
    ],
    carried: null,
    board: { item: 'tomato', chops: 2 },
    grill: { item: 'patty', t: 4.5, burnt: false },
    pot: null,
    plate: ['bun', 'pattyCooked', 'lettuceChopped'],
    popups: [],
    servedToday: 4,
    missedToday: 0,
  };
}
