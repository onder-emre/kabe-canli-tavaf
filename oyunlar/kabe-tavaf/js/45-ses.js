/* SESLER — oyunun seslerini tek tek açıp kapatma ve seslerin birbirine girmemesi.
 *
 * Masadaki "Bu oyunda" kartının başında dört anahtar:
 *   Ney (ezgi) · Ritim (kudüm, bendir, halile) · Dem (alttaki uzun ses) · Efektler (hediye zili)
 * ve "Oyun seslerinin hepsini kapat / aç" düğmesi. Seçimler tarayıcıda saklanır.
 * "Şarkı çalarken oyun sesleri sussun" açıkken (öntanım) YouTube'dan ya da şarkı sırasından bir şarkı çaldığı sürece
 * oyunun bütün sesleri susar: müzik zaten susar (çekirdek, muzik.disSustur), buna efektler de eklenir.
 *
 * Tek sekme kuralı: oyun aynı anda iki sekmede açıksa (ör. panelli sayfa ve #yayin sayfası) ikisi de ses çıkarır ve
 * sesler üst üste biner. Bir sekmede ses açılınca ya da şarkı başlayınca öbür sekmeler (BroadcastChannel) kendi
 * seslerini, şarkılarını ve YouTube'larını kapatır: ses yalnız en son başlatılan sekmeden gelir.
 *
 * Kanallar çekirdeğin muzik.ses.kanal kazançlarıdır (davul, ezgi, eslik); ses yeniden kurulursa ayarlar yeniden uygulanır.
 */
const SES_ANAHTAR = 'kabe-tavaf-sesler';
const SES = Object.assign({ ney: true, ritim: true, dem: true, efekt: true, sarkidaSus: true }, (() => {
  try {
    const v = JSON.parse(localStorage.getItem(SES_ANAHTAR) || '{}');
    return v && typeof v === 'object' ? v : {};
  }
  catch (h) {
    return {};
  }
})());
const sesOzgun = new WeakMap(); // ses grafiği → kanalların ilk (özgün) düzeyleri
let sesImza = '', sesDugmeler = {};

function sesKaydet() {
  try {
    localStorage.setItem(SES_ANAHTAR, JSON.stringify(SES));
  }
  catch (h) { /* saklanamazsa yalnız bu oturumda geçerli */ }
}
// Her karede çağrılır; yalnız bir şey değişince kazançlara dokunur.
function sesUygula() {
  const s = muzik.ses;
  if (!s || !s.kanal)
    return;
  const sarki = muzik.disAd !== null && muzik.disAd !== undefined;
  const imza = [SES.ney, SES.ritim, SES.dem, SES.efekt, SES.sarkidaSus, sarki].join() + (sesOzgun.has(s) ? '' : '*');
  if (imza === sesImza && sesOzgun.has(s))
    return;
  sesImza = imza;
  if (!sesOzgun.has(s))
    sesOzgun.set(s, { davul: s.kanal.davul.value, ezgi: s.kanal.ezgi.value, eslik: s.kanal.eslik.value, efekt: s.efektYol.gain.value });
  const o = sesOzgun.get(s), t = muzik.ctx.currentTime;
  s.kanal.ezgi.setTargetAtTime(SES.ney ? o.ezgi : 0, t, 0.05);
  s.kanal.davul.setTargetAtTime(SES.ritim ? o.davul : 0, t, 0.05);
  s.kanal.eslik.setTargetAtTime(SES.dem ? o.eslik : 0, t, 0.05);
  // Efekt yolu yalnız zil çalarken işlenir; boştayken zamanlanmış geçiş bekler ve okunan değer eski kalır.
  // Bu yüzden değeri doğrudan yazılır: sonraki zil kesin olarak yeni düzeyle çalar.
  s.efektYol.gain.cancelScheduledValues(t);
  s.efektYol.gain.value = SES.efekt && !(sarki && SES.sarkidaSus) ? o.efekt : 0;
}
// Çekirdek testi bu oyunda zilin şarkı çalarken susmasını bekleyebilsin
Object.defineProperty(window, 'OYUN_SARKIDA_EFEKT_SUS', { get: () => !!SES.sarkidaSus, configurable: true });
function sesDugmeYaz() {
  for (const k in sesDugmeler)
    sesDugmeler[k].setAttribute('aria-pressed', String(!!SES[k]));
  if (sesDugmeler.hepsi) {
    const hepsiKapali = !SES.ney && !SES.ritim && !SES.dem && !SES.efekt;
    sesDugmeler.hepsi.textContent = 'Tümü';
    sesDugmeler.hepsi.title = hepsiKapali ? 'Oyunun bütün seslerini aç' : 'Oyunun bütün seslerini kapat';
    sesDugmeler.hepsi.setAttribute('aria-label', sesDugmeler.hepsi.title);
    sesDugmeler.hepsi.setAttribute('aria-pressed', String(!hepsiKapali));
  }
}
function sesKartKur(yer, ayrinti) {
  const kutu = document.createElement('div');
  kutu.className = 'ses-kutu';
  for (const [k, ad, ipucu] of [['ney', 'Ney', 'Ezgi'], ['ritim', 'Ritim', 'Kudüm, bendir, halile'], ['dem', 'Dem', 'Alttaki uzun ses'], ['efekt', 'Efekt', 'Hediye zili']]) {
    const d = document.createElement('button');
    d.type = 'button';
    d.className = 'ses-hap';
    d.textContent = ad;
    d.title = ipucu + ': aç / kapat';
    d.setAttribute('aria-label', ad + ' sesi');
    d.onclick = () => {
      SES[k] = !SES[k];
      sesKaydet();
      sesDugmeYaz();
      sesUygula();
    };
    sesDugmeler[k] = d;
    kutu.append(d);
  }
  const hepsi = document.createElement('button');
  hepsi.type = 'button';
  hepsi.className = 'ses-hap ses-hepsi';
  hepsi.onclick = () => {
    const ac = !SES.ney && !SES.ritim && !SES.dem && !SES.efekt;
    SES.ney = SES.ritim = SES.dem = SES.efekt = ac;
    sesKaydet();
    sesDugmeYaz();
    sesUygula();
  };
  sesDugmeler.hepsi = hepsi;
  kutu.append(hepsi);
  yer.prepend(kutu);
  // "şarkı çalarken sussun" seyrek değişir: katlanır bölümün içinde
  const sus = document.createElement('button');
  sus.type = 'button';
  sus.className = 'anahtar';
  sus.textContent = 'Şarkı çalarken oyun sesleri sussun';
  sus.onclick = () => {
    SES.sarkidaSus = !SES.sarkidaSus;
    sesKaydet();
    sesDugmeYaz();
    sesUygula();
  };
  sesDugmeler.sarkidaSus = sus;
  if (ayrinti)
    ayrinti.prepend(sus);
  sesDugmeYaz();
  const st = document.createElement('style');
  st.textContent = `
.ses-kutu{display:flex;flex-wrap:wrap;align-items:center;gap:4px;margin-bottom:6px}
.ses-hap{font:inherit;font-size:11.5px;font-weight:600;padding:3px 7px;white-space:nowrap;border-radius:999px;cursor:pointer;
  border:1px solid rgba(232,195,106,.55);background:rgba(232,195,106,.18);color:inherit}
.ses-hap[aria-pressed="false"]{background:transparent;opacity:.55;text-decoration:line-through}
.ses-hepsi{border-style:dashed;background:transparent}`;
  document.head.append(st);
}
/* ---- tek sekme ---- */
const SEKME_NO = Math.random().toString(36).slice(2);
let sesKanal = null, sonAcik = false, sonSarki = false;
try {
  sesKanal = new BroadcastChannel('kabe-tavaf-ses');
  sesKanal.onmessage = e => {
    if (!e.data || e.data.tip !== 'calan' || e.data.no === SEKME_NO)
      return;
    // başka sekme ses çıkarmaya başladı: bu sekme susar
    if (typeof sarkiDurdur === 'function')
      sarkiDurdur(true);
    if (CanliOyun.youtube && CanliOyun.youtube.durum().caliyor)
      CanliOyun.youtube.durdur();
    if (muzik.acik)
      muzik.sesKapat();
    sonAcik = false;
    sonSarki = false;
  };
}
catch (h) { /* BroadcastChannel yoksa tek sekme kuralı yok */ }
// Bu sekmede ses açıldı ya da şarkı başladıysa öbür sekmelere duyur
function sekmeDenetle() {
  const acik = !!muzik.acik, sarki = muzik.disAd !== null && muzik.disAd !== undefined;
  if (sesKanal && ((acik && !sonAcik) || (sarki && !sonSarki)))
    sesKanal.postMessage({ tip: 'calan', no: SEKME_NO });
  sonAcik = acik;
  sonSarki = sarki;
}

// Sekme arka plandayken tarayıcı kare çizmez (oyunUst çağrılmaz) ama müzik çalmaya devam eder: ses ayarları ve tek
// sekme kuralı kareye bağlı kalmasın diye ayrıca zamanlayıcıyla da uygulanır.
setInterval(() => {
  sesUygula();
  sekmeDenetle();
}, 250);
