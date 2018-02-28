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

  return minCPTimes;
};
