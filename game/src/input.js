// Sizzle & Serve — mouse and keyboard input.
// The canvas is scaled by CSS, so pointer coordinates are mapped back into
// 1280x720 canvas space before any hit test. Clicks are delivered as
// (x, y) canvas points; keys arrive as lower-case key names.
export class Input {
  constructor(canvas, onClick, onKey) {
    this.canvas = canvas;
    this.onClick = onClick;
    this.onKey = onKey;
    this.mouse = { x: 0, y: 0, inside: false };
    this._bind();
  }

  toCanvas(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: (clientX - rect.left) * (this.canvas.width / rect.width),
      y: (clientY - rect.top) * (this.canvas.height / rect.height),
    };
  }

  _bind() {
    this.canvas.addEventListener('pointermove', (e) => {
      const p = this.toCanvas(e.clientX, e.clientY);
      this.mouse.x = p.x;
      this.mouse.y = p.y;
      this.mouse.inside = true;
    });
    this.canvas.addEventListener('pointerleave', () => { this.mouse.inside = false; });
    this.canvas.addEventListener('pointerdown', (e) => {
      const p = this.toCanvas(e.clientX, e.clientY);
      this.mouse.x = p.x;
      this.mouse.y = p.y;
      this.onClick(p.x, p.y);
    });
    window.addEventListener('keydown', (e) => {
      if (e.repeat) return;
      this.onKey(e.key.toLowerCase());
    });
  }
}

// Point-in-rect hit test used by every station and button.
export function hitRect(px, py, r) {
  return px >= r.x && px < r.x + r.w && py >= r.y && py < r.y + r.h;
}
