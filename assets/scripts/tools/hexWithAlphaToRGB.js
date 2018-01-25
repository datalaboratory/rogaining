const hexWithAlphaToRGB = (hex, alpha) => {
  const rgb = {
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
  };

  const rgbPlusAlpha = {
    r: Math.round(((1 - alpha) * 255) + (alpha * rgb.r)),
    g: Math.round(((1 - alpha) * 255) + (alpha * rgb.g)),
    b: Math.round(((1 - alpha) * 255) + (alpha * rgb.b)),
  };

  return `rgb(${rgbPlusAlpha.r}, ${rgbPlusAlpha.g}, ${rgbPlusAlpha.b})`;
};

export default hexWithAlphaToRGB;
