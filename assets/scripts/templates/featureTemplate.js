import mapTemplate from './mapTemplate';

const featureTemplate = (races, selectedRace) => {
  const raceSelectOptions = races
    .map(r => `<option${r.title === selectedRace ? ' selected' : ''}>${r.title}</option>`)
    .join('');

  return `
    <div class="dl-feature">
      <div class="dl-feature__controls">
        <select class="dl-feature__race-select">
          ${raceSelectOptions}
        </select>
        <div class="dl-feature__time-slider">
          <div class="dl-feature__time-slider-legend">часы:</div>
        </div>
      </div>
      <div class="dl-feature__map-container">
        ${mapTemplate()}
      </div>
      <div class="dl-feature__table-container"></div>
    </div>
  `;
};

export default featureTemplate;
