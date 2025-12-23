# 🎬 Multiple Subtitles 

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6)
![Manifest](https://img.shields.io/badge/Manifest-V3-orange)

A high-performance Chrome Extension that intelligently manages video subtitles. **It prioritizes existing secondary subtitles; if none are available, it automatically translates the primary subtitle using AI.**

## ✨ Key Features

* **🧠 Smart Hybrid Logic:** Checks if a second subtitle track exists. If yes, it uses it directly. If not, it falls back to AI translation.
* **🔍 Auto Detection:** Automatically finds `<video>` elements (JWPlayer, HTML5) and attaches listeners.
* **🤖 AI Translation:** Intercepts `.vtt` files and translates them instantly when needed.
* **💾 Smart Caching:** Caches translations to `chrome.storage` to save API credits and load instantly on replay.
* **🛡️ Safe Injection:** Renders subtitles into `document.body` to prevent player crashes.
* **⚡ Zero Idle CPU:** Scripts completely detach when the extension is disabled.

## 🛠️ Tech Stack

* **React 18 & TypeScript**
* **Vite & CRXJS**
* **Chrome Manifest V3**

## 🚀 How to Install

### 1. Build the Project
Run the following commands to generate the extension files:

```bash
git clone [https://github.com/gorkem-arpaci/multipleSubtitles.git](https://github.com/gorkem-arpaci/multipleSubtitles.git)
cd ai-subtitle-extension
npm install
npm run build
```
### 2. Load into Chrome 

 1. Go to `chrome://extensions`.
 2. Enable **Developer Mode** (top right)
 3. Click **Load unpacked**.
 4. Select the `dist` folder created in your project directory.

## 📝 License

Distributed under the MIT License.
