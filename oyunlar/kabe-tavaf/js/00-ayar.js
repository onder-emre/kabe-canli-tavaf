/* AYAR — Kâbe Canlı Tavaf yayınının bütün yazıları, hediye kademeleri, açılış kalabalığı ve sahte yorumları.
 * Derlemede HER ZAMAN İLK dosyadır; çekirdek OYUN'u buradan okur (docs/KANCALAR.md).
 * Oyun: yorum yazan izleyici tavafa katılır, Kâbe'nin etrafında (soldan, saat yönünün tersine) döner; her turu
 * adının yanında "3/7" diye sayılır, yedinci turda tavafı tamamlanır. Hediye atanın adı büyük kartta çıkar;
 * en çok hediye atan ("gönül veren") en içteki halkada, Kâbe'ye en yakın yürür.
 */
const OYUN = {
  id: 'kabe-tavaf',
  ad: 'Kâbe Canlı Tavaf',
  logo: ['Kâbe-i', 'Muazzama'],
  nasil: { yorum: 'Yorum: tavafa katıl', begeni: 'Beğeni: kalabalık', hediye: 'Hediye: ismin nurlansın' },
  yazi: {
    sira: 'Gönül verenler', gosterge: 'Beğeni', bos: 'Henüz kimse yok. İlk yorumu yazan tavafa başlar.',
    birim: 'kişi', ses: 'Ney sesini başlat', sahne: 'Kâbe etrafında tavaf sahnesi', giris: 'tavafa katılır',
    bosalt: 'Tavafı boşalt'
  },
  kapasite: 48,
  // Büyükten küçüğe. tip, oyunHediye'nin hangi etkiyi başlatacağını seçer; etki paneldeki tabloda ve sahnedeki
  // hediye kartlarında yazar (kart: kisa).
  kademe: [
    { min: 500, ad: 'Kâbe nurlanır', tip: 'nur', etki: 'Kâbe nurlanır, gönderenin adı parlar', kisa: 'Kâbe nurlanır' },
    { min: 100, ad: 'Harem ışıkları', tip: 'isik', etki: 'Harem ışıkları yanar, minareler parlar', kisa: 'Harem ışıkları yanar' },
    { min: 10, ad: 'Kafile', tip: 'kafile', etki: 'Gönderenin adına bir kafile tavafa katılır', kisa: 'Kafileye katılır' },
    { min: 1, ad: 'Gül', tip: 'gul', etki: 'Gönderenin adı nurlanır, gül yaprakları yağar', kisa: 'İsmin nurlanır, gül yağar' }
  ],
  tohum: [['Özdemir', 183], ['ItsMuko', 121], ['SOYDAN', 100], ['Hesam2', 80], ['zeynep', 50], ['Derya', 10], ['Kemal', 5], ['Naz', 1], ['Hüseyin', 0], ['SEMANUR', 0], ['ireemerdem', 0], ['Valeria', 0]],
  sahteAd: ['Fatih', 'zeynep', 'Hüseyin', 'Kemal', 'Naz', 'SEMANUR', 'ireemerdem', 'Valeria', 'Derya', 'KATAR27', 'elkoahmad', 'Malick', 'habab114', 'Fatima', 'senakavacnn', 'Elis', 'Bellnay', 'Emir.Mehmet', 'Baghlan68', 'David', 'Hesam2', 'Özdemir', 'ItsMuko', 'SOYDAN', 'yarwn', 'İrem', 'Ayşe_nur', 'muhammed.33', 'Büşra', 'Abdullah', 'Rukiye', 'Yusuf', 'Meryem.k', 'Hatice', 'Ömer_faruk', 'Elif', 'Bilal', 'Sümeyye', 'Hamza', 'Zehra', 'İbrahim', 'Esma', 'Selim', 'Kübra'],
  sahteYorum: ['Bismillahirrahmanirrahim', 'Lebbeyk Allahümme lebbeyk', 'Allah kabul etsin', 'Amin', 'Elhamdülillah', 'Maşallah', 'annem için dua edin', 'İnşallah bir gün gideceğim', 'Selamün aleyküm', 'Allahu Ekber', 'Subhanallah', 'Rabbim nasip etsin', 'babam için dua', 'Amin amin', 'La ilahe illallah', 'Allah razı olsun', 'Estağfirullah', 'Ya Rabbi', 'Amin ya Rabbi', 'Sübhanallahi ve bihamdihi'],
  // Adsız tavafçıların ve kafilenin ara sıra söylediği kısa dualar (sahnede küçük balon)
  duaSoz: ['Amin', 'Allahu Ekber', 'Lebbeyk Allahümme lebbeyk', 'Subhanallah', 'Elhamdülillah', 'Bismillah', 'Allah kabul etsin', 'Maşallah', 'Rabbim nasip etsin', 'La ilahe illallah', 'Estağfirullah', 'Ya Rabbi', 'Amin ya Rabbi', 'Allah razı olsun', 'Sübhanallahi ve bihamdihi'],
  // Gece Harem'i: lacivert gök, altın ışık, beyaz mermer. Panel çekirdeğin koyu temasında kalır.
  renk: { zemin: '#0b1330', zemin2: '#15214a', zemin3: '#26366c', cizgi: '#3b4d88', vurgu: '#e8c36a', sicak: '#a87a22', serin: '#63c9b6', acik: '#fbf5e4', soluk: '#b9c1dd' },
  // Yukarıdan bakan kamera: tavaf halkasının tamamı ve Kâbe birlikte görünsün.
  kamera: { egim: 0.64, F: 1000, ustPay: 2.6, altPay: 0.25 },
  etiket: { ustSinir: true, altSinir: true, disari: 'gizle', balonSira: 'derinlik' },
  sahneYazi: { pankart: 'alt' },
  // Müzik: ney ve kudüm (tekke / ilahi havası). İki özgün, sakin hava; tempo tavafın yürüyüş hızıdır.
  // Yayıncı kendi şarkılarını (ilahiler) masadaki "Şarkı sırası"ndan sırayla çaldırabilir.
  muzik: {
    takim: 'ney-kudum',
    havalar: [
      { id: 'harem', ad: 'Harem', bpm: 76, spb: 4, bar: 16, tonik: 293.7,
        dizi: [0, 150, 300, 500, 700, 800, 1000],                        // uşşak
        davul: { ana: 'D...k.T.D.k.T...', cesni: 'D...k.T.b.k.T.k.', gecis: 'D.k.T.k.D.kkT.kk' },
        ust: { ana: 'z...............', cesni: '........z.......', gecis: 'z.......z...z...' },
        bas: { ana: '1...............', cesni: '1.......5.......', gecis: '1.......5...8...' },
        bolum: {
          A: '0:4 1:2 2:2 3:4 2:4 | 3:4 4:4 3:2 2:2 1:4 | 2:2 3:2 4:4 5:4 4:4 | 3:4 2:2 1:2 0:8',
          B: '4:4 5:4 6:4 7:4 | 7:4 6:2 5:2 4:8 | 5:4 4:2 3:2 2:4 3:4 | 2:4 1:4 0~:8',
          D: '-:16 -:16'
        },
        eslik: { A: '0:16 3:16 4:16 0:16', B: '4:16 0:16 3:16 0:16' },
        form: 'AABBD' },
      { id: 'seher', ad: 'Seher', bpm: 84, spb: 4, bar: 8, tonik: 261.6,
        dizi: [0, 200, 350, 500, 700, 900, 1050],                        // rast
        davul: { ana: 'D.k.T.k.', cesni: 'D.kkT.k.', gecis: 'D.T.T.kk' },
        ust: { ana: 'z.......', cesni: '........', gecis: 'z...z...' },
        bas: { ana: '1...5...', cesni: '1.......', gecis: '1.5.8...' },
        bolum: {
          A: '0:2 2:2 4:4 | 3:2 2:2 3:4 | 4:2 5:2 4:2 3:2 | 2:4 1:4 | 2:2 3:2 4:4 | 5:2 4:2 3:2 2:2 | 1:2 2:2 1:2 -1:2 | 0:8',
          B: '7:4 6:2 5:2 | 6:4 5:4 | 4:2 5:2 6:2 5:2 | 4:8 | 3:2 4:2 5:4 | 4:2 3:2 2:4 | 1:2 2:2 3:2 1:2 | 0~:8',
          D: '-:8 -:8'
        },
        eslik: { A: '0:16 3:8 4:8 0:16 4:8 0:8', B: '4:16 0:16 3:16 4:8 0:8' },
        form: 'AABBD' }
    ]
  }
};
