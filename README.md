# 🍯 HandyMedia (Landscape Converter)

A beautiful and blazingly fast desktop application designed to bypass YouTube shorts and other platform requirements by converting portrait (vertical) videos into a 16:9 landscape format. It adds sleek padding—perfect for content creators who need ultimate flexibility.

![HandyMedia Preview]() *(You can add a screenshot later)*

## 🚀 Features

- **Side-by-Side Preview**: Instantly preview exactly how your video will look with padding before converting. Includes a professional checkerboard background to visualize transparency vs. solid black.
- **Drag-and-Drop simplicity**: No need to fiddle with complex file menus. Just drag your video over the app and drop it!
- **Dynamic Window Resizing**: A UI that feels native. The application automatically grows and shrinks depending on whether a preview is currently presented or not.
- **FFmpeg Under the Hood**: Leverage the robust power of FFmpeg without needing terminal experience. Everything is handled locally inside the application.
- **Accessibility Friendly**: Complete keyboard interaction and screen-reader compliant flows.
- **Auto Update**: Keeps itself up-to-date automatically using GitHub Releases.

## 🛠️ Built With

- **React + Vite**: For a snappy, modern UI component framework.
- **TypeScript**: Ensuring scalable and bug-free code.
- **Electron**: Bringing the web to the desktop with low overhead and deep OS integration.
- **Vanilla CSS**: Used native CSS nesting and custom variables for a rich "Honey" theme, completely independent of heavy UI libraries.

## 📦 Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) and [Yarn](https://yarnpkg.com/) installed on your machine.

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd landscape-converter
   ```

2. Install dependencies:
   ```bash
   yarn install
   ```

### Running Locally

To start the development server with Hot Module Replacement (HMR):
```bash
yarn start
```

## 🔨 Build & Distribution

To create a production-ready application that you can run on your machine without packaging:
```bash
yarn local-pack
```
This will compile the source code, pack the app, and place the executable inside the `dist_build` folder (`mac-arm64` etc.).

To manually test the build target prior to packaging:
```bash
yarn build
```

To create a distribution-ready `.tgz`, `.dmg`, or equivalent installer across OS platforms:
```bash
yarn pack
```

*Note: GitHub Actions are configured out-of-the-box (`.github/workflows/releaser.yml`) to automatically build and publish a release whenever a new tag is pushed.*

## 📖 How to Use

1. **Select the Source Video:** Drag an `.mp4`, `.mov`, `.mkv` or `.m4v` into the app.
2. **Review:** The system extracts the first frame to supply a clear before-and-after shot.
3. **Select Target Output:** Pick a save location.
4. **Convert:** Hit 'Convert to Landscape' and watch the progress bar zip along.
5. **Open:** Click the resulting path on the success screen, and Finder/Explorer will open right alongside it!

## 📜 License

This project is licensed under the MIT License. See the `package.json` file for more details.
