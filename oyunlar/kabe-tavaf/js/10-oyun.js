/* TAVAF — kim nerede yürür, nasıl döner, turlar nasıl sayılır, hediyeler ne yapar.
 *
 * Kâbe dünyanın ortasında (x = 0, z = 0). Herkes Kâbe'yi solunda tutarak, yukarıdan bakınca saat yönünün tersine
 * döner (açı artar). Yürüyenler iç içe halkalara dizilir: sıradaki yeri (k.sn) küçük olan, yani daha çok hediye
 * atan, Kâbe'ye daha yakın halkada yürür. Halkalar dolunca dışa doğru yenisi açılır.
 * Tur: Hacerü'l-Esved köşesinin hizası (BASLA_ACI) başlangıç çizgisidir; çizgiyi her geçiş bir tur. Yedi turda
 * tavaf tamamlanır, sayaç artar, tur sayısı yeniden başlar.
 * Boş kalmasın diye adsız tavafçılar (NPC) da yürür; bunlar izleyici değildir, adları yoktur, sayılmaz.
 */
const KABE_G = 2.3, KABE_D = 2.0, KABE_Y = 2.55;   // Kâbe'nin eni (x), derinliği (z), yüksekliği (metre)
const HALKA0 = 2.3, HALKA_ARA = 0.72, ADIM_ARA = 0.86;  // ilk halkanın yarıçapı, halkalar arası, yan yana iki kişi
const HIZ = 0.4;                                    // vuruş başına yürüme (metre)
const BASLA_ACI = Math.PI * 1.25;                   // Hacerü'l-Esved köşesi: kameradan bakınca Kâbe'nin sol ön köşesi
const DIS_R = 8.4;                                  // halka dışı: girenler buradan gelir, çıkanlar buraya gider

// Adsız tavafçılar (sahte kalabalık) yalnız denemede baştan açık: gerçek yayında sahnede yalnız gerçek izleyiciler yürür
// (TikTok sahte etkileşim sayabilir). Masadaki "Adsız tavafçılar" düğmesi yine açar.
Object.assign(D, { tamam: 0, npc: [], kafile: [], npcAcik: document.documentElement.getAttribute('data-kip') !== 'canli', isikBit: -99, nur: null, kart: null, gulBit: -99,
  yaprak: [], begeniHedef: 0, sonB: 0, hediyeKart: { tip: '', b: -99 } });

const halkaR = l => HALKA0 + l * HALKA_ARA;
const halkaYer = l => Math.max(6, Math.floor(TAU * halkaR(l) / ADIM_ARA));
const aciNorm = a => ((a % TAU) + TAU) % TAU;

// Görünüş (ihram, ferace): 15-kilik.js
// Her yürüyen (izleyici ya da NPC) için tavaf alanları
function tavafHazir(k, aci, r) {
  kilikKur(k);
  if (k.ta !== undefined)
    return;
  k.ta = aci;
  k.tr = r;
  k.trH = r;
  k.tur = 0;
  k.adimF = k.g.salin * TAU;
}

/* ---- adsız tavafçılar ---- */
const NPC_EN = 30, NPC_AZ = 6;
let npcSay = 0;
function npcHedefSayi() { return D.npcAcik ? Math.round(clamp(NPC_EN - D.sira.length * 0.55, NPC_AZ, NPC_EN)) : 0; }
function npcYap(aci, r) {
  const k = karakterYap('npc-' + (npcSay++), '');
  k.npc = true;
  k.son = zaman;
  tavafHazir(k, aci, r);
  return k;
}

/* ---- yerleşim: halkalar ----
 * Önce izleyiciler (sıraya göre), sonra NPC'ler halkalara dağılır. Kafile üyeleri halka saymaz: sahiplerinin
 * arkasında yürürler.
 */
function oyunYerlesim() {
  let l = 0, dolu = 0;
  const yerlestir = k => {
    if (dolu >= halkaYer(l)) {
      l++;
      dolu = 0;
    }
    k.halka = l;
    k.trH = halkaR(l) + (ozet(k.id) % 7 - 3) * 0.025;
    dolu++;
  };
  for (const k of D.sira)
    if (!k.cikiyor)
      yerlestir(k);
  // NPC sayısını kalabalığa göre ayarla: fazlası halkadan dışarı yürüyüp gider
  const hedef = npcHedefSayi();
  let canli = D.npc.filter(n => !n.cikiyor);
  while (canli.length < hedef) {
    const n = npcYap(Math.random() * TAU, DIS_R);
    D.npc.push(n);
    canli.push(n);
  }
  for (let i = hedef; i < canli.length; i++) {
    canli[i].cikiyor = true;
    canli[i].trH = DIS_R + 0.6;
  }
  canli = canli.slice(0, hedef);
  for (const n of canli)
    yerlestir(n);
  D.halkaSay = l + 1;
}
// Yeni izleyici halkanın dışından, kendi halkasındaki en geniş boşluğa doğru yürür.
function oyunGiris(k) {
  const hedef = k.trH;
  tavafHazir(k, 0, DIS_R);
  k.trH = hedef === undefined ? halkaR(k.halka || 0) : hedef;
  k.ta = bosAci(k.halka || 0, k);
  k.tr = DIS_R;
}
function bosAci(l, ben) {
  const r = halkaR(l), acilar = [];
  for (const o of yuruyenler())
    if (o !== ben && o.trH !== undefined && !o.cikiyor && Math.abs(o.trH - r) < HALKA_ARA * 0.5)
      acilar.push(aciNorm(o.ta));
  if (!acilar.length)
    return BASLA_ACI - 0.3;
  acilar.sort((a, b) => a - b);
  let enIyi = 0, enGenis = -1;
  for (let i = 0; i < acilar.length; i++) {
    const a = acilar[i], b = i + 1 < acilar.length ? acilar[i + 1] : acilar[0] + TAU;
    if (b - a > enGenis) {
      enGenis = b - a;
      enIyi = a + (b - a) / 2;
    }
  }
  return enIyi;
}
function* yuruyenler() {
  for (const k of D.oy.values())
    yield k;
  for (const n of D.npc)
    yield n;
  for (const f of D.kafile)
    yield f;
}

/* ---- olaylar ---- */
// Hediye: adı büyük kartta çıkar, kademeye göre etkisi başlar. Gönderen ellerini dua için kaldırır (zip aralığı).
function oyunHediye(k, jeton, kademe) {
  tavafHazir(k, BASLA_ACI, DIS_R);
  const tip = kademe.tip;
  k.nurBit = Math.max(k.nurBit || 0, B) + (tip === 'gul' ? 10 : 16);
  D.hediyeKart = { tip, b: B };
  const KART = {
    gul: ['Gül gönderdi', 'İsmi nurlandı'],
    kafile: ['Gül demeti gönderdi', 'Kafileye katıldı'],
    isik: ['Harem ışıklarını yaktı', 'Allah razı olsun'],
    nur: ['Kâbe nurlandı', 'Adına büyük dua']
  }[tip];
  kartGoster(k.ad, KART[0], KART[1], tip, tip === 'nur' ? 7 : 4.2);
  if (tip === 'gul' || tip === 'nur')
    D.gulBit = Math.max(D.gulBit, B) + (tip === 'nur' ? 14 : 5);
  if (tip === 'kafile')
    kafileKur(k, Math.min(5, 2 + Math.floor(jeton / 25)));
  if (tip === 'isik' || tip === 'nur')
    D.isikBit = Math.max(D.isikBit, B) + clamp(jeton * 0.4, 40, 240);
  if (tip === 'nur') {
    D.nur = { k, b0: B, bit: B + 24 };
    k.yildiz = true;
    pankart(k.ad + ' için', 'Rabbimiz dualarını kabul etsin');
  }
}
function oyunLiderDegisti(eski, yeni) {
  pankart('En çok gönül veren', yeni.ad);
  yeni.nurBit = Math.max(yeni.nurBit || 0, B) + 8;
}
// Kafile: gönderenin arkasından gelen birkaç adsız tavafçı; bir süre onunla birlikte döner, sonra ayrılır.
function kafileKur(k, n) {
  for (let i = 0; i < n; i++) {
    const f = npcYap(k.ta - (i + 1) * 0.5 / Math.max(1.5, k.tr), DIS_R);
    f.sahip = k;
    f.sira = i + 1;
    f.bit = B + 64;
    D.kafile.push(f);
  }
  while (D.kafile.length > 15)
    D.kafile.shift();
}
function kartGoster(ad, satir1, satir2, tip, sn) {
  D.kart = { ad, satir1, satir2, tip, t0: zaman, sure: sn };
}

function oyunBaslat() {
  for (const k of D.sira) {
    tavafHazir(k, 0, halkaR(k.halka || 0));
    k.tr = k.trH;
    k.yer = 1;
    k.yeni = -9;
  }
  // açılışta herkes halkasında, eşit aralıklı dursun
  const halkalar = new Map();
  for (const k of [...D.sira, ...D.npc]) {
    if (!halkalar.has(k.halka))
      halkalar.set(k.halka, []);
    halkalar.get(k.halka).push(k);
  }
  for (const [l, dizi] of halkalar) {
    dizi.forEach((k, i) => {
      tavafHazir(k, 0, halkaR(l));
      k.ta = BASLA_ACI + 0.7 + (i / dizi.length) * TAU + l * 0.37;
      k.tr = k.trH;
    });
  }
  D.begeniHedef = begeniHedefBul(D.begeni);
  D.sonB = B;
  sahneStilKur();
  masaKur();
}
function oyunBosalt() {
  D.tamam = 0;
  D.kafile.length = 0;
  D.nur = null;
  D.kart = null;
  D.isikBit = -99;
  D.gulBit = -99;
  oyunYerlesim();
}
function oyunDurum(d) {
  d.tamam = D.tamam;
  d.npc = D.npc.length;
  d.kafile = D.kafile.length;
  d.isik = B < D.isikBit;
  d.nur = !!(D.nur && B < D.nur.bit);
  d.kart = D.kart && zaman - D.kart.t0 < D.kart.sure ? D.kart.ad : null;
  d.turlar = D.sira.map(k => [k.ad, k.tur]);
}

/* ---- beğeni hedefi ---- */
const BEGENI_BASAMAK = [100, 250, 500, 1000, 2000, 3000, 5000, 7000, 10000, 13000, 16000, 20000];
function begeniHedefBul(n) {
  for (const h of BEGENI_BASAMAK)
    if (h > n)
      return h;
  return (Math.floor(n / 5000) + 1) * 5000;
}
function begeniDenetle() {
  if (D.begeni >= D.begeniHedef && D.begeniHedef > 0) {
    let varilan = D.begeniHedef;
    for (const h of BEGENI_BASAMAK)
      if (h <= D.begeni)
        varilan = h;
    D.begeniHedef = begeniHedefBul(D.begeni);
    pankart(varilan.toLocaleString('tr-TR') + ' beğeni', 'Kalabalık çoğalıyor, teşekkürler');
    D.isikBit = Math.max(D.isikBit, B + 16);
  }
  else if (!D.begeniHedef)
    D.begeniHedef = begeniHedefBul(D.begeni);
}

/* ---- her kare ---- */
function oyunGuncelle(dt) {
  let dB = B - D.sonB;
  D.sonB = B;
  if (!(dB > 0) || dB > 2)
    dB = dt * 1.25; // dondurulmuş ya da sıçrayan saat: kısa bir adım say
  begeniDenetle();
  if (D.nur && B > D.nur.bit) {
    D.nur.k.yildiz = false;
    D.nur = null;
  }
  // kafile: sahibi gittiyse ya da süre bittiyse dağılır
  for (const f of D.kafile)
    if (!f.cikiyor && (B > f.bit || !D.oy.has(f.sahip.id) || f.sahip.cikiyor)) {
      f.cikiyor = true;
      f.trH = DIS_R + 0.6;
    }
  const hepsi = [...yuruyenler()];
  // aynı halkada öndekine çok yaklaşan yavaşlar (basit sıra tutma)
  for (const k of hepsi)
    k.yavas = 1;
  for (let i = 0; i < hepsi.length; i++) {
    const a = hepsi[i];
    for (let j = 0; j < hepsi.length; j++) {
      if (i === j)
        continue;
      const b = hepsi[j];
      if (Math.abs(a.tr - b.tr) > 0.42)
        continue;
      const fark = aciNorm(b.ta - a.ta) * Math.min(a.tr, b.tr); // b, a'nın ne kadar önünde (metre)
      if (fark < 1e-3 && i < j)
        continue; // tam üst üste: biri önde sayılır, ikisi birden durmasın
      if (fark < ADIM_ARA * 0.95)
        a.yavas = Math.min(a.yavas, clamp(fark / (ADIM_ARA * 0.95), 0.15, 1));
    }
  }
  for (const k of hepsi)
    yuruyenGuncelle(k, dt, dB);
  // gidenler
  D.npc = D.npc.filter(n => !(n.cikiyor && n.tr > DIS_R + 0.3));
  D.kafile = D.kafile.filter(n => !(n.cikiyor && n.tr > DIS_R + 0.3));
  duaSoyle();
  // gül yaprakları
  if (B < D.gulBit && !azHareket)
    for (let i = 0; i < 2; i++)
      if (Math.random() < 0.6 && D.yaprak.length < 140)
        D.yaprak.push({ x: Math.random() * GW, y: ALAN_UST - 30, vx: (Math.random() - 0.5) * 30, vy: 60 + Math.random() * 60, a: Math.random() * TAU, va: (Math.random() - 0.5) * 5, r: 5 + Math.random() * 5, renk: Math.random() < 0.7 ? '#c8283c' : '#e8566a' });
  for (const p of D.yaprak) {
    p.x += (p.vx + Math.sin(zaman * 2 + p.a) * 20) * dt;
    p.y += p.vy * dt;
    p.a += p.va * dt;
  }
  D.yaprak = D.yaprak.filter(p => p.y < ALAN_ALT + 20);
}
function yuruyenGuncelle(k, dt, dB) {
  if (k.ta === undefined)
    tavafHazir(k, Math.random() * TAU, DIS_R);
  if (k.cikiyor && !k.npc)
    k.trH = DIS_R + 0.8;
  // kafile üyesi sahibinin arkasında, aynı halkada
  if (k.sahip && !k.cikiyor) {
    k.trH = k.sahip.tr + (k.sira % 2 ? 0.28 : -0.28);
    const hedefA = k.sahip.ta - k.sira * 0.42 / Math.max(1.5, k.sahip.tr);
    k.ta += clamp(aciFark(k.ta, hedefA), -0.05, 0.05);
  }
  // yarıçap: yavaşça halkasına geçer (girişte içeri, çıkışta dışarı yürür)
  const dr = k.trH - k.tr;
  k.tr += Math.sign(dr) * Math.min(Math.abs(dr), (0.35 + Math.abs(dr) * 0.5) * dB);
  // açı: tavaf yönünde ilerler
  const hiz = HIZ * (k.yavas || 1) * (k.yildiz ? 0.6 : 1);
  const da = hiz * dB / Math.max(1.2, k.tr);
  const once = k.ta;
  k.ta += da;
  // tur: başlangıç çizgisini geçti mi (yalnız halkasına oturmuş izleyicide)
  if (!k.npc && !k.cikiyor && Math.abs(k.tr - k.trH) < 0.3) {
    const n0 = Math.floor((once - BASLA_ACI) / TAU), n1 = Math.floor((k.ta - BASLA_ACI) / TAU);
    if (n1 > n0) {
      if (k.turBasladi) {
        k.tur++;
        if (k.tur >= 7) {
          D.tamam++;
          k.tur = 0;
          k.tamamB = B;
          bildir(k.ad, 'tavafını tamamladı', 'Allah kabul etsin');
          gunluk('tavaf', k.ad, 'yedi turu tamamladı', true, k.id);
          k.nurBit = Math.max(k.nurBit || 0, B) + 8;
        }
      }
      else
        k.turBasladi = true;
      k.istilam = B; // Hacerü'l-Esved hizasında sağ el Kâbe'ye kalkar
    }
  }
  k.x = Math.cos(k.ta) * k.tr;
  k.z = Math.sin(k.ta) * k.tr;
  k.y0 = 0;
  k.yer = 1;
  // yön: halkaya teğet (saat yönünün tersine); girerken / çıkarken biraz içeri / dışarı döner
  const tx = -Math.sin(k.ta), tz = Math.cos(k.ta), rx = Math.cos(k.ta), rz = Math.sin(k.ta);
  const ic = clamp(dr * 0.8, -1.2, 1.2);
  const yon = Math.atan2(tx + rx * ic, tz + rz * ic);
  k.yon += aciFark(k.yon, yon) * Math.min(1, dt * 6);
  if (k.cikiyor && k.tr > DIS_R + 0.2)
    k.gitti = true;
  pozKur(k, hiz * (k.yavas || 1) > 0.05);
}
// Yürüme pozu: her vuruşta bir adım; hediye anında iki el duaya kalkar; başlangıç çizgisinde sağ el Kâbe'ye selam.
function pozKur(k, yuru) {
  const f = TAU * B / 2 + k.adimF, s = Math.sin(f), cs = Math.cos(f), adim = yuru ? 1 : 0.25;
  const poz = {
    hipX: 0, hipY: KALCA - 0.018 * Math.abs(s) * adim, egim: 0.03, yat: 0, omL: 0, omR: 0,
    aS: [-0.075, 0.085 * s * adim, Math.max(0, cs) * 0.04 * adim], aL: [0.075, -0.085 * s * adim, Math.max(0, -cs) * 0.04 * adim]
  };
  const dua = !k.npc && B >= k.zip0 && B < k.zip1 + 2;
  const istilam = k.istilam !== undefined && B - k.istilam < 2;
  const W = iskeletKur(k, poz);
  k.elSekil = null;
  if (dua) {
    // iki el, avuçlar yukarı, göğüs hizasında dua
    k.j.haR = W(-0.15, poz.hipY + 0.2, 0.2);
    k.j.haL = W(0.15, poz.hipY + 0.2, 0.2);
    k.elSekil = { R: 'avuc', L: 'avuc' };
  }
  else {
    const sal = 0.05 * s * adim;
    k.j.haR = istilam ? W(0.02, poz.hipY + 0.5, 0.12) : W(-0.19, poz.hipY + 0.04, -sal);
    k.j.haL = W(0.19, poz.hipY + 0.04, sal);
    if (istilam)
      k.elSekil = { R: 'avuc' };
  }
  // başı biraz Kâbe'ye dönük
  k.basYon = k.yon + 0.35;
  kolKur(k);
}

function oyunKamera() {
  let enR = HALKA0 + 0.6;
  for (const k of yuruyenler())
    if (!k.cikiyor && Math.abs(k.tr - k.trH) < 0.6)
      enR = Math.max(enR, k.trH);
  enR = Math.min(enR, DIS_R - 0.6) + 0.35;
  const n = [];
  for (let i = 0; i < 12; i++)
    n.push([Math.cos(i / 12 * TAU) * enR, Math.sin(i / 12 * TAU) * enR, 0.6]);
  return {
    noktalar: n,
    odak: [[-KABE_G / 2, -KABE_D / 2, 1], [KABE_G / 2, -KABE_D / 2, 1], [0, KABE_D / 2, 1]],
    odakEn: 1.9
  };
}

/* ---- adsız tavafçıların duaları ----
 * Adsız tavafçılar ve kafile üyeleri ara sıra kısa bir dua söyler (Amin, Allahu Ekber, Lebbeyk …): başlarının
 * üstünde küçük bir balon olarak çıkar (çizimi 30-baslik.js, duaBalonlari). Aynı anda en çok üç balon olur.
 * İzleyicilerin balonları onların gerçek yorumlarıdır; onlara dokunulmaz.
 */
const DUA_SURE = 3.2, DUA_EN_COK = 3;
let duaSonra = 0;
function duaSoyle() {
  if (zaman < duaSonra)
    return;
  duaSonra = zaman + 1.4 + Math.random() * 2.2;
  const adaylar = [...D.npc, ...D.kafile].filter(k => !k.cikiyor && k.et && k.trH < DIS_R - 0.5 && Math.abs(k.tr - k.trH) < 0.15 && !(k.dua && zaman - k.dua.t0 < DUA_SURE + 2));
  const acik = [...D.npc, ...D.kafile].filter(k => k.dua && zaman - k.dua.t0 < DUA_SURE).length;
  if (!adaylar.length || acik >= DUA_EN_COK)
    return;
  const k = adaylar[Math.floor(Math.random() * adaylar.length)], soz = OYUN.duaSoz || ['Amin'];
  k.dua = { m: soz[Math.floor(Math.random() * soz.length)], t0: zaman };
}
