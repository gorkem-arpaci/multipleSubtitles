console.log("Background Service Worker Başladı! (Her isteği raporlayacak mod)");

const ALTYAZI_UZANTILARI = [".vtt", ".srt", ".dfxp", ".xml"];

chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    const url = details.url.toLowerCase();

    // Sadece altyazı uzantılarını kontrol et
    if (ALTYAZI_UZANTILARI.some((uzanti) => url.includes(uzanti))) {
      console.log("🎯 ALTYAZI YAKALANDI (Filtresiz):", details.url);

      // Aktif sekmeye mesaj gönder
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          // ÖNEMLİ: Mesajı o sekmedeki TÜM çerçevelere (iframe dahil) gönderiyoruz.
          // Böylece hem ana sayfa hem video iframe'i haberi alır.
          chrome.tabs
            .sendMessage(tabs[0].id, {
              mesaj: "ALTYAZI_BULUNDU",
              url: details.url,
            })
            .catch((err) =>
              console.log("Mesaj iletilemedi (sekme hazır olmayabilir):", err),
            );
        }
      });
    }
  },
  { urls: ["<all_urls>"] },
);
