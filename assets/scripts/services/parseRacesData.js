import capitalizeFirstLetter from '../tools/capitalizeFirstLetter';
import hhmmssToSeconds from '../tools/hhmmssToSeconds';
import lastOf from '../tools/lastOf';

// Apply protocol adjustment
const applyProtocolAdjustment = (participant, protocol) => {
  const participantData = {
    points: parseInt(participant['***'], 10) || 0,
    time: hhmmssToSeconds(participant['Результат']),
    path: Object.keys(participant)
      .filter(key =>
        key.indexOf('#') !== -1 &&
        participant[key] &&
        participant[key].match(/\[(.*?)\]/))
      .sort((a, b) => +a.split('#')[1] - +b.split('#')[1])
      .map(key => ({
        checkpoint: participant[key].match(/\[(.*?)\]/)[1],
        fromStart: hhmmssToSeconds(participant[key].split('[')[0]),
        fromPrevious: hhmmssToSeconds(participant[key].split(']')[1]),
      })),
  };

  const protocolAdjustment = protocol.filter(p =>
    p['Команда'] === participant['Номер'] ||
    p['Команда'] === participant['Номер'].split('.')[0]);

  if (protocolAdjustment.length) {
    // There are adjustment records in protocol
    protocolAdjustment.forEach((pa) => {
      const parsedAdjustment = pa['Корректировка'].split('-');
      const aFirstIndex = parsedAdjustment[0] === 'старт' ?
        0 :
        participantData.path.findIndex(p => p.checkpoint === parsedAdjustment[0]);
      const aSecondIndex = parsedAdjustment[2] === 'финиш' ?
        participantData.path.length - 1 :
        participantData.path.findIndex(p => p.checkpoint === parsedAdjustment[2]);

      if ((aFirstIndex !== -1 && aSecondIndex !== -1) &&
        (!(aSecondIndex - aFirstIndex) || aSecondIndex - aFirstIndex === 1)) {
        // Adjustment can be applied
        const item = { checkpoint: parsedAdjustment[1] };

        if (!aFirstIndex) {
          // Beginning of path
          item.fromStart = Math.ceil(participantData.path[0].fromStart / 2);
          item.fromPrevious = 0;

          participantData.path.unshift(item);

          participantData.path[1].fromPrevious = Math.floor(participantData.path[1].fromStart / 2);
        } else if (aFirstIndex === participantData.path.length - 1) {
          // End of path
          const fromFirstToSecond = participantData.time - lastOf(participantData.path).fromStart;

          item.fromStart = lastOf(participantData.path).fromStart + Math.ceil(fromFirstToSecond / 2);
          item.fromPrevious = Math.floor(fromFirstToSecond / 2);

          participantData.path.push(item);
        } else {
          // Somewhere along path
          const fromFirstToSecond = participantData.path[aSecondIndex].fromStart -
            participantData.path[aFirstIndex].fromStart;

          item.fromStart = participantData.path[aFirstIndex].fromStart + Math.ceil(fromFirstToSecond / 2);
          item.fromPrevious = Math.floor(fromFirstToSecond / 2);

          participantData.path.splice(aSecondIndex, 0, item);
        }

        participantData.points += +parsedAdjustment[1][0];
      }
    });
  }

  return participantData;
};

const parseRacesData = (rawData, races) =>
  races.map((r, i) => ({
    title: r.title,
    participants: rawData[i].map(rd => Object.assign(
      // Participant data contains of two objects — static data and path data
      {
        number: rd['Номер'],
        teamName: rd['Команда'],
        name: capitalizeFirstLetter(rd['Имя'].toLowerCase()),
        surname: capitalizeFirstLetter(rd['Фамилия'].toLowerCase()),
        yearOfBirth: rd['Г.р.'],
      },
      applyProtocolAdjustment(rd, lastOf(rawData)),
    )).sort((a, b) => {
      if (a.points > b.points) return -1;
      if (a.points < b.points) return 1;
      if (a.time < b.time) return -1;
      if (a.time > b.time) return 1;

      return 0;
    }),
  }));

export default parseRacesData;
