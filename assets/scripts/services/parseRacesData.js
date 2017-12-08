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
      })),
  };

  participantData.path.unshift({
    checkpoint: 'Старт',
    fromStart: 0,
  });

  participantData.path.push({
    checkpoint: 'Старт',
    fromStart: participantData.time,
  });

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
        const fromFirstToSecond = participantData.path[aSecondIndex].fromStart -
          participantData.path[aFirstIndex].fromStart;

        participantData.path.splice(aSecondIndex, 0, {
          checkpoint: parsedAdjustment[1],
          fromStart: participantData.path[aFirstIndex].fromStart + Math.ceil(fromFirstToSecond / 2),
        });

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
