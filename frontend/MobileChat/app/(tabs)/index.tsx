// STIL NOTU
//
// Bu dosyada onceden hem "className" (NativeWind) hem de "style"
// kullaniliyordu. Ama NativeWind PROJEYE HIC BAGLANMAMISTI:
// babel.config.js'te nativewind preset'i, metro.config.js ve
// global.css yoktu. Yani className prop'larinin HICBIRI calismiyor,
// ustelik "npx tsc" bu proptan dolayi HATA veriyordu (React Native
// bilesenlerinde boyle bir prop yok).
//
// Sonuc: sadece className tasiyan ogeler (kok View, FlatList, mesaj
// balonu) hicbir stil almiyordu. Hepsi StyleSheet degerlerine
// cevrildi -- gorunum artik gercekten uygulaniyor.
//
// NativeWind ileride kurulmak istenirse: nativewind kurulum
// rehberindeki uc adim (babel preset, metro config, global.css)
// tamamlanmali; yarim kurulum sessizce hicbir sey yapmiyor.
import React, { useState, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface Msg {
  id: string;
  me: boolean;
  text: string;
  sentiment?: string;
}

// Backend'in dondugu sekil (ChatController -> MessageResponse).
// Onceden "any" kullaniliyordu; alan adi degisse TypeScript
// uyarmazdi.
interface ApiMessage {
  id: number;
  text: string;
  sentiment?: string;
  createdAt?: string;
  userId?: number;
}

// BACKEND ADRESI
//
// Onceki deger "http://localhost:5000" idi ve IKI AYRI SEKILDE yanlisti:
//
// 1) PORT YANLIS. Backend 5165'te calisiyor
//    (backend/.../Properties/launchSettings.json). Web istemcisi 5165,
//    mobil istemci 5000 yaziyordu; ikisi ayni API'ye baktigini
//    saniyordu ama mobil taraf hicbir zaman baglanamazdi.
//
// 2) "localhost" MOBILDE CALISMAZ. Emulator/cihaz icin "localhost"
//    KENDISIDIR, gelistirme makinen degil. Android emulatorunde ana
//    makineye 10.0.2.2 uzerinden ulasilir; gercek bir telefonda ise
//    makinenin yerel ag IP'si (orn. 192.168.1.20) gerekir.
//
// Adres artik EXPO_PUBLIC_API_URL
// ortam degiskeninden geliyor (bkz. .env.example); asagidaki
// varsayilanlar yalnizca o verilmediginde devreye girer.
const DEFAULT_HOST =
  Platform.OS === "android"
    ? "http://10.0.2.2:5165" // Android emulatorunden ana makine
    : "http://localhost:5165"; // iOS simulatoru ve web

const API_BASE = `${process.env.EXPO_PUBLIC_API_URL ?? DEFAULT_HOST}/api/chat`;

export default function App() {
  const [list, setList] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [yuklemeHatasi, setYuklemeHatasi] = useState(false);

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

      // res.ok KONTROL EDILIYOR.
      // Onceden dogrudan res.json() cagriliyordu: sunucu 400 ya da
      // 500 donse bile arayuz cevabi "mesaj" sanip listeye ekliyordu.
      if (!res.ok) {
        throw new Error(`Sunucu ${res.status} döndü`);
      }

      const msg: ApiMessage = await res.json();

      setList((prev) => [
        ...prev,
        {
          id: msg.id?.toString() ?? Date.now().toString(),
          text: msg.text,
          sentiment: msg.sentiment,
          me: true,
        },
      ]);
      setText("");
    } catch (err) {
      // React Native'de web'in alert()'i guvenilir degildir;
      // dogru arac Alert.alert.
      Alert.alert(
        "Mesaj gönderilemedi",
        "API çalışıyor mu? Adres: " + API_BASE,
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // iptal bayragi: bilesen kaldirildiktan sonra state'e yazmayalim.
    let iptal = false;

    fetch(API_BASE)
      .then((r) => {
        if (!r.ok) throw new Error(`Sunucu ${r.status} döndü`);
        return r.json();
      })
      .then((msgs: ApiMessage[]) => {
        if (iptal) return;
        setList(
          (msgs ?? []).map((m) => ({
            id: m.id?.toString() ?? Date.now().toString(),
            text: m.text,
            sentiment: m.sentiment,
            me: false,
          })),
        );
      })
      .catch((err) => {
        // Onceden ".catch(() => {})" hatayi TAMAMEN yutuyordu:
        // API kapaliyken hicbir iz kalmiyor, sorunu bulmak icin
        // koda bakmaktan baska yol olmuyordu.
        if (iptal) return;
        setYuklemeHatasi(true);
        console.error(err);
      });

    return () => {
      iptal = true;
    };
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: "#f9fafb", padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 16 }}>
        Mobile Chat 📱
      </Text>

      {yuklemeHatasi && (
        <Text
          style={{
            color: "#b91c1c",
            backgroundColor: "#fee2e2",
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 8,
            marginBottom: 8,
            fontSize: 13,
          }}
        >
          Geçmiş mesajlar yüklenemedi. API adresi: {API_BASE}
        </Text>
      )}
      <FlatList
        data={list}
        keyExtractor={(i) => i.id}
        style={{ flex: 1 }}
        contentContainerStyle={{ gap: 8 }}
        renderItem={({ item }) => (
          <View
            style={{
              maxWidth: "80%",
              borderRadius: 16,
              paddingHorizontal: 12,
              paddingVertical: 8,
              alignSelf: item.me ? "flex-end" : "flex-start",
              backgroundColor: item.me ? "#2563eb" : "#e5e7eb",
            }}
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
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          marginTop: 8,
        }}
      >
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Mesaj yaz..."
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
          style={{
            backgroundColor: "#2563eb",
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 8,
          }}
          disabled={loading || !text.trim()}
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
