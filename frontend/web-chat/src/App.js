import React, { useState } from "react";

// Backend adresi ortam degiskeninden geliyor.
//
// Onceden koda gomuluydu ve mobil istemci BASKA bir port yaziyordu
// (5000) -- ikisi ayni backend'e baktigini saniyordu ama biri
// yanlisti. Gercek port launchSettings.json'da 5165.
//
// Create React App yalnizca "REACT_APP_" ile baslayan degiskenleri
// pakete gomer. Deger build sirasinda gomulur, calisma aninda
// okunmaz -- degistirirsen yeniden build gerekir.
const API_BASE = `${process.env.REACT_APP_API_URL || "http://localhost:5165"}/api/chat`;

export default function App() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const sentimentColor = (sentiment) => {
    if (sentiment === "NEGATIVE" || sentiment === "negative") return "bg-red-100 border-red-400 text-red-700";
    if (sentiment === "POSITIVE" || sentiment === "positive") return "bg-green-100 border-green-400 text-green-700";
    return "bg-gray-100 border-gray-400 text-gray-700";
  };

  const send = async () => {
    if (!text.trim() || loading) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, userId: 1 }) // kimlik dogrulama henüz yok
      });

      // res.ok KONTROL EDILIYOR.
      // Onceden dogrudan res.json() cagriliyordu: sunucu 400 ya da
      // 500 donse bile arayuz cevabi "mesaj" sanip listeye ekliyordu.
      if (!res.ok) {
        throw new Error(`Sunucu ${res.status} döndü`);
      }

      const msg = await res.json();
      // Fonksiyonel guncelleme: "messages" bagimliligina takilmadan
      // her zaman en guncel listeye ekler.
      setMessages((prev) => [...prev, { ...msg, me: true }]);
      setText("");
    } catch (err) {
      // alert() yerine ekran ici mesaj: alert sayfayi bloklar ve
      // mobil tarayicilarda rahatsiz edicidir.
      setError("Mesaj gönderilemedi. API çalışıyor mu?");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // İlk açılışta eski mesajları getir.
  React.useEffect(() => {
    let iptal = false;

    fetch(API_BASE)
      .then((r) => {
        if (!r.ok) throw new Error(`Sunucu ${r.status} döndü`);
        return r.json();
      })
      .then((msgs) => {
        if (!iptal) setMessages(msgs || []);
      })
      .catch((err) => {
        // Onceden .catch YOKTU: API kapaliyken bu zincir islenmemis
        // bir promise reddi uretiyor ve konsola hata basiyordu.
        if (!iptal) setError("Geçmiş mesajlar yüklenemedi.");
        console.error(err);
      });

    return () => {
      iptal = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-4">
        <h1 className="text-2xl font-bold mb-4">Web Chat 💬</h1>

        {error && (
          <p role="alert" className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
        <div className="h-96 overflow-y-auto space-y-2 mb-3 pr-1">
          {messages.length === 0 && !error && (
            <p className="text-center text-sm text-gray-400 py-8">
              Henüz mesaj yok. İlk mesajı sen yaz.
            </p>
          )}
          {messages.map((m) => (
            <div
              key={m.id}
              className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed flex flex-col gap-1 border ${m.me ? "ml-auto bg-blue-600 text-white border-blue-600" : "mr-auto bg-gray-100 text-gray-900 border-gray-100"}`}
            >
              <div>{m.text}</div>
              {m.sentiment && (
                <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold self-end mt-1 ${sentimentColor(m.sentiment)}`}>
                  {m.sentiment.toLocaleUpperCase("tr")}
                </span>
              )}
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Mesaj yaz..."
            className="flex-1 border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
            onKeyDown={e => { if (e.key === "Enter") send(); }}
          />
          <button
            onClick={send}
            disabled={loading || !text.trim()}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300"
          >
            Gönder
          </button>
        </div>
      </div>
    </div>
  );
}
