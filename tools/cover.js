// Render the TikTok cover (1080x1920) of an episode: SCENES.cover.draw in scenes.js -> <ep>/cover.png
//   node tools/cover.js episodes/07-musa
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const ep = path.resolve(process.argv[2]);
const TL = JSON.parse(fs.readFileSync(path.join(ep, 'timeline.json'), 'utf8'));
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  page.on('pageerror', e => console.error('PAGE ERROR', e.message));
  await page.goto('file://' + path.join(__dirname, 'player.html'));
  const b64 = await page.evaluate(async ([tl, src]) => {
    window.TL = tl; await loadScenes(src);
    await document.fonts.load('700 40px Amiri', 'موسى'); await document.fonts.load('600 40px Lora'); await document.fonts.load('700 40px Lora'); await document.fonts.load('italic 500 40px Lora'); await document.fonts.ready;
    const c = document.getElementById('c').getContext('2d'); c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#000'; c.fillRect(0, 0, W, H);
    c.save(); SCENES.cover.draw(c); c.restore(); post(c, 0, null);
    return document.getElementById('c').toDataURL('image/png').slice(22);
  }, [TL, 'file://' + path.join(ep, 'scenes.js')]);
  fs.writeFileSync(path.join(ep, 'cover.png'), Buffer.from(b64, 'base64'));
  await browser.close(); console.log('==>', path.join(ep, 'cover.png'));
})();
