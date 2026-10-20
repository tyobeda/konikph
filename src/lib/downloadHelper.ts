/**
 * Helper utilitas untuk mengunduh karya:
 * 1. Mengunduh file JPG full (asli) jika tidak ada file master.
 * 2. Mengunduh file dari link Google Drive / format lainnya.
 * 3. Khusus link Canva diarahkan ke tab baru untuk membuka link Canva.
 */

export interface DownloadArtworkOptions {
  artwork: {
    id: string;
    title: string;
    imageUrl: string;
    imageUrls?: string[];
    downloadUrl?: string | null;
    format?: string | null;
  };
  onStartDownloadImage?: () => void;
  onFinishDownloadImage?: () => void;
  onToast?: (message: string) => void;
}

export async function downloadArtworkFile({
  artwork,
  onStartDownloadImage,
  onFinishDownloadImage,
  onToast,
}: DownloadArtworkOptions) {
  const formatTrimmed = (artwork.format || '').trim();
  const hasMaster =
    Boolean(artwork.downloadUrl) &&
    artwork.downloadUrl!.trim() !== '' &&
    artwork.downloadUrl !== '#' &&
    formatTrimmed !== 'Hanya gambar' &&
    formatTrimmed !== 'Hanya Gambar' &&
    formatTrimmed !== 'HANYA_GAMBAR' &&
    formatTrimmed !== 'Tanpa File Master';

  // 2. Ada file master (Google Drive, Canva, atau format lainnya)
  if (hasMaster && artwork.downloadUrl) {
    const rawUrl = artwork.downloadUrl.trim();
    const urlLower = rawUrl.toLowerCase();
    const isCanva =
      urlLower.includes('canva.com') ||
      formatTrimmed.toUpperCase() === 'CANVA';

    // Khusus link Canva: buka di tab baru
    if (isCanva) {
      if (onToast) onToast('Membuka tautan Canva di tab baru...');
      window.open(rawUrl, '_blank', 'noopener,noreferrer');
      return { type: 'canva', url: rawUrl };
    }

    // Google Drive
    if (urlLower.includes('drive.google.com')) {
      const driveRegex = /\/file\/d\/([a-zA-Z0-9_-]+)/;
      const driveMatch = rawUrl.match(driveRegex);
      if (driveMatch && driveMatch[1]) {
        const fileId = driveMatch[1];
        const directUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
        if (onToast) onToast('Mengunduh berkas langsung dari Google Drive...');

        const link = document.createElement('a');
        link.href = directUrl;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return { type: 'gdrive_direct', url: directUrl };
      } else {
        // Link folder atau format gdrive lainnya
        if (onToast) onToast('Membuka tautan Google Drive...');
        window.open(rawUrl, '_blank', 'noopener,noreferrer');
        return { type: 'gdrive_folder', url: rawUrl };
      }
    }

    // Format & tautan eksternal lainnya (Dropbox, OneDrive, Direct File .psd, .cdr, .ai, .pdf, dll)
    if (onToast) onToast('Membuka tautan unduhan file master...');
    window.open(rawUrl, '_blank', 'noopener,noreferrer');
    return { type: 'external', url: rawUrl };
  }

  // 1. Tidak ada file master (Hanya gambar) -> Unduh file JPG/PNG full asli
  const targetImgUrl =
    artwork.imageUrl ||
    (artwork.imageUrls && artwork.imageUrls.length > 0 ? artwork.imageUrls[0] : '');

  if (!targetImgUrl) {
    if (onToast) onToast('File gambar tidak ditemukan.');
    return { type: 'not_found' };
  }

  if (onStartDownloadImage) onStartDownloadImage();
  if (onToast) onToast('Mengunduh file JPG full asli...');

  const cleanTitle =
    artwork.title.replace(/[^a-zA-Z0-9_\- ]/g, '').replace(/\s+/g, '_') ||
    'karya_pksart';

  try {
    const res = await fetch(targetImgUrl);
    if (res.ok) {
      const blob = await res.blob();
      const ext = blob.type.includes('png')
        ? 'png'
        : blob.type.includes('webp')
        ? 'webp'
        : 'jpg';
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${cleanTitle}.${ext}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
      if (onFinishDownloadImage) onFinishDownloadImage();
      return { type: 'image_blob', url: targetImgUrl };
    }
  } catch (err) {
    console.error('Fetch image blob failed, fallback to direct download:', err);
  }

  // Fallback download
  const link = document.createElement('a');
  link.href = targetImgUrl;
  link.download = `${cleanTitle}.jpg`;
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  if (onFinishDownloadImage) onFinishDownloadImage();
  return { type: 'image_direct', url: targetImgUrl };
}
