const colorSets = {
  3: ['#fee8c8', '#fdbb84', '#e34a33'],
  4: ['#fef0d9', '#fdcc8a', '#fc8d59', '#d7301f'],
  5: ['#fef0d9', '#fdcc8a', '#fc8d59', '#e34a33', '#b30000'],
  6: ['#fef0d9', '#fdd49e', '#fdbb84', '#fc8d59', '#e34a33', '#b30000'],
  7: ['#fef0d9', '#fdd49e', '#fdbb84', '#fc8d59', '#ef6548', '#d7301f', '#990000'],
  8: ['#fff7ec', '#fee8c8', '#fdd49e', '#fdbb84', '#fc8d59', '#ef6548', '#d7301f', '#990000'],
  9: ['#fff7ec', '#fee8c8', '#fdd49e', '#fdbb84', '#fc8d59', '#ef6548', '#d7301f', '#b30000', '#7f0000'],
};

const getSequentialColors = quantity =>
  colorSets[quantity] || [];

export default getSequentialColors;
