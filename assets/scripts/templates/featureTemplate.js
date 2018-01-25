import checkboxesTemplate from './checkboxesTemplate';
import mapTemplate from './mapTemplate';
import raceSelectTemplate from './raceSelectTemplate';

const featureTemplate = (races, selectedRace, checkboxes) =>
  `
    <div class="dl-feature">
      <div class="dl-feature__header">
        <div class="dl-feature__header-caption">Финал кубка «Золотой маршрут» 2017</div>
        ${raceSelectTemplate(races, selectedRace)}
      </div>
      <div class="dl-feature__map-checkboxes-container">
        ${mapTemplate()}
        ${checkboxesTemplate(checkboxes)}
      </div>
      <div class="dl-feature__time-slider-and-player-button">
        <div class="dl-feature__time-slider">
          <div class="dl-feature__time-slider-legend">часы:</div>
        </div>
        <div class="dl-feature__player-button"></div>
      </div>
      <div class="dl-feature__table-container"></div>
    </div>
  `;

export default featureTemplate;
