// Sizzle & Serve — boot and game loop.
// The loop runs at the display refresh rate; kitchen.update gets real delta
// time, capped so a tab switch never fast-forwards the kitchen. In shot
// mode the state is staged and frozen: the loop only renders.
import { CANVAS_W, CANVAS_H } from './config.js';
import { Kitchen } from './kitchen.js';
import { SoundEngine } from './audio.js';
import { Input } from './input.js';
import { drawGame } from './render.js';
import { applyShot } from './shots.js';

const canvas = document.getElementById('game');
canvas.width = CANVAS_W;
canvas.height = CANVAS_H;
const ctx = canvas.getContext('2d');

const sound = new SoundEngine();
const kitchen = new Kitchen(sound);
// Exposed for automated play-testing only; the game never reads it back.
window.__kitchen = kitchen;

const params = new URLSearchParams(location.search);
const shot = params.get('shot');
if (shot) applyShot(kitchen, shot);

const input = new Input(canvas, (x, y) => {
  sound.ensure();
  if (kitchen.mode === 'shot') return;
  kitchen.click(x, y);
}, (key) => {
  sound.ensure();
  if (kitchen.mode === 'shot') return;
  kitchen.key(key);
});

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.1, (now - last) / 1000);
  last = now;
  if (kitchen.mode === 'playing') kitchen.update(dt);
  drawGame(ctx, kitchen, input.mouse);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// Keep the sizzle loop honest: it only runs while a patty is on the grill.
setInterval(() => {
  if (kitchen.mode === 'playing' && kitchen.grill && !kitchen.grill.burnt) sound.startSizzle();
  else sound.stopSizzle();
}, 500);
