# 🍯 HandyMedia

![HandyMedia Preview]() *(You can add a screenshot later)*

Welcome to HandyMedia! This document is split into two sections depending on what you're looking for:

1. [For End Users](#for-end-users): Explains what the app does and how it helps you.
2. [For Developers](#for-developers): Explains how the app is built and how to run it.

---

## 🙋 For End Users

### The Problem
### The Solution: HandyMedia
HandyMedia is a desktop app designed to bypass these formatting rules. It converts your tall, vertical videos into standard 16:9 wide videos.

It calculates the necessary measurements and adds solid **black bars** (padding) to the left and right sides of your video. This means your original video is preserved in the center, and it is now wrapped in a landscape format.

### How to Use It
It's designed to be simple:
1. **Drag and Drop:** Grab a video file on your computer and drag it into the app window.
2. **Preview:** The app shows you a "Before and After" picture. You'll see a checkerboard pattern showing empty space turning into black padding.
3. **Choose Save Location:** Click "Choose Folder" to decide where the converted video should be saved.
4. **Convert:** Hit "Convert to Landscape" and wait for the progress bar to complete.
5. **Done!** Click the output link to open the folder containing your new video.

No complex settings, no confusing menus. Just drop, review, and convert.

---

## 🛠️ For Developers

Welcome! If you're looking to fiddle with the code, build the app yourself, or contribute, here is everything you need to know about what's going on under the hood.

### Tech Stack
- **Frontend Framework:** React + Vite
- **Language:** TypeScript
- **Desktop Wrapper:** Electron
- **Media Processing:** FFmpeg (via `fluent-ffmpeg` and bundled `ffmpeg-static`)
- **Styling:** Vanilla CSS with custom variables and native nesting (No bulky component libraries).
- **Auto-Update:** Handled natively via `electron-updater` and GitHub Releases.

### Getting Started

Ensure you have [Node.js](https://nodejs.org/) and [Yarn](https://yarnpkg.com/) installed.

1. Clone the repository:
   ```bash
   git clone https://github.com/moshfeu/landscape-converter.git
   cd landscape-converter
   ```

2. Install dependencies:
   ```bash
   yarn install
   ```

### Running Locally
To start the development server with Hot Module Replacement (HMR). This is what you should use to develop UI/logic changes:
```bash
yarn start
```

### Build & Distribution Commands

- **`yarn build`**: Compiles the TypeScript and Vite assets for production (`dist` and `dist-electron`). Run this to verify your code compiles.
- **`yarn local-pack`**: Compiles the code AND creates a local executable inside the `dist_build` folder (`mac-arm64` etc.) using Electron Builder. Use this to quickly test exactly what the final production `.app` looks and behaves like on your machine.
- **`yarn pack`**: Wraps the code into a distribution-ready installer/archive (like `.dmg` or `.tgz`).
- **`yarn publish`**: Instructs Electron Builder to build and push the releases directly to GitHub.

### CI/CD Pipeline
GitHub Actions are configured out-of-the-box in `.github/workflows/releaser.yml`.
Whenever you push a tag (e.g., `v1.0.0`) to the `main` branch, the workflow will automatically:
1. Fire up environments for Mac, Windows, and Linux.
2. Build the app binaries.
3. Publish them to the GitHub Releases page.

### Important Structure Notes
- **`src/main.ts`**: The Electron main process. Handles window creation, filesystem access, and the heavy FFmpeg `spawn` background task.
- **`src/preload.ts`**: The context bridge securing the connection to the renderer.
- **`src/App.tsx`**: The main React view handling all states (Selection, Progress, Success).
