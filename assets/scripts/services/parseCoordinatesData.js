const parseCoordinatesData = rawData =>
  rawData.map(rd => ({
    name: rd['КП'],
    x: parseInt(rd.x, 10),
    y: parseInt(rd.y, 10),
  }));

export default parseCoordinatesData;
