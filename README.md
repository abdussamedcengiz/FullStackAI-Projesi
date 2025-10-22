# FullStackAI Projesi

FullStackAI, gerçek zamanlı web ve mobil sohbet uygulaması ile yapay zekâ servislerini buluşturan, uçtan uca örnek bir fullstack projedir.

## İçindekiler
- [Özellikler](#özellikler)
- [Teknolojiler](#teknolojiler)
- [Kurulum](#kurulum)
- [Kullanım](#kullanim)
- [Dizin Yapısı](#dizin-yapısı)
- [Katkıda Bulunma](#katkıda-bulunma)
- [Lisans](#lisans)

## Özellikler
- React tabanlı web sohbet arayüzü
- Expo + React Native mobil sohbet uygulaması
- .NET 8 Web API backend
- Python tabanlı yapay zeka servis entegrasyonu
- SQLite veritabanı kullanımı

## Teknolojiler
- **Frontend (Web):** React, Tailwind CSS
- **Frontend (Mobil):** React Native, Expo, NativeWind
- **Backend:** ASP.NET Core Web API
- **AI Servis:** Python, Flask (örnek)

## Kurulum

### 1. Ana Dizin
```sh
cd FullStackAI-Projesi
```

### 2. Backend (API)
```sh
cd backend/KonusarakOgrenAPI
# .NET 8+ yüklü olmalı
dotnet build
dotnet ef database update # ilk kurulum için
dotnet run
```

### 3. Yapay Zekâ Servisi
```sh
cd ai-service
# Python 3.8+ ve virtualenv ile kütüphaneleri yükleyin
pip install -r requirements.txt
python app.py
```

### 4. Web Sohbet (React)
```sh
cd frontend/web-chat
npm install
npm start
```

### 5. Mobil Sohbet (Expo)
```sh
cd frontend/MobileChat
npm install
npm start
```

> **Not:** Mobil için Expo Go uygulaması ile QR kodu okutabilirsiniz.

## Dizin Yapısı

```
FullStackAI-Projesi/
  ├── ai-service/      # Python tabanlı AI servis (Flask)
  ├── backend/        # ASP.NET Core Web API
  ├── frontend/
  │   ├── MobileChat/ # React Native + Expo mobil uygulama
  │   └── web-chat/   # React tabanlı web arayüzü
  └── README.md
```

## Katkıda Bulunma
Pull request’ler ve sorun bildirimleri (“issue”) açıktır. Lütfen katkı sunmadan önce kod stiline ve proje yapısına göz atınız.

---

# FullStackAI

A modern fullstack project combining web and mobile chat with AI-powered backend services.

## Features
- Web chat (React)
- Mobile chat (React Native + Expo)
- Backend API (ASP.NET Core)
- Python AI microservice (Flask example)

## Tech Stack
- **Frontend (Web):** React, Tailwind CSS
- **Frontend (Mobile):** React Native, Expo, NativeWind
- **Backend:** ASP.NET Core Web API
- **AI Service:** Python, Flask

## Quick Start
See Turkish section above or ask for English setup instructions!

## License
MIT


