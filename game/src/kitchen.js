// Sizzle & Serve — game state and kitchen logic.
// Modes: menu, playing, paused, dayEnd, gameOver, win, shot (frozen demo).
// One hand carries a single ingredient; stations transform raw ingredients
// into prepared ones; the plate collects prepared items; the serve bell
// matches the plate against the waiting orders.
import { DAY_LENGTH_S, DAYS, MOOD_MAX, PLATE_MAX, LAYOUT } from './config.js';
import { INGREDIENTS, PREPARED, PREPARED_INFO, RECIPES, STATION_TIME, plateMatchesRecipe } from './recipes.js';
import { hitRect } from './input.js';

let orderSeq = 1;

export class Kitchen {
  constructor(sound) {
    this.sound = sound;
    this.best = Number(localStorage.getItem('sizzle-serve-best') || 0);
    this.resetRun();
    this.mode = 'menu';
  }

  resetRun() {
    this.day = 1;
    this.money = 0;
    this.totalEarned = 0;
    this.mood = MOOD_MAX;
    this.combo = 0;
    this.bestCombo = 0;
    this.servedTotal = 0;
    this.missedTotal = 0;
    this.dayTargetsMet = [];
    this.muted = false;
    this.startDay(1);
    this.mode = 'playing';
  }

  startDay(day) {
    this.day = day;
    const cfg = DAYS[day - 1];
    this.cfg = cfg;
    this.dayTimeLeft = DAY_LENGTH_S;
    this.dayEarned = 0;
    this.orders = [];
    this.carried = null;
    this.board = null;
    this.grill = null;
    this.pot = null;
    this.plate = [];
    this.popups = [];
    this.spawnTimer = 3;
    this.servedToday = 0;
    this.missedToday = 0;
    this.spawnOrder();
  }

  spawnOrder() {
    if (this.orders.length >= this.cfg.maxOrders) return;
    const pool = this.cfg.recipes;
    const recipeId = pool[Math.floor(Math.random() * pool.length)];
    this.orders.push({
      id: orderSeq++,
      recipeId,
      timeLeft: this.cfg.patienceS,
      patience: this.cfg.patienceS,
    });
  }

  popup(x, y, text, color = '#fff8ec') {
    this.popups.push({ x, y, text, color, t: 0 });
  }

  update(dt) {
    if (this.mode !== 'playing') return;
    this.dayTimeLeft -= dt;
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.spawnOrder();
      this.spawnTimer = this.cfg.spawnEveryS;
    }
    for (const o of this.orders) o.timeLeft -= dt;
    const expired = this.orders.filter((o) => o.timeLeft <= 0);
    if (expired.length) {
      this.orders = this.orders.filter((o) => o.timeLeft > 0);
      this.loseMood(expired.length, 'Order expired!');
    }
    if (this.grill) {
      this.grill.t += dt;
      if (this.grill.t >= STATION_TIME.burnAfterS && !this.grill.burnt) {
        this.grill.burnt = true;
        this.popup(680, 120, 'Burnt!', '#e4572e');
        this.sound.buzz();
      }
    }
    if (this.pot) this.pot.t += dt;
    for (const p of this.popups) p.t += dt;
    this.popups = this.popups.filter((p) => p.t < 1.2);
    if (this.dayTimeLeft <= 10 && this.dayTimeLeft + dt > 10) this.sound.tick();
    if (this.dayTimeLeft <= 0) this.endDay();
  }

  loseMood(n, why) {
    this.mood -= n;
    this.combo = 0;
    this.missedTotal += n;
    this.missedToday += n;
    this.popup(175, 330, why, '#e4572e');
    this.sound.buzz();
    if (this.mood <= 0) {
      this.mood = 0;
      this.mode = 'gameOver';
      this.sound.stopSizzle();
      this.saveBest();
    }
  }

  endDay() {
    this.dayTimeLeft = 0;
    this.dayTargetsMet.push(this.dayEarned >= this.cfg.target);
    this.totalEarned += this.dayEarned;
    this.sound.dayEnd();
    this.sound.stopSizzle();
    if (this.day >= 3) {
      this.mode = this.dayTargetsMet.every(Boolean) ? 'win' : 'gameOver';
      this.saveBest();
    } else {
      this.mode = 'dayEnd';
    }
  }

  saveBest() {
    if (this.totalEarned > this.best) {
      this.best = this.totalEarned;
      localStorage.setItem('sizzle-serve-best', String(this.best));
    }
  }

  // --- carrying -------------------------------------------------------------
  carry(rawId) {
    this.carried = rawId;
    this.sound.pickup();
  }

  discardCarried() {
    if (!this.carried) return;
    this.carried = null;
    this.sound.place();
  }

  // --- stations ---------------------------------------------------------------
  clickBoard() {
    if (!this.carried) {
      if (this.board) this.chopOnce();
      return;
    }
    const ing = INGREDIENTS[this.carried];
    if (!ing || ing.prep !== 'chop') return;
    if (this.board) return;
    this.board = { item: this.carried, chops: 0 };
    this.carried = null;
    this.sound.place();
  }

  chopOnce() {
    if (!this.board) return;
    this.board.chops++;
    if (this.board.chops >= STATION_TIME.chopClicks) {
      const done = PREPARED[this.board.item];
      this.board = null;
      this.carried = done;
      this.sound.chopDone();
      this.popup(460, 150, PREPARED_INFO[done].name + '!', '#7bc96f');
    } else {
      this.sound.chop();
    }
  }

  clickGrill() {
    if (this.grill) {
      if (this.grill.burnt) {
        this.grill = null;
        this.sound.buzz();
        this.popup(680, 120, 'Tossed', '#e4572e');
        return;
      }
      if (this.grill.t >= STATION_TIME.grillS) {
        this.carried = 'pattyCooked';
        this.grill = null;
        this.sound.place();
      }
      return;
    }
    if (this.carried === 'patty') {
      this.grill = { item: 'patty', t: 0, burnt: false };
      this.carried = null;
      this.sound.place();
      this.sound.startSizzle();
    }
  }

  clickPot() {
    if (this.pot) {
      if (this.pot.t >= STATION_TIME.boilS) {
        this.carried = 'noodlesCooked';
        this.pot = null;
        this.sound.place();
      }
      return;
    }
    if (this.carried === 'noodles') {
      this.pot = { item: 'noodles', t: 0 };
      this.carried = null;
      this.sound.place();
    }
  }

  clickPlate() {
    if (!this.carried) return;
    if (!PREPARED_INFO[this.carried]) {
      this.popup(1140, 150, 'Needs prep first!', '#f2b705');
      this.sound.tick();
      return;
    }
    if (this.plate.length >= PLATE_MAX) return;
    this.plate.push(this.carried);
    this.carried = null;
    this.sound.place();
  }

  clickServe() {
    if (!this.plate.length) return;
    const match = this.orders.find((o) => plateMatchesRecipe(this.plate, RECIPES[o.recipeId]));
    if (!match) {
      this.plate = [];
      this.loseMood(1, 'Wrong dish!');
      return;
    }
    const recipe = RECIPES[match.recipeId];
    const timeBonus = Math.round((match.timeLeft / match.patience) * 5);
    const mult = Math.min(2, 1 + this.combo * 0.1);
    const earned = Math.round((recipe.price + timeBonus) * mult);
    this.money += earned;
    this.dayEarned += earned;
    this.combo++;
    this.bestCombo = Math.max(this.bestCombo, this.combo);
    this.servedTotal++;
    this.servedToday++;
    this.orders = this.orders.filter((o) => o.id !== match.id);
    this.plate = [];
    this.popup(490, 360, `+$${earned}` + (this.combo > 1 ? `  x${this.combo} combo!` : ''), '#f2b705');
    this.sound.ding();
    this.sound.coin();
  }

  // --- clicks ---------------------------------------------------------------
  binRect(i) {
    const bins = LAYOUT.bins;
    const w = bins.w / 6;
    return { x: bins.x + i * w + 6, y: bins.y + 8, w: w - 12, h: bins.h - 16 };
  }

  click(x, y) {
    if (this.mode === 'menu') {
      if (hitRect(x, y, { x: 490, y: 540, w: 300, h: 64 })) {
        this.sound.ensure();
        this.sound.startMusic();
        this.resetRun();
      }
      return;
    }
    if (this.mode === 'paused') {
      if (hitRect(x, y, { x: 490, y: 330, w: 300, h: 56 })) this.mode = 'playing';
      if (hitRect(x, y, { x: 490, y: 400, w: 300, h: 56 })) this.resetRun();
      if (hitRect(x, y, { x: 490, y: 470, w: 300, h: 56 })) this.mode = 'menu';
      return;
    }
    if (this.mode === 'dayEnd') {
      if (hitRect(x, y, { x: 490, y: 520, w: 300, h: 60 })) {
        this.startDay(this.day + 1);
        this.mode = 'playing';
      }
      return;
    }
    if (this.mode === 'gameOver' || this.mode === 'win') {
      if (hitRect(x, y, { x: 430, y: 520, w: 180, h: 56 })) this.resetRun();
      if (hitRect(x, y, { x: 650, y: 520, w: 180, h: 56 })) this.mode = 'menu';
      return;
    }
    if (this.mode !== 'playing') return;

    // Header buttons: pause and mute.
    if (hitRect(x, y, { x: 1130, y: 12, w: 56, h: 46 })) { this.mode = 'paused'; return; }
    if (hitRect(x, y, { x: 1200, y: 12, w: 56, h: 46 })) {
      this.muted = !this.muted;
      this.sound.setMuted(this.muted);
      return;
    }
    // Stations.
    if (hitRect(x, y, LAYOUT.chopping)) { this.clickBoard(); return; }
    if (hitRect(x, y, LAYOUT.grill)) { this.clickGrill(); return; }
    if (hitRect(x, y, LAYOUT.pot)) { this.clickPot(); return; }
    if (hitRect(x, y, LAYOUT.plate)) { this.clickPlate(); return; }
    if (hitRect(x, y, LAYOUT.serve)) { this.clickServe(); return; }
    if (hitRect(x, y, LAYOUT.trash)) { this.discardCarried(); return; }
    // Clear-plate button below the plate card.
    if (hitRect(x, y, { x: 1020, y: 294, w: 240, h: 24 })) {
      this.plate = [];
      this.sound.place();
      return;
    }
    // Ingredient bins.
    const ids = Object.keys(INGREDIENTS);
    for (let i = 0; i < 6; i++) {
      if (hitRect(x, y, this.binRect(i))) {
        if (this.carried === ids[i]) this.carried = null;
        else this.carry(ids[i]);
        return;
      }
    }
  }

  key(k) {
    if (this.mode === 'playing' && ['1', '2', '3', '4', '5', '6'].includes(k)) {
      const id = Object.keys(INGREDIENTS)[Number(k) - 1];
      if (this.carried === id) this.carried = null;
      else this.carry(id);
      return;
    }
    if (k === ' ' || k === 'p' || k === 'escape') {
      if (this.mode === 'playing') { this.mode = 'paused'; this.sound.stopSizzle(); }
      else if (this.mode === 'paused') this.mode = 'playing';
      return;
    }
    if (k === 'm') {
      this.muted = !this.muted;
      this.sound.setMuted(this.muted);
    }
    if (k === 'enter' && this.mode === 'menu') {
      this.sound.ensure();
      this.sound.startMusic();
      this.resetRun();
    }
  }
}
