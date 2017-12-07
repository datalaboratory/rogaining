import mapTemplate from './mapTemplate';

const featureTemplate = (races) => {
  const raceSelectorOptions = races
    .map((r, i) => `<option${!i ? ' selected' : ''}>${r.title}</option>`)
    .join('');

  return `
    <div class="dl-feature">
      <select class="dl-feature__race-selector">
        ${raceSelectorOptions}
      </select>
      <div class="dl-feature__map-container">
        ${mapTemplate()}
      </div>
    </div>
  `;
};

export default featureTemplate;
