import { tranlateSubtitle } from "../utils/ai-ceviri";

console.log("Background: Akıllı Mod (WASM İzinli & Spam Korumalı)");

// --- GLOBAL HAFIZA ---
const islenenDosyalar = new Set<string>();
let ingilizceBulundu = false;

chrome.webRequest.onBeforeRequest.addListener(
  (details: any): undefined => {
    const hamUrl = details.url;
    const tabId = details.tabId;

    // Tab ID geçersizse çık
    if (tabId === -1) return;

    // 1. ADIM: URL Temizliği (Parametreleri at)
    const safUrl = hamUrl.split("?")[0];
    const lowerUrl = safUrl.toLowerCase();

    if (islenenDosyalar.has(safUrl)) {
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
    console.log("İLK KEZ İŞLENİYOR:", safUrl, "Tab:", tabId);

    // SENARYO 1: Orijinal İngilizce
    if (
      lowerUrl.includes("eng") ||
      lowerUrl.includes("/en/") ||
      lowerUrl.includes("english")
    ) {
      console.log("ORİJİNAL İNGİLİZCE BULUNDU. Diğer işlemler durduruluyor.");
      ingilizceBulundu = true;

      mesajGonder(
        tabId,
        "ALTYAZI_BULUNDU",
        "Orijinal İngilizce bulundu (AI İptal)...",
      );

      fetch(hamUrl)
        .then((res) => res.text())
        .then((metin) => {
          mesajGonder(tabId, "ICERIK_HAZIR", metin);
        })
        .catch((e: any) => console.error("İndirme hatası:", e));
      return;
    }

    // SENARYO 2: Türkçe (Sadece İngilizce yoksa çalışır)
    if (
      (lowerUrl.includes("tur") || lowerUrl.includes("tr")) &&
      !ingilizceBulundu
    ) {
      console.log("Sadece Türkçe var, AI devreye giriyor...");

      mesajGonder(
        tabId,
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
              mesajGonder(tabId, "ICERIK_HAZIR", cevrilmisMetin); // ⭐ DÜZELTME
            }
          } catch (error) {
            console.error("AI Çeviri Hatası (CSP olabilir):", error);
            mesajGonder(
              tabId,
              "ALTYAZI_BULUNDU",
              "HATA: Yapay zeka güvenlik engeline takıldı.",
            );
          }
        });
    }
  },
  { urls: ["*://*/*.vtt*", "*://*/*.srt*"] },
);

function mesajGonder(tabId: number, mesajTipi: string, veri: string) {
  chrome.tabs
    .sendMessage(tabId, { mesaj: mesajTipi, veri: veri })
    .then(() => {
      console.log(`✅ Mesaj gönderildi (Tab ${tabId}):`, mesajTipi);
    })
    .catch((err: any) => {
      console.error(`❌ Mesaj gönderilemedi (Tab ${tabId}):`, err);
    });
}
