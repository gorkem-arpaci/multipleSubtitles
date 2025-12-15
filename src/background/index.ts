import { tranlateSubtitle } from "../utils/ai-ceviri";

console.log("Background: Akıllı Hibrit Mod (Eng > AI > Tr)");

const UZANTILAR = [".vtt", ".srt"];
// İngilizce bulduk mu diye takip edeceğimiz bayrak
let ingilizceBulundu = false;

chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    const url = details.url;
    const lowerUrl = url.toLowerCase();

    // 1. Altyazı dosyası mı?
    if (UZANTILAR.some((ext) => lowerUrl.includes(ext))) {
      // Reklamları ve segmentleri ele
      if (
        lowerUrl.includes("segment") ||
        lowerUrl.includes("ad_") ||
        lowerUrl.includes("vast") ||
        lowerUrl.includes(".xml")
      )
        return;

      // SENARYO 1: Orijinal İngilizce Bulundu
      if (
        lowerUrl.includes("eng") ||
        lowerUrl.includes("/en/") ||
        lowerUrl.includes("english")
      ) {
        console.log("ORİJİNAL İNGİLİZCE BULUNDU:", url);
        ingilizceBulundu = true; // Bayrağı dik, artık AI kullanmayacağız

        // Content Script'e haber ver
        mesajGonder(
          "ALTYAZI_BULUNDU",
          "Orijinal İngilizce bulundu, yükleniyor...",
        );

        fetch(url)
          .then((res) => res.text())
          .then((metin) => {
            // Çeviri yapmadan direkt gönder
            mesajGonder("ICERIK_HAZIR", metin);
          });
        return;
      }

      // SENARYO 2: Türkçe Bulundu (Ve henüz İngilizce yoksa)
      if (
        (lowerUrl.includes("tur") || lowerUrl.includes("tr")) &&
        !ingilizceBulundu
      ) {
        console.log("Sadece Türkçe var, AI devreye giriyor:", url);

        mesajGonder(
          "ALTYAZI_BULUNDU",
          "İngilizce yok. Türkçe -> İngilizce çevirisi yapılıyor...",
        );

        fetch(url)
          .then((res) => res.text())
          .then(async (metin) => {
            // Tam çeviriye başlamadan son kez kontrol et:
            // Belki indirme sürerken İngilizce gelmiştir?
            if (ingilizceBulundu) {
              console.log("Çeviri iptal, bu sırada orijinal İngilizce geldi.");
              return;
            }

            // Türkçe metni İngilizceye çevir
            const cevrilmisMetin = await tranlateSubtitle(metin);

            // Göndermeden önce tekrar kontrol et
            if (!ingilizceBulundu) {
              mesajGonder("ICERIK_HAZIR", cevrilmisMetin);
            }
          });
      }
    }
  },
  { urls: ["<all_urls>"] },
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
