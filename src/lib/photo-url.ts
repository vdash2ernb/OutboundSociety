// Absolute URL of an optimized photo from src/assets/photos (for structured data)
import { getImage } from 'astro:assets';
import type { ImageMetadata } from 'astro';

const photos = import.meta.glob<{ default: ImageMetadata }>('../assets/photos/*.jpg', { eager: true });

export async function photoUrl(name: string, site: URL | undefined, width = 1200) {
  const img = await getImage({ src: photos[`../assets/photos/${name}.jpg`].default, width, format: 'jpg' });
  return new URL(img.src, site).toString();
}
