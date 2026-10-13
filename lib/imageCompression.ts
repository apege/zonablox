/**
 * High-performance client-side image compression to WebP.
 * Seamlessly compresses images before saving or uploading,
 * dramatically saving bandwidth and storage without degrading visual quality.
 */
export async function compressImageToWebP(
  file: File,
  options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
  } = {}
): Promise<{ file: File; dataUrl: string; originalSize: number; compressedSize: number }> {
  const { maxWidth = 1600, maxHeight = 1600, quality = 0.82 } = options;

  return new Promise((resolve, reject) => {
    // If not an image, reject
    if (!file.type.startsWith("image/")) {
      reject(new Error("Provided file is not a supported image."));
      return;
    }

    const reader = new FileReader();

    reader.onerror = () => reject(new Error("Failed to read image file."));

    reader.onload = (e) => {
      const img = new window.Image();

      img.onerror = () => reject(new Error("Failed to process image for compression."));

      img.onload = () => {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        // Proportional scale calculation
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas 2D context is not supported in this browser."));
          return;
        }

        // Draw image with smoothing for best quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        // Name output with .webp extension
        const baseName = file.name.replace(/\.[^/.]+$/, "");
        const webpFileName = `${baseName}.webp`;

        // Export to WebP blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              // Fallback to dataURL if toBlob fails
              const dataUrl = canvas.toDataURL("image/webp", quality);
              const byteString = atob(dataUrl.split(",")[1]);
              const mimeString = dataUrl.split(",")[0].split(":")[1].split(";")[0];
              const ab = new ArrayBuffer(byteString.length);
              const ia = new Uint8Array(ab);
              for (let i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
              }
              const fallbackBlob = new Blob([ab], { type: mimeString });
              const compressedFile = new File([fallbackBlob], webpFileName, {
                type: "image/webp",
                lastModified: Date.now(),
              });
              resolve({
                file: compressedFile,
                dataUrl,
                originalSize: file.size,
                compressedSize: fallbackBlob.size,
              });
              return;
            }

            const compressedFile = new File([blob], webpFileName, {
              type: "image/webp",
              lastModified: Date.now(),
            });

            const dataUrl = canvas.toDataURL("image/webp", quality);
            resolve({
              file: compressedFile,
              dataUrl,
              originalSize: file.size,
              compressedSize: blob.size,
            });
          },
          "image/webp",
          quality
        );
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}
