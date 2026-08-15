/**
 * Tile-based world: rendering, movement, and proximity-triggered interactions.
 * The whole map fits in one canvas (no camera scroll needed at this world size).
 */
const World = (() => {
  let canvas, ctx;
  let data = null;
  let player = { col: 0, row: 0, x: 0, y: 0, color: '#f2a65a', dir: 'down' };
  let keys = {};
  let nearby = null; // { kind: 'npc'|'object', entity }
  let running = false;
  let onInteract = null;
  let rafId = null;
  let lastTime = 0;
  const SPEED = 140; // px/sec

  function init(canvasEl, worldData, opts) {
    canvas = canvasEl;
    ctx = canvas.getContext('2d');
    data = worldData;
    onInteract = opts.onInteract || function () {};

    const spawn = opts.spawnPos || data.spawn;
    player.col = spawn.col;
    player.row = spawn.row;
    player.x = spawn.col * data.tileSize;
    player.y = spawn.row * data.tileSize;

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', (e) => { keys[e.key.toLowerCase()] = false; });
  }

  function handleKeyDown(e) {
    keys[e.key.toLowerCase()] = true;
    if (e.key.toLowerCase() === 'e' && nearby) {
      onInteract(nearby);
    }
  }

  function setBlocked(blocked) {
    // when true, movement + interaction input is suppressed (dialogue/minigame open)
    blockedInput = blocked;
  }
  let blockedInput = false;

  function start() {
    if (running) return;
    running = true;
    lastTime = performance.now();
    rafId = requestAnimationFrame(loop);
  }

  function stop() {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
  }

  function loop(now) {
    if (!running) return;
    const dt = Math.min(0.05, (now - lastTime) / 1000);
    lastTime = now;
    update(dt);
    render();
    rafId = requestAnimationFrame(loop);
  }

  function update(dt) {
    if (!blockedInput) {
      let dx = 0, dy = 0;
      if (keys['arrowup'] || keys['w']) { dy -= 1; player.dir = 'up'; }
      if (keys['arrowdown'] || keys['s']) { dy += 1; player.dir = 'down'; }
      if (keys['arrowleft'] || keys['a']) { dx -= 1; player.dir = 'left'; }
      if (keys['arrowright'] || keys['d']) { dx += 1; player.dir = 'right'; }

      if (dx !== 0 || dy !== 0) {
        const len = Math.hypot(dx, dy);
        const nx = player.x + (dx / len) * SPEED * dt;
        const ny = player.y + (dy / len) * SPEED * dt;
        const maxX = data.cols * data.tileSize - data.tileSize;
        const maxY = data.rows * data.tileSize - data.tileSize;
        player.x = Math.max(0, Math.min(maxX, nx));
        player.y = Math.max(0, Math.min(maxY, ny));
      }
    }

    findNearby();
  }

  function findNearby() {
    const ts = data.tileSize;
    const px = player.x + ts / 2, py = player.y + ts / 2;
    let closest = null, closestDist = Infinity;

    for (const npc of data.npcs) {
      const ex = npc.col * ts + ts / 2, ey = npc.row * ts + ts / 2;
      const d = Math.hypot(px - ex, py - ey);
      if (d < ts * 1.3 && d < closestDist) { closest = { kind: 'npc', entity: npc }; closestDist = d; }
    }
    for (const obj of data.objects) {
      const ex = obj.col * ts + ts / 2, ey = obj.row * ts + ts / 2;
      const d = Math.hypot(px - ex, py - ey);
      if (d < ts * 1.3 && d < closestDist) { closest = { kind: 'object', entity: obj }; closestDist = d; }
    }
    nearby = closest;

    const promptEl = document.getElementById('interact-prompt');
    if (nearby) promptEl.classList.remove('hidden'); else promptEl.classList.add('hidden');
  }

  function render() {
    const ts = data.tileSize;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // zones
    for (const zone of data.zones) {
      ctx.fillStyle = zone.color;
      ctx.fillRect(zone.colStart * ts, 0, (zone.colEnd - zone.colStart + 1) * ts, data.rows * ts);
    }
    // zone dividers + labels
    ctx.font = 'bold 16px Segoe UI';
    ctx.fillStyle = 'rgba(20,16,31,0.75)';
    for (const zone of data.zones) {
      ctx.fillText(zone.label, zone.colStart * ts + 10, 22);
    }
    ctx.strokeStyle = 'rgba(20,16,31,0.25)';
    for (const zone of data.zones) {
      ctx.beginPath();
      ctx.moveTo(zone.colStart * ts, 0);
      ctx.lineTo(zone.colStart * ts, data.rows * ts);
      ctx.stroke();
    }

    // subtle tile grid
    ctx.strokeStyle = 'rgba(20,16,31,0.08)';
    for (let c = 0; c <= data.cols; c++) {
      ctx.beginPath(); ctx.moveTo(c * ts, 0); ctx.lineTo(c * ts, data.rows * ts); ctx.stroke();
    }
    for (let r = 0; r <= data.rows; r++) {
      ctx.beginPath(); ctx.moveTo(0, r * ts); ctx.lineTo(data.cols * ts, r * ts); ctx.stroke();
    }

    // objects
    for (const obj of data.objects) {
      drawEntity(obj.col * ts, obj.row * ts, ts, obj.color, obj.label);
    }
    // npcs
    for (const npc of data.npcs) {
      drawEntity(npc.col * ts, npc.row * ts, ts, npc.color, '🧑', npc.label);
    }

    // player
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(player.x + 4, player.y + 4, ts - 8, ts - 8, 6) : ctx.rect(player.x + 4, player.y + 4, ts - 8, ts - 8);
    ctx.fill();
    ctx.font = '18px Segoe UI';
    ctx.textAlign = 'center';
    ctx.fillText('🙂', player.x + ts / 2, player.y + ts / 2 + 6);
    ctx.textAlign = 'left';

    // highlight nearby entity
    if (nearby) {
      const e = nearby.entity;
      ctx.strokeStyle = '#f2a65a';
      ctx.lineWidth = 2;
      ctx.strokeRect(e.col * ts + 1, e.row * ts + 1, ts - 2, ts - 2);
      ctx.lineWidth = 1;
    }
  }

  function drawEntity(x, y, ts, color, emoji, label) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x + ts / 2, y + ts / 2, ts / 2 - 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = '16px Segoe UI';
    ctx.textAlign = 'center';
    ctx.fillText(emoji, x + ts / 2, y + ts / 2 + 6);
    if (label) {
      ctx.font = '10px Segoe UI';
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.fillText(label, x + ts / 2, y - 4);
    }
    ctx.textAlign = 'left';
  }

  function getPosition() {
    return { col: Math.round(player.x / data.tileSize), row: Math.round(player.y / data.tileSize), x: player.x, y: player.y };
  }

  function setPosition(pos) {
    if (!pos) return;
    player.x = pos.x !== undefined ? pos.x : pos.col * data.tileSize;
    player.y = pos.y !== undefined ? pos.y : pos.row * data.tileSize;
  }

  return { init, start, stop, setBlocked, getPosition, setPosition };
})();
