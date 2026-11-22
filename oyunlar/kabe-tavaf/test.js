// Kâbe Canlı Tavaf'a özgü kontroller: her hediye kademesinin etkisi, ad kartı, tur sayımı ve tavafın tamamlanması,
// beğeni hedefi, şarkı sırası. Çekirdek testleri ayrıca çalışır. Çalıştırma: node oyunlar/kabe-tavaf/test.js kabe-tavaf
'use strict';
const path = require('path');
const { OYUN_URL, CIKTI, tarayici, raporla, kontrolcu, hazirBekle } = require(path.join(__dirname, '..', '..', 'cekirdek', 'test', 'ortak'));
const { sonuc, kontrol } = kontrolcu();

(async () => {
  const b = await tarayici();
  const hatalar = [];
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  p.on('pageerror', e => hatalar.push('SAYFA HATASI: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/ERR_TUNNEL|Failed to load resource|fonts\.g/.test(m.text())) hatalar.push(m.text()); });
  await p.addInitScript(() => { window.OYUN_YAZI_KAPALI = true; });
  await p.goto(OYUN_URL);
  await hazirBekle(p);
  await p.evaluate(() => { const o = document.getElementById('oto'); if (o.getAttribute('aria-pressed') === 'true') o.click(); document.getElementById('bosalt').click(); });

  // Sessiz hediye (OYUN.hediyeSessiz): her değerde yalnız ad kartında teşekkür; ödül etkisi (gül, kafile, ışık, nur) ve
  // ekranda jeton yok, gönderen lider / iç halka olmaz.
  const kd = await p.evaluate(() => {
    const D = CanliOyun._test.D, cik = {};
    CanliOyun.olay({ tip: 'yorum', kullanici: { id: 'ilk', ad: 'IlkGelen' }, metin: 'amin' });
    for (const j of [1, 10, 100, 500]) {
      CanliOyun._test.zamanEkle(0.2);
      const kafile = D.kafile.length;
      CanliOyun.olay({ tip: 'hediye', kullanici: { id: 'h' + j, ad: 'Hediyeci' + j }, jeton: j });
      const d = CanliOyun.durum();
      cik[j] = { kart: d.kart, yazi: D.kart && D.kart.satir1, gul: D.gulBit > d.vurus, kafile: D.kafile.length - kafile, isik: d.isik, nur: d.nur, lider: d.lider, bildirim: document.getElementById('bildirim').textContent };
    }
    return cik;
  });
  for (const j of [1, 10, 100, 500])
    kontrol(j + ' jeton: yalnız teşekkür kartı (ödül etkisi, jeton yazısı, liderlik yok)', kd[j].kart === 'Hediyeci' + j && kd[j].yazi === 'Allah razı olsun' && !kd[j].gul && kd[j].kafile === 0 && !kd[j].isik && !kd[j].nur && kd[j].lider === 'IlkGelen' && !/jeton/.test(kd[j].bildirim), kd[j]);
  await p.waitForTimeout(400);
  await p.locator('#sahne').screenshot({ path: CIKTI + '/k-nur.png' });

  // tur sayımı: yedi tur bitince tavaf tamam sayacı artar
  const tur = await p.evaluate(async () => {
    const T = CanliOyun._test, D = T.D;
    document.getElementById('bosalt').click();
    CanliOyun.olay({ tip: 'yorum', kullanici: { id: 't1', ad: 'Tavafçı' }, metin: 'Bismillah' });
    const k = D.oy.get('t1');
    const once = D.tamam;
    // yürüyüşü hızlandır: vuruş saatini ileri al, her adımda bir kare bekle
    for (let i = 0; i < 2600 && D.tamam === once; i++) {
      T.vurusIlerle(1.2);
      await new Promise(r => requestAnimationFrame(r));
    }
    T.vurusCoz();
    return { tamam: D.tamam - once, tur: k.tur };
  });
  kontrol('Yedi turu biten izleyicinin tavafı tamamlanır, sayaç artar', tur.tamam === 1, tur);

  // beğeni hedefi geçilince ödül yok (pankart çıkmaz; TikTok beğeniye karşılık ödülü yapay etkileşim sayıyor), hedef yalnız sayım için büyür
  const beg = await p.evaluate(async () => {
    const D = CanliOyun._test.D, h0 = D.begeniHedef;
    CanliOyun.olay({ tip: 'begeni', kullanici: { id: 'b1', ad: 'Beğenen' }, adet: 500 });
    CanliOyun.olay({ tip: 'begeni', kullanici: { id: 'b1', ad: 'Beğenen' }, adet: 500 });
    await new Promise(r => setTimeout(r, 200));
    return { h0, h1: D.begeniHedef, pankart: document.getElementById('pankart-yeri').textContent };
  });
  kontrol('Beğeni hedefi geçilince ödül pankartı çıkmaz (yalnız sayım büyür)', beg.h1 > beg.h0 && !/beğeni/.test(beg.pankart), beg);

  // şarkı sırası: YouTube linki eklenir, sıra değişir, silinir; dosya adı HTML olarak yazılmaz
  const sk = await p.evaluate(async () => {
    document.querySelector('.sarki-katla').open = true;
    const yt = document.querySelector('.sarki-yt input'), ekle = document.querySelector('.sarki-yt button');
    yt.value = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    ekle.click();
    yt.value = 'https://youtu.be/aaaaaaaaaaa';
    ekle.click();
    yt.value = 'bu bir link değil';
    ekle.click();
    const sayi1 = document.querySelectorAll('.sarki-liste li').length;
    const ilk = document.querySelector('.sarki-liste li .ad').textContent;
    document.querySelectorAll('.sarki-liste li')[1].querySelectorAll('button')[1].click(); // ikinciyi yukarı
    const yeniIlk = document.querySelector('.sarki-liste li .ad').textContent;
    document.querySelector('.sarki-liste li').querySelectorAll('button')[3].click(); // sil
    return { sayi1, ilk, yeniIlk, sayi2: document.querySelectorAll('.sarki-liste li').length, img: document.querySelectorAll('.sarki-liste img').length };
  });
  kontrol('Şarkı sırası: link eklenir, geçersiz link eklenmez, sıra değişir, silinir', sk.sayi1 === 2 && sk.ilk !== sk.yeniIlk && sk.sayi2 === 1 && sk.img === 0, sk);

  // yorumla karakter seçme: yalnız "erkek" / "kadın" yazan değişir, cümle içinde geçmesi değiştirmez
  const cin = await p.evaluate(() => {
    const D = CanliOyun._test.D, yaz = (id, m) => CanliOyun.olay({ tip: 'yorum', kullanici: { id, ad: id }, metin: m });
    yaz('c1', 'selam');
    const ilk = D.oy.get('c1').g.kadin, r = {};
    yaz('c1', ilk ? 'Erkek' : 'KADIN 🙏');
    r.degisti = D.oy.get('c1').g.kadin !== ilk;
    r.kilik = D.oy.get('c1').tv.tur === (ilk ? 'ihram' : 'ferace');
    yaz('c1', ilk ? 'erkek kardeşim için dua edin' : 'kadın doğum hastanesi');
    r.cumle = D.oy.get('c1').g.kadin !== ilk;
    yaz('c2', 'kadin');
    yaz('c3', 'erkek');
    r.c2 = D.oy.get('c2').tv.tur;
    r.c3 = D.oy.get('c3').tv.tur;
    return r;
  });
  kontrol('Yoruma yalnız "erkek" ya da "kadın" yazanın karakteri değişir; cümle içinde geçmesi değiştirmez', cin.degisti && cin.kilik && cin.cumle && cin.c2 === 'ferace' && cin.c3 === 'ihram', cin);

  kontrol('Tavaf testlerinde sayfada hata çıkmadı', hatalar.length === 0, hatalar.slice(0, 4).join(' | '));
  await b.close();
  process.exit(raporla(sonuc) ? 1 : 0);
})().catch(e => { console.error('TEST ÇÖKTÜ', e); process.exit(1); });
