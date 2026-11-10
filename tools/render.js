// Render an episode to video. Usage:
//   node tools/render.js episodes/01-yusuf [--preview t1,t2,...] [--fps 30] [--workers 4]
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs'), path = require('path');
const ep = path.resolve(process.argv[2]);
const arg = k => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const TL = JSON.parse(fs.readFileSync(path.join(ep, 'timeline.json'), 'utf8'));
const fps = +(arg('--fps') || TL.fps), workers = +(arg('--workers') || 4);
const player = 'file://' + path.join(__dirname, 'player.html');

async function openPage(browser) {
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  page.on('pageerror', e => console.error('PAGE ERROR', e.message));
  await page.goto(player);
  await page.evaluate(async ([tl, src]) => { window.TL = tl; await loadScenes(src); await document.fonts.load('700 40px Amiri', 'يوسف'); await document.fonts.load('600 40px Lora'); await document.fonts.load('italic 500 40px Lora'); await document.fonts.ready; }, [TL, 'file://' + path.join(ep, 'scenes.js')]);
  return page;
}
async function frameJpeg(page, t) {
  const b64 = await page.evaluate(t => { draw(t); return document.getElementById('c').toDataURL('image/jpeg', 0.93).slice(23); }, t);
  return Buffer.from(b64, 'base64');
}
(async () => {
  const browser = await chromium.launch({ args: ['--disable-gpu-vsync'] });
  const prev = arg('--preview');
  if (prev) {
    const page = await openPage(browser); const out = path.join(ep, 'preview'); fs.mkdirSync(out, { recursive: true });
    for (const t of prev.split(',').map(Number)) { fs.writeFileSync(path.join(out, `t${t.toFixed(1)}.jpg`), await frameJpeg(page, t)); }
    await browser.close(); return;
  }
  const total = Math.ceil(TL.total * fps), per = Math.ceil(total / workers);
  const tmp = path.join(ep, '.segments'); fs.mkdirSync(tmp, { recursive: true });
  let done = 0; const t0 = Date.now();
  await Promise.all([...Array(workers).keys()].map(async w => {
    const page = await openPage(browser);
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-',
      '-c:v', 'libx264', '-preset', 'medium', '-crf', '22', '-pix_fmt', 'yuv420p', path.join(tmp, `seg${w}.mp4`)]);
    for (let f = w * per; f < Math.min(total, (w + 1) * per); f++) {
      const buf = await frameJpeg(page, f / fps);
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
      if (++done % 300 === 0) console.log(`${done}/${total} frames  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
    }
    ff.stdin.end(); await new Promise(r => ff.on('close', r));
  }));
  fs.writeFileSync(path.join(tmp, 'list.txt'), [...Array(workers).keys()].map(w => `file 'seg${w}.mp4'`).join('\n'));
  await browser.close();
  console.log('frames done in', ((Date.now() - t0) / 1000).toFixed(0), 's');
})();
