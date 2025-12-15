console.log("Content Script Hazır");

function getOrCreateKutu(): HTMLDivElement {
  let kutu = document.getElementById("ai-altyazi-kutusu") as HTMLDivElement;
  if (!kutu) {
    kutu = document.createElement("div");
    kutu.id = "ai-altyazi-kutusu";
    Object.assign(kutu.style, {
      position: "fixed",
      bottom: "100px",
      left: "50%",
      transform: "translateX(-50%)",
      backgroundColor: "rgba(0,0,0,0.7)",
      color: "white",
      padding: "10px",
      fontSize: "18px",
      zIndex: "9999999",
      borderRadius: "8px",
      maxWidth: "80%",
      textAlign: "center",
      display: "none",
    });
    (document.body || document.documentElement).appendChild(kutu);
  }
  return kutu;
}

chrome.runtime.onMessage.addListener((request) => {
  // Iframe kontrolü
  if (window !== window.top) return;

  const kutu = getOrCreateKutu();

  if (request.mesaj === "ALTYAZI_BULUNDU") {
    kutu.style.display = "block";
    kutu.style.color = "yellow";
    kutu.innerText = "⏳ " + request.veri;
  }

  if (request.mesaj === "ICERIK_HAZIR") {
    kutu.style.display = "block";
    kutu.style.color = "#00ff00";
    // Buraya ileride senkronizasyon kodları gelecek
    kutu.innerText =
      "✅ İNGİLİZCE ALTYAZI HAZIR!\n\n" +
      request.veri.substring(0, 150) +
      "...";
  }
});
