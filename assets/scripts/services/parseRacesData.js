import groupby from 'lodash.groupby';

import capitalizeFirstLetter from '../tools/capitalizeFirstLetter';
import HHMMSSToSeconds from '../tools/HHMMSSToSeconds';
import lastOf from '../tools/lastOf';

// Apply protocol adjustment
const applyProtocolAdjustment = (participant, protocol) => {
  const participantData = {
    points: 0,
    time: HHMMSSToSeconds(participant['Результат']),
    checkpoints: Object.keys(participant)
      .filter(key =>
        key.indexOf('#') !== -1 &&
        participant[key] &&
        participant[key].match(/\[(.*?)\]/))
      .sort((a, b) => +a.split('#')[1] - +b.split('#')[1])
      .map(key => ({
        name: participant[key].match(/\[(.*?)\]/)[1],
        fromStart: HHMMSSToSeconds(participant[key].split('[')[0]),
      })),
    adjustmentErrors: [],
  };

  participantData.checkpoints.unshift({
    name: 'Старт',
    fromStart: 0,
  });

  participantData.checkpoints.push({
    name: 'Старт',
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
        participantData.checkpoints.findIndex(p => p.name === parsedAdjustment[0]);
      const aSecondIndex = parsedAdjustment[2] === 'финиш' ?
        participantData.checkpoints.length - 1 :
        participantData.checkpoints.findIndex(p => p.name === parsedAdjustment[2]);

      if ((aFirstIndex !== -1 && aSecondIndex !== -1) &&
        (!(aSecondIndex - aFirstIndex) || aSecondIndex - aFirstIndex === 1)) {
        // Adjustment can be applied
        const fromFirstToSecond = participantData.checkpoints[aSecondIndex].fromStart -
          participantData.checkpoints[aFirstIndex].fromStart;

        participantData.checkpoints.splice(aSecondIndex, 0, {
          name: parsedAdjustment[1],
          fromStart: participantData.checkpoints[aFirstIndex].fromStart + Math.ceil(fromFirstToSecond / 2),
        });
      } else {
        participantData.adjustmentErrors.push(pa['Корректировка']);
      }
    });
  }

  if (participantData.time) {
    participantData.points = participantData.checkpoints
      .map(cp => +(cp.name.indexOf('-') === -1 ? cp.name[0] : cp.name.split('-')[1]) || 0)
      .reduce((a, b) => a + b, 0);

    const penalty = Math.ceil((participantData.time - (4 * 60 * 60)) / 60);

    if (penalty > 30 || participantData.points - penalty < 0) {
      participantData.points = 0;
    } else if (penalty > 0) {
      participantData.points -= penalty;
    }
  }

  return participantData;
};

const parseRacesData = (rawData, races) =>
  races.map((r, i) => {
    const participants = rawData[i]
      .map(rd => Object.assign(
        // Participant data contains of two objects — static data and checkpoints data
        {
          number: rd['Номер'],
          teamName: rd['Команда'],
          name: capitalizeFirstLetter(rd['Имя'].toLowerCase()),
          surname: capitalizeFirstLetter(rd['Фамилия'].toLowerCase()),
          yearOfBirth: rd['Г.р.'],
        },
        applyProtocolAdjustment(rd, lastOf(rawData)),
      ))
      .sort((a, b) => {
        if (a.surname < b.surname) return -1;
        if (a.surname > b.surname) return 1;
        if (a.name < b.name) return -1;
        if (a.name > b.name) return 1;

        return 0;
      });

    const participantsGroupedByTeamName = groupby(participants, 'teamName');

    const teams = Object.keys(participantsGroupedByTeamName)
      .map(key => ({
        name: key,
        points: Math.min(...participantsGroupedByTeamName[key].map(p => p.points)),
        time: Math.max(...participantsGroupedByTeamName[key].map(p => p.time)),
        participants: participantsGroupedByTeamName[key],
      }))
      .sort((a, b) => {
        if (a.points > b.points) return -1;
        if (a.points < b.points) return 1;
        if (a.time < b.time) return -1;
        if (a.time > b.time) return 1;

        return 0;
      });

    return {
      id: r.id,
      teams,
    };
  });

export default parseRacesData;
