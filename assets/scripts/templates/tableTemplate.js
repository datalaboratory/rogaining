import secondsToHhmmss from '../tools/secondsToHhmmss';

const tableTemplate = (selectedRaceParticipants) => {
  const tableRows = selectedRaceParticipants
    .map((srp, i) => {
      const checkpoints = srp.checkpoints
        .slice(1, -1)
        .map(cp => `
          <div class="dl-table__checkpoint">
            <div class="dl-table__checkpoint-name">${cp.name}</div>
            <div class="dl-table__checkpoint-from-start">${cp.fromStart}</div>
          </div>
        `)
        .join('');

      return `
        <div
          id="${i}"
          class="dl-table__row"
        >
          <div class="dl-table__table-number dl-table__tabular">${i + 1}</div>
          <div class="dl-table__race-number dl-table__tabular">${srp.number}</div>
          <div class="dl-table__name">${srp.name} ${srp.surname}</div>
          <div class="dl-table__points dl-table__tabular">${srp.points}</div>
          <div class="dl-table__time dl-table__tabular">${secondsToHhmmss(srp.time)}</div>
          <div class="dl-table__team-name">${srp.teamName}</div>
          <div class="dl-table__year-of-birth dl-table__tabular">${srp.yearOfBirth}</div>
        </div>
      `;
    })
    .join('');

  return `
    <div class="dl-table">
      <div class="dl-table__header">
        <div class="dl-table__table-number"></div>
        <div class="dl-table__race-number">№</div>
        <div class="dl-table__name">Участник</div>
        <div class="dl-table__points">Очки</div>
        <div class="dl-table__time">Время</div>
        <div class="dl-table__team-name">Команда</div>
        <div class="dl-table__year-of-birth">Г.р.</div>
      </div>
      ${tableRows}
    </div>
  `;
};

export default tableTemplate;
