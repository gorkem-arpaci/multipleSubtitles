console.log("Content Script Hazır - Dual Subtitle Modu");

// Kutu oluşturma fonksiyonu (Daha küçük ve şık)
function getOrCreateKutu(): HTMLDivElement {
  let kutu = document.getElementById("ai-altyazi-kutusu") as HTMLDivElement;

  if (!kutu) {
    kutu = document.createElement("div");
    kutu.id = "ai-altyazi-kutusu";

    Object.assign(kutu.style, {
      position: "fixed",
      bottom: "100px", // Alttaki Türkçe altyazının biraz üstünde dursun
      left: "50%",
      transform: "translateX(-50%)",
      backgroundColor: "rgba(0, 0, 0, 0.6)", // Daha şeffaf
      color: "#ffffff", // Beyaz yazı
      textShadow: "1px 1px 2px black",
      padding: "10px 20px",
      fontSize: "20px", // Okunaklı
      fontWeight: "bold",
      zIndex: "2147483647",
      borderRadius: "5px",
      pointerEvents: "none", // Tıklamayı engellemesin
      textAlign: "center",
      display: "none",
      width: "80%",
    });

    (document.body || document.documentElement).appendChild(kutu);
  }
  return kutu;
}

// VTT metnini o anki saniyeye göre ayıklayan yardımcı fonksiyonlara ihtiyacımız olacak.
// Ama şimdilik basitçe tüm metni basmak yerine, mantığı kuralım.
// GERÇEK SENKRONİZASYON İÇİN: VTT parser gerekir.
// Şimdilik "İndirildi" mesajını görelim.

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (window !== window.top) return; // Sadece ana sayfada çalış

  const kutu = getOrCreateKutu();

  if (request.mesaj === "ALTYAZI_BULUNDU") {
    kutu.style.display = "block";
    kutu.innerText = "İngilizce Altyazı Bulundu!\nYükleniyor...";
    kutu.style.color = "yellow";
  }

  if (request.mesaj === "ICERIK_HAZIR") {
    kutu.style.display = "block";
    kutu.style.color = "white";

    // BURASI ÖNEMLİ:
    // Normalde burada tüm dosyayı ekrana basamayız (çok uzun).
    // Videonun saniyesini dinleyip ona uygun satırı göstermemiz lazım.
    // Şimdilik sadece çalıştığını kanıtlamak için ilk 200 karakteri gösterelim.

    kutu.innerText =
      "Çift Altyazı Hazır!\n(Senkronizasyon modülü eklenecek)\n\n" +
      request.veri.substring(0, 100) +
      "...";

    // Bu veriyi hafızaya alıp videonun timeupdate event'inde kullanacağız.
    window.engSubtitleData = request.veri;
  }
});

// TypeScript için window objesine yeni özellik ekleme (Geçici çözüm)
declare global {
  interface Window {
    engSubtitleData: string;
  }
}
