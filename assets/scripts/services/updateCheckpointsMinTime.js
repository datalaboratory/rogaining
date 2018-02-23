export default (coordinates, selectedRaceData) => {
  const minCPTimes = {};
  selectedRaceData.teams.forEach(({ participants }) => {
    const cps = participants[0].checkpoints;
    cps.forEach(({ name, fromStart }, i) => {
      if (!i) return;
      const prevCP = cps[i - 1].name;
      const time = Number(fromStart);
      if (minCPTimes[prevCP] !== undefined) {
        if (minCPTimes[prevCP].to[name] !== undefined) {
          if (minCPTimes[prevCP].to[name] > time) {
            minCPTimes[prevCP].to[name] = time;
          }
        } else {
          minCPTimes[prevCP].to[name] = time;
        }
      } else {
        minCPTimes[prevCP] = { to: { [name]: time } };
      }
    });
  });
  // coordinates.forEach((c) => {
  //   minCPTimes[c.name] = Math.min.apply(null, selectedRaceData.teams
  //     .map(({ participants }) => {
  //       const cp = participants[0].checkpoints.find(({ name }, i) => name === c.name && i !== 0);
  //       return (cp && cp.fromStart) || (cp && cp.fromStart !== 0 && +Infinity) || (!cp && +Infinity) || cp.fromStart;
  //     }));
  // });
  return minCPTimes;
};
