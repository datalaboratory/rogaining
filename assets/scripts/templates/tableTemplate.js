import getPointsFromCpName from '../services/getPointsFromCpName';
import secondsToHHMMSS from '../tools/secondsToHHMMSS';

const tableTemplate = (selectedRaceTeams, selectedRaceTime, maxTime, cpColorScale) => {
  const maxRowHeight = 36;
  const checkpointsHeight = 20;

  const tableRows = selectedRaceTeams
    .map((srt, i) => {
      const nOfCheckpoints = Math.max(...srt.participants.map(p => p.checkpoints.length));
      const checkpoints = [];

      for (let j = 1; j < nOfCheckpoints - 1; j += 1) {
        const ucpParticipants = srt.participants;
        const ucp = srt.participants[0].checkpoints[j];

        const cpd = {
          color: cpColorScale(getPointsFromCpName(ucp.name)),
          height: (ucpParticipants.length * 100) / srt.participants.length,
          fromStart: Math.max(...ucpParticipants.map(p => p.checkpoints[j].fromStart)),
        };

        const checkpointParts = `
              <div
                class="dl-table__checkpoint-part"
                style="top: -2px; left: ${(cpd.fromStart * 100) / maxTime}%; height: calc(100% + 4px);">
                <div
                  class="dl-table__checkpoint-part-mark"
                  style="background-color: ${cpd.color};">
                </div>
              </div>
            `;

        checkpoints.push(`
          <div class="dl-table__checkpoint">
            ${checkpointParts}
          </div>
        `);
      }

      return `
        <div
          class="dl-table__row"
          style="height: ${maxRowHeight}px;">
          <div class="dl-table__number dl-table__tabular">${i + 1}</div>
          <div class="dl-table__name">
            <div class="dl-table__name-short">${srt.name}</div>
            <div class="dl-table__name-full">${srt.name}</div>
          </div>
          <div class="dl-table__points dl-table__tabular">${srt.points}</div>
          <div class="dl-table__time dl-table__tabular">${secondsToHHMMSS(srt.time)}</div>
          <div
            class="dl-table__checkpoints"
            style="height: ${checkpointsHeight}px">
            <div
              class="dl-table__checkpoints-background"
              style="width: ${((srt.time > selectedRaceTime ? selectedRaceTime : srt.time) * 100) / maxTime}%;"></div>
            ${srt.time > selectedRaceTime ? `
              <div
                class="dl-table__penalty-cut"
                style="left: ${(selectedRaceTime * 100) / maxTime}%; width: ${((srt.time - selectedRaceTime) * 100) / maxTime}%;"></div>
              ` : ''}
            ${checkpoints.join('')}
          </div>
        </div>
      `;
    })
    .join('');

  return `
    <div class="dl-table">
      <div class="dl-table__header">
        <div class="dl-table__number"></div>
        <div class="dl-table__name">Команда</div>
        <div class="dl-table__points">Очки</div>
        <div class="dl-table__time">Время</div>
        <div class="dl-table__checkpoints">Сплиты</div>
      </div>
      <div class="dl-table__body">
        ${tableRows}
      </div>
      <div class="dl-table__tooltip-container"></div>
    </div>
  `;
};

export default tableTemplate;
