import React, { useState } from "react";

const API_BASE = "http://localhost:5165/api/chat"; // <-- backend API'nizin gerçek portunu kullandığınızdan emin olun

export default function App() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const sentimentColor = (sentiment) => {
    if (sentiment === "NEGATIVE" || sentiment === "negative") return "bg-red-100 border-red-400 text-red-700";
    if (sentiment === "POSITIVE" || sentiment === "positive") return "bg-green-100 border-green-400 text-green-700";
    return "bg-gray-100 border-gray-400 text-gray-700";
  };

  const send = async () => {
    if (!text.trim() || loading) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, userId: 1 }) // örnek userId, gerçek kimlik eklenebilir
      });
      const msg = await res.json();
      setMessages([...messages, { ...msg, me: true }]);
      setText("");
    } catch {
      alert("Mesaj gönderilemedi. API bağlantısını kontrol edin.");
    }
    setLoading(false);
  };

  // İlk açılışta eski mesajları API'den çekmek için (opsiyonel):
  React.useEffect(() => {
    fetch(API_BASE)
      .then(r => r.json())
      .then(msgs => setMessages(msgs || []));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-4">
        <h1 className="text-2xl font-bold mb-4">Web Chat 💬</h1>
        <div className="h-96 overflow-y-auto space-y-2 mb-3 pr-1">
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
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300"
          >
            Gönder
          </button>
        </div>
      </div>
    </div>
  );
}
