/**
 * UX 6.3: Mobile → Native Share Sheet; Desktop/បរាជ័យ → ទាញយកផ្ទាល់
 * return: 'shared' | 'cancelled' | 'downloaded'
 */
export async function shareOrDownloadFile(blob, filename) {
  const file = new File([blob], filename, { type: blob.type || 'application/pdf' });
  const isTouch = window.matchMedia?.('(pointer: coarse)').matches;

  if (isTouch && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: filename });
      return 'shared';
    } catch (err) {
      if (err?.name === 'AbortError') return 'cancelled';
      // NotAllowedError (Safari ផុត User Gesture) ។ល។ → Fallback ទាញយក
    }
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return 'downloaded';
}