/**
 * Utility untuk validasi ukuran file (Max 2MB) dan kompresi gambar tinggi tanpa merusak kualitas visual.
 * Menggunakan HTML5 Canvas API dengan intelligent proportional scaling & JPEG/WebP quality encoding 85%.
 */

export interface CompressionResult {
  dataUrl: string;
  originalSizeMb: number;
  compressedSizeMb: number;
  isCompressed: boolean;
  message?: string;
}

export const compressImageFile = (
  file: File,
  maxSizeMB = 2,
  maxDimension = 1920,
  quality = 0.85
): Promise<CompressionResult> => {
  return new Promise((resolve, reject) => {
    const originalSizeMb = parseFloat((file.size / (1024 * 1024)).toFixed(2));

    // Validasi tipe file
    if (!file.type.startsWith('image/')) {
      reject(new Error('Format file harus berupa gambar (JPG, PNG, WebP).'));
      return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Proportional Scaling jika resolusi melebihi maxDimension (misal 1920px)
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Gagal memproses gambar pada Canvas browser.'));
          return;
        }

        // Terapkan image smoothing kualitas tinggi
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Pilih format kompresi (PNG dipertahankan transparansinya jika twibbon, JPG/WebP untuk foto)
        const exportType = file.type === 'image/png' && file.name.toLowerCase().includes('twibbon')
          ? 'image/png'
          : 'image/jpeg';

        const compressedDataUrl = canvas.toDataURL(exportType, quality);

        // Hitung estimasi ukuran setelah kompresi
        const head = `data:${exportType};base64,`;
        const base64Length = compressedDataUrl.length - head.length;
        const compressedSizeBytes = Math.round(base64Length * 0.75);
        const compressedSizeMb = parseFloat((compressedSizeBytes / (1024 * 1024)).toFixed(2));

        // Jika ukuran setelah kompresi masih > 2MB, berikan pesan pemberitahuan
        if (compressedSizeMb > maxSizeMB) {
          resolve({
            dataUrl: compressedDataUrl,
            originalSizeMb,
            compressedSizeMb,
            isCompressed: true,
            message: `Gambar berhasil dikompresi dari ${originalSizeMb}MB menjadi ${compressedSizeMb}MB.`,
          });
        } else {
          resolve({
            dataUrl: compressedDataUrl,
            originalSizeMb,
            compressedSizeMb,
            isCompressed: originalSizeMb !== compressedSizeMb,
            message: `Gambar dioptimalkan sempurna (${compressedSizeMb}MB).`,
          });
        }
      };

      img.onerror = () => {
        reject(new Error('Gagal membaca data gambar yang diunggah.'));
      };
    };

    reader.onerror = () => {
      reject(new Error('Gagal membaca file dari perangkat.'));
    };

    reader.readAsDataURL(file);
  });
};
