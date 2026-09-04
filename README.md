# Ezy Checklist

An AI-powered grocery and shopping checklist app that converts plain text item lists into organized categories automatically.

## Features

* AI-based item categorization using Gemini 3.1 Flash Lite
* Convert raw item lists into structured categories
* Interactive checklist with completion tracking
* Persistent storage using Local Storage
* Mobile-first responsive design
* Fast and lightweight
* No account required
* No backend required

## Demo

### Input

```text
potato
onion
milk
ghee
bread
toothpaste
```

### Output

```json
{
  "Vegetables": ["potato", "onion"],
  "Dairy": ["milk", "ghee"],
  "Bakery": ["bread"],
  "Personal Care": ["toothpaste"]
}
```

## Categories

* Vegetables
* Fruits
* Dairy
* Bakery
* Beverages
* Household
* Personal Care
* Other

## Tech Stack

* React
* TypeScript
* Tailwind CSS
* Gemini 3.1 Flash Lite
* Local Storage
* Vite

## Installation

### Clone Repository

```bash
git clone https://github.com/your-username/ezy-checklist.git
cd ezy-checklist
```

### Install Dependencies

```bash
npm install
```

### Configure Environment Variables

Create a `.env` file in the root directory.

```env
VITE_GEMINI_API_KEY=your_api_key_here
```

### Start Development Server

```bash
npm run dev
```

## Build

### Web Build

```bash
npm run build
```

### Android APK (Expo)

```bash
npx expo prebuild
cd android
.\gradlew.bat assembleRelease
```

APK Location:

```text
android/app/build/outputs/apk/release/app-release.apk
```

## Project Structure

```text
src/
├── components/
├── pages/
├── hooks/
├── services/
├── utils/
├── types/
└── App.tsx
```

## How It Works

1. User enters items in a text area.
2. Items are sent to Gemini 3.1 Flash Lite.
3. Gemini categorizes the items.
4. Results are displayed as grouped checklists.
5. Checklist state is stored in Local Storage.
6. Completed items remain saved after page refresh.

## Local Storage

Example stored data:

```json
{
  "Vegetables": [
    {
      "name": "potato",
      "checked": true
    },
    {
      "name": "onion",
      "checked": false
    }
  ]
}
```

## Roadmap

* Custom categories
* Recurring shopping lists
* Voice input
* Barcode scanning
* Cloud sync
* Shared family lists
* Offline AI categorization

## License

MIT License
