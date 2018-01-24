const getDistanceBetweenPoints = (p1, p2) => {
  let xs = p2.x - p1.x;
  xs *= xs;

  let ys = p2.y - p1.y;
  ys *= ys;

  return Math.sqrt(xs + ys);
};

export default getDistanceBetweenPoints;
