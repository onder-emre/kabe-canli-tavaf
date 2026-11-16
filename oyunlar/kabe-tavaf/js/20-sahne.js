/* SAHNE — Mescid-i Haram gecesi: gök, revaklar, minareler, beyaz mermer metaf, tavaf halkaları, başlangıç çizgisi
 * ve ortada Kâbe (siyah örtü, altın kuşak, altın kapı, Hacerü'l-Esved köşesi). Görseller kodla çizilir.
 * Işıklar (100+ jeton) revak kandillerini ve minareleri yakar; nur (500+ jeton) Kâbe'den göğe ışık çıkarır.
 */
const MERMER = '#eeeae1', MERMER2 = '#d9d3c6', TAS = '#d6c7a8', TAS_KOYU = '#a8946f', ALTIN = '#d9ad4e', ALTIN_ACIK = '#f4d98c';
const KISVE = '#141419';

function isikGuc() { return clamp((D.isikBit - B) / 6, 0, 1); }
function nurGuc() { return D.nur ? clamp(Math.min((B - D.nur.b0) / 3, (D.nur.bit - B) / 4), 0, 1) : 0; }
// Dünyada yatay bir çember (y = 0): projeksiyonu yapılmış nokta dizisi
function cemberNoktalar(r, n, y) {
  const p = [];
  for (let i = 0; i <= n; i++) {
    const a = i / n * TAU;
    p.push(pr([Math.cos(a) * r, y || 0, Math.sin(a) * r]));
  }
  return p;
}
function yolCiz(p, kapat) {
  c.beginPath();
  let ilk = true;
  for (const q of p) {
    if (!q.ok)
      continue;
    if (ilk) {
      c.moveTo(q.x, q.y);
      ilk = false;
    }
    else
      c.lineTo(q.x, q.y);
  }
  if (kapat)
    c.closePath();
}

let gokBoya = null, yildizlar = null;
function oyunZemin() {
  // tur rozetleri için: etiket kutusu çekirdekte her karenin başında silinir, bir önceki karedekini sakla
  for (const k of D.oy.values())
    k.rozetKutu = k.etKutu;
  const isik = isikGuc(), nur = nurGuc();
  // gök
  if (!gokBoya) {
    gokBoya = c.createLinearGradient(0, 0, 0, GH);
    gokBoya.addColorStop(0, '#060a1f');
    gokBoya.addColorStop(0.35, '#0f1a44');
    gokBoya.addColorStop(0.55, '#26345e');
    gokBoya.addColorStop(1, '#3b3a52');
    const r = rastgeleUret(7);
    yildizlar = Array.from({ length: 70 }, () => [r() * GW, r() * 560, 0.6 + r() * 1.4, r() * TAU]);
  }
  c.fillStyle = gokBoya;
  c.fillRect(0, 0, GW, GH);
  for (const [x, y, s, f] of yildizlar) {
    c.globalAlpha = 0.35 + 0.35 * Math.sin(zaman * 0.8 + f);
    c.fillStyle = '#fdf6e0';
    c.fillRect(x, y, s, s);
  }
  c.globalAlpha = 1;
  // uzak taş zemin (revakların önü)
  yolCiz(cemberNoktalar(DIS_R + 1.6, 72), true);
  c.fillStyle = renkKat('#8f8a80', '#c9a95e', isik * 0.25);
  c.fill();
  // revaklar ve minareler: uzak yarım çember
  revakCiz(isik);
  // metaf: beyaz mermer, ortası ışıklı
  const kp = pr([0, 0, 0]);
  yolCiz(cemberNoktalar(DIS_R + 1.1, 96), true);
  const mb = c.createRadialGradient(kp.x, kp.y, 10, kp.x, kp.y, Math.max(200, kp.s * (DIS_R + 1)));
  mb.addColorStop(0, '#fbf9f3');
  mb.addColorStop(0.6, MERMER);
  mb.addColorStop(1, renkKat(MERMER2, '#e9c77a', isik * 0.3));
  c.fillStyle = mb;
  c.fill();
  // mermer derzleri: halkalar
  c.lineWidth = 1;
  c.strokeStyle = 'rgba(150,140,120,0.22)';
  for (let r = 1.9; r < DIS_R + 1; r += 0.8) {
    yolCiz(cemberNoktalar(r, 72), true);
    c.stroke();
  }
  // başlangıç çizgisi (Hacerü'l-Esved hizası)
  const b1 = pr([Math.cos(BASLA_ACI) * 1.6, 0, Math.sin(BASLA_ACI) * 1.6]), b2 = pr([Math.cos(BASLA_ACI) * (DIS_R + 1), 0, Math.sin(BASLA_ACI) * (DIS_R + 1)]);
  if (b1.ok && b2.ok) {
    c.strokeStyle = 'rgba(92,120,88,0.75)';
    c.lineWidth = Math.max(2, b1.s * 0.06);
    c.beginPath();
    c.moveTo(b1.x, b1.y);
    c.lineTo(b2.x, b2.y);
    c.stroke();
  }
  // Kâbe'nin yere vuran ışığı
  const isikR = kp.s * (2.6 + nur * 3);
  const kg = c.createRadialGradient(kp.x, kp.y, 0, kp.x, kp.y, isikR);
  kg.addColorStop(0, 'rgba(255,226,150,' + (0.18 + nur * 0.5) + ')');
  kg.addColorStop(1, 'rgba(255,226,150,0)');
  c.fillStyle = kg;
  c.fillRect(kp.x - isikR, kp.y - isikR, isikR * 2, isikR * 2);
  // gölgeler ve nurlanan izleyicinin ayağındaki ışık halkası
  for (const k of yuruyenler()) {
    golge(k.x, k.z, 0.23 * k.g.boy, 0.12 * k.g.boy);
    const nurlu = !k.npc && (B < (k.nurBit || 0) || k === D.lider);
    if (nurlu) {
      const g = pr([k.x, 0, k.z]);
      if (!g.ok)
        continue;
      const n = 1 + 0.1 * Math.sin(B * TAU), lider = k === D.lider;
      const gl = c.createRadialGradient(g.x, g.y, 0, g.x, g.y, g.s * 0.7);
      gl.addColorStop(0, 'rgba(255,215,120,0.75)');
      gl.addColorStop(1, 'rgba(255,215,120,0)');
      c.fillStyle = gl;
      c.beginPath();
      c.ellipse(g.x, g.y, g.s * 0.7, g.s * 0.38, 0, 0, TAU);
      c.fill();
      c.strokeStyle = lider ? ALTIN : 'rgba(244,217,140,0.9)';
      c.lineWidth = Math.max(2, g.s * (lider ? 0.035 : 0.025));
      c.beginPath();
      c.ellipse(g.x, g.y, 0.4 * g.s * n, 0.21 * g.s * n, 0, 0, TAU);
      c.stroke();
    }
  }
}

// Revaklar: Kâbe'nin arkasında yarım çember çizen iki katlı kemerli duvar; iki yanda minare.
function revakCiz(isik) {
  const R = DIS_R + 1.5, H = 3.3, n = 34, a0 = -0.22, a1 = Math.PI + 0.22;
  const duvar = renkKat(TAS, '#f5d68e', isik * 0.35), ic = renkKat('#3b3225', '#7a5a22', isik * 0.6);
  const P = (a, y) => pr([Math.cos(a) * R, y, Math.sin(a) * R]);
  // uzaktan yakına: önce en arkadaki (ortadaki) dilimler değil, kenarlardan ortaya değil — revak tek yüzey,
  // dilimler birbirini örtmez; sırayla çizmek yeterli
  for (let i = 0; i < n; i++) {
    const u0 = a0 + (a1 - a0) * i / n, u1 = a0 + (a1 - a0) * (i + 1) / n;
    const p = [P(u0, 0), P(u1, 0), P(u1, H), P(u0, H)];
    if (p.some(q => !q.ok))
      continue;
    cokgenCiz(p, duvar);
    // alt kat kemeri
    const kemer = (y0, y1, yay, gen) => {
      const yol = [];
      const L = (t, y) => pr([Math.cos(lerp(u0, u1, t)) * R, y, Math.sin(lerp(u0, u1, t)) * R]);
      yol.push(L(0.5 - gen, y0));
      yol.push(L(0.5 - gen, y1));
      for (let s = 0; s <= 8; s++) {
        const t = s / 8;
        yol.push(L(0.5 - gen + 2 * gen * t, y1 + yay * Math.sin(Math.PI * t)));
      }
      yol.push(L(0.5 + gen, y0));
      cokgenCiz(yol, ic);
      return L(0.5, y1 + yay * 0.6);
    };
    const lamba = kemer(0, 1.15, 0.45, 0.34);
    kemer(1.85, 2.25, 0.25, 0.26);
    // kandil
    if (lamba.ok) {
      const r = Math.max(2, lamba.s * 0.06) * (1 + isik * 0.8);
      c.fillStyle = renkKat('#c98f2e', '#fff1b8', 0.3 + isik * 0.7);
      c.beginPath();
      c.arc(lamba.x, lamba.y, r, 0, TAU);
      c.fill();
      if (isik > 0) {
        const g = c.createRadialGradient(lamba.x, lamba.y, 0, lamba.x, lamba.y, r * 6);
        g.addColorStop(0, 'rgba(255,220,130,' + 0.45 * isik + ')');
        g.addColorStop(1, 'rgba(255,220,130,0)');
        c.fillStyle = g;
        c.fillRect(lamba.x - r * 6, lamba.y - r * 6, r * 12, r * 12);
      }
    }
  }
  // korniş
  c.strokeStyle = renkKat(TAS_KOYU, '#f4d98c', isik * 0.5);
  c.lineWidth = 2;
  const ust = [];
  for (let i = 0; i <= n; i++)
    ust.push(P(a0 + (a1 - a0) * i / n, H));
  yolCiz(ust, false);
  c.stroke();
  for (const a of [Math.PI * 0.2, Math.PI * 0.8, Math.PI * 0.5])
    minareCiz(Math.cos(a) * (R + 0.9), Math.sin(a) * (R + 0.9), isik, a === Math.PI * 0.5 ? 1.15 : 1);
}
function minareCiz(x, z, isik, olc) {
  const t = pr([x, 0, z]), u = pr([x, 7.5 * olc, z]);
  if (!t.ok || !u.ok)
    return;
  const w = Math.max(5, t.s * 0.34);
  const govde = c.createLinearGradient(t.x - w, 0, t.x + w, 0);
  govde.addColorStop(0, renkKat('#bfb294', '#f3dc9c', isik * 0.4));
  govde.addColorStop(0.5, renkKat('#efe6d2', '#fff6d8', isik * 0.5));
  govde.addColorStop(1, renkKat('#a99a7a', '#d9b866', isik * 0.4));
  c.fillStyle = govde;
  c.beginPath();
  c.moveTo(t.x - w, t.y);
  c.lineTo(u.x - w * 0.7, u.y);
  c.lineTo(u.x + w * 0.7, u.y);
  c.lineTo(t.x + w, t.y);
  c.closePath();
  c.fill();
  // şerefeler
  for (const h of [0.45, 0.72]) {
    const s = pr([x, 7.5 * olc * h, z]);
    c.fillStyle = renkKat('#cbbf9f', '#ffe7a6', isik * 0.6);
    c.fillRect(s.x - w * 1.25, s.y - w * 0.3, w * 2.5, w * 0.45);
    if (isik > 0) {
      c.fillStyle = 'rgba(255,224,140,' + 0.9 * isik + ')';
      for (let i = -2; i <= 2; i++)
        c.fillRect(s.x + i * w * 0.5 - 1.5, s.y - w * 0.3 - 3, 3, 3);
    }
  }
  // külah ve alem
  c.fillStyle = renkKat('#5f6a5a', ALTIN, 0.35 + isik * 0.5);
  c.beginPath();
  c.moveTo(u.x - w * 0.7, u.y);
  c.lineTo(u.x, u.y - w * 2.6);
  c.lineTo(u.x + w * 0.7, u.y);
  c.closePath();
  c.fill();
  c.strokeStyle = ALTIN;
  c.lineWidth = Math.max(1.5, w * 0.15);
  c.beginPath();
  c.arc(u.x, u.y - w * 3.1, w * 0.35, 0.6, TAU - 0.6);
  c.stroke();
  if (isik > 0) {
    const g = c.createRadialGradient(u.x, u.y - w, 0, u.x, u.y - w, w * 7);
    g.addColorStop(0, 'rgba(255,230,150,' + 0.5 * isik + ')');
    g.addColorStop(1, 'rgba(255,230,150,0)');
    c.fillStyle = g;
    c.fillRect(u.x - w * 7, u.y - w * 8, w * 14, w * 14);
  }
}

// Kâbe ve yürüyenler: çizim listesine. Kâbe tek parça bir nesne (ozel), derinliği merkezinin derinliği.
function oyunCiz() {
  const m = pr([0, KABE_Y * 0.5, 0]);
  ozel(m.d, kabeCiz);
  for (const k of yuruyenler())
    if (tavafciEkle(k) && !k.npc)
      k.et.bx = k.et.x;
}
function kabeCiz() {
  const T = donusum(0, 0, 0, Math.PI), nur = nurGuc(), G = KABE_G / 2, Dd = KABE_D / 2, H = KABE_Y;
  // şazervan: alttaki mermer kaide
  kutuCiz(T, -G - 0.09, G + 0.09, 0, 0.16, -Dd - 0.09, Dd + 0.09, '#cfc8b8', 1.5);
  const g = kutuCiz(T, -G, G, 0.16, H, -Dd, Dd, KISVE, 2, { ust: '#2a2a31', yan: '#0b0b0f', arka: '#08080b' });
  // altın kuşak (hizam): görünen her yan yüzde
  const k0 = H * 0.7, k1 = H * 0.79;
  const kusak = (yuz, renk) => {
    if (yuz === 'on')
      return yuzCiz(T, [[-G, k0, Dd + 0.003], [G, k0, Dd + 0.003], [G, k1, Dd + 0.003], [-G, k1, Dd + 0.003]], renk);
    if (yuz === 'sol')
      return yuzCiz(T, [[G + 0.003, k0, -Dd], [G + 0.003, k0, Dd], [G + 0.003, k1, Dd], [G + 0.003, k1, -Dd]], renk);
    if (yuz === 'sag')
      return yuzCiz(T, [[-G - 0.003, k0, -Dd], [-G - 0.003, k0, Dd], [-G - 0.003, k1, Dd], [-G - 0.003, k1, -Dd]], renk);
    return null;
  };
  const altinOn = renkKat(ALTIN, '#fff1c0', nur * 0.6), altinYan = renkKat('#9c7a2e', ALTIN, nur * 0.6);
  for (const yuz of ['on', 'sol', 'sag'])
    if (g[yuz]) {
      const p = kusak(yuz, yuz === 'on' ? altinOn : altinYan);
      if (p)
        hatSusu(p, yuz === 'on' ? '#7c5a1c' : '#5a4214');
    }
  // ön yüzün altındaki ince altın yazı şeridi ve kapı
  if (g.on) {
    // kapı: Hacerü'l-Esved'e yakın yanda (kameradan bakınca sola), yerden yüksekte
    const k = yuzCiz(T, [[-0.78, 0.6, Dd + 0.01], [-0.18, 0.6, Dd + 0.01], [-0.18, 1.62, Dd + 0.01], [-0.78, 1.62, Dd + 0.01]], renkKat('#c08f2c', '#ffe6a0', nur * 0.6), 1.5);
    if (k) {
      // kapının süsü: iki kanat, çerçeve, kulp
      c.strokeStyle = '#7c5a1c';
      c.lineWidth = 1.2;
      const orta = (a, b, t) => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) });
      const ust = orta(k[3], k[2], 0.5), alt = orta(k[0], k[1], 0.5);
      c.beginPath();
      c.moveTo(ust.x, ust.y);
      c.lineTo(alt.x, alt.y);
      c.stroke();
      for (const t of [0.25, 0.55, 0.8]) {
        const sl = orta(k[0], k[3], t), sg = orta(k[1], k[2], t);
        c.beginPath();
        c.moveTo(sl.x, sl.y);
        c.lineTo(sg.x, sg.y);
        c.stroke();
      }
      c.fillStyle = ALTIN_ACIK;
      for (const t of [0.42, 0.58]) {
        const q = orta(orta(k[0], k[3], 0.45), orta(k[1], k[2], 0.45), t);
        c.beginPath();
        c.arc(q.x, q.y, 2, 0, TAU);
        c.fill();
      }
    }
    // kapının altındaki basamak izi
    yuzCiz(T, [[-0.86, 0.52, Dd + 0.012], [-0.1, 0.52, Dd + 0.012], [-0.1, 0.6, Dd + 0.012], [-0.86, 0.6, Dd + 0.012]], '#8c6a28');
    // kuşağın altında küçük altın kandil süsleri (örtüdeki yazı panolarını andırır)
    for (const a of [-0.95, 0.45, 0.95]) {
      const p = yuzCiz(T, [[a - 0.12, k0 - 0.36, Dd + 0.004], [a + 0.12, k0 - 0.36, Dd + 0.004], [a + 0.12, k0 - 0.1, Dd + 0.004], [a - 0.12, k0 - 0.1, Dd + 0.004]], '#3a2f1a');
      if (p)
        hatSusu(p, '#c9a14a');
    }
  }
  // Hacerü'l-Esved: sol ön köşede gümüş çerçeve
  const hp = pr(yerelNokta(T, -G - 0.02, 0.62, Dd + 0.02));
  if (hp.ok) {
    c.fillStyle = '#c9ccd2';
    c.beginPath();
    c.ellipse(hp.x, hp.y, hp.s * 0.13, hp.s * 0.17, 0, 0, TAU);
    c.fill();
    c.fillStyle = '#2a2224';
    c.beginPath();
    c.ellipse(hp.x, hp.y, hp.s * 0.07, hp.s * 0.1, 0, 0, TAU);
    c.fill();
  }
  // üst kenar: örtünün yukarıda toplandığı ince çizgi
  if (nur > 0) {
    // göğe yükselen nur
    const a = pr([0, H, 0]), b = pr([0, H + 9, 0]);
    if (a.ok && b.ok) {
      const w = a.s * KABE_G * 0.7;
      const gl = c.createLinearGradient(0, a.y, 0, b.y);
      gl.addColorStop(0, 'rgba(255,236,170,' + 0.75 * nur + ')');
      gl.addColorStop(1, 'rgba(255,236,170,0)');
      c.fillStyle = gl;
      c.beginPath();
      c.moveTo(a.x - w, a.y);
      c.lineTo(b.x - w * 1.8, b.y);
      c.lineTo(b.x + w * 1.8, b.y);
      c.lineTo(a.x + w, a.y);
      c.closePath();
      c.fill();
    }
    // Kâbe'nin çevresinde altın parıltı
    const m = pr([0, H * 0.55, 0]);
    if (m.ok) {
      const r = m.s * KABE_G * 1.3, gl = c.createRadialGradient(m.x, m.y, r * 0.3, m.x, m.y, r);
      gl.addColorStop(0, 'rgba(255,233,168,0)');
      gl.addColorStop(0.6, 'rgba(255,233,168,' + 0.28 * nur * (0.75 + 0.25 * Math.sin(zaman * 4)) + ')');
      gl.addColorStop(1, 'rgba(255,233,168,0)');
      c.fillStyle = gl;
      c.fillRect(m.x - r, m.y - r, r * 2, r * 2);
    }
  }
}
// Altın kuşağın içinde yazıyı andıran küçük kıvrımlar (okunur bir yazı değil, süs)
function hatSusu(p, renk) {
  const [a, b, cc, d] = p, n = 14;
  c.strokeStyle = renk;
  c.lineWidth = 1.2;
  c.beginPath();
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) / n;
    const al = { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) }, us = { x: lerp(d.x, cc.x, t), y: lerp(d.y, cc.y, t) };
    const mx = lerp(al.x, us.x, 0.5), my = lerp(al.y, us.y, 0.5), h = Math.hypot(us.x - al.x, us.y - al.y) * 0.28;
    c.moveTo(mx - h * 0.6, my + h * 0.3);
    c.quadraticCurveTo(mx, my - h * (i % 2 ? 1.2 : 0.6), mx + h * 0.6, my + h * 0.3);
  }
  c.stroke();
}
