const getPointsFromCpName = (name) => {
  const number = Number(name);
  if (number < 9) return 2;
  if (number < 20) return 3;
  if (number < 70) return +name[0];
  if (number < 80) return 4;
  if (number < 90) return 5;
  if (number < 100) return 6;
  return 1;
};

export default getPointsFromCpName;
