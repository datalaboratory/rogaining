const HHMMSSToSeconds = (string) => {
  const ss = string.split(':');

  return (ss[ss.length - 3] ? +ss[ss.length - 3] * 60 * 60 : 0) +
    (ss[ss.length - 2] ? +ss[ss.length - 2] * 60 : 0) +
    (ss[ss.length - 1] ? +ss[ss.length - 1] : 0);
};

export default HHMMSSToSeconds;
