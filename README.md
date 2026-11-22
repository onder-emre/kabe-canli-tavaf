# Kâbe Canlı Tavaf

TikTok canlı yayını için etkileşimli tavaf sahnesi. İzleyiciler yorum, beğeni ve hediyeyle sahneye katılır:

| İzleyici | Sahnede |
|---|---|
| Yorum yazar | Tavafa katılır, Kâbe'nin etrafında döner; adının yanında tur sayısı (3/7). Yedinci turda tavafı tamamlanır. |
| Beğeni atar | Beğeni hedefi dolar; hedefe ulaşınca teşekkür yazısı çıkar. |
| Gül (1 jeton) | Adı büyük kartta çıkar, gül yaprakları yağar. |
| Gül demeti (10 jeton) | Adına bir kafile tavafa katılır. |
| 100+ jeton | Harem ışıkları ve minareler yanar. |
| 500+ jeton | Kâbe nurlanır, adına büyük dua kartı. |
| En çok hediye atan | "Gönül verenler"in başında, Kâbe'ye en yakın halkada yürür. |

Erkekler ihramla (sağ omuz açık), kadınlar ferace ve tesettürle çizilir. Üstte dönen dua kartı: Rabbenâ duaları
ve Telbiye (Arapça, okunuşu, anlamı).

## Çalıştırma

Gerekli: [Node.js](https://nodejs.org) (LTS sürümü).

1. Depoyu indir (yeşil **Code → Download ZIP**) ve bir klasöre çıkar.
2. Başlat:
   - **Mac:** `BASLAT.command` dosyasına çift tıkla. macOS engellerse: Sistem Ayarları → Gizlilik ve Güvenlik →
     "Yine de Aç". Ya da Terminal'de bu klasöre gir ve `sh BASLAT.command` yaz.
   - **Windows:** `BASLAT.bat` dosyasına çift tıkla.
   - **Linux:** `sh BASLAT.sh`
3. Tarayıcıda açılan sayfada önce sarı **Dene** düğmesiyle sahte izleyicilerle dene.
4. Yayın için sağ üstteki bilete TikTok kullanıcı adını yaz, kırmızı **Yayın** düğmesine bas.
5. Sahneyi yayına ekle (aşağıda).

İlk açılışta TikTok bağlantı kütüphanesi bir kez iner (internet gerekir, yaklaşık bir dakika).

## TikTok LIVE Studio'ya ekleme

Oyun Studio'nun içinde doğrudan çizilir; ekran ya da pencere yakalanmaz, görüntü kayıpsız ve gecikmesiz, ses de
doğrudan yayına gider.

1. Studio'da **Add source → Link**.
2. Adres: `http://kabe.localhost:8787/sahne/` · **Turn on sound** açık · **Custom resolution** açıp 1080 × 1920.
3. **Add source**. Kaynağı sağ tıkla → **Full screen → Fit to screen**.

Bu adres hiç değişmez: oyun başlatılınca kendiliğinden görünür, oyun yokken "Oyun bekleniyor" yazar.

Tarayıcıdaki oyun sayfası artık **kumanda**dır: Studio'daki sahne bağlıyken masada "Yayın sahnesi bağlı" yazar,
sayfa kendi sesini kısar (ses Studio'dan gelir) ve masada bastığın her şey (şarkı sırası, ses düğmeleri, yasaklı
kelimeler, gizle / çıkar, Tavafı boşalt, B tuşu) sahnede de olur. Bilgisayardan eklenen şarkı dosyaları da
sahneye geçer. Tarayıcı sayfasını küçültebilir ya da arkaya alabilirsin; yayını etkilemez.

## Şarkılar

Yayın masasında **Bu oyunda → Şarkı sırası ve tavafçılar**: bilgisayardan ses dosyası (mp3, m4a, wav…) ya da
YouTube linki ekle; liste sırayla çalar, oklarla sırası değişir, ✕ ile çıkar. Liste tarayıcıda saklanır. Liste
boşken oyunun kendi ney ve kudüm müziği çalar.

## Geliştirme

```
npm install
npx playwright install chromium
node araclar/derle.js kabe-tavaf          # oyunlar/kabe-tavaf/js → oyun.html
node kopru.js --deneme --oyun kabe-tavaf --ac
node araclar/test.js kabe-tavaf            # bütün testler
node araclar/kare-cek.js kabe-tavaf        # sahne kareleri: test/cikti/kabe-tavaf/
node araclar/paket.js kabe-tavaf           # yayıncı paketi: dist/kabe-tavaf.zip
```

Oyunun kodu `oyunlar/kabe-tavaf/js/` içinde; `oyun.html` derlenmiş hâlidir, elle düzenlenmez. Ortak motor
`cekirdek/`, TikTok köprüsü `kopru.js`.

TikTok bağlantısı resmî olmayan bir kütüphaneyle (tiktok-live-connector) yapılır; bu yazılım TikTok ile bağlantılı
değildir.

## Lisans

Bu projenin kodu MIT lisanslıdır; ayrıntı [LICENSE](LICENSE) dosyasında. Çekirdek, MIT lisanslı bir altyapıdan
türetilmiştir ve özgün telif bildirimi LICENSE dosyasında korunur.

Üçüncü taraf bileşenler (bu depoya dahil değil, çalışırken yüklenir):

| Bileşen | Ne için | Lisans |
| --- | --- | --- |
| [tiktok-live-connector](https://www.npmjs.com/package/tiktok-live-connector) | TikTok canlı yayınındaki yorum, beğeni ve hediyeleri okumak | AGPL-3.0 |
| Google Fonts: Rubik, Paytone One, Amiri, Cormorant Garamond | Yazı tipleri | SIL Open Font License |
| YouTube IFrame oynatıcısı | Yayıncının seçtiği şarkıları çalmak | YouTube Hizmet Şartları |

Kur'an ayetleri ve dualar kamu malıdır. Sahnedeki bütün çizimler ve oyunun ney-kudüm müziği kodla üretilir.
