// Bir altyazı bloğunun yapısı
export interface SubtitleItem {
  start: number; // Başlangıç saniyesi (Örn: 5.5)
  end: number; // Bitiş saniyesi (Örn: 8.2)
  text: string; // Ekranda görünecek yazı
}

// "00:01:05.500" formatını saniyeye (65.5) çevirir
function timeToSeconds(timeString: string): number {
  const parts = timeString.split(":");
  let seconds = 0;

  // Saat, Dakika, Saniye hesaplaması
  if (parts.length === 3) {
    seconds += parseFloat(parts[0]) * 3600; // Saat
    seconds += parseFloat(parts[1]) * 60; // Dakika
    seconds += parseFloat(parts[2]); // Saniye
  } else if (parts.length === 2) {
    seconds += parseFloat(parts[0]) * 60; // Dakika
    seconds += parseFloat(parts[1]); // Saniye
  }
  return seconds;
}

// Ana Fonksiyon: Metni alıp listeye çevirir
export function parseVTT(vttText: string): SubtitleItem[] {
  const items: SubtitleItem[] = [];

  // Satır sonlarını standartlaştır ve bloklara böl (Boş satıra göre)
  const blocks = vttText.replace(/\r\n/g, "\n").split(/\n\s*\n/);

  blocks.forEach((block) => {
    const lines = block.split("\n");

    // Zaman damgası olan satırı bul (--> işareti içerir)
    const timeLineIndex = lines.findIndex((line) => line.includes("-->"));
    if (timeLineIndex === -1) return; // Zaman yoksa geç (Header vs.)

    const timeLine = lines[timeLineIndex];
    const [startStr, endStr] = timeLine.split(" --> ");

    // Zamanları saniyeye çevir
    const start = timeToSeconds(startStr.trim());
    const end = timeToSeconds(endStr.trim());

    // Metin kısmını al (Zaman satırından sonraki her şey)
    // HTML etiketlerini temizle (<b>, <i> vs.)
    const rawText = lines.slice(timeLineIndex + 1).join(" ");
    const cleanText = rawText.replace(/<\/?[^>]+(>|$)/g, ""); // Tag temizliği

    if (cleanText.trim()) {
      items.push({ start, end, text: cleanText });
    }
  });

  return items;
}
