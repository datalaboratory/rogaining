const isLinkExisting = (links, from, to) =>
  links.find(l => l.from === from && l.to === to) ||
  links.find(l => l.from === to && l.to === from);

const getPossibleLinks = (coordinates) => {
  const links = [];

  for (let i = 0; i < coordinates.length; i += 1) {
    for (let j = 0; j < coordinates.length; j += 1) {
      if (i !== j) {
        const from = coordinates[i].name;
        const to = coordinates[j].name;

        if (!isLinkExisting(links, from, to)) {
          links.push({
            from,
            to,
            x1: coordinates[i].x,
            y1: coordinates[i].y,
            x2: coordinates[j].x,
            y2: coordinates[j].y,
          });
        }
      }
    }
  }

  return links;
};

export default getPossibleLinks;
