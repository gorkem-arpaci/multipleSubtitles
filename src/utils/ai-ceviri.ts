import { pipeline, env } from "@xenova/transformers";

// Yerel dosyadan CDN'e geçişi sağlanıyor.
env.allowLocalModels = false;
env.useBrowserCache = true;

//Model variable
let translatorInstance: any = null;

// model yükleme fonksiyonu
async function getTranslator() {
  if (!translatorInstance) {
    console.log(
      "Model yükleniyor... (Bu işlem internet hızına göre 1-2 dakika sürebilir",
    );

    translatorInstance = await pipeline("translation", "Xenova/opus-mt-tr-en");
  }

  return translatorInstance;
}

function parseVTT(vttText: string) {
  return vttText
    .split(/\n\s*\n/)
    .map((block) => {
      const lines = block.split("\n");

      const timeLineIndex = lines.findIndex((line) => line.includes("-->"));

      if (timeLineIndex === -1) return null;

      const time = lines[timeLineIndex];

      const text = lines.slice(timeLineIndex + 1).join(" ");

      return { original: block, time, text };
    })
    .filter((b) => b !== null && b.text.trim().length > 0); // Boşları temizle
}

//main function
export async function tranlateSubtitle(vttcontent: string) {
  const translator = await getTranslator();
  const blocks = parseVTT(vttcontent);

  const iselenecekBlocklar = blocks.slice(0, 20);

  let translatedVTT = "WEBVTT\n\n";

  for (const block of iselenecekBlocklar) {
    try {
      const result = await translator(block!.text, {
        src_lang: "tur",
        trg_lang: "eng",
      });

      const englishText = result[0].tranlation_text;
      console.log(`Satır: ${block!.text} -> ${englishText}`);

      translatedVTT += `${block!.text} -> ${englishText}`;
    } catch (err) {
      console.log(`An error occured, ${err}`);
      translatedVTT += `${block!.text}\n\n`;
    }
  }
  return translatedVTT;
}
