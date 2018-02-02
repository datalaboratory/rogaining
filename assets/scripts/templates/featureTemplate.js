import checkboxesAndLogoTemplate from './checkboxesAndLogoTemplate';
import mapTemplate from './mapTemplate';
import playerTemplate from './playerTemplate';
import raceSelectTemplate from './raceSelectTemplate';

const featureTemplate = (races, selectedRace, checkboxes) =>
  `
    <div class="dl-feature">
      <div class="dl-feature__header">
        <div class="dl-feature__header-caption">Финал кубка «Золотой маршрут» 2017</div>
        ${raceSelectTemplate(races, selectedRace)}
      </div>
      <div class="dl-feature__map-checkboxes-and-logo-container">
        ${mapTemplate()}
        ${checkboxesAndLogoTemplate(checkboxes)}
      </div>
      ${playerTemplate()}
      <div class="dl-feature__table-container"></div>
    </div>
  `;

export default featureTemplate;
