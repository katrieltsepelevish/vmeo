import Axios from "axios";
import * as Fs from "fs";
import Emtr from "@katrieltsepelevish/emtr";

type Quality = "240p" | "360p" | "540p" | "720p" | "1080p";

// Define possible event names
type Event = "data" | "error" | "success";

// Define a type for event listeners based on the event name
type EventListener<T extends Event, U> = {
  data: (percentage: number) => U;
  success: () => U;
  error: (error: Error) => U;
}[T];

// Define the options for downloading a video
export interface DownloadOptions {
  // The quality of the requested video
  quality: Quality;

  // The file path where the video will be downloaded
  outputPath: string;

  // // Optional: Flag to override the existing video file at the specified path
  override?: boolean;

  // Optional: Callback function to receive download progress updates
  onProgress?: (percentage: number) => void;

  // Optional: Callback function invoked upon successful completion of the download
  onSuccess?: () => void;

  // Optional: Callback function invoked when the download encounters an error
  onFailure?: (error: Error) => void;
}

class Vmeo {
  // Map to store video qualities and their corresponding URLs
  private qualityToUrl = new Map<string, string>();

  // Event emitter instance for handling custom events
  private emitter = new Emtr();

  /**
   * Download a video from a given URL with specified options
   * @param url - The URL of the video
   * @param options - Options for downloading the video
   * @returns A promise that resolves when the download is complete
   */
  public download = async (url: string, options: DownloadOptions) => {
    try {
      if (!url) {
        throw new Error("Cannot find URL");
      }

      // Convert the URL to the embedded format
      const embeddedUrl = this.urlToEmbedded(url);
      // Load video files based on the embedded URL
      await this.loadFiles(embeddedUrl);

      if (!this.qualityToUrl.size) {
        throw new Error(`Cannot find data for video ${embeddedUrl}`);
      }

      if (!options.quality || !this.qualityToUrl.get(options.quality)) {
        throw new Error(`Cannot download video in ${options.quality}`);
      }

      // Check if the file exists
      if (Fs.existsSync(options.outputPath) && !options.override) {
        throw new Error(
          `File already exists at ${options.outputPath}. To override the existing file, pass 'ovveride' as true to options.`
        );
      }

      const { data, headers } = await Axios({
        method: "get",
        url: this.qualityToUrl.get(options.quality),
        responseType: "stream",
      });

      const totalSize = Number(headers["content-length"]);
      let downloadedSize = 0;

      // Create a writable stream to save the video file
      const writer = Fs.createWriteStream(options.outputPath, { flags: "w" }); // 'w' flag to write and truncate the file

      // Listen for data events (chunks) during the download
      data.on("data", (chunk: Buffer) => {
        downloadedSize += chunk.length;
        const percentage = (downloadedSize / totalSize) * 100;

        // Emit a 'data' event and Call the onProgress callback if provided with the percentage
        options.onProgress?.(percentage);
        this.emitter.fire("data", percentage);
      });

      data.pipe(writer);

      return new Promise((resolve, reject) => {
        // Listen for the 'finish' event when the download is complete
        writer.on("finish", () => {
          // Emit a 'success' event and Call the onSuccess callback if provided
          options.onSuccess?.();
          this.emitter.fire("success");

          resolve(true);
        });

        // Listen for the 'error' event if any errors occur during the download
        writer.on("error", (error) => {
          // Emit a 'error' event and Call the onFailure callback if provided
          options.onFailure?.(error);
          this.emitter.fire("error");

          reject(error);
        });
      });
    } catch (error) {
      throw error;
    }
  };

  /**
   * Register an event listener for a specific event
   * @param event - The name of the event to listen for
   * @param listener - The callback function to be invoked when the event occurs
   */
  public on<T extends Event>(event: T, listener: EventListener<T, void>): void {
    this.emitter.handle(event, listener);
  }

  /**
   * Load video files based on the provided URL
   * @param url - The URL of the video
   * @returns A promise that resolves when the files are loaded
   */
  private loadFiles = async (url: string): Promise<void> => {
    try {
      const { data } = await Axios({
        method: "get",
        url,
      });

      const scriptRegex =
        /<script>window\.playerConfig = ({[\s\S]+?})<\/script>/;
      const match = data.match(scriptRegex);

      if (!match) {
        throw new Error(`Cannot find data for video ${url}`);
      }

      const parsed = JSON.parse(match[1]);

      const files = parsed?.request?.files?.progressive;

      if (!files) {
        throw new Error("Cannot find files");
      }

      // Populate the qualityToUrl map with video qualities and URLs
      files.forEach(({ quality, url }) => {
        this.qualityToUrl.set(quality, url);
      });
    } catch (error) {
      throw error;
    }
  };

  /**
   * Convert a Vimeo URL to its embedded format
   * @param url - The Vimeo URL
   * @returns The Vimeo URL in embedded format
   */
  private urlToEmbedded = (url: string): string => {
    const vimeoRegex =
      /^(https:\/\/vimeo\.com\/\d+|https:\/\/player\.vimeo\.com\/video\/\d+)$/;

    if (!vimeoRegex.test(url)) {
      throw new Error("Invalid Vimeo URL");
    }

    return url.startsWith("https://vimeo.com/")
      ? url.replace("https://vimeo.com/", "https://player.vimeo.com/video/")
      : url;
  };
}

export default Vmeo;
