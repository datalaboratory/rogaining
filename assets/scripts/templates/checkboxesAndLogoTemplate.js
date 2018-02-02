const checkboxesAndLogoTemplate = (checkboxes) => {
  const checkboxContainers = checkboxes
    .map(c => `
      <div class="dl-checkboxes-and-logo__checkbox-container">
        <input
          type="checkbox"
          id="${c.id}"
          ${c.checked ? 'checked' : ''}
        />
        <label for="${c.id}">${c.label}</label>
      </div>
    `)
    .join('');

  return `
    <div class="dl-checkboxes-and-logo">
      ${checkboxContainers}
      <div class="dl-checkboxes-and-logo__logo">
        <img src="img/logo.png" />
        Визуализация
        <br/>
        <a href="https://datalaboratory.ru/">Лаборатории данных</a>
      </div>
    </div>
  `;
};

export default checkboxesAndLogoTemplate;
