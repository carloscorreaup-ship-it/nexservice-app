/**
 * imageUtils.ts
 * Compress images from the device gallery/camera before converting to Base64.
 * Uses the Canvas API to resize and re-encode as JPEG, drastically reducing
 * file size from ~3-5 MB (raw phone photo) to ~30-80 KB.
 */

const DEFAULT_MAX_DIMENSION = 800;  // max width or height in pixels
const DEFAULT_QUALITY = 0.70;       // JPEG quality (0 to 1)

/**
 * Compress a File (image) into a lightweight Base64 data-URL string.
 *
 * 1. Creates a temporary Image element from the File blob.
 * 2. Draws it onto an off-screen Canvas at a reduced resolution.
 * 3. Exports the Canvas as a JPEG data-URL with controlled quality.
 *
 * @param file          The raw File from an <input type="file"> element.
 * @param maxDimension  Maximum width or height in pixels (default 800).
 * @param quality       JPEG quality factor 0-1 (default 0.70).
 * @returns             A Promise resolving to a compact `data:image/jpeg;base64,...` string.
 */
export function compressImageFile(
  file: File,
  maxDimension: number = DEFAULT_MAX_DIMENSION,
  quality: number = DEFAULT_QUALITY
): Promise<string> {
  return new Promise((resolve, reject) => {
    // Validate input
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error(`El archivo "${file?.name}" no es una imagen válida.`));
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      try {
        // Calculate proportional dimensions
        let { width, height } = img;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        // Draw onto an off-screen canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('No se pudo crear el contexto del canvas.'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Export as compressed JPEG
        const dataUrl = canvas.toDataURL('image/jpeg', quality);

        // Cleanup
        URL.revokeObjectURL(objectUrl);

        resolve(dataUrl);
      } catch (err) {
        URL.revokeObjectURL(objectUrl);
        reject(err);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(`No se pudo cargar la imagen "${file.name}".`));
    };

    img.src = objectUrl;
  });
}

/**
 * Compress multiple image Files in parallel.
 *
 * @param files         Array of Files to compress.
 * @param maxDimension  Maximum width or height in pixels.
 * @param quality       JPEG quality factor 0-1.
 * @returns             A Promise resolving to an array of compact Base64 data-URL strings.
 *                      Failed compressions are silently skipped (logged to console).
 */
export async function compressMultipleImages(
  files: File[],
  maxDimension: number = DEFAULT_MAX_DIMENSION,
  quality: number = DEFAULT_QUALITY
): Promise<string[]> {
  const results: string[] = [];

  for (const file of files) {
    try {
      const compressed = await compressImageFile(file, maxDimension, quality);
      results.push(compressed);
    } catch (err) {
      console.warn(`[imageUtils] Skipping file "${file.name}":`, err);
    }
  }

  return results;
}
