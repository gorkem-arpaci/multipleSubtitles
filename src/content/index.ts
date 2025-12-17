import { parseVTT } from "../utils/vtt-parser";

console.log("🔥 Content Script Başladı - Video Avcısı Modu");

interface SubtitleItem {
  start: number;
  end: number;
  text: string;
}

let activeSubtitles: SubtitleItem[] = [];
let videoElement: HTMLVideoElement | null = null;
let kutuElement: HTMLDivElement | null = null; // Kutuyu global tutalım

// 1. Kutuyu Oluşturma Fonksiyonu
function createKutu(): HTMLDivElement {
  const kutu = document.createElement("div");
  kutu.id = "ai-altyazi-kutusu";

  Object.assign(kutu.style, {
    position: "fixed", // DÜZELTME 1: Absolute yerine Fixed (Ekrana yapışsın)
    top: "10px",
    left: "50%",
    transform: "translateX(-50%)",

    color: "white", // Yeşil yazı (Dikkat çeksin)
    padding: "10px 20px",
    fontSize: "24px",
    fontWeight: "bold",
    fontFamily: "Arial, sans-serif",

    zIndex: "2147483647", // En üst katman
    borderRadius: "8px",
    textAlign: "center",
    textShadow: "2px 2px 2px black",
    pointerEvents: "none", // Tıklamaları videoya geçir

    display: "block",
    maxWidth: "100%",
    width: "fit-content",
  });

  kutu.innerText = "⏳ AI ALTYAZI BEKLENİYOR...";
  return kutu;
}

// 2. Videoyu ve Kutuyu Yöneten Avcı Fonksiyon
function videoAvcisi() {
  const video = document.querySelector("video");

  // Video varsa ve henüz işlem yapmadıysak (veya kutu silindiyse)
  if (video && !videoElement) {
    console.log("✅ VİDEO BULUNDU! Kutu enjekte ediliyor...");
    videoElement = video;

    // Kutuyu oluştur
    kutuElement = createKutu();

    // DÜZELTME 3: Kutuyu body yerine videonun BABASINA (parent) ekle
    // Bu sayede video tam ekran olsa bile kutu görünür.
    if (video.parentElement) {
      video.parentElement.appendChild(kutuElement);
      // Parent relative olmalı ki içindeki öğeler düzgün dursun (Genelde öyledir)
      // Eğer bozuk durursa burayı document.body.appendChild(kutuElement) yapabilirsin.
    } else {
      document.body.appendChild(kutuElement);
    }

    // Timeupdate dinleyicisi
    video.addEventListener("timeupdate", zamanlayici);
  }
}

// 3. Senkronizasyon (Zamanlayıcı)
function zamanlayici() {
  if (!videoElement || !kutuElement || activeSubtitles.length === 0) return;

  const currentTime = videoElement.currentTime;

  // O anki saniyeye denk gelen altyazıyı bul
  const currentSub = activeSubtitles.find(
    (s) => currentTime >= s.start && currentTime <= s.end,
  );

  if (currentSub) {
    kutuElement.innerText = currentSub.text;
    kutuElement.style.display = "block";
    kutuElement.style.border = "none"; // Yazı gelince kırmızı çerçeveyi kaldır
    kutuElement.style.color = "white";
  } else {
    kutuElement.style.display = "none";
  }
}

// 4. Mesaj Dinleyicisi
chrome.runtime.onMessage.addListener((request) => {
  // Video yoksa mesajı işleme (önce videoyu bulmalı)
  if (!videoElement) return;

  if (request.mesaj === "ALTYAZI_BULUNDU") {
    if (kutuElement) {
      kutuElement.style.display = "block";
      kutuElement.innerText = "📥 İNDİRİLİYOR...\n" + request.veri;
      kutuElement.style.color = "yellow";
    }
  }

  if (request.mesaj === "ICERIK_HAZIR") {
    console.log("📦 Altyazı İçeriği Geldi! Parse ediliyor...");

    try {
      activeSubtitles = parseVTT(request.veri);
      console.log(`✅ ${activeSubtitles.length} satır yüklendi.`);

      if (kutuElement) {
        kutuElement.innerText = "✅ ALTYAZI YÜKLENDİ!\nİyi Seyirler";
        kutuElement.style.color = "#00ff00";

        // 3 saniye sonra bilgi mesajını gizle
        setTimeout(() => {
          if (kutuElement) kutuElement.style.display = "none";
        }, 3000);
      }
    } catch (e) {
      console.error("VTT hatası", e);
    }
  }
});

// 5. Avcıyı Başlat (Sürekli kontrol et, video geç yüklenebilir)
setInterval(videoAvcisi, 1000);
