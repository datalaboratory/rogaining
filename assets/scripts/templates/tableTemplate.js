import secondsToHhmmss from '../tools/secondsToHhmmss';

const tableTemplate = (selectedRaceTeams) => {
  const tableRows = selectedRaceTeams
    .map((srt, i) => {
      /*
      const checkpoints = srp.checkpoints
        .slice(1, -1)
        .map(cp => `
          <div class="dl-table__checkpoint">
            <div class="dl-table__checkpoint-name">${cp.name}</div>
            <div class="dl-table__checkpoint-from-start">${cp.fromStart}</div>
          </div>
        `)
        .join('');
      */

      return `
        <div
          id="${i}"
          class="dl-table__row"
        >
          <div class="dl-table__number dl-table__tabular">${i + 1}</div>
          <div class="dl-table__name">${srt.name}</div>
          <div class="dl-table__points dl-table__tabular">${srt.points}</div>
          <div class="dl-table__time dl-table__tabular">${secondsToHhmmss(srt.time)}</div>
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
      </div>
      <div class="dl-table__rows">
        ${tableRows}
      </div>
    </div>
  `;
};

export default tableTemplate;
