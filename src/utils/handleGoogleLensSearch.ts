export const handleGoogleLensSearch = (
  event: React.MouseEvent,
  imageUrl: string | undefined,
) => {
  event.preventDefault();
  event.stopPropagation();
  if (!imageUrl) return;

  try {
    // This prevents double-encoding issues
    let normalizedUrl = imageUrl;

    // Check if the URL appears to be already encoded
    if (imageUrl.includes('%20') || imageUrl.includes('%3A') || imageUrl.includes('%2F')) {
      try {
        // Try to decode first to avoid double encoding
        normalizedUrl = decodeURIComponent(imageUrl);
      } catch (e) {
        // If decoding fails, use the original URL
        console.warn('Failed to decode URL, using original');
        normalizedUrl = imageUrl;
      }
    }

    // Now encode the normalized URL
    const encodedUrl = encodeURIComponent(normalizedUrl);

    // Open Google Lens with the properly encoded URL
    window.open(
      `https://lens.google.com/uploadbyurl?url=${encodedUrl}`,
      "_blank",
    );
  } catch (error) {
    console.error('Error handling Google Lens search:', error);

    // Fallback approach - try opening Google Lens without the problematic URL
    try {
      window.open('https://lens.google.com/', '_blank');
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError);
    }
  }
};