# 🛒 Ezy-Chklist

A minimal, AI-powered grocery organizer that automatically categorizes your shopping list into smart groups — built with React Native + Expo.

> Type your items in any format, hit **Categorize**, and get an organized checklist instantly.

---

## ✨ Features

- **AI-Powered Categorization** — Uses Google's Gemini API to intelligently sort items into categories like *Vegetables & Greens*, *Dairy & Eggs*, *Bakery & Bread*, *Personal Care*, and more
- **Flexible Input** — Enter items separated by commas, spaces, or new lines. It just works
- **Persistent Checklist** — Your list and checked-off items are saved locally and survive app restarts
- **Progress Tracking** — Visual progress bar shows how many items you've checked off
- **Settings Panel** — Bring your own Gemini API key and switch models from within the app
- **Cross-Platform** — Runs on Android, iOS, and Web via Expo

---

## 📸 How It Works

```
Input:  potato onion milk ghee bread toothpaste

Output:
┌─────────────────────────────┐
│ 🥬 Vegetables & Greens      │
│   ☐ potato                  │
│   ☐ onion                   │
├─────────────────────────────┤
│ 🥛 Dairy & Eggs             │
│   ☐ milk                    │
│   ☐ ghee                    │
├─────────────────────────────┤
│ 🍞 Bakery & Bread           │
│   ☐ bread                   │
├─────────────────────────────┤
│ 🧴 Personal Care            │
│   ☐ toothpaste              │
└─────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Expo Go](https://expo.dev/go) app on your phone
- A free [Gemini API Key](https://ai.google.dev/)

### Install & Run

```bash
# Clone the repo
git clone https://github.com/naman-0804/coding-tracker_apk.git
cd coding-tracker_apk

# Install dependencies
npm install

# Start the dev server
npx expo start
```

Then scan the QR code with **Expo Go** on your phone.

### Setup API Key

1. Open the app
2. Tap the **⚙️** gear icon in the header
3. Paste your Gemini API key
4. (Optional) Change the model ID
5. Hit **Save Settings**

No `.env` files needed — the key is stored securely on-device.

---

## 🏗️ Build APK (via Expo)

To get a standalone APK, use [EAS Build](https://expo.dev/eas) (no local Android SDK needed):

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build APK
eas build -p android --profile preview
```

The download link will appear in your terminal and on the [Expo dashboard](https://expo.dev) once the build completes.

---

## 🧠 AI Model

By default the app uses **Gemini 3.1 Flash Lite** for fast, low-cost categorization. You can switch to any supported Gemini model from the Settings panel:

| Model | Speed | Quality |
|---|---|---|
| `gemini-3.1-flash-lite` | ⚡ Fastest | Good |
| `gemini-2.5-flash` | Fast | Great |
| `gemini-2.0-flash` | Fast | Great |
| `gemini-1.5-flash` | Moderate | Excellent |

---

## 📁 Project Structure

```
ezy-chklist/
├── App.js            # Main application (UI + logic)
├── app.json          # Expo configuration
├── eas.json          # EAS Build profiles
├── package.json      # Dependencies & scripts
├── assets/           # App icons & images
└── .gitignore
```

---

## 🛠️ Tech Stack

- **React Native** + **Expo** (SDK 57)
- **Google Gemini API** (Generative AI)
- **AsyncStorage** (local persistence)

---

## 📄 License

MIT — do whatever you want with it.
