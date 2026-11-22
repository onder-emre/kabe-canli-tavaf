// Kumanda uçtan uca: motor (ana sayfa kipi) + Safari benzeri panel + Studio benzeri yayın sahnesi (ayrı tarayıcı bağlamları).
'use strict';
// node cekirdek/test/kumanda.test.js — motor (ana sayfa kipi) + panel + yayın sahnesi; 8899 numaralı kapıyı kullanır.
const { spawn } = require('child_process'), path = require('path'), fs = require('fs');
const KOK = path.join(__dirname, "..", "..");
const playwright = require(path.join(KOK, 'node_modules', 'playwright'));
const PORT = 8899;
let gecti = 0, kaldi = 0;
const ok = (k, ad) => { if (k) { gecti++; console.log('  ✓ ' + ad); } else { kaldi++; console.log('  ✗ ' + ad); } };
const bekle = ms => new Promise(r => setTimeout(r, ms));
async function kadar(fn, sn = 8000) { const t = Date.now(); while (Date.now() - t < sn) { try { if (await fn()) return true; } catch (e) { } await bekle(150); } return false; }

(async () => {
  const motor = spawn('node', ['kopru.js', '--ana-sayfa', '--port', String(PORT)], { cwd: KOK, stdio: ['ignore', 'pipe', 'pipe'] });
  let gunluk = ''; motor.stdout.on('data', d => gunluk += d); motor.stderr.on('data', d => gunluk += d);
  await kadar(async () => (await fetch('http://localhost:' + PORT + '/api/oyunlar')).ok, 15000);
  const b = await fetch('http://localhost:' + PORT + '/api/baslat', { method: 'POST', headers: { 'content-type': 'application/json', origin: 'http://localhost:' + PORT, 'sec-fetch-site': 'same-origin' }, body: JSON.stringify({ oyun: 'kabe-tavaf', kip: 'deneme' }) }).then(r => r.json());
  ok(b.tamam, 'oyun deneme kipinde başladı');

  const tar = await playwright.chromium.launch({ executablePath: process.env.CHROME_PATH || undefined, args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'] });
  const kur = async () => { const x = await tar.newContext({ viewport: { width: 1280, height: 900 } }); const p = await x.newPage(); await p.route(/fonts\.(googleapis|gstatic)\.com|youtube/, r => r.abort()); p.on('pageerror', e => console.log('    [sayfa hatası] ' + e.message)); return p; };

  // Panel önce açılır, sahne gelmeden bir ayar değişir (sahne bağlanınca durumla almalı)
  const panel = await kur();
  await panel.goto('http://localhost:' + PORT + '/oyun/kabe-tavaf/');
  await kadar(() => panel.evaluate(() => CanliOyun.durum().bagli));
  ok(await panel.evaluate(() => CanliOyun.durum().bagli), 'panel köprüye bağlandı');
  await panel.evaluate(() => { document.querySelector('.sarki-katla').open = true; });
  await panel.click('.ses-hap:nth-child(3)'); // Dem kapat (sahne yokken)
  await panel.fill('#yasak', 'kotu, cirkin');
  await panel.locator('#yasak').dispatchEvent('change');

  const sahne = await kur();
  await sahne.setViewportSize({ width: 720, height: 1280 });
  await sahne.goto('http://kabe.localhost:' + PORT + '/sahne/');
  ok(await kadar(() => sahne.evaluate(() => window.OYUN_SAHNE === true && document.body.classList.contains('yayin'))), 'sahne kabe.localhost adresinden açıldı, yalnız sahne görünümünde');
  ok(await kadar(() => sahne.evaluate(() => CanliOyun.durum().bagli)), 'sahne köprüye bağlandı');
  ok(await sahne.evaluate(() => getComputedStyle(document.getElementById('cik-yayin')).display === 'none' && getComputedStyle(document.getElementById('panel')).display === 'none'), 'sahnede panel ve "Paneli göster" yok');
  ok(await kadar(() => sahne.evaluate(() => CanliOyun._test.muzik.acik)), 'sahnede ses kendiliğinden açıldı');
  ok(await kadar(() => panel.evaluate(() => !document.getElementById('sahne-bilgi').hidden && CanliOyun._test.muzik.uzak === true)), 'panel sahneyi gördü ve kendi sesini kıstı');
  ok(await kadar(() => sahne.evaluate(() => JSON.parse(localStorage.getItem('kabe-tavaf-sesler') || '{}').dem === false)), 'durum: sahne bağlanınca paneldeki Dem kapalı ayarını aldı');
  ok(await kadar(() => sahne.evaluate(() => document.getElementById('yasak').value === 'kotu, cirkin')), 'durum: yasaklı kelimeler sahneye geçti');

  // Düğmeler
  await panel.click('.ses-hap:nth-child(1)'); // Ney kapat
  ok(await kadar(() => sahne.evaluate(() => JSON.parse(localStorage.getItem('kabe-tavaf-sesler') || '{}').ney === false)), 'Ney düğmesi sahnede de kapandı');
  await panel.fill('.sarki-yt input', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  await panel.click('.sarki-yt .dugme');
  ok(await kadar(() => sahne.evaluate(() => document.querySelectorAll('.sarki-liste li .ad').length === 1)), 'YouTube linki sahnenin şarkı sırasına eklendi');
  // Dosya
  const dosya = '/tmp/deneme-sarki.wav';
  if (!fs.existsSync(dosya)) { const n = 8000, h = Buffer.alloc(44 + n); h.write('RIFF', 0); h.writeUInt32LE(36 + n, 4); h.write('WAVEfmt ', 8); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22); h.writeUInt32LE(8000, 24); h.writeUInt32LE(8000, 28); h.writeUInt16LE(1, 32); h.writeUInt16LE(8, 34); h.write('data', 36); h.writeUInt32LE(n, 40); fs.writeFileSync(dosya, h); }
  await panel.setInputFiles('.sarki-kutu input[type=file]', dosya);
  ok(await kadar(() => sahne.evaluate(() => [...document.querySelectorAll('.sarki-liste li .ad')].some(x => x.textContent === 'deneme-sarki'))), 'bilgisayardan eklenen şarkı dosyası sahneye geçti');
  ok(await sahne.evaluate(() => [...document.querySelectorAll('.sarki-liste li .ad')].map(x => x.textContent).join('|')) === await panel.evaluate(() => [...document.querySelectorAll('.sarki-liste li .ad')].map(x => x.textContent).join('|')), 'iki sayfada şarkı sırası aynı');
  // Sıra oku: 2. şarkıyı yukarı al
  await panel.click('.sarki-liste li:nth-child(2) button:nth-of-type(2)');
  ok(await kadar(() => sahne.evaluate(() => document.querySelector('.sarki-liste li .ad').textContent === 'deneme-sarki')), 'sıra değişikliği (↑) sahneye geçti');
  // Panelin alttaki YouTube kutusu: sayfanın kendisinin geri yazdığı link (input olayı yok) Çal ile sahneye de gitmeli
  await panel.evaluate(() => { document.getElementById('yt-link').value = 'https://www.youtube.com/watch?v=goyPvmDbE1s'; });
  await panel.click('#yt-cal');
  ok(await kadar(() => sahne.evaluate(() => document.getElementById('yt-link').value.includes('goyPvmDbE1s') && document.getElementById('yt-ileti').textContent !== 'Bu bir YouTube linki değil.')), 'alttaki YouTube kutusu: geri yazılmış link Çal ile sahnede de çalınmaya başlar');
  // Balon: B tuşu
  await panel.click('#yayin-gor'); await panel.keyboard.press('Escape');
  await panel.keyboard.press('b');
  ok(await kadar(() => sahne.evaluate(() => CanliOyun._test.ayar.balon === false)), 'B tuşu sahnenin yorum balonlarını kapattı');
  ok(await sahne.evaluate(() => document.body.classList.contains('yayin')), 'paneldeki "Yalnızca sahneyi göster" / Esc sahneyi etkilemedi');
  // Ses düğmesi: sahnenin sesini kapatır
  await panel.click('#ses-dugme');
  ok(await kadar(() => sahne.evaluate(() => CanliOyun._test.muzik.acik === false)), 'panelin Sesi kapat düğmesi sahnenin sesini kapattı');
  ok(await kadar(() => panel.evaluate(() => document.getElementById('ses-yazi').textContent === 'Sesi aç')), 'panelin ses düğmesi sahnenin durumunu gösteriyor');
  await panel.click('#ses-dugme');
  ok(await kadar(() => sahne.evaluate(() => CanliOyun._test.muzik.acik === true)), 'Sesi aç sahnenin sesini yeniden açtı');
  // Kişi çıkarma (kimlikle)
  await kadar(() => sahne.evaluate(() => CanliOyun.durum().kisi > 0), 15000);
  const id = await panel.evaluate(() => { const k = [...CanliOyun._test.D.oy.values()].find(k => !String(k.id).startsWith('npc')); return k && k.id; });
  if (id) {
    await panel.evaluate(i => { const ul = document.getElementById('kisi-liste'); const li = [...ul.children].find(x => x.dataset.id === i); if (li) { li.querySelector('.kisi-dugme').click(); } }, id);
    const tiklandi = await panel.evaluate(i => { const li = [...document.getElementById('kisi-liste').children].find(x => x.dataset.id === i); const b = li && li.querySelector('.k-cikar'); return !!b; }, id);
    if (tiklandi) await panel.click('#kisi-liste li[data-id="' + id.replace(/"/g, '\\"') + '"] .k-cikar');
    ok(await kadar(() => sahne.evaluate(i => CanliOyun._test.ayar.cikan.some(x => x.id === i), id)), 'paneldeki "çıkar" sahnede aynı kişiyi çıkardı');
  } else ok(false, 'çıkarılacak kişi bulunamadı');
  // Boşalt
  const onceki = await sahne.evaluate(() => [...CanliOyun._test.D.oy.keys()]);
  await panel.click('#bosalt-sor'); await panel.click('#bosalt');
  ok(onceki.length > 0 && await kadar(() => sahne.evaluate(o => o.every(i => !CanliOyun._test.D.oy.has(i)), onceki)), 'Tavafı boşalt sahnede de boşalttı (' + onceki.length + ' kişi gitti)');
  // Sahne kapanınca panel sesini geri açar
  await sahne.close();
  ok(await kadar(() => panel.evaluate(() => CanliOyun._test.muzik.uzak === false && document.getElementById('sahne-bilgi').hidden)), 'sahne kapanınca panel kendi sesine döndü');
  // Güvenlik: başka ad ve başka kökenden istek
  const yabanci = await fetch('http://127.0.0.1:' + PORT + '/api/sarki', { method: 'POST', headers: { 'content-type': 'audio/wav', 'x-kabe': 'sarki', origin: 'http://evil.example' }, body: 'x' });
  ok(yabanci.status === 403, 'başka siteden şarkı yükleme geri çevrildi');
  const sahneBos = await fetch('http://localhost:' + PORT + '/sahne/').then(r => r.text());
  ok(sahneBos.includes('OYUN_SAHNE'), '/sahne/ çalışan oyunu veriyor');
  await fetch('http://localhost:' + PORT + '/api/durdur', { method: 'POST', headers: { 'content-type': 'application/json', origin: 'http://localhost:' + PORT }, body: '{}' });
  const bekleme = await fetch('http://localhost:' + PORT + '/sahne/').then(r => r.text());
  ok(bekleme.includes('Oyun bekleniyor'), 'oyun yokken /sahne/ bekleme sayfası veriyor');
  await tar.close(); motor.kill();
  console.log('\n' + gecti + ' geçti, ' + kaldi + ' kaldı');
  if (kaldi) console.log(gunluk.slice(-1500));
  process.exit(kaldi ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
