// Imports
import { scaleLinear as d3scaleLinear } from 'd3-scale';
import { select as d3select } from 'd3-selection';

import featureTemplate from './templates/featureTemplate';
import getCpCoordinates from './services/getCpCoordinates';

// Globals
const cpCoordinates = getCpCoordinates();

const mPerPx = ((432 / 84) + (432 / 84) + (635 / 124) + (635 / 124)) / 4;
const xMin = -(820 + (2 / mPerPx)) * mPerPx;
const xMax = (802 - (2 / mPerPx)) * mPerPx;
const yMin = -(924 - (3 / mPerPx)) * mPerPx;
const yMax = (220 + (3 / mPerPx)) * mPerPx;
const ratio = (xMax - xMin) / (yMax - yMin);

const scales = {
  x: d3scaleLinear().domain([xMin, xMax]),
  y: d3scaleLinear().domain([yMin, yMax]),
};

let $feature;
let $checkpoints;

let checkpointGroups;

// Window resize — set calculated size
const resize = () => {
  const { width, height } = $feature.getBoundingClientRect();

  let checkpointsWidth = width;
  let checkpointsHeight = height;

  if (width > height * ratio) {
    checkpointsWidth = height * ratio;
  } else if (height > width / ratio) {
    checkpointsHeight = width / ratio;
  }

  $checkpoints.style.width = `${checkpointsWidth}px`;
  $checkpoints.style.height = `${checkpointsHeight}px`;

  scales.x.range([0, checkpointsWidth]);
  scales.y.range([checkpointsHeight, 0]);

  checkpointGroups.attr('transform', d => `translate(${scales.x(d.x)}, ${scales.y(d.y)})`);
};

window.addEventListener('resize', resize);

// Document DOMContentLoaded — create layout
const DOMContentLoaded = () => {
  // Create layout
  document.querySelector('.dl-feature-container').innerHTML = featureTemplate(cpCoordinates, scales);

  $feature = document.querySelector('.dl-feature');
  $checkpoints = document.querySelector('.dl-checkpoints');

  checkpointGroups = d3select('.dl-checkpoints svg')
    .selectAll('g')
    .data(cpCoordinates)
    .enter()
    .append('g')
    .attr('class', 'dl-checkpoints__checkpoint');

  checkpointGroups.append('text')
    .attr('class', 'dl-checkpoints__checkpoint-caption')
    .attr('y', -5)
    .text(d => d.name);

  checkpointGroups.append('circle')
    .attr('class', 'dl-checkpoints__checkpoint-mark')
    .attr('r', 5);

  resize();
};

document.addEventListener('DOMContentLoaded', DOMContentLoaded);
