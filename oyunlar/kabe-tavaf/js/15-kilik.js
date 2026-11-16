/* KILIK — tavaf eden insanın gövdesi: çekirdeğin insanEkle'si yerine bu oyuna özgü giysiler.
 *
 * Erkek: ihram. İki parça dikişsiz beyaz bez: belden baldıra izar, gövdede rida. Tavafta rida sağ koltuk altından
 * geçip sol omza atılır (ıztıba): sağ omuz ve sağ kol çıplak, sol omuz ve sol üst kol örtülü. Baş açık, ayakta
 * sandalet; bir kısmında sakal, bir kısmında para kuşağı.
 * Kadın: ayak bileğine kadar ferace (abaya), bilekte biten uzun kol, başı, boynu ve omuzları örten tesettür;
 * yüz ve eller açık. Renkler koyu (siyah, lacivert, kahve, yeşil) ya da beyaz (Güneydoğu Asya hacıları gibi).
 * Baş çekirdeğin kafaCiz'iyle çizilir (yüz, gözler); örtü ve sakal başın üstüne ayrıca çizilir.
 */
const IHRAM = '#f8f6f0', IHRAM_GOLGE = '#e4dfd2', IHRAM_KIVRIM = '#cfc8b6';
const FERACE_RENK = ['#17181f', '#1d2233', '#2a2230', '#2e2a26', '#1f2c2a', '#26324f', '#3b2e2a', '#f4f1ea'];
const ORTU_RENK = { '#f4f1ea': ['#f4f1ea', '#e9e4d8'], koyu: ['#17181f', '#2a2a33', '#3a3a46', '#f4f1ea', '#5a4a3a'] };
const SAKAL_RENK = ['#1d1612', '#2b1d14', '#3d2b1f', '#6b6b6b', '#c9c9c9'];

// Görünüş: kimlikten türer, aynı kişi her yayında aynı görünür
function kilikKur(k) {
  if (k.kilik)
    return;
  k.kilik = true;
  const g = k.g, r = rastgeleUret(ozet(k.id + ':kilik'));
  if (g.kadin) {
    const f = FERACE_RENK[Math.floor(r() * FERACE_RENK.length)];
    const ortu = f === '#f4f1ea' ? ORTU_RENK['#f4f1ea'][Math.floor(r() * 2)] : ORTU_RENK.koyu[Math.floor(r() * ORTU_RENK.koyu.length)];
    k.tv = { tur: 'ferace', ferace: f, ortu, katlama: renkKatHex(f === '#f4f1ea' ? '#d8d2c4' : f, f === '#f4f1ea' ? 0 : -0.35) };
    Object.assign(g, { baslik: 'hicab', sac: ortu, biyik: false, ayakkabi: f === '#f4f1ea' ? '#d6cdbd' : '#1a1410' });
  }
  else {
    k.tv = { tur: 'ihram', sakal: r() < 0.55 ? SAKAL_RENK[Math.floor(r() * SAKAL_RENK.length)] : null, kusak: r() < 0.35 ? (r() < 0.5 ? '#4f6b4a' : '#7a6248') : null };
    Object.assign(g, { baslik: 'yok', biyik: !!k.tv.sakal && r() < 0.7, ayakkabi: r() < 0.5 ? '#7a5a3a' : '#3b2c22' });
    if (k.tv.sakal)
      g.sac = k.tv.sakal === '#c9c9c9' || k.tv.sakal === '#6b6b6b' ? k.tv.sakal : g.sac;
  }
}
// #rrggbb rengini açar (t > 0, beyaza doğru) ya da koyulaştırır (t < 0)
function renkKatHex(h, t) {
  const n = parseInt(h.slice(1), 16), f = v => Math.round(t > 0 ? v + (255 - v) * t : v * (1 + t)).toString(16).padStart(2, '0');
  return '#' + f(n >> 16) + f((n >> 8) & 255) + f(n & 255);
}

// Çekirdeğin insanEkle'si gibi: gövde ve baş çizim listesine, k.et kurulur, çizildiyse true döner.
function tavafciEkle(k) {
  kilikKur(k);
  const j = k.j, g = k.g, p = k.p, boy = g.boy, tv = k.tv, ihram = tv.tur === 'ihram';
  k.et = null;
  for (const n in j)
    p[n] = pr(j[n]);
  if (!p.hip.ok || !p.kafa.ok)
    return false;
  const W3 = (a, ileri, yukari, taban) => [taban[0] + k.l[0] * a * boy + k.f[0] * ileri * boy, taban[1] + yukari * boy, taban[2] + k.l[2] * a * boy + k.f[2] * ileri * boy];
  const dzOrta = [(j.dzL[0] + j.dzR[0]) / 2, (j.dzL[1] + j.dzR[1]) / 2, (j.dzL[2] + j.dzR[2]) / 2];
  const ayOrta = [(j.ayL[0] + j.ayR[0]) / 2, (j.ayL[1] + j.ayR[1]) / 2, (j.ayL[2] + j.ayR[2]) / 2];
  const enYakin = Math.min(p.kbL.d, p.kbR.d, p.dzL.d, p.dzR.d, p.ayL.d, p.ayR.d);
  // bacaklar ve ayaklar
  for (const y of ['L', 'R']) {
    const kb = p['kb' + y], dz = p['dz' + y], ay = p['ay' + y];
    if (ihram) {
      kap(kb, 0.078 * boy, dz, 0.068 * boy, IHRAM);
      kap(dz, 0.058 * boy, ay, 0.05 * boy, g.ten);        // baldırlar açık
    }
    const a3 = j['ay' + y], uc = pr([a3[0] + k.f[0] * 0.075 * boy, a3[1] - 0.01, a3[2] + k.f[2] * 0.075 * boy]);
    kap(ay, 0.058 * boy, uc, 0.052 * boy, ihram ? g.ten : g.ayakkabi, (ay.d + uc.d) / 2 - 0.01);
    if (ihram) {
      // sandalet: tabanı ve üstteki kayış
      const t1 = pr([a3[0], a3[1] - 0.03, a3[2]]), t2 = pr([uc.ok ? a3[0] + k.f[0] * 0.085 * boy : a3[0], a3[1] - 0.035, a3[2] + k.f[2] * 0.085 * boy]);
      kap(t1, 0.05 * boy, t2, 0.046 * boy, g.ayakkabi, (ay.d + uc.d) / 2 - 0.005);
      const ks = pr([a3[0] + k.f[0] * 0.04 * boy, a3[1], a3[2] + k.f[2] * 0.04 * boy]);
      top(ks, 0.03 * boy, g.ayakkabi, (ay.d + uc.d) / 2 - 0.015);
    }
  }
  if (ihram) {
    // izar: belden dizin altına beyaz sargı; önde bindirmenin kıvrım çizgisi
    const etek = pr([dzOrta[0], dzOrta[1] - 0.03 * boy, dzOrta[2]]);
    kap(p.hip, 0.152 * boy, etek, 0.165 * boy, IHRAM_GOLGE, enYakin - 0.03);
    const k1 = pr(W3(-0.06, 0.13, 0.01, j.hip)), k2 = pr(W3(-0.03, 0.15, -0.03, dzOrta));
    const kd = (k1.d + k2.d) / 2 - 0.12;
    if (k1.ok && k2.ok)
      ozel(kd, () => cizgi(k1, k2, IHRAM_KIVRIM, Math.max(1, k1.s * 0.012)));
  }
  else {
    // ferace: bilekten aşağı inen geniş etek, önde düşen kıvrım
    const etek = pr([ayOrta[0], ayOrta[1] + 0.005 * boy, ayOrta[2]]);
    kap(p.hip, 0.16 * boy, etek, 0.225 * boy, tv.ferace, enYakin - 0.03);
    const k1 = pr(W3(0.02, 0.14, 0.0, j.hip)), k2 = pr(W3(0.035, 0.22, 0.02, ayOrta));
    const kd = (k1.d + k2.d) / 2 - 0.13;
    if (k1.ok && k2.ok)
      ozel(kd, () => cizgi(k1, k2, tv.katlama, Math.max(1, k1.s * 0.01)));
  }
  // gövde
  kap(p.hip, 0.148 * boy, p.gogus, 0.168 * boy, ihram ? IHRAM : tv.ferace, p.gogus.d - 0.01);
  if (ihram) {
    // ıztıba: sağ omuz ve göğsün sağ üstü açık; ridanın kenarı sol omuzdan sağ koltuk altına iner
    const om = pr(W3(-0.13, 0.02, 0.0, j.omR)), gs = pr(W3(-0.04, 0.115, 0.0, j.gogus));
    kap(om, 0.08 * boy, gs, 0.07 * boy, g.ten, Math.min(om.d, gs.d) - 0.03);
    const r1 = pr(W3(0.06, 0.07, 0.03, j.omL)), r2 = pr(W3(-0.12, 0.13, -0.09, j.gogus));
    const rd = Math.min(r1.d, r2.d, om.d, gs.d) - 0.04;
    if (r1.ok && r2.ok)
      ozel(rd, () => {
        // ridanın kenarı: sol omuzdan sağ koltuk altına inen kıvrımlı kumaş kenarı
        cizgi(r1, r2, IHRAM, Math.max(2, r1.s * 0.05));
        cizgi(r1, r2, IHRAM_KIVRIM, Math.max(1, r1.s * 0.012));
      });
    // sol omuzda ridanın düşen ucu
    const s1 = pr(W3(0.02, -0.02, 0.02, j.omL)), s2 = pr(W3(0.03, -0.06, -0.12, j.omL));
    kap(s1, 0.06 * boy, s2, 0.05 * boy, IHRAM_GOLGE);
    if (tv.kusak) {
      const b1 = pr(W3(0.1, 0, 0.0, j.hip)), b2 = pr(W3(-0.1, 0, 0.0, j.hip));
      kap(b1, 0.045 * boy, b2, 0.045 * boy, tv.kusak, Math.min(b1.d, b2.d) - 0.06);
    }
  }
  // kollar: ihramda sağ kol çıplak, sol üst kol örtülü; ferace bileğe kadar
  for (const y of ['L', 'R']) {
    const om = p['om' + y], dr = p['dr' + y], ha = p['ha' + y];
    const ust = ihram ? (y === 'R' ? g.ten : IHRAM) : tv.ferace, alt = ihram ? g.ten : tv.ferace;
    kap(om, (ihram && y === 'R' ? 0.05 : 0.058) * boy, dr, 0.05 * boy, ust);
    kap(dr, (ihram ? 0.044 : 0.05) * boy, ha, (ihram ? 0.04 : 0.047) * boy, alt);
    const sekil = k.elSekil && k.elSekil[y];
    if (ha.ok && (sekil === 'avuc' || sekil === 'yumruk')) {
      const gg = p.gogus;
      ozel(ha.d - 0.02, () => elSekilCiz(k, ha, dr, sekil, gg));
    }
    else if (ha.ok)
      liste.push({ d: ha.d - 0.02, t: 2, x: ha.x, y: ha.y, r: 0.055 * boy * ha.s, c: g.ten, w: Math.max(1, ha.s * 0.011) });
  }
  const ph = p.kafa, bo = k.basOlcek;
  if (!ihram) {
    // tesettür: boynu ve omuzları örten, göğse inen örtü (başın arkasında çizilir)
    const boyun = pr(W3(0, 0.01, 0.06, j.gogus)), cene = pr(W3(0, 0.02, -0.12, j.kafa));
    kap(boyun, 0.2 * boy, cene, 0.19 * boy, tv.ortu, ph.d - 0.03);
  }
  ozel(ph.d - 0.05, () => kafaCiz(k, ph, bo));
  ozel(ph.d - 0.06, () => basUstu(k, ph, bo));
  const et = k._et || (k._et = { x: 0, y: 0, s: 0, d: 0 }), R = KAFA_R * (bo === undefined ? g.boy : g.boy * bo) * ph.s;
  et.x = ph.x;
  et.y = ph.y - R;
  et.s = ph.s;
  et.d = ph.d;
  et.alt = ph.y + R;
  et.asagi = et.bx = et.by = undefined;
  k.et = et;
  return true;
}
function cizgi(a, b, renk, w) {
  c.strokeStyle = renk;
  c.lineWidth = w;
  c.lineCap = 'round';
  c.beginPath();
  c.moveTo(a.x, a.y);
  c.lineTo(b.x, b.y);
  c.stroke();
  c.lineCap = 'butt';
}
// Başın üstü: kadında yüzü çerçeveleyen örtü, erkekte sakal. Yüzün kameraya ne kadar döndüğü kafaCiz'deki gibi.
function basUstu(k, ph, olcek) {
  const g = k.g, tv = k.tv, R = KAFA_R * (olcek === undefined ? g.boy : g.boy * olcek) * ph.s, x0 = ph.x, y0 = ph.y;
  const yon = typeof k.basYon === 'number' ? k.basYon : k.yon, f = [Math.sin(yon), 0, Math.cos(yon)], l = [-Math.cos(yon), 0, Math.sin(yon)];
  const ku = kam.bu, kf = kam.bf;
  const fr = f[0] * kam.r[0] + f[2] * kam.r[2], fu = f[0] * ku[0] + f[2] * ku[2], fd = f[0] * kf[0] + f[2] * kf[2];
  const lr = l[0] * kam.r[0] + l[2] * kam.r[2], lu = l[0] * ku[0] + l[2] * ku[2];
  const N = (a, b, cc) => ({ x: x0 + R * (a * lr + cc * fr), y: y0 - R * (a * lu + b * ku[1] + cc * fu) });
  const cw = Math.max(1, ph.s * 0.012);
  if (tv.tur === 'ferace') {
    // yüzün çevresinde örtünün kenarı: başın dış halkası örtü renginde, yüz ortada açık kalır
    c.save();
    c.beginPath();
    c.arc(x0, y0, R - cw * 0.5, 0, TAU);
    c.clip();
    c.strokeStyle = tv.ortu;
    c.lineWidth = R * 0.34;
    c.beginPath();
    c.arc(x0, y0, R * 0.98, 0, TAU);
    c.stroke();
    // alnın üstü
    if (fd < 0.4) {
      const t = N(0, 0.62, 0.62);
      c.fillStyle = tv.ortu;
      c.beginPath();
      c.ellipse(t.x, t.y, R * 0.78, R * 0.32, 0, 0, TAU);
      c.fill();
    }
    else {
      c.fillStyle = tv.ortu;
      c.beginPath();
      c.arc(x0, y0, R, 0, TAU);
      c.fill();
    }
    c.restore();
    c.strokeStyle = MUREKKEP;
    c.lineWidth = cw;
    c.beginPath();
    c.arc(x0, y0, R, 0, TAU);
    c.stroke();
    // yandan ve arkadan bakınca örtünün kıvrımı
    if (fd >= -0.2) {
      c.strokeStyle = renkKatHex(tv.ortu === '#f4f1ea' || tv.ortu === '#e9e4d8' ? '#c8c0b0' : tv.ortu, tv.ortu.startsWith('#f') || tv.ortu.startsWith('#e') ? 0 : 0.25);
      c.lineWidth = cw * 1.2;
      const a = N(-0.2, 0.7, -0.5), b = N(0.25, -0.6, -0.6);
      c.beginPath();
      c.moveTo(a.x, a.y);
      c.quadraticCurveTo(x0 + (a.x - x0) * 0.1, y0, b.x, b.y);
      c.stroke();
    }
  }
  else if (tv.sakal && fd < 0.55) {
    // sakal: yüzün alt kenarını saran hilal; baş çemberinin içinde kalır, ağız açık bırakılır
    c.save();
    c.beginPath();
    c.arc(x0, y0, R - cw * 0.5, 0, TAU);
    c.clip();
    const cn = N(0, -0.78, 0.62);
    c.fillStyle = tv.sakal;
    c.beginPath();
    c.ellipse(cn.x, cn.y, R * 0.62, R * 0.42, 0, 0, TAU);
    c.fill();
    const ic = N(0, -0.48, 0.86);
    c.fillStyle = g.ten;
    c.beginPath();
    c.ellipse(ic.x, ic.y - R * 0.05, R * 0.34, R * 0.16, 0, 0, TAU);
    c.fill();
    c.restore();
    const m = N(0, -0.44, 0.86);
    if (fd < 0.2) {
      c.fillStyle = '#7a1f2a';
      c.beginPath();
      c.arc(m.x, m.y - R * 0.05, R * 0.11, 0, Math.PI);
      c.closePath();
      c.fill();
    }
    c.strokeStyle = MUREKKEP;
    c.lineWidth = cw;
    c.beginPath();
    c.arc(x0, y0, R, 0, TAU);
    c.stroke();
  }
}
