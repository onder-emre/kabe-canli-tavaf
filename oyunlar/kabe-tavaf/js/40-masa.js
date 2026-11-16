/* YAYIN MASASI: "Bu oyunda" kartı — şarkı sırası ve adsız tavafçılar.
 *
 * Şarkı sırası: yayıncı bilgisayarından ses dosyası (mp3, m4a, wav…) ya da YouTube linki ekler; parçalar listedeki
 * sırayla çalar, biri bitince sıradaki başlar. Sıra yukarı / aşağı oklarıyla değişir, ✕ ile çıkar. Liste tarayıcının
 * kendi deposunda (IndexedDB) saklanır: oyun aynı adresten (BASLAT, localhost:8787) açıldıkça dosyalar yeniden
 * seçilmeden geri gelir. Çalarken oyunun kendi ney sesi susar (muzik.disSustur), sahnede şarkının adı yazar.
 * YouTube linkleri çekirdeğin YouTube oynatıcısıyla çalar (CanliOyun.youtube); bitince sıradaki gelir.
 * Bütün yazılar textContent: dosya adları da yabancı metin sayılır.
 */
const SARKI = { liste: [], calan: -1, ses: null, url: null, yt: false, ytBasladi: false, ytIzle: 0, dongu: true, db: null, el: {} };

function masaKur() {
  const yer = $('bu-oyunda');
  if (!yer || yer.querySelector('.sarki-katla'))
    return;
  // Kart küçük ekranda masayı itmesin diye katlanır bir bölüm: başlığa basınca açılır
  const katla = document.createElement('details');
  katla.className = 'sarki-katla';
  const ozetS = document.createElement('summary');
  ozetS.textContent = 'Şarkı sırası ve diğer ayarlar';
  katla.append(ozetS);
  const kutu = document.createElement('div');
  kutu.className = 'sarki-kutu';
  const ogeYap = (tag, sinif, yazi) => { const e = document.createElement(tag); if (sinif) e.className = sinif; if (yazi != null) e.textContent = yazi; return e; };
  const baslik = ogeYap('h3', 'sarki-baslik', 'Şarkı sırası (ilahiler)');
  const ipucu = ogeYap('p', 'kart-ipucu', 'Dosya ya da YouTube linki ekle; listedeki sırayla çalar.');
  // dosya ekle
  const dosya = document.createElement('input');
  dosya.type = 'file';
  dosya.accept = 'audio/*,.mp3,.m4a,.wav,.ogg,.aac,.flac';
  dosya.multiple = true;
  dosya.hidden = true;
  const dosyaDug = ogeYap('button', 'dugme kucuk', 'Bilgisayardan şarkı ekle');
  dosyaDug.type = 'button';
  dosyaDug.onclick = () => dosya.click();
  dosya.onchange = () => { for (const f of dosya.files) sarkiEkle({ tur: 'dosya', ad: f.name.replace(/\.[^.]+$/, ''), blob: f }); dosya.value = ''; };
  // youtube ekle
  const ytSatir = ogeYap('div', 'sarki-yt');
  const yt = document.createElement('input');
  yt.type = 'text';
  yt.placeholder = 'YouTube linki yapıştır';
  yt.setAttribute('aria-label', 'Sıraya eklenecek YouTube linki');
  const ytDug = ogeYap('button', 'dugme kucuk', 'Sıraya ekle');
  ytDug.type = 'button';
  const ytEkle = () => {
    const link = yt.value.trim();
    const id = CanliOyun.youtube && CanliOyun.youtube.linkCoz ? CanliOyun.youtube.linkCoz(link) : null;
    if (!link || !id) {
      sarkiIleti('Bu bir YouTube linkine benzemiyor.');
      return;
    }
    sarkiEkle({ tur: 'youtube', ad: 'YouTube · ' + id.video, link });
    yt.value = '';
  };
  ytDug.onclick = ytEkle;
  yt.onkeydown = e => { if (e.key === 'Enter') ytEkle(); };
  ytSatir.append(yt, ytDug);
  const ol = ogeYap('ol', 'sarki-liste');
  const dugmeler = ogeYap('div', 'sarki-dugmeler');
  const bas = ogeYap('button', 'dugme kucuk ana', 'Sırayı başlat');
  const sonraki = ogeYap('button', 'dugme kucuk', 'Sonraki');
  const dur = ogeYap('button', 'dugme kucuk', 'Durdur');
  const dongu = ogeYap('button', 'anahtar', 'Bitince başa dön');
  for (const b of [bas, sonraki, dur, dongu])
    b.type = 'button';
  dongu.setAttribute('aria-pressed', 'true');
  bas.onclick = () => sarkiCal(SARKI.calan >= 0 ? SARKI.calan : 0);
  sonraki.onclick = () => sarkiSonraki();
  dur.onclick = () => sarkiDurdur(true);
  dongu.onclick = () => { SARKI.dongu = !SARKI.dongu; dongu.setAttribute('aria-pressed', String(SARKI.dongu)); };
  dugmeler.append(bas, sonraki, dur, dongu);
  const ileti = ogeYap('p', 'kart-not sarki-ileti', '');
  // adsız tavafçılar
  const npc = ogeYap('button', 'anahtar', 'Adsız tavafçılar');
  npc.type = 'button';
  npc.setAttribute('aria-pressed', 'true');
  npc.title = 'Kalabalık az iken halkayı dolduran adsız tavafçılar';
  npc.onclick = () => { D.npcAcik = !D.npcAcik; npc.setAttribute('aria-pressed', String(D.npcAcik)); oyunYerlesim(); };
  kutu.append(baslik, ipucu, dosyaDug, dosya, ytSatir, ol, dugmeler, ileti, npc);
  katla.append(kutu);
  yer.append(katla);
  sesKartKur(yer, kutu);
  SARKI.el = { ol, ileti, bas };
  const st = document.createElement('style');
  st.textContent = `
.sarki-katla{min-width:0;max-width:100%}
.sarki-katla summary{cursor:pointer;font-weight:600}
.sarki-kutu{min-width:0}
.sarki-kutu > .dugme{width:100%;box-sizing:border-box}
.sarki-yt .dugme{flex:none}
.sarki-kutu{display:flex;flex-direction:column;gap:8px;margin-top:8px}
.sarki-baslik{margin:0;font-size:14px}
.sarki-yt{display:flex;gap:6px}
.sarki-yt input{flex:1;min-width:0}
.sarki-liste{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:4px;max-height:220px;overflow:auto}
.sarki-liste li{display:flex;align-items:center;gap:6px;padding:4px 6px;border-radius:8px;background:rgba(255,255,255,.05);font-size:13px}
.sarki-liste li.calan{background:rgba(232,195,106,.22);outline:1px solid rgba(232,195,106,.6)}
.sarki-liste li .no{opacity:.7;min-width:18px}
.sarki-liste li .ad{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.sarki-liste{overflow-x:hidden}
.sarki-liste li button{padding:1px 5px;min-width:0;min-height:0;height:24px;width:auto;font-size:11px;flex:none}
.sarki-dugmeler{display:flex;flex-wrap:wrap;gap:6px}
`;
  document.head.append(st);
  muzik.dinle(m => { if (SARKI.ses) SARKI.ses.volume = m.acik ? clamp(m.duzey, 0, 1) : 0; });
  sarkiYukle();
}
function sarkiIleti(m) { if (SARKI.el.ileti) SARKI.el.ileti.textContent = m; }
function sarkiListeYaz() {
  const ol = SARKI.el.ol;
  if (!ol)
    return;
  ol.textContent = '';
  if (!SARKI.liste.length) {
    const li = document.createElement('li');
    li.textContent = 'Liste boş. Çalmazsa oyunun kendi ney sesi çalar.';
    ol.append(li);
    return;
  }
  SARKI.liste.forEach((s, i) => {
    const li = document.createElement('li');
    if (i === SARKI.calan)
      li.className = 'calan';
    const no = document.createElement('span');
    no.className = 'no';
    no.textContent = i + 1 + '.';
    const ad = document.createElement('span');
    ad.className = 'ad';
    ad.textContent = s.ad;
    ad.title = s.ad;
    li.append(no, ad);
    for (const [yazi, etiket, is] of [['▶', 'Bunu çal', () => sarkiCal(i)], ['↑', 'Yukarı', () => sarkiTasi(i, -1)], ['↓', 'Aşağı', () => sarkiTasi(i, 1)], ['✕', 'Listeden çıkar', () => sarkiSil(i)]]) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'dugme kucuk';
      b.textContent = yazi;
      b.setAttribute('aria-label', etiket + ': ' + s.ad);
      b.onclick = is;
      li.append(b);
    }
    ol.append(li);
  });
}
function sarkiEkle(s) {
  s.id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  SARKI.liste.push(s);
  sarkiKaydet();
  sarkiListeYaz();
  sarkiIleti('"' + s.ad + '" sıraya eklendi (' + SARKI.liste.length + '. sırada).');
}
function sarkiTasi(i, yon) {
  const j = i + yon;
  if (j < 0 || j >= SARKI.liste.length)
    return;
  const l = SARKI.liste;
  [l[i], l[j]] = [l[j], l[i]];
  if (SARKI.calan === i)
    SARKI.calan = j;
  else if (SARKI.calan === j)
    SARKI.calan = i;
  sarkiKaydet();
  sarkiListeYaz();
}
function sarkiSil(i) {
  if (i === SARKI.calan)
    sarkiDurdur(true);
  SARKI.liste.splice(i, 1);
  if (SARKI.calan > i)
    SARKI.calan--;
  sarkiKaydet();
  sarkiListeYaz();
}
function sarkiCal(i) {
  if (!SARKI.liste.length) {
    sarkiIleti('Önce listeye şarkı ekle.');
    return;
  }
  sarkiDurdur(false);
  SARKI.calan = ((i % SARKI.liste.length) + SARKI.liste.length) % SARKI.liste.length;
  const s = SARKI.liste[SARKI.calan];
  sarkiListeYaz();
  if (!muzik.acik)
    muzik.sesAc().catch(() => { });
  if (s.tur === 'youtube') {
    if (!CanliOyun.youtube) {
      sarkiIleti('YouTube oynatıcısı yok; sıradaki parçaya geçiliyor.');
      setTimeout(sarkiSonraki, 800);
      return;
    }
    SARKI.yt = true;
    SARKI.ytBasladi = false;
    CanliOyun.youtube.cal(s.link);
    sarkiIleti('Çalıyor: ' + s.ad);
    // YouTube oynatıcısının durumunu izle: çalmaya başlayıp durunca sıradakine geç
    SARKI.ytIzle = setInterval(() => {
      const d = CanliOyun.youtube.durum();
      if (d.caliyor)
        SARKI.ytBasladi = true;
      else if (SARKI.ytBasladi || /çalınamıyor|bulunamadı|açılamadı/.test(d.ileti || '')) {
        clearInterval(SARKI.ytIzle);
        SARKI.ytIzle = 0;
        SARKI.yt = false;
        sarkiSonraki();
      }
    }, 1000);
    return;
  }
  if (!s.blob) {
    sarkiIleti('"' + s.ad + '" dosyası bulunamadı, yeniden ekle.');
    setTimeout(sarkiSonraki, 800);
    return;
  }
  SARKI.url = URL.createObjectURL(s.blob);
  const ses = new Audio(SARKI.url);
  SARKI.ses = ses;
  ses.volume = muzik.acik ? clamp(muzik.duzey, 0, 1) : 0;
  ses.onended = () => sarkiSonraki();
  ses.onerror = () => { sarkiIleti('"' + s.ad + '" çalınamadı; sıradakine geçiliyor.'); setTimeout(sarkiSonraki, 600); };
  muzik.disSustur(true, s.ad);
  ses.play().then(() => sarkiIleti('Çalıyor: ' + s.ad), () => sarkiIleti('Çalmak için "Sırayı başlat"a bas.'));
}
function sarkiSonraki() {
  if (!SARKI.liste.length)
    return sarkiDurdur(true);
  const n = SARKI.calan + 1;
  if (n >= SARKI.liste.length && !SARKI.dongu) {
    sarkiDurdur(true);
    sarkiIleti('Liste bitti; oyunun kendi ney sesi çalıyor.');
    return;
  }
  sarkiCal(n);
}
function sarkiDurdur(tamamen) {
  if (SARKI.ytIzle) {
    clearInterval(SARKI.ytIzle);
    SARKI.ytIzle = 0;
  }
  if (SARKI.yt && CanliOyun.youtube) {
    SARKI.yt = false;
    CanliOyun.youtube.durdur();
  }
  if (SARKI.ses) {
    SARKI.ses.onended = SARKI.ses.onerror = null;
    SARKI.ses.pause();
    SARKI.ses = null;
  }
  if (SARKI.url) {
    URL.revokeObjectURL(SARKI.url);
    SARKI.url = null;
  }
  muzik.disSustur(false);
  if (tamamen) {
    SARKI.calan = -1;
    sarkiListeYaz();
    sarkiIleti('Durdu; oyunun kendi ney sesi çalıyor.');
  }
}

/* ---- saklama: IndexedDB (dosyalar büyük olduğu için localStorage değil) ---- */
function sarkiDb() {
  if (SARKI.db)
    return SARKI.db;
  SARKI.db = new Promise((tamam, hata) => {
    try {
      const r = indexedDB.open('kabe-tavaf-sarki', 1);
      r.onupgradeneeded = () => r.result.createObjectStore('liste');
      r.onsuccess = () => tamam(r.result);
      r.onerror = () => hata(r.error);
    }
    catch (h) { hata(h); }
  });
  return SARKI.db;
}
function sarkiKaydet() {
  const kayit = SARKI.liste.map(s => ({ id: s.id, tur: s.tur, ad: s.ad, link: s.link || null, blob: s.blob || null }));
  sarkiDb().then(db => { const t = db.transaction('liste', 'readwrite'); t.objectStore('liste').put(kayit, 'sira'); }).catch(() => { /* saklanamazsa liste yalnız bu oturumda kalır */ });
}
function sarkiYukle() {
  sarkiListeYaz();
  sarkiDb().then(db => new Promise(tamam => {
    const r = db.transaction('liste', 'readonly').objectStore('liste').get('sira');
    r.onsuccess = () => tamam(r.result);
    r.onerror = () => tamam(null);
  })).then(k => {
    if (Array.isArray(k) && k.length && !SARKI.liste.length) {
      SARKI.liste = k.filter(s => s && (s.tur === 'youtube' ? typeof s.link === 'string' : s.blob)).map(s => ({ id: String(s.id), tur: s.tur, ad: String(s.ad || 'Şarkı').slice(0, 80), link: s.link, blob: s.blob }));
      sarkiListeYaz();
      sarkiIleti(SARKI.liste.length + ' şarkı hazır. "Sırayı başlat"a bas.');
    }
  }).catch(() => { });
}
