const getAngleBetweenPoints = (point, centerPoint) => {
  const dy = point.y - centerPoint.y;
  const dx = point.x - centerPoint.x;
  const theta = Math.atan2(dy, dx);

  let angle = (((theta * 180) / Math.PI)) % 360;

  angle = (angle < 0) ? 360 + angle : angle;

  return angle;
};

export default getAngleBetweenPoints;
