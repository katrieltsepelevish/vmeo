# Vmeo

A lightweight Vimeo client

## Dependecy Installation

**pnpm:**

```bash
> pnpm add @katrieltsepelevish/vmeo
```

## Usage

```js
import * as Path from "path";
import Vmeo, { DownloadOptions } from "@katrieltsepelevish/vmeo";

// Create an instance of the Vimeo Client
const vmeo = new Vmeo();

// Set your Vimeo video URL
const videoUrl = "https://vimeo.com/VIDEO_ID";

// Specify download options
const options: DownloadOptions = {
  quality: "720p",
  outputPath: Path.join(__dirname, "/path/to/save/video.mp4"),
  override: false,
  onProgress: (percentage) => {
    console.log(`Downloading: ${percentage.toFixed(2)}%`);
  },
  onSuccess: () => {
    console.log("Download completed successfully!");
  },
  onFailure: (error) => {
    console.error(`Download failed: ${error.message}`);
  },
};

// Add event listeners
vmeo.on("data", (percentage) => {
  console.log(`Data event received: ${percentage.toFixed(2)}%`);
});

vmeo.on("success", () => {
  console.log("Success event received!");
});

vmeo.on("error", (error) => {
  console.error(`Error event received: ${error.message}`);
});

// Start the download
vmeo.download(videoUrl, options);
```

## Explanation

### Event Listeners

- **data:** An event that receives the download progress as a percentage
- **success:** An event that invokes when the download is completed successfully
- **error:** An event that invokes if an error occurs during the download

### Download Options

- **quality:** Specify the desired video quality ('240p', '360p', '540p', '720p', '1080p')
- **outputPath:** The file path where the downloaded video will be saved
- **override:** (Optional) Set to true if you want to override an existing file at the specified path
- **onProgress:** A callback function that receives the download progress as a percentage
- **onSuccess:** A callback function invoked when the download is completed successfully
- **onFailure:** A callback function invoked if an error occurs during the download

## Publish

Make sure to bump the version before publishing

```bash
yarn build
npm publish --access=public
```
