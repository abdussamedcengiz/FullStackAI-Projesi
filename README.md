# FullStack + AI Chat Stajyer Projesi

## Proje Özeti
Kullanıcıların web ve mobilde mesajlaşabildiği, anlık olarak mesajlara AI (duygu analizi) skoru entegre edilen bir fullstack projedir. Tüm backend, frontend ve AI hizmetleri ücretsiz platformlarda deploy edilebilir yapıdadır.

---
## Klasör Yapısı

```
FullStackAI/
  |__ ai-service/     # Hugging Face Spaces için AI (duygu analizi) API servisi (Python)
  |__ backend/        # .NET Core API + SQLite veritabanı (Render deploy için hazır)
  |__ frontend/       # Web (React) ve Mobil (React Native CLI/Expo) arayüzleri
```

---
## Servisler ve Açıklamalar

### 1. **AI Servisi (`ai-service/`)
- **Temel işlev**: Gradio + FastAPI ile sentiment (duygu) analizi REST API'si
- **deploy**: Hugging Face Spaces ile (ücretsiz)
- **Kritik dosya**: `app.py`
    - `/analyze` endpointi: JSON POST ile metni analiz eder (elle yazılmış + AI ile model kullanımı)
- **requirements.txt** dosyası içerir

### 2. **Backend (`backend/`)
- **Temel işlev**: Kullanıcı ve mesaj kayıt-endpointleri, AI servisi ile entegrasyon
- **deploy**: Render.com (ücretsiz web service olarak)
- **Kritik dosyalar:**
    - `KonusarakOgrenAPI/Controllers/ChatController.cs` (Mesaj kaydı, AI servisini çağıran endpoint) **(elle yazılmış önemli logic!)**
    - `Program.cs` (Entity/db model, context, migration)
- AI ile yazılan (sentiment) endpoint entegrasyonu - elle yazılmış API çağrısı ve model yönetimi

### 3. **Frontend (`frontend/`)
#### Web
- **Teknoloji:** React (+Tailwind)
- **Kritik dosya:** `web-chat/src/App.js`
    - Mesaj gönderip backend'den analiz sonucu alan ve ekranda gösteren fonksiyonlar (**elle yazılmış**) + UI
- **deploy**: Vercel (ücretsiz)

#### Mobil
- **Teknoloji:** React Native CLI/Expo
- **Kritik dosya:** `MobileChat/app/(tabs)/index.tsx`
    - Mobilde mesajı backend'e gönderip sentiment sonucunu ekrana işleyen logic (**elle yazılmış**)

---
## Deployment Rehberi

### 1. AI Servisi (`ai-service/`)
- Hugging Face Spaces'ta yeni bir Space açın (Gradio & Python olarak)
- `app.py` ve `requirements.txt` yükleyin
- Space açıldığında `/analyze` endpointinizi test edin: `POST .../analyze { "text": "örnek mesaj" }`

### 2. Backend (`backend/`)
- Render.com'a kaydolun → New Web Service → repo seçin
- Root: `backend/KonusarakOgrenAPI` olacak şekilde publish edin
- SQLite dosyası otomatik oluşturulur (ilgili migration logic'i var)
- AI Servisi ile backend arası endpoint adresini `.cs` dosyasında elle güncelleyin!

### 3. Frontend Web (`frontend/web-chat`)
- `npm install && npm run build` ile Vercel'e deploy edin
- API adresini, backend endpointinizi gösterecek şekilde `src/App.js` içinde değiştirin

### 4. Frontend Mobil (`frontend/MobileChat`)
- `npm install` ardından `npx expo start` ile çalıştırın
- Eğer APK build almak isterseniz, Expo EAS veya klasik React Native CLI yolunu seçebilirsiniz
- API adresini kodun başındaki satırdan alın

---
## Özelleştirme ve Geliştirme
- Rumuz/kullanıcı girişi kolayca eklenebilir (backend modelinde mevcut)
- Mesaj listesi canlı güncellenir, yeni mesajlarda sentiment anlık olarak gelir
- Tasarım ve iş mantığı tamamen açık ve geliştirilebilir yapıdadır

---
## Kod Hakimiyeti Notları
- Tüm .NET backend API, veri modeli, frontend mesaj yönetimi ve AI REST entegrasyonu elle yazılmıştır.
- AI aracının yazdığı kısım: Sadece `app.py` içinde model çağrısı (transformers pipeline) ve örnek analiz fonksiyonu. Tüm API ve uygulama logic'i elle hazırlanmıştır.
- Her kritik dosyanın başında kısa işlev açıklaması veya satır içi comment bulunur.

---
## Desteklenen platformlar ve link paylaşımları
Teorik olarak tamamlanmış yapıdır. Aktif deploy örnekleri için kendi repository ve deploy adreslerinizi kullanıcıya yazabilirsiniz.

---
## Sorularınız ve geliştirme desteği için
Tüm soruları repo Issues kısmından paylaşabilirsiniz. Kolay gelsin!


