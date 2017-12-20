const secondsToHHMMSS = (seconds) => {
  const result = [];

  const hhmmss = new Date(seconds * 1000)
    .toISOString()
    .substr(11, 8)
    .split(':');

  for (let i = 0; i < hhmmss.length; i += 1) {
    if (+hhmmss[i] || result.length) result.push(result.length ? hhmmss[i] : +hhmmss[i]);
  }

  if (!result.length) return 0;

  return result.join(':');
};

export default secondsToHHMMSS;
