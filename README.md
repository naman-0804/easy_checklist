# Coding Tracker

A simple Android app for tracking the number of coding questions solved across different coding platforms.

## Features

* Add coding platforms
* Track questions solved for each platform
* Update solved question counts
* Automatically calculate total questions solved
* Delete platforms
* Store data locally on the device
* Works offline
* Simple and lightweight interface

## Example

| Platform      | Questions Solved |
| ------------- | ---------------: |
| HackerRank    |               10 |
| TUF           |              200 |
| LeetCode      |              150 |
| GeeksforGeeks |               75 |

**Total Solved: 435**

## Tech Stack

* React Native
* Expo
* JavaScript
* AsyncStorage

## Installation

Download the latest APK from the [Releases](../../releases) section.

Install the APK on your Android device.

## Development

Clone the repository:

```bash
git clone https://github.com/YOUR_USERNAME/coding-tracker.git
cd coding-tracker
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npx expo start
```

## Build APK

Install EAS CLI:

```bash
npm install -g eas-cli
```

Build the Android APK:

```bash
eas build -p android --profile preview
```

## Data Storage

All coding progress is stored locally on the user's device using AsyncStorage.

No account or backend is required.

## License

This project is licensed under the MIT License.
