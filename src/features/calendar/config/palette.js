export const CATEGORY_FALLBACK_COLORS = {
  Studio: '#F26389',
  Event: '#6366F1',
};

export const getCategoryColor = (categoryName, categories = []) => {
  if (!categoryName) return '#b1b1b1';
  const match = categories.find((c) => c.name === categoryName);
  return match?.color || CATEGORY_FALLBACK_COLORS[categoryName] || '#b1b1b1';
};

export const hexToRgba = (hex, alpha = 1) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return `rgba(178,177,177,${alpha})`;
  return `rgba(${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)},${alpha})`;
};
