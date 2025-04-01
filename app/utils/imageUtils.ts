type ImageKey = 'beach-cleanup' | 'community-garden' | 'environmental-education' | 'trail-maintenance';

export const PLACEHOLDER_IMAGES: Record<ImageKey, string> = {
  'beach-cleanup': 'https://placehold.co/600x400/87CEEB/ffffff?text=Beach+Cleanup',
  'community-garden': 'https://placehold.co/600x400/90EE90/ffffff?text=Community+Garden',
  'environmental-education': 'https://placehold.co/600x400/FFB6C1/ffffff?text=Environmental+Education',
  'trail-maintenance': 'https://placehold.co/600x400/DEB887/ffffff?text=Trail+Maintenance'
};

export const getImageUrl = (key: string | undefined): string => {
  if (!key) return 'https://placehold.co/600x400/cccccc/333333?text=No+Image';
  const normalizedKey = key.replace('/images/', '').replace('.jpg', '') as ImageKey;
  return PLACEHOLDER_IMAGES[normalizedKey] || 'https://placehold.co/600x400/cccccc/333333?text=No+Image';
}; 