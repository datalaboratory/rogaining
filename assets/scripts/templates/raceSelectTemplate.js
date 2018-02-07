const raceSelectTemplate = (races, selectedRace) => {
  const options = races
    .map((r, i) => {
      if (!i || r.group !== races[i - 1].group) {
        let optionClass = 'dl-race-select__option';

        if (r.id === selectedRace) {
          optionClass += ' dl-race-select__option--selected';
        }

        return `
          <div class="dl-race-select__optgroup">${r.group}</div>
          <div class="${optionClass}">${r.title}</div>
        `;
      }

      return `
        <div class="dl-race-select__option">${r.title}</div>
      `;
    })
    .join('');

  return `
    <div
      class="dl-race-select"
      tabindex="0">
      <div class="dl-race-select__toggle">${selectedRace}</div>
      <div class="dl-race-select__dropdown">
        ${options}
      </div>
    </div>
  `;
};

export default raceSelectTemplate;
