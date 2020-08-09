window.addEventListener('load', () => {
  initRangeInput();
  updatePreviewColor();
});

const rangeInputs = Array.from(document.querySelectorAll('.range'));

const previewDiv = document.querySelector('#block-rgb');
const bodyDiv = document.querySelector('#body-rgb');

const updatePreviewColor = () => {
  const rgbColor = `rgb(${rangeInputs.map((range) => range.value).join(',')})`;
  previewDiv.style.backgroundColor = rgbColor;
  bodyDiv.style.backgroundColor = rgbColor;
};
const initRangeInput = () => {
  rangeInputs.forEach((range) => {
    const input = document.querySelector(`#${range.id}-value`);
    range.value = 0;
    input.value = range.value;
    range.addEventListener('input', (event) => {
      input.value = event.target.value;
      updatePreviewColor();
    });
  });
};
