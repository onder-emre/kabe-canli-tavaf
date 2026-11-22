/* BAŞLIK VE SAHNE ÜSTÜ — tuvalin üst kısmı (ALAN_UST'e kadar): Mescid-i Haram başlığı, "Kâbe-i Muazzama",
 * sayaçlar (tavaftaki kişi, beğeni hedefi, tamamlanan tavaf), dönen dua kartı (Arapça, okunuşu, anlamı), hediye
 * kartları. Hediye gelince dua kartının üstünde gönderenin adı büyük çıkar. Altındaki "Gönül verenler" satırı
 * çekirdeğin sıra kutusudur (sayfa öğesi); biçimi sahneStilKur'da bu oyuna göre değiştirilir.
 * Ayrıca: yürüyenlerin adının yanında tur rozeti ("3/7") ve yağan gül yaprakları. İzleyici adı yalnız fillText.
 */
const BASLIK_YAZI = '"Cormorant Garamond", Georgia, "Times New Roman", serif';
const ARAP_YAZI = 'Amiri, "Geeza Pro", "Al Bayan", "Traditional Arabic", "Arabic Typesetting", "Noto Naskh Arabic", "DejaVu Sans", serif';
const GOVDE_YAZI = 'Rubik, system-ui, sans-serif';
const DUALAR = [
  { ref: 'EL-BAKARA 2:201', ar: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
    ok: 'Rabbenâ âtinâ fi’d-dünyâ haseneten ve fi’l-âhireti haseneten ve kınâ azâbe’n-nâr',
    anlam: 'Rabbimiz! Bize dünyada da iyilik ver, ahirette de iyilik ver ve bizi ateş azabından koru.' },
  { ref: 'EL-BAKARA 2:127', ar: 'رَبَّنَا تَقَبَّلْ مِنَّا إِنَّكَ أَنْتَ السَّمِيعُ الْعَلِيمُ',
    ok: 'Rabbenâ tekabbel minnâ inneke ente’s-semîu’l-alîm',
    anlam: 'Rabbimiz! Bizden kabul buyur. Şüphesiz sen hakkıyla işitensin, hakkıyla bilensin.' },
  { ref: 'İBRAHİM 14:41', ar: 'رَبَّنَا اغْفِرْ لِي وَلِوَالِدَيَّ وَلِلْمُؤْمِنِينَ يَوْمَ يَقُومُ الْحِسَابُ',
    ok: 'Rabbenağfir lî ve li-vâlideyye ve li’l-mü’minîne yevme yekûmu’l-hisâb',
    anlam: 'Rabbimiz! Hesap gününde beni, anne babamı ve bütün müminleri bağışla.' },
  { ref: 'ÂL-İ İMRÂN 3:8', ar: 'رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِنْ لَدُنْكَ رَحْمَةً إِنَّكَ أَنْتَ الْوَهَّابُ',
    ok: 'Rabbenâ lâ tuzığ kulûbenâ ba’de iz hedeytenâ ve heb lenâ min ledünke rahmeh, inneke ente’l-vehhâb',
    anlam: 'Rabbimiz! Bizi doğru yola ilettikten sonra kalplerimizi kaydırma, bize katından rahmet bağışla.' },
  { ref: 'TELBİYE', ar: 'لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ، لَبَّيْكَ لَا شَرِيكَ لَكَ لَبَّيْكَ',
    ok: 'Lebbeyk Allâhümme lebbeyk, lebbeyke lâ şerîke leke lebbeyk',
    anlam: 'Buyur Allah’ım, emrindeyim. Buyur, senin hiçbir ortağın yoktur, emrindeyim.' }
];
const DUA_VURUS = 28;   // her dua kaç vuruş kalır

let basBoya = null;
let sarkiGorunur = false;
function oyunUst(dt) {
  sesUygula();
  sekmeDenetle();
  // çalan şarkının adı (sahnenin sol üstünde) yalnız yayıncının kendi şarkısı çalarken görünür
  if (sarkiGorunur !== !!muzik.disAd) {
    sarkiGorunur = !!muzik.disAd;
    document.body.classList.toggle('kabe-sarki', sarkiGorunur);
  }
  yapraklarCiz();
  turRozetleri();
  if (!basBoya) {
    basBoya = c.createLinearGradient(0, 0, 0, ALAN_UST + 30);
    basBoya.addColorStop(0, 'rgba(5,9,28,0.82)');
    basBoya.addColorStop(0.82, 'rgba(7,12,34,0.62)');
    basBoya.addColorStop(1, 'rgba(7,12,34,0)');
  }
  c.fillStyle = basBoya;
  c.fillRect(0, 0, GW, ALAN_UST + 30);
  c.textAlign = 'center';
  c.textBaseline = 'alphabetic';
  // üst satır
  yaziAralik(c, '4px');
  c.font = '600 15px ' + GOVDE_YAZI;
  c.fillStyle = RENK.vurgu;
  c.fillText('MESCİD-İ HARÂM · CANLI TAVAF', GW / 2, 32);
  yaziAralik(c, '0px');
  // başlık
  c.font = '700 58px ' + BASLIK_YAZI;
  c.shadowColor = 'rgba(232,195,106,0.55)';
  c.shadowBlur = 18;
  c.fillStyle = '#fff8e6';
  c.fillText('Kâbe-i Muazzama', GW / 2, 88);
  c.shadowBlur = 0;
  c.font = '500 21px ' + GOVDE_YAZI;
  c.fillStyle = RENK.acik;
  c.fillText('Yorum yaz, ismin tavafa katılsın', GW / 2, 118);
  // küçük bildiri: yorumla karakter seçme (15-kilik.js, oyunYorum)
  c.font = '500 14px ' + GOVDE_YAZI;
  c.fillStyle = RENK.vurgu;
  c.fillText('Yoruma “erkek” ya da “kadın” yaz, karakterin değişsin', GW / 2, 140);
  sayaclarCiz(150);
  duaKartCiz(188, 116);
  // Hediye kademe kartları yayında gösterilmez: ekranda "şu kadar jetona şu olur" yazmak hediye karşılığı vaat sayılır
  // (TikTok yapay etkileşim / hediye isteme). Kademeler masada yazılı; hediye gelince etki ve teşekkür kartı çıkar.
  isimKartiCiz(GH - 84, 66);
}
function yaziAralik(cx, v) {
  if ('letterSpacing' in cx)
    cx.letterSpacing = v;
}
function hap(x, y, w, h, renk, cizgi) {
  c.beginPath();
  c.roundRect(x, y, w, h, h / 2);
  c.fillStyle = renk;
  c.fill();
  if (cizgi) {
    c.strokeStyle = cizgi;
    c.lineWidth = 1.2;
    c.stroke();
  }
}
// İki hap: tavaftaki kişi, tamamlanan tavaf. Beğeni hedefi (sayı / hedef) gösterilmez: izleyiciyi hedef için ekrana
// art arda bastırmak TikTok'ta "beğeni ticareti / tekrarlanan hareketle etkileşim" sayılıp yayını kısıtlatıyor.
function sayaclarCiz(y) {
  const sayi = D.sira.length;
  const parca = [
    ['nokta', sayi.toLocaleString('tr-TR') + ' kişi tavafta'],
    ['kabe', D.tamam.toLocaleString('tr-TR') + ' tavaf tamam']
  ];
  c.font = '600 17px ' + GOVDE_YAZI;
  const ws = parca.map(p => c.measureText(p[1]).width + 46), ara = 10, top = ws.reduce((a, b) => a + b, 0) + ara * (parca.length - 1);
  let x = (GW - top) / 2;
  parca.forEach((p, i) => {
    const w = ws[i];
    hap(x, y, w, 30, 'rgba(9,14,38,0.85)', 'rgba(232,195,106,0.35)');
    const ix = x + 18, iy = y + 15;
    if (p[0] === 'nokta') {
      c.fillStyle = '#5fd88a';
      c.beginPath();
      c.arc(ix, iy, 5 + Math.sin(zaman * 3), 0, TAU);
      c.fill();
    }
    else if (p[0] === 'kalp')
      kalpIkon(ix, iy, 8, '#ff5b7a');
    else
      kabeIkon(ix, iy, 8);
    c.fillStyle = RENK.acik;
    c.textAlign = 'left';
    c.fillText(p[1], x + 32, y + 21);
    c.textAlign = 'center';
    x += w + ara;
  });
}
function kalpIkon(x, y, r, renk) {
  c.fillStyle = renk;
  c.beginPath();
  c.moveTo(x, y + r * 0.8);
  c.bezierCurveTo(x - r * 1.4, y - r * 0.1, x - r * 0.6, y - r * 1.1, x, y - r * 0.35);
  c.bezierCurveTo(x + r * 0.6, y - r * 1.1, x + r * 1.4, y - r * 0.1, x, y + r * 0.8);
  c.fill();
}
function kabeIkon(x, y, r) {
  c.fillStyle = '#16161c';
  c.fillRect(x - r, y - r * 0.85, r * 2, r * 1.7);
  c.fillStyle = ALTIN;
  c.fillRect(x - r, y - r * 0.4, r * 2, r * 0.3);
  c.fillRect(x - r * 0.55, y + r * 0.05, r * 0.45, r * 0.8);
}
// Köşeleri parantezli koyu kart
function cerceve(x, y, w, h, al) {
  c.globalAlpha = al === undefined ? 1 : al;
  c.beginPath();
  c.roundRect(x, y, w, h, 14);
  c.fillStyle = 'rgba(10,15,40,0.88)';
  c.fill();
  c.strokeStyle = 'rgba(232,195,106,0.35)';
  c.lineWidth = 1.2;
  c.stroke();
  c.strokeStyle = RENK.vurgu;
  c.lineWidth = 2;
  const u = 14, p = 7;
  for (const [cx, cy, sx, sy] of [[x + p, y + p, 1, 1], [x + w - p, y + p, -1, 1], [x + p, y + h - p, 1, -1], [x + w - p, y + h - p, -1, -1]]) {
    c.beginPath();
    c.moveTo(cx, cy + sy * u);
    c.lineTo(cx, cy);
    c.lineTo(cx + sx * u, cy);
    c.stroke();
  }
  c.globalAlpha = 1;
}
// Yazıyı genişliğe sığdırır: punto küçülür, en küçük puntoda da sığmazsa iki satıra böler
function sigdir(metin, x, y, en, punto, enAz, kalip) {
  let p = punto;
  c.font = kalip(p);
  while (c.measureText(metin).width > en && p > enAz) {
    p--;
    c.font = kalip(p);
  }
  if (c.measureText(metin).width <= en) {
    c.fillText(metin, x, y);
    return p;
  }
  // iki satır
  const k = metin.split(' ');
  let a = '', i = 0;
  while (i < k.length && c.measureText(a + k[i] + ' ').width < en)
    a += k[i++] + ' ';
  c.fillText(a.trim(), x, y - p * 0.55);
  c.fillText(k.slice(i).join(' '), x, y + p * 0.6, en);
  return p;
}
function duaKartCiz(y, h) {
  const x = 22, w = GW - 44;
  cerceve(x, y, w, h);
  // dua: DUA_VURUS vuruşta bir değişir, aradaki geçişte solup açılır
  const sira = Math.floor(Math.max(0, B) / DUA_VURUS), ic = (Math.max(0, B) % DUA_VURUS) / DUA_VURUS;
  const dua = DUALAR[sira % DUALAR.length], gor = clamp(Math.min(ic * 12, (1 - ic) * 12), 0, 1);
  c.globalAlpha = gor;
  c.textAlign = 'center';
  yaziAralik(c, '3px');
  c.font = '600 11px ' + GOVDE_YAZI;
  c.fillStyle = RENK.soluk;
  c.fillText(dua.ref, GW / 2, y + 20);
  yaziAralik(c, '0px');
  c.fillStyle = '#fff3d2';
  c.direction = 'rtl';
  sigdir(dua.ar, GW / 2, y + 54, w - 50, 30, 19, p => p + 'px ' + ARAP_YAZI);
  c.direction = 'ltr';
  c.fillStyle = RENK.vurgu;
  sigdir(dua.ok, GW / 2, y + 80, w - 46, 17, 12, p => 'italic 500 ' + p + 'px ' + BASLIK_YAZI);
  c.fillStyle = RENK.acik;
  sigdir(dua.anlam, GW / 2, y + 102, w - 46, 15, 11, p => '400 ' + p + 'px ' + GOVDE_YAZI);
  c.globalAlpha = 1;
}
// Hediye atanın adı: sahnenin altındaki boş zeminde, tavaf halkasının altında çıkar. Dua ve hediye kartları
// (hangi hediye ne yapar) hep görünür kalır; arka arkaya hediye gelse de üstleri kapanmaz.
function isimKartiCiz(y, h) {
  const kart = D.kart && zaman - D.kart.t0 < D.kart.sure ? D.kart : null;
  if (!kart)
    return;
  const a = clamp(Math.min((zaman - kart.t0) * 5, (kart.sure - (zaman - kart.t0)) * 3), 0, 1), w = 480;
  isimKarti(kart, (GW - w) / 2, y, w, h, a);
}
function isimKarti(k, x, y, w, h, a) {
  const kw = w, kh = h, kx = x, ky = y;
  const n = k.tip === 'nur', parla = 0.6 + 0.4 * Math.sin(zaman * 5);
  c.globalAlpha = a;
  c.save();
  c.translate(GW / 2, ky + kh / 2);
  const s = 0.92 + 0.08 * a;
  c.scale(s, s);
  c.translate(-GW / 2, -(ky + kh / 2));
  c.beginPath();
  c.roundRect(kx, ky, kw, kh, 16);
  c.fillStyle = n ? 'rgb(46,34,8)' : 'rgb(14,20,50)';
  c.fill();
  c.strokeStyle = n ? 'rgba(255,226,140,' + parla + ')' : 'rgba(232,195,106,0.8)';
  c.lineWidth = n ? 3 : 2;
  c.stroke();
  hediyeIkon(k.tip, kx + 42, ky + kh / 2, 18);
  c.textAlign = 'center';
  c.fillStyle = n ? '#ffe7a3' : '#ffd98a';
  c.shadowColor = 'rgba(255,214,120,0.7)';
  c.shadowBlur = 12;
  sigdir(k.ad, GW / 2 + 22, ky + kh / 2 + 2, kw - 120, 30, 18, p => '700 ' + p + 'px ' + BASLIK_YAZI);
  c.shadowBlur = 0;
  c.font = '500 14px ' + GOVDE_YAZI;
  c.fillStyle = RENK.acik;
  c.fillText(k.satir1 + ' · ' + k.satir2, GW / 2 + 22, ky + kh / 2 + 24, kw - 120);
  c.restore();
  c.globalAlpha = 1;
}
function hediyeIkon(tip, x, y, r) {
  if (tip === 'gul') {
    c.strokeStyle = '#3f8f4c';
    c.lineWidth = r * 0.12;
    c.beginPath();
    c.moveTo(x, y + r * 0.2);
    c.quadraticCurveTo(x - r * 0.15, y + r * 0.7, x + r * 0.05, y + r * 1.05);
    c.stroke();
    c.fillStyle = '#4fae6c';
    c.beginPath();
    c.ellipse(x + r * 0.28, y + r * 0.62, r * 0.25, r * 0.1, -0.6, 0, TAU);
    c.fill();
    for (const [dx, dy, rr, renk] of [[-0.25, -0.05, 0.38, '#b81d33'], [0.25, -0.05, 0.38, '#b81d33'], [0, -0.32, 0.4, '#d62f47'], [0, 0.05, 0.36, '#e2425a'], [0, -0.12, 0.18, '#8f1426']]) {
      c.fillStyle = renk;
      c.beginPath();
      c.arc(x + dx * r, y + dy * r, rr * r, 0, TAU);
      c.fill();
    }
  }
  else if (tip === 'kafile') {
    for (const [dx, s, renk] of [[-0.55, 0.75, '#e9e3d6'], [0.55, 0.75, '#2d2a3a'], [0, 1, '#fbf8f1']]) {
      c.fillStyle = renk;
      c.beginPath();
      c.arc(x + dx * r, y - r * 0.35 * s, r * 0.28 * s, 0, TAU);
      c.fill();
      c.beginPath();
      c.ellipse(x + dx * r, y + r * 0.45 * s, r * 0.36 * s, r * 0.5 * s, 0, Math.PI, 0);
      c.fill();
    }
  }
  else if (tip === 'isik') {
    c.fillStyle = ALTIN_ACIK;
    c.beginPath();
    c.arc(x, y, r * 0.8, 0, TAU);
    c.fill();
    c.globalCompositeOperation = 'destination-out';
    c.beginPath();
    c.arc(x + r * 0.35, y - r * 0.2, r * 0.68, 0, TAU);
    c.fill();
    c.globalCompositeOperation = 'source-over';
  }
  else {
    const yildiz = (cx, cy, rr) => {
      c.beginPath();
      for (let i = 0; i < 8; i++) {
        const a = i * Math.PI / 4 - Math.PI / 2, u = i % 2 ? rr * 0.32 : rr;
        c.lineTo(cx + Math.cos(a) * u, cy + Math.sin(a) * u);
      }
      c.closePath();
      c.fill();
    };
    c.fillStyle = ALTIN_ACIK;
    yildiz(x, y, r);
    yildiz(x + r * 0.75, y - r * 0.65, r * 0.4);
    yildiz(x - r * 0.7, y + r * 0.6, r * 0.3);
  }
}
// Dört hediye kartı: ikon, ad, jeton, etkisi. Az önce gelen hediyenin kartı parlar.
function hediyeKartlari(y, h) {
  const sirali = KADEME.slice().reverse(), n = sirali.length, ara = 9, x0 = 18, w = (GW - x0 * 2 - ara * (n - 1)) / n;
  sirali.forEach((kd, i) => {
    const x = x0 + i * (w + ara), son = D.hediyeKart.tip === kd.tip && B - D.hediyeKart.b < 6;
    const p = son ? 0.5 + 0.5 * Math.sin(zaman * 8) : 0;
    c.beginPath();
    c.roundRect(x, y, w, h, 12);
    c.fillStyle = son ? 'rgba(60,44,12,0.95)' : 'rgba(10,15,40,0.86)';
    c.fill();
    c.strokeStyle = son ? 'rgba(255,224,140,' + (0.6 + 0.4 * p) + ')' : 'rgba(232,195,106,0.3)';
    c.lineWidth = son ? 2.5 : 1.2;
    c.stroke();
    hediyeIkon(kd.tip, x + 22, y + 24, 12);
    c.textAlign = 'left';
    c.fillStyle = '#ffe3a0';
    const ad = kd.tip === 'kafile' ? 'Gül demeti' : kd.tip === 'isik' ? kd.min + '+ jeton' : kd.tip === 'nur' ? kd.min + '+ jeton' : kd.ad;
    sigdirSol(ad, x + 40, y + 24, w - 46, 18, 12, p => '600 ' + p + 'px ' + BASLIK_YAZI);
    c.font = '500 11px ' + GOVDE_YAZI;
    c.fillStyle = RENK.soluk;
    const alt = kd.tip === 'gul' || kd.tip === 'kafile' ? kd.min + ' jeton' : 'hediye gönder';
    c.fillText(alt, x + 40, y + 40);
    c.fillStyle = RENK.acik;
    satirla(kd.kisa || kd.ad, x + 9, y + 60, w - 16, 13, '500 13px ' + GOVDE_YAZI);
  });
  c.textAlign = 'center';
}
function sigdirSol(metin, x, y, en, punto, enAz, kalip) {
  let p = punto;
  c.font = kalip(p);
  while (c.measureText(metin).width > en && p > enAz) {
    p--;
    c.font = kalip(p);
  }
  c.fillText(metin, x, y, en);
}
// Kısa açıklamayı en çok iki satıra böler
function satirla(metin, x, y, en, ara, font) {
  c.font = font;
  const k = metin.split(' ');
  let a = '', i = 0;
  while (i < k.length && c.measureText(a + k[i]).width <= en)
    a += k[i++] + ' ';
  c.fillText(a.trim(), x, y, en);
  if (i < k.length)
    c.fillText(k.slice(i).join(' '), x, y + ara + 3, en);
}

// Adsız tavafçıların dua balonu: izleyici balonlarıyla aynı biçimde, biraz küçük; ad etiketlerinin üstünde çizilir
// (oyunSon, etiketlerden sonra çalışır).
function oyunSon() {
  duaBalonlari();
}
function duaBalonlari() {
  c.font = '700 17px ' + GOVDE_YAZI;
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  for (const k of [...D.npc, ...D.kafile]) {
    if (!k.dua || !k.et)
      continue;
    const t = zaman - k.dua.t0;
    if (t > DUA_SURE)
      continue;
    const a = clamp(Math.min(t * 5, (DUA_SURE - t) * 3), 0, 1), x = k.et.x, y = k.et.y - 8 - (1 - a) * 6;
    if (y - 34 < ALAN_UST || y > ALAN_ALT)
      continue;
    const w = c.measureText(k.dua.m).width + 22, h = 30, bx = clamp(x, w / 2 + 8, GW - w / 2 - 8);
    c.globalAlpha = a;
    c.fillStyle = RENK.vurgu;
    c.strokeStyle = MUREKKEP;
    c.lineWidth = 2.2;
    c.beginPath();
    c.roundRect(bx - w / 2, y - h, w, h, 12);
    c.fill();
    c.stroke();
    c.beginPath();
    c.moveTo(x - 7, y - 2);
    c.lineTo(x, y + 7);
    c.lineTo(x + 7, y - 2);
    c.stroke();
    c.fill();
    c.fillStyle = MUREKKEP;
    c.fillText(k.dua.m, bx, y - h / 2 + 1);
  }
  c.globalAlpha = 1;
  c.textBaseline = 'alphabetic';
}
// Tur rozeti: adın sağında "3/7". Etiketin kutusu çekirdekte bir önceki karede yazılır; yürüyüş yavaş olduğu için
// bir kare geriden gelmesi gözle görülmez.
function turRozetleri() {
  c.font = '700 12px ' + GOVDE_YAZI;
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  for (const k of D.oy.values()) {
    const e = k.rozetKutu;
    if (!e || k.cikiyor || !k.et)
      continue;
    const tur = Math.min(7, (k.tur || 0) + 1), yeniBitti = k.tamamB !== undefined && B - k.tamamB < 6;
    const metin = yeniBitti ? '7/7' : tur + '/7', w = 30, h = e[3] - 4, x = e[0] + e[2] + 2, y = e[1] + 2;
    if (x + w > GW)
      continue;
    hap(x, y, w, h, yeniBitti ? RENK.vurgu : tur >= 5 ? '#8fd694' : 'rgba(176,226,140,0.95)', null);
    c.fillStyle = '#0d1a10';
    c.fillText(metin, x + w / 2, y + h / 2 + 1);
  }
  c.textBaseline = 'alphabetic';
}
function yapraklarCiz() {
  for (const p of D.yaprak) {
    c.save();
    c.translate(p.x, p.y);
    c.rotate(p.a);
    c.fillStyle = p.renk;
    c.beginPath();
    c.ellipse(0, 0, p.r, p.r * 0.55, 0, 0, TAU);
    c.fill();
    c.restore();
  }
}

/* ---- sayfa öğelerinin (sıra kutusu, bildirim, pankart) bu oyundaki biçimi ----
 * Çekirdeğin yazıları yerinde kalır (testler ve masa onları okur), yalnız görünüşleri değişir: üstteki logo ve
 * gösterge yerine tuvalin başlığı çizildiği için onlar gizlenir; sıra kutusu "Gönül verenler" satırı olur.
 */
function sahneStilKur() {
  if (document.getElementById('kabe-stil'))
    return;
  const s = document.createElement('style');
  s.id = 'kabe-stil';
  s.textContent = `
.hud-ust{display:none}
.ses-cagri{display:none!important}
.cosku{top:40.3cqh;left:3cqw;right:auto;width:44cqw;text-align:left;opacity:0;pointer-events:none}
.cosku h2,.cosku .cubuk{display:none}
.cosku .bilgi{font-size:2.1cqw;opacity:.85;color:#3b3220;text-shadow:none;background:rgba(251,245,228,.7);
  border-radius:1.2cqw;padding:.5cqw 1.2cqw;display:inline-block}
.sira{top:32cqh;left:2.5cqw;right:2.5cqw;width:auto;background:rgba(9,14,38,.86);border:1px solid rgba(232,195,106,.4);
  border-radius:2.2cqw;padding:1cqw 1.6cqw 1.3cqw;font-size:2.4cqw}
.sira h2{text-align:center;font-family:Rubik,system-ui,sans-serif;font-weight:600;font-size:1.75cqw;letter-spacing:.32em;
  text-transform:uppercase;color:var(--vurgu);margin:0 0 .9cqw;text-shadow:none}
.sira ol{flex-direction:row;gap:1.2cqw}
.sira li{flex:1 1 0;display:grid;grid-template-columns:auto 1fr;grid-template-rows:auto auto;column-gap:1cqw;row-gap:.1cqw;
  align-items:center;background:transparent;padding:0;border-radius:0}
.sira li .no{grid-row:1/3;width:5.6cqw;height:5.6cqw;font-size:2.6cqw;background:#26366c;color:var(--acik);
  border:.3cqw solid rgba(232,195,106,.55)}
.sira li .ad{grid-column:2;font-weight:600;font-size:2.35cqw;color:var(--acik)}
.sira li .jt{grid-column:2;font-size:2cqw;font-weight:500;color:var(--soluk)}
.sira li .jt::after{content:" jeton"}
.sira li.bas{background:transparent}
.sira li.bas .no{background:var(--vurgu);color:#1a1405;box-shadow:0 0 1.6cqw rgba(232,195,106,.8)}
.sira li.bas .ad{color:#ffe3a0}
.sira li.bas .jt{color:var(--vurgu)}
.sira .bos{background:transparent;text-align:center;color:var(--soluk);padding:.6cqw}
.bildirim{top:41cqh}
.bildirim div{background:rgba(251,245,228,.95)}
.bildirim div b{color:#8a6414}
.pankart{background:rgba(12,18,48,.94);border-block:.5cqw solid var(--vurgu)}
.pankart.alt{top:47cqh}
.pankart .b1{font-family:"Cormorant Garamond",Georgia,serif;font-weight:700;color:#fff3d2}
`;
  document.head.append(s);
  // Sahnedeki "Ney sesini başlat" düğmesi gizli: ses masadan açılıp kapanır. Yalnız sahnenin gösterildiği sayfada
  // (#yayin) masa yoktur; orada sahneye ilk tıklama sesi bir kez açar (tarayıcı sesi ancak bir tıklamayla başlatır).
  const sahne = document.getElementById('sahne');
  if (sahne)
    sahne.addEventListener('pointerdown', () => {
      if (!muzik.acik && document.getElementById('ses-dugme'))
        document.getElementById('ses-dugme').click();
    }, { once: true });
  // Başlık ve dua yazı tipleri (Google Fonts; yüklenmezse yedek yazı tipleri). Amiri: Arapça, Cormorant: başlık.
  if (!window.OYUN_YAZI_KAPALI && !document.getElementById('kabe-yazi')) {
    const l = document.createElement('link');
    l.id = 'kabe-yazi';
    l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Cormorant+Garamond:ital,wght@0,600;0,700;1,500&display=swap';
    document.head.append(l);
  }
}
