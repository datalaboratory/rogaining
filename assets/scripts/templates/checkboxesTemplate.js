const checkboxesTemplate = (checkboxes) => {
  const checkboxContainers = checkboxes
    .map(c => `
      <div class="dl-checkboxes__checkbox-container">
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
    <div class="dl-checkboxes">
      ${checkboxContainers}
      <div class="dl-checkboxes__checkbox-container-logo">
        <img src="img/dl-logo.png"/>
        Визуализация
        <br/>
        <a href="https://datalaboratory.ru/">Лаборатории данных</a>
      </div>
    </div>
  `;
};

export default checkboxesTemplate;
