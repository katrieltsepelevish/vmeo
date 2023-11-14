import Vmeo, { DownloadOptions } from "../Vmeo";

describe("Vimeo", () => {
  const vmeo: Vmeo = new Vmeo();

  const options: DownloadOptions = {
    quality: "720p",
    outputPath: "/path/to/save/video.mp4",
    override: true,
    onProgress: jest.fn(),
    onSuccess: jest.fn(),
    onFailure: jest.fn(),
  };

  describe("Download", () => {
    it("should throw an error for an invalid Vimeo URL", () => {
      const url = "https://example.com/video";

      expect(() => vmeo.download(url, options)).rejects.toHaveProperty(
        "message",
        "Invalid Vimeo URL"
      );
    });
  });
});
