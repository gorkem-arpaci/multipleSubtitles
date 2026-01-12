import { parseVTT } from "../utils/vtt-parser";

console.log("Content Script Başladı");

interface SubtitleItem {
  start: number;
  end: number;
  text: string;
}

let activeSubtitles: SubtitleItem[] = [];
let videoElement: HTMLVideoElement | null = null;
let kutuElement: HTMLDivElement | null = null;
let kutuEnjekteEdildi = false;
let altyaziYuklendi = false;

async function altyazilariYukle() {
  try {
    const result = await chrome.storage.local.get([
      "cachedSubtitles",
      "currentUrl",
    ]);

    if (result.cachedSubtitles && result.currentUrl === window.location.href) {
      activeSubtitles = result.cachedSubtitles as SubtitleItem[];
      altyaziYuklendi = true;
      console.log(`${activeSubtitles.length} satır cache'den yüklendi!`);

      if (kutuElement) {
        kutuElement.innerText = "✅ ALTYAZI HAZIR!";
        kutuElement.style.color = "#00ff00";
        setTimeout(() => {
          if (kutuElement) kutuElement.style.display = "none";
        }, 2000);
      }
    }
  } catch (e) {
    console.log("Cache bulunamadı, yeni altyazı beklenecek");
  }
}

// 1. Kutuyu Oluşturma Fonksiyonu
function createKutu(): HTMLDivElement {
  const kutu = document.createElement("div");
  kutu.id = "ai-altyazi-kutusu";
  Object.assign(kutu.style, {
    position: "fixed",
    top: "10px",
    left: "50%",
    transform: "translateX(-50%)",
    color: "white",
    padding: "10px 20px",
    fontSize: "30px",
    lineHeight: "1.25",
    fontWeight: "normal",
    fontFamily: "Arial, sans-serif",
    zIndex: "2147483647",
    borderRadius: "8px",
    textAlign: "center",
    textShadow: "2px 2px 2px black",
    pointerEvents: "none",
    display: "block",
    maxWidth: "100%",
    width: "fit-content",
  });
  kutu.innerText = "⏳ AI ALTYAZI BEKLENİYOR...";
  return kutu;
}

// 2. Videoyu ve Kutuyu Yöneten Avcı Fonksiyon
async function videoAvcisi() {
  if (kutuEnjekteEdildi) return;

  const video = document.querySelector("video");

  if (video && !videoElement) {
    console.log("VİDEO BULUNDU! Kutu enjekte ediliyor...");
    videoElement = video;
    kutuElement = createKutu();

    if (video.parentElement) {
      video.parentElement.appendChild(kutuElement);
    } else {
      document.body.appendChild(kutuElement);
    }

    video.addEventListener("timeupdate", zamanlayici);
    kutuEnjekteEdildi = true;

    await altyazilariYukle();

    if (!altyaziYuklendi) {
      kutuElement.innerText = "⏳ AI ALTYAZI BEKLENİYOR...";
      kutuElement.style.display = "block";
    }
  }
}

// 3. Senkronizasyon (Zamanlayıcı)
function zamanlayici() {
  if (!videoElement || !kutuElement) return;

  if (activeSubtitles.length === 0) {
    return; // Altyazı yoksa beklemeye devam
  }

  const currentTime = videoElement.currentTime;

  const currentSub = activeSubtitles.find(
    (s) => currentTime >= s.start && currentTime <= s.end,
  );

  if (currentSub) {
    kutuElement.innerText = currentSub.text;
    kutuElement.style.display = "block";
    kutuElement.style.border = "none";
    kutuElement.style.color = "white";
  } else {
    kutuElement.style.display = "none";
  }
}

// 4. Mesaj Dinleyicisi
chrome.runtime.onMessage.addListener((request: any) => {
  if (request.mesaj === "ALTYAZI_BULUNDU") {
    if (kutuElement) {
      kutuElement.style.display = "block";
      kutuElement.innerText = "İNDİRİLİYOR...\n" + request.veri;
      kutuElement.style.color = "yellow";
    }
  }

  if (request.mesaj === "ICERIK_HAZIR") {
    try {
      activeSubtitles = parseVTT(request.veri);
      altyaziYuklendi = true;

      // İlk 3 altyazıyı göster
      if (activeSubtitles.length > 0) {
      }

      chrome.storage.local
        .set({
          cachedSubtitles: activeSubtitles,
          currentUrl: window.location.href,
        })
        .then(() => {
          console.log("Altyazılar cache'e kaydedildi!");
        });

      if (kutuElement) {
        kutuElement.innerText = "✅ ALTYAZI YÜKLENDİ!\nİyi Seyirler";
        kutuElement.style.color = "#00ff00";

        setTimeout(() => {
          if (kutuElement) kutuElement.style.display = "none";
        }, 3000);
      }
    } catch (e) {
      console.error("❌ VTT Parse Hatası:", e);
      if (kutuElement) {
        kutuElement.innerText = "❌ ALTYAZI YÜKLENEMEDI";
        kutuElement.style.color = "red";
      }
    }
  }
});

// 5. Avcıyı Başlat
setInterval(videoAvcisi, 1000);

window.addEventListener("beforeunload", () => {
  // İsterseniz burada cache'i temizleyebilirsiniz
  // chrome.storage.local.remove(['cachedSubtitles', 'currentUrl']);
});
