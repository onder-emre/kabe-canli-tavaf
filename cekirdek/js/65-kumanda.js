/* KUMANDA — oyunu TikTok LIVE Studio'nun "Link" kaynağında doğrudan çizdirmek, paneli ayrı bir sayfada tutmak.
 *
 * İki sayfa aynı başlatmaya bağlanır:
 *   Yayın sahnesi (KUMANDA_SAHNE): motorun /sahne/ adresi (Studio'ya "http://127.0.0.1.nip.io:8787/sahne/" yazılır).
 *     Yalnız sahneyi çizer, sesi kendisi çalar; görüntü ve ses pencere yakalamadan, kayıpsız yayına gider. Paneli yoktur.
 *   Panel: ana sayfadan açılan her zamanki oyun sayfası (Safari). Sahne bağlıyken kendi sesini kısar (muzik.uzakSustur,
 *     iki yerden ses çıkmasın); masada basılan düğmeler, yazılan alanlar ve yayıncının eylemleri (gizle, çıkar, balon)
 *     motor üzerinden sahneye iletilir, sahne aynısını kendi masasında yapar.
 * İletiler köprünün WebSocket'inden gider ({ tip: 'kumanda' }, yalnız panelden sahneye); sahne kendi durumunu
 * ({ tip: 'sahne-durum' }) yollar, motor panellere { tip: 'sahne', bagli, ses, acik, yeni } diye duyurur.
 * Yeni bir sahne bağlanınca (yeni: true) panel bütün ayarlarını yollar (durumGonder); oyun kendi ayarlarını
 * oyunKumandaTopla / oyunKumandaUygula kancalarıyla ekler, kendi iletilerini oyunKumanda ile alır (varsa).
 * Düğme kimliği: id'si varsa id; yoksa data-id'li liste satırının içindeki yeri; yoksa id'li en yakın atasından yol.
 * Sahne yalnız kendi #panel'inin içindeki öğelere basar.
 */
const KUMANDA_SAHNE = window.OYUN_SAHNE === true;
// Panelde sahneye iletilmeyenler: görünüm ve bağlantı düğmeleri, dosya seçici (sahnede pencere açardı), kendi iletisiyle
// giden eylemler (balon, gizle / çıkar listeleri), yalnız bu sayfanın arama ve süzgeçleri.
const KUMANDA_HARIC = '#yayin-gor, #bag-dugme, #bag-adres, #balon-dugme, #ses-dugme, #ses-cagri, #kisi-liste, #kisi-ara, #gunluk, #akis-suz, #mod-liste, #mod-temizle, [data-yerel]';
function kumandaYol(kok, el) {
  const y = [];
  while (el && el !== kok) {
    const p = el.parentElement;
    if (!p)
      return null;
    y.unshift([...p.children].indexOf(el));
    el = p;
  }
  return el === kok ? y : null;
}
function kumandaHedefYaz(el) {
  if (el.id)
    return { id: el.id };
  const li = el.closest('li[data-id]');
  if (li && li.parentElement && li.parentElement.id)
    return { liste: li.parentElement.id, veri: li.dataset.id, yol: kumandaYol(li, el) };
  const kok = el.parentElement && el.parentElement.closest('[id]');
  const yol = kok && kumandaYol(kok, el);
  return yol ? { kok: kok.id, yol } : null;
}
function kumandaHedefBul(h) {
  if (!h || typeof h !== 'object')
    return null;
  let el = null;
  if (typeof h.id === 'string')
    el = document.getElementById(h.id);
  else {
    if (typeof h.liste === 'string') {
      const ul = document.getElementById(h.liste);
      el = ul && [...ul.children].find(x => x.dataset && x.dataset.id === String(h.veri));
    }
    else if (typeof h.kok === 'string')
      el = document.getElementById(h.kok);
    if (!el || !Array.isArray(h.yol))
      return null;
    for (const i of h.yol) {
      el = el.children[i | 0];
      if (!el)
        return null;
    }
  }
  return el && $('panel').contains(el) ? el : null;
}
const Kumanda = {
  sahne: { bagli: 0, ses: null, acik: false },
  sesTamam: false, sonDurum: '', sonT: 0,
  yolla(o) {
    const w = Yayin.ws;
    if (!w || w.readyState !== 1)
      return false;
    try {
      w.send(JSON.stringify(o));
      return true;
    }
    catch (e) {
      return false;
    }
  },
  // Panelden sahneye: yalnız bir sahne bağlıyken.
  gonder(o) { return !KUMANDA_SAHNE && this.sahne.bagli > 0 && this.yolla(Object.assign({ tip: 'kumanda' }, o)); },
  acildi() { if (KUMANDA_SAHNE) { this.sonDurum = ''; this.durumBildir(); } },
  kapandi() {
    if (KUMANDA_SAHNE)
      return;
    this.sahne = { bagli: 0, ses: null, acik: false };
    muzik.uzakSustur(false);
    this.bilgiYaz();
  },
  al(m) {
    if (m.tip === 'sahne' && !KUMANDA_SAHNE)
      this.sahneGeldi(m);
    else if (m.tip === 'kumanda' && KUMANDA_SAHNE)
      this.uygula(m);
  },
  /* ---- panel ---- */
  sahneGeldi(m) {
    this.sahne = { bagli: Math.max(0, m.bagli | 0), ses: typeof m.ses === 'string' ? m.ses : null, acik: !!m.acik };
    muzik.uzakSustur(this.sahne.bagli > 0);
    this.bilgiYaz();
    if (this.sahne.bagli && m.yeni)
      this.durumGonder();
  },
  bilgiYaz() {
    if (KUMANDA_SAHNE)
      return;
    let p = $('sahne-bilgi');
    if (!p) {
      const ileti = $('bag-ileti');
      if (!ileti)
        return;
      p = document.createElement('p');
      p.id = 'sahne-bilgi';
      p.className = 'aciklama ileti';
      ileti.after(p);
    }
    const s = this.sahne;
    p.hidden = !s.bagli;
    if (!s.bagli) {
      sesYaz(); // ses düğmesi yeniden bu sayfanın sesini gösterir
      return;
    }
    p.textContent = 'Yayın sahnesi bağlı (TikTok LIVE Studio). Görüntü ve ses oradan yayına gidiyor; bu sayfa sessiz, buradaki düğmeler sahneyi yönetir.' +
      (!s.acik ? ' Sahnede oyunun sesi kapalı: açmak için Sesi aç\'a bas.' : s.ses !== 'running' ? ' Sahnede ses henüz başlamadı.' : '');
    // Ses düğmesi bu sayfanın değil, sahnenin sesini gösterir ve yönetir.
    $('ses-yazi').textContent = s.acik ? 'Sesi kapat' : 'Sesi aç';
    $('ses-dugme').classList.toggle('ana', !s.acik);
  },
  async durumGonder() {
    let oyun = null;
    try {
      if (typeof oyunKumandaTopla === 'function')
        oyun = await oyunKumandaTopla();
    }
    catch (e) {
      console.error(e);
    }
    this.gonder({ tur: 'durum', ayar: { balon: ayar.balon, yasak: ayar.yasak, gizli: ayar.gizli, cikan: ayar.cikan }, sirayla: muzik.sirayla, duzey: muzik.duzey, oyun });
  },
  // Şarkı dosyası: panel motora yükler, sahne kimliğiyle indirir.
  async dosyaYolla(blob) {
    const tur = blob.type && /^audio\/[\w.+-]+$/.test(blob.type) ? blob.type : 'application/octet-stream';
    const r = await fetch('/api/sarki', { method: 'POST', headers: { 'content-type': tur, 'x-kabe': 'sarki' }, body: blob });
    const j = await r.json();
    if (!j || !j.tamam || typeof j.id !== 'string')
      throw new Error((j && j.hata) || 'Şarkı yüklenemedi.');
    return j.id;
  },
  async dosyaAl(id) {
    if (!/^[a-f0-9]{24}$/.test(String(id)))
      throw new Error('Geçersiz şarkı kimliği.');
    const r = await fetch('/api/sarki/' + id, { cache: 'no-store' });
    if (!r.ok)
      throw new Error('Şarkı alınamadı.');
    return r.blob();
  },
  // Düğmeden önce aynı kutudaki yazı alanlarının o anki değeri gider. Sayfanın kendisinin doldurduğu değer (ör. son
  // YouTube linki, sayfa açılınca kutuya geri yazılır) input olayı üretmez; gitmezse sahnedeki kutu boş kalırdı.
  alanEsitle(kok) {
    if (!kok)
      return;
    const alanlar = kok.matches && kok.matches('input, textarea') ? [kok] : [...kok.querySelectorAll('input, textarea')];
    for (const t of alanlar) {
      if (t.type === 'file' || t.type === 'checkbox' || t.type === 'radio' || t.type === 'range' || t.closest(KUMANDA_HARIC))
        continue;
      const h = kumandaHedefYaz(t);
      if (h)
        this.gonder({ tur: 'deger', h, deger: String(t.value).slice(0, 4000), olay: 'input' });
    }
  },
  panelKur() {
    const panel = $('panel'), bagli = () => this.sahne.bagli > 0;
    document.addEventListener('click', e => {
      if (!e.isTrusted || !bagli())
        return;
      const b = e.target && e.target.closest ? e.target.closest('button') : null;
      if (!b || !panel.contains(b))
        return;
      if (b.id === 'ses-dugme' || b.id === 'ses-cagri') {
        this.gonder({ tur: 'ses', ac: b.id === 'ses-cagri' ? true : !this.sahne.acik });
        return;
      }
      if (b.closest(KUMANDA_HARIC))
        return;
      const h = kumandaHedefYaz(b);
      if (!h)
        return;
      this.alanEsitle(b.parentElement && b.parentElement.closest('[id]'));
      this.gonder({ tur: 'tik', h });
    }, true);
    const deger = e => {
      const t = e.target;
      if (!e.isTrusted || !bagli() || !t || !/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.type === 'file' || !panel.contains(t) || t.closest(KUMANDA_HARIC))
        return;
      const h = kumandaHedefYaz(t);
      if (h)
        this.gonder({ tur: 'deger', h, deger: String(t.value).slice(0, 4000), olay: e.type });
    };
    document.addEventListener('input', deger, true);
    document.addEventListener('change', deger, true);
    document.addEventListener('keydown', e => {
      const t = e.target;
      if (!e.isTrusted || !bagli() || e.key !== 'Enter' || !t || t.tagName !== 'INPUT' || !panel.contains(t) || t.closest(KUMANDA_HARIC))
        return;
      const h = kumandaHedefYaz(t);
      if (!h)
        return;
      this.alanEsitle(t);
      this.gonder({ tur: 'tus', h, key: 'Enter' });
    }, true);
    // Kendi iletisiyle giden eylemler: listelerdeki satırlar iki sayfada farklı sırada olabilir, kimlikle gider.
    const gz = izleyiciGizle, go = izleyiciGoster, ck = izleyiciCikar, ga = izleyiciGeriAl, ba = balonAyarla;
    izleyiciGizle = (id, ad) => { this.gonder({ tur: 'mod', is: 'gizle', id, ad }); return gz(id, ad); };
    izleyiciGoster = id => { this.gonder({ tur: 'mod', is: 'goster', id }); return go(id); };
    izleyiciCikar = (id, ad) => { this.gonder({ tur: 'mod', is: 'cikar', id, ad }); return ck(id, ad); };
    izleyiciGeriAl = id => { this.gonder({ tur: 'mod', is: 'geri', id }); return ga(id); };
    balonAyarla = v => { this.gonder({ tur: 'balon', v: !!v }); return ba(v); };
    muzik.dinle(() => this.bilgiYaz()); // sesYaz'dan sonra çalışır: ses düğmesi sahnenin durumunu göstersin
    this.bilgiYaz();
  },
  /* ---- yayın sahnesi ---- */
  durumBildir() {
    const ses = muzik.ctx ? muzik.ctx.state : 'yok', acik = !!muzik.acik, imza = ses + '|' + acik;
    if (imza === this.sonDurum && Date.now() - this.sonT < 10000)
      return;
    if (this.yolla({ tip: 'sahne-durum', ses, acik })) {
      this.sonDurum = imza;
      this.sonT = Date.now();
    }
  },
  sahneKur() {
    yayinModu(true);
    // Studio'nun tarayıcısında tıklama yok: ses kendiliğinden açılır. Tarayıcı izin vermezse 3 sn'de bir yeniden dener;
    // ses bir kez açıldıktan sonra yalnız panelden gelen ileti açar / kapatır.
    const dene = () => {
      if (this.sesTamam)
        return;
      if (muzik.acik) {
        this.sesTamam = true;
        return;
      }
      muzik.sesAc(true).then(ok => {
        if (ok) {
          this.sesTamam = true;
          sesYaz();
        }
        this.durumBildir();
      });
    };
    dene();
    const z = setInterval(() => { if (this.sesTamam) clearInterval(z); else dene(); }, 3000);
    setInterval(() => this.durumBildir(), 2000);
  },
  uygula(m) {
    switch (m.tur) {
      case 'tik': {
        const el = kumandaHedefBul(m.h);
        if (el && !el.disabled)
          el.click();
        break;
      }
      case 'deger': {
        const el = kumandaHedefBul(m.h);
        if (el && 'value' in el && el.type !== 'file') {
          el.value = String(m.deger == null ? '' : m.deger).slice(0, 4000);
          el.dispatchEvent(new Event(m.olay === 'change' ? 'change' : 'input', { bubbles: true }));
        }
        break;
      }
      case 'tus': {
        const el = kumandaHedefBul(m.h);
        if (el && m.key === 'Enter')
          el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        break;
      }
      case 'ses':
        this.sesTamam = true;
        sesDegistir(!!m.ac).then(() => this.durumBildir());
        break;
      case 'balon':
        balonAyarla(!!m.v);
        break;
      case 'mod': {
        const id = String(m.id || '').slice(0, 64), ad = m.ad == null ? undefined : String(m.ad).slice(0, 64);
        if (!id)
          break;
        if (m.is === 'gizle')
          izleyiciGizle(id, ad);
        else if (m.is === 'goster')
          izleyiciGoster(id);
        else if (m.is === 'cikar')
          izleyiciCikar(id, ad);
        else if (m.is === 'geri')
          izleyiciGeriAl(id);
        break;
      }
      case 'durum':
        this.durumUygula(m);
        break;
      case 'oyun':
        if (typeof oyunKumanda === 'function')
          oyunKumanda(m);
        break;
    }
  },
  durumUygula(m) {
    const a = m.ayar && typeof m.ayar === 'object' ? m.ayar : {};
    const gz = modKayit(a.gizli), ck = modKayit(a.cikan);
    for (const x of [...ayar.gizli])
      if (!gz.some(y => y.id === x.id))
        izleyiciGoster(x.id);
    for (const x of [...ayar.cikan])
      if (!ck.some(y => y.id === x.id))
        izleyiciGeriAl(x.id);
    for (const x of gz)
      izleyiciGizle(x.id, x.ad);
    for (const x of ck)
      izleyiciCikar(x.id, x.ad);
    if (typeof a.balon === 'boolean' && a.balon !== ayar.balon)
      balonAyarla(a.balon);
    if (Array.isArray(a.yasak)) {
      ayar.yasak = a.yasak.filter(x => typeof x === 'string' && x.length > 1).map(x => x.slice(0, 60)).slice(0, 200);
      $('yasak').value = ayar.yasak.join(', ');
      yasakUygula();
      ayarYaz();
    }
    if (typeof m.sirayla === 'boolean') {
      muzik.sirayla = m.sirayla;
      anahtarYaz('sirayla', muzik.sirayla, 'Havaları sırayla çal');
    }
    if (typeof m.duzey === 'number' && isFinite(m.duzey)) {
      const v = clamp(m.duzey, 0, 0.7);
      muzik.duzeyAyarla(v);
      $('ses-duzey').value = Math.round(v / 0.7 * 100);
    }
    if (typeof oyunKumandaUygula === 'function')
      Promise.resolve(oyunKumandaUygula(m.oyun || null)).catch(e => console.error(e));
  }
};
function kumandaBasla() {
  if (KUMANDA_SAHNE)
    Kumanda.sahneKur();
  else
    Kumanda.panelKur();
}
