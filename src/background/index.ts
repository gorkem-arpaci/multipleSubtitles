import { tranlateSubtitle } from "../utils/ai-ceviri";
import { parseVTT } from "../utils/vtt-parser";

console.log("Background: Akıllı Mod (WASM İzinli & Spam Korumalı)");

// --- GLOBAL HAFIZA ---
const islenenDosyalar = new Set<string>();
let ingilizceBulundu = false;

chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    const hamUrl = details.url;

    // 1. ADIM: URL Temizliği (Parametreleri at)
    const safUrl = hamUrl.split("?")[0];
    const lowerUrl = safUrl.toLowerCase();

    // 2. ADIM: ÖLÜMCÜL KONTROL (SPAM ENGELİ)
    // Eğer listede varsa, kod burda biter. Aşağıya İNEMEZ.
    if (islenenDosyalar.has(safUrl)) {
      // console.log("Engellendi (Spam):", safUrl);
      return;
    }

    // Gereksiz dosyaları baştan ele
    if (
      lowerUrl.includes("segment") ||
      lowerUrl.includes("ad_") ||
      lowerUrl.includes(".xml")
    )
      return;

    // Listeye ekle (Kapıyı kilitle)
    islenenDosyalar.add(safUrl);
    console.log("İLK KEZ İŞLENİYOR:", safUrl);

    // SENARYO 1: Orijinal İngilizce
    if (
      lowerUrl.includes("eng") ||
      lowerUrl.includes("/en/") ||
      lowerUrl.includes("english")
    ) {
      console.log("ORİJİNAL İNGİLİZCE BULUNDU. Diğer işlemler durduruluyor.");

      ingilizceBulundu = true;

      mesajGonder(
        "ALTYAZI_BULUNDU",
        "Orijinal İngilizce bulundu (AI İptal)...",
      );

      fetch(hamUrl)
        .then((res) => res.text())
        .then((metin) => {
          mesajGonder("ICERIK_HAZIR", metin);
        })
        .catch((e) => console.error("İndirme hatası:", e));

      return;
    }

    // SENARYO 2: Türkçe (Sadece İngilizce yoksa çalışır)
    if (
      (lowerUrl.includes("tur") || lowerUrl.includes("tr")) &&
      !ingilizceBulundu
    ) {
      console.log("Sadece Türkçe var, AI devreye giriyor...");

      mesajGonder(
        "ALTYAZI_BULUNDU",
        "Türkçe -> İngilizce çevirisi yapılıyor...",
      );

      fetch(hamUrl)
        .then((res) => res.text())
        .then(async (metin) => {
          // İndirme bittiğinde İngilizce hala yoksa çevir
          if (ingilizceBulundu) {
            console.log("Çeviri iptal edildi (O ara İngilizce bulundu).");
            return;
          }

          try {
            // AI Fonksiyonunu Çağır
            const cevrilmisMetin = await tranlateSubtitle(metin);

            if (!ingilizceBulundu) {
              mesajGonder("ICERIK_HAZIR", cevrilmisMetin);
            }
          } catch (error) {
            console.error("AI Çeviri Hatası (CSP olabilir):", error);
            mesajGonder(
              "ALTYAZI_BULUNDU",
              "HATA: Yapay zeka güvenlik engeline takıldı.",
            );
          }
        });
    }
  },
  // SIKI FİLTRE
  { urls: ["*://*/*.vtt*", "*://*/*.srt*"] },
);

function mesajGonder(mesajTipi: string, veri: string) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.id) {
      chrome.tabs
        .sendMessage(tabs[0].id, { mesaj: mesajTipi, veri: veri })
        .catch(() => {});
    }
  });
}
