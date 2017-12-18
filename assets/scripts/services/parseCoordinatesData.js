const parseCoordinatesData = rawData =>
  rawData
    .map(rd => ({
      name: rd['КП'],
      x: +rd.x,
      y: +rd.y,
    }))
    .sort((a, b) => b.x - a.x);

export default parseCoordinatesData;
