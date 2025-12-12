console.log("Content script sayfaya enjekte edildi!");

// Sayfadaki video elementini bulma denemesi
const video = document.querySelector("video");
if (video) {
  console.log("Video bulundu:", video.currentSrc);

  // Test amaçlı videonun üzerine kırmızı bir kutu ekleyelim
  const testBox = document.createElement("div");
  testBox.style.position = "absolute";
  testBox.style.top = "100px";
  testBox.style.left = "100px";
  testBox.style.zIndex = "9999";
  testBox.style.background = "red";
  testBox.style.color = "white";
  testBox.style.padding = "10px";
  testBox.innerText = "AI Çeviri Hazır!";

  document.body.appendChild(testBox);
}
