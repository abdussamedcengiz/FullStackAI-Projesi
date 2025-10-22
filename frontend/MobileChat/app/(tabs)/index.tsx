import React, { useState, useEffect } from "react";
import {
  FlatList,
  TextInput,
  TouchableOpacity,
  View,
  Text,
  ActivityIndicator,
} from "react-native";

interface Msg {
  id: string;
  me: boolean;
  text: string;
  sentiment?: string;
}

const API_BASE = "http://localhost:5000/api/chat";

export default function App() {
  const [list, setList] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const sentimentColor = (sentiment?: string) => {
    if (!sentiment) return {};
    if (sentiment.toLowerCase() === "negative")
      return { backgroundColor: "#fee2e2", color: "#b91c1c" };
    if (sentiment.toLowerCase() === "positive")
      return { backgroundColor: "#dcfce7", color: "#065f46" };
    return { backgroundColor: "#f3f4f6", color: "#374151" };
  };

  const send = async () => {
    if (!text.trim() || loading) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, userId: 1 }),
      });
      const msg = await res.json();
      setList((prev) => [
        ...prev,
        { ...msg, id: msg.id?.toString() || Date.now().toString(), me: true },
      ]);
      setText("");
    } catch {
      alert("Mesaj gönderilemedi. API bağlantısını kontrol edin.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetch(API_BASE)
      .then((r) => r.json())
      .then((msgs) =>
        setList(
          msgs?.map((m: any) => ({ ...m, id: m.id?.toString(), me: false })) ||
            []
        )
      )
      .catch(() => {});
  }, []);

  return (
    <View className="flex-1 bg-gray-50 p-4">
      <Text className="text-2xl font-bold mb-4">Mobile Chat 📱</Text>
      <FlatList
        data={list}
        keyExtractor={(i) => i.id}
        className="flex-1"
        contentContainerStyle={{ gap: 8 }}
        renderItem={({ item }) => (
          <View
            className={`max-w-[80%] rounded-2xl px-3 py-2 ${
              item.me ? "self-end bg-blue-600" : "self-start bg-gray-200"
            }`}
            style={
              item.me ? { alignSelf: "flex-end" } : { alignSelf: "flex-start" }
            }
          >
            <Text style={{ color: item.me ? "#fff" : "#111" }}>
              {item.text}
            </Text>
            {item.sentiment && (
              <Text
                style={{
                  ...sentimentColor(item.sentiment),
                  marginTop: 2,
                  fontSize: 12,
                  alignSelf: "flex-end",
                  paddingHorizontal: 6,
                  paddingVertical: 1,
                  borderRadius: 8,
                  fontWeight: "bold",
                }}
              >
                {item.sentiment.toUpperCase()}
              </Text>
            )}
          </View>
        )}
      />
      <View
        className="flex-row items-center gap-2 mt-2"
        style={{ flexDirection: "row", alignItems: "center", marginTop: 8 }}
      >
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Mesaj yaz..."
          className="flex-1 border border-gray-300 rounded-xl px-3 py-2"
          style={{
            flex: 1,
            borderWidth: 1,
            borderColor: "#d1d5db",
            borderRadius: 12,
            paddingHorizontal: 12,
            paddingVertical: 8,
          }}
        />
        <TouchableOpacity
          onPress={send}
          className="px-4 py-2 rounded-xl bg-blue-600"
          style={{
            backgroundColor: "#2563eb",
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 8,
            marginLeft: 8,
          }}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: "#fff", fontWeight: "500" }}>Gönder</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
