/**
 * Client-side image processor for instant uploads
 * Resizes large high-res camera photos to optimal web dimensions (max 1600px)
 * ensuring instant base64 uploads without network timeouts or size errors.
 */
export async function processImageFile(file: File, maxDimension = 1600, quality = 0.88): Promise<string> {
  return new Promise((resolve, reject) => {
    // If SVG, read as text/dataURL directly
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        // Draw image smoothly
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Keep PNG transparency if PNG, else JPEG
        const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const dataUrl = canvas.toDataURL(outputType, quality);
        resolve(dataUrl);
      };
      img.onerror = () => {
        resolve(e.target?.result as string);
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Removes white / light or solid background from an image URL or dataURL
 * returning a transparent PNG base64 data URL.
 */
export async function removeImageBackground(
  imageSrc: string,
  threshold = 215
): Promise<string> {
  return new Promise(async (resolve) => {
    let processableSrc = imageSrc;
    if (!imageSrc.startsWith('data:')) {
      try {
        const response = await fetch(imageSrc, { mode: 'cors' });
        const blob = await response.blob();
        processableSrc = URL.createObjectURL(blob);
      } catch {
        // Fallback to direct src if CORS fetch fails
      }
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(imageSrc);
          return;
        }

        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;

        // Sample corner pixels to detect solid background color if present
        const tlR = data[0], tlG = data[1], tlB = data[2];
        const isCornerLight = (tlR + tlG + tlB) / 3 > 180;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          // Check if pixel is light/white OR matches corner background color
          const brightness = (r + g + b) / 3;
          const diffR = Math.abs(r - tlR);
          const diffG = Math.abs(g - tlG);
          const diffB = Math.abs(b - tlB);
          const isNearCornerColor = diffR < 35 && diffG < 35 && diffB < 35;

          if (brightness >= threshold || (isCornerLight && isNearCornerColor)) {
            // Calculate smooth feathering alpha
            const alphaFactor = Math.max(0, 255 - (brightness - threshold) * 8);
            data[i + 3] = isNearCornerColor ? 0 : Math.min(data[i + 3], alphaFactor);
          }
        }

        ctx.putImageData(imgData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } catch (err) {
        console.error('Canvas processing error (CORS or tainted):', err);
        alert('Could not remove background due to image security restrictions. Please upload the image file directly from your computer.');
        resolve(imageSrc);
      }
    };
    img.onerror = () => {
      alert('Failed to load image for background removal.');
      resolve(imageSrc);
    };
    img.src = processableSrc;
  });
}

