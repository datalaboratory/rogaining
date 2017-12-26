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
    </div>
  `;
};

export default checkboxesTemplate;
