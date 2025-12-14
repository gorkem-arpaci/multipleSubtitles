// Script her çalıştığında önce nerede olduğunu anlayalım
console.log("Script çalıştı. Bulunduğu URL:", window.location.href);

function videoKontrolVeEkle() {
  // Background'dan gelen mesajları dinle
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.mesaj === "ALTYAZI_BULUNDU") {
      console.log("Content Script Mesajı Aldı! URL:", request.url);
      console.log("Şu anki Konum (URL):", window.location.href);

      // Kutu var mı kontrol et
      let kutu = document.getElementById("ai-altyazi-kutusu");

      if (!kutu) {
        console.log("Kutu yok, yeni oluşturuluyor...");
        kutu = document.createElement("div");
        kutu.id = "ai-altyazi-kutusu";
        kutu.style.position = "fixed";
        kutu.style.top = "10%"; // Üstten biraz boşluk
        kutu.style.left = "50%"; // Ortala
        kutu.style.transform = "translateX(-50%)"; // Tam ortalamak için
        kutu.style.backgroundColor = "rgba(0, 0, 0, 0.9)"; // Koyu siyah
        kutu.style.color = "#00ff00"; // Parlak yeşil
        kutu.style.padding = "20px";
        kutu.style.fontSize = "18px";
        kutu.style.fontWeight = "bold";
        kutu.style.zIndex = "2147483647"; // CSS'in izin verdiği EN BÜYÜK sayı
        kutu.style.border = "3px solid white";
        kutu.style.borderRadius = "10px";
        kutu.style.boxShadow = "0 0 20px rgba(0,255,0,0.5)";
        kutu.style.maxWidth = "80%";

        // Kutuyu en güvenli yere ekle (documentElement bazen body'den daha güvenlidir)
        (document.body || document.documentElement).appendChild(kutu);
      } else {
        console.log("Kutu zaten var, içeriği güncelleniyor.");
      }

      kutu.innerText = "ALTYAZI YAKALANDI!";

      // 5 saniye sonra kutuyu otomatik gizle (İstersen bu satırı sil)
      setTimeout(() => {
        kutu!.style.display = "none";
      }, 8000);
    }
  });
}

// Sayfa yüklendiğinde çalıştır
videoKontrolVeEkle();

// Bazı siteler videoyu sonradan yükler (dinamik), o yüzden 2 sn sonra tekrar dene
setTimeout(videoKontrolVeEkle, 2000);
setTimeout(videoKontrolVeEkle, 5000);
