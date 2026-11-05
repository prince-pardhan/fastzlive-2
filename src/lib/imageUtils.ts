/**
 * Fastzlive Image Optimization Utility
 * Automatically compresses large mobile photos to optimal news publishing resolution
 */

export async function optimizeImageForUpload(file: File, maxWidth = 1920, quality = 0.85): Promise<{ file: File; dataUrl: string }> {
  return new Promise((resolve) => {
    // If SVG or GIF, do not re-encode via canvas
    if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
      const reader = new FileReader();
      reader.onload = () => resolve({ file, dataUrl: reader.result as string });
      reader.onerror = () => resolve({ file, dataUrl: '' });
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Calculate dimensions preserving aspect ratio
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({ file, dataUrl: e.target?.result as string });
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);

        // Convert back to Blob/File
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const optimizedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.jpg'), {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve({ file: optimizedFile, dataUrl });
            } else {
              resolve({ file, dataUrl: e.target?.result as string });
            }
          },
          'image/jpeg',
          quality
        );
      };

      img.onerror = () => {
        resolve({ file, dataUrl: e.target?.result as string });
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      resolve({ file, dataUrl: '' });
    };

    reader.readAsDataURL(file);
  });
}
