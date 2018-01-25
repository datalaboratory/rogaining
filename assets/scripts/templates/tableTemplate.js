import uniq from 'lodash.uniq';

import secondsToHHMMSS from '../tools/secondsToHHMMSS';

const tableTemplate = (selectedRaceTeams, maxTime, cpColorScale) => {
  const maxRowHeight = 36;
  const checkpointsHeight = 20;

  const tableRows = selectedRaceTeams
    .map((srt, i) => {
      const nOfCheckpoints = Math.max(...srt.participants.map(p => p.checkpoints.length));
      const checkpoints = [];

      for (let j = 1; j < nOfCheckpoints - 1; j += 1) {
        const uniqCheckpoints = uniq(srt.participants.map(p => p.checkpoints[j].name)).filter(Boolean);

        const checkpointPartsData = uniqCheckpoints
          .map((ucp) => {
            const ucpParticipants = srt.participants.filter(p => p.checkpoints[j].name === ucp);

            return {
              color: cpColorScale(ucp),
              height: (100 * ucpParticipants.length) / srt.participants.length,
              fromStart: Math.max(...ucpParticipants.map(p => p.checkpoints[j].fromStart)),
            };
          })
          .sort((a, b) => a.fromStart - b.fromStart);

        let y = 0;

        const checkpointParts = checkpointPartsData
          .map((cpd) => {
            const top = `${y}%`;
            y += cpd.height;

            return `
              <div
                class="dl-table__checkpoint-part"
                style="top: calc(${top} - 2px); left: ${(100 * cpd.fromStart) / maxTime}%; height: calc(${cpd.height}% + 4px);">
                <div
                  class="dl-table__checkpoint-part-mark"
                  style="background-color: ${cpd.color};">
                </div>
              </div>
            `;
          })
          .join('');

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
              style="width: ${(100 * srt.time) / maxTime}%;"></div>
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
    </div>
  `;
};

export default tableTemplate;
