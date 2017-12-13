const getPossibleLinks = (coordinates) => {
  const links = [];

  for (let i = 0; i < coordinates.length; i += 1) {
    for (let j = 0; j < coordinates.length; j += 1) {
      if (coordinates[i].name !== coordinates[j].name) {
        links.push({
          name: `${coordinates[i].name}-${coordinates[j].name}`,
          x1: coordinates[i].x,
          y1: coordinates[i].y,
          x2: coordinates[j].x,
          y2: coordinates[j].y,
        });
      }
    }
  }

  return links;
};

export default getPossibleLinks;
