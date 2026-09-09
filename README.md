# FullStackAI Projesi

Yazdığın mesajın duygu durumunu yapay zekâ ile analiz eden bir sohbet
uygulaması. Aynı backend'i bir web ve bir mobil istemci kullanıyor;
analiz işini ayrı bir Python servisi yapıyor.

Amaç dört farklı teknolojinin (React, React Native, .NET, Python) tek
bir sistemde nasıl konuştuğunu uçtan uca göstermek.

## Nasıl çalışıyor?

```
web-chat (React)  ─┐
                   ├─→  .NET 8 Web API  ─→  Python AI servisi
MobileChat (Expo) ─┘         │                (FastAPI + Transformers)
                             ↓
                          SQLite
```

1. İstemci mesajı API'ye gönderir.
2. API mesajı Python servisine yollar, duygu etiketini (`POSITIVE` /
   `NEGATIVE`) alır.
3. Mesaj ve etiket SQLite'a kaydedilir, istemciye geri döner.

AI servisine ulaşılamazsa etiket `unknown` olur ve **mesaj yine de
kaydedilir** — analiz bir zenginleştirmedir, sohbetin kendisi ona
bağımlı değildir.

## Teknolojiler

| Katman | Kullanılanlar | Port |
|---|---|---|
| Web arayüz | React 19, Tailwind CSS, Create React App | 3000 |
| Mobil arayüz | React Native, Expo Router | 8081 |
| API | ASP.NET Core 8, EF Core, SQLite, Swagger | **5165** |
| AI servisi | Python, FastAPI, Transformers, Gradio | 8000 (Gradio: 7860) |

## Kurulum

Servisleri **şu sırayla** başlat: AI servisi → API → istemci.
API, AI servisi kapalıyken de çalışır (etiket `unknown` olur).

### 1. AI servisi

```bash
cd ai-service
python -m venv .venv
.venv\Scripts\activate        # macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

> İlk çalıştırmada model indirilir (birkaç yüz MB) ve `torch` paketi
> tek başına ~2 GB yer kaplar. Sadece CPU yetiyorsa daha küçük sürüm:
> `pip install torch --index-url https://download.pytorch.org/whl/cpu`

Kontrol: <http://localhost:8000/health> → `{"status":"ok", ...}`

### 2. Backend (API)

```bash
cd backend/KonusarakOgrenAPI
dotnet run
```

Veritabanı için ayrı bir komut **gerekmez**: uygulama açılırken
migration'ları kendisi uygular (`Program.cs`).

Kontrol: <http://localhost:5165/swagger>

### 3. Web arayüz

```bash
cd frontend/web-chat
copy .env.example .env        # macOS/Linux: cp .env.example .env
npm install
npm start
```

<http://localhost:3000> adresinde açılır.

### 4. Mobil arayüz

```bash
cd frontend/MobileChat
npm install
npx expo start
```

> **Adres uyarısı:** Mobilde `localhost`, telefonun/emülatörün kendisidir —
> geliştirme makinen değil. Varsayılanlar platforma göre ayarlandı
> (Android emülatörü için `10.0.2.2`), ama **gerçek bir telefonda**
> makinenin yerel IP'sini vermen gerekir:
> `EXPO_PUBLIC_API_URL=http://192.168.1.20:5165` (bkz. `.env.example`)

## Yapılandırma

Hiçbir adres artık koda gömülü değil.

| Yer | Değişken | Varsayılan |
|---|---|---|
| API | `AiService:BaseUrl` (appsettings.json) | `http://localhost:8000` |
| API | `Cors:AllowedOrigins` (appsettings.json) | `localhost:3000`, `localhost:8081` |
| Web | `REACT_APP_API_URL` | `http://localhost:5165` |
| Mobil | `EXPO_PUBLIC_API_URL` | platforma göre |
| AI | `SENTIMENT_MODEL`, `HOST`, `PORT` | `distilbert-...-sst-2-english`, `127.0.0.1`, `8000` |

## API

| Metot | Adres | Açıklama |
|---|---|---|
| POST | `/api/chat/send` | Mesaj gönderir, analiz eder, kaydeder |
| GET | `/api/chat?limit=100` | Son mesajları döner (en fazla 500) |
| GET | `/api/test` | Servis ayakta mı |

İstek gövdesi doğrulanır: `text` 1–1000 karakter olmalıdır.
`Sentiment` ve `CreatedAt` **sunucu tarafından** belirlenir; istemci
bu alanları gönderemez.

## Dizin yapısı

```
FullStackAI-Projesi/
├── ai-service/
│   ├── app.py                    # FastAPI + Gradio, /analyze ve /health
│   └── requirements.txt
├── backend/KonusarakOgrenAPI/
│   ├── Program.cs                # Kurulum, DbContext, varlıklar
│   ├── Controllers/ChatController.cs
│   ├── Dtos/ChatDtos.cs          # İstek/cevap modelleri
│   ├── Migrations/
│   └── appsettings.json
├── frontend/
│   ├── web-chat/                 # React (CRA) + Tailwind
│   └── MobileChat/               # Expo Router
└── README.md
```

## Bilinen eksikler

Bu bir öğrenme projesi; aşağıdakiler bilerek açık bırakıldı ve
üretimde kullanılmadan önce kapatılmalıdır:

- **Kimlik doğrulama yok.** `userId` istemciden geliyor; herkes
  başkasının kimliğiyle mesaj yazabilir. Gerçek uygulamada bu alan
  istekten değil, doğrulanmış oturumdan alınmalıdır.
- **Gerçek zamanlı değil.** WebSocket/SignalR yok; bir istemcinin
  gönderdiği mesaj diğerinde ancak sayfa yenilenince görünür.
- **Kullanıcı yönetimi yok.** `User` tablosu var ama hiç kullanılmıyor.
- **Test yok.**

## Lisans

MIT — ayrıntılar için [LICENSE](LICENSE) dosyasına bak.
