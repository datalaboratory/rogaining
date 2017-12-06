// Imports
import { csv as d3csv } from 'd3-request/build/d3-request';
import { queue as d3queue } from 'd3-queue';
import { scaleLinear as d3scaleLinear } from 'd3-scale';
import { select as d3select } from 'd3-selection';

import featureTemplate from './templates/featureTemplate';
import lastOf from './tools/lastOf';
import parseCoordinatesData from './services/parseCoordinatesData';
import parseRacesData from './services/parseRacesData';

// Globals
const races = [
  { fileName: 'Split_rogaining_Final_Kubka - Ж4Б_В.csv', title: 'Ж4Б_В' },
  { fileName: 'Split_rogaining_Final_Kubka - Ж4Б_СВ.csv', title: 'Ж4Б_СВ' },
  { fileName: 'Split_rogaining_Final_Kubka - Ж4Б_Ю.csv', title: 'Ж4Б_Ю' },
  { fileName: 'Split_rogaining_Final_Kubka - Ж4Б.csv', title: 'Ж4Б' },
  { fileName: 'Split_rogaining_Final_Kubka - Ж4В_В.csv', title: 'Ж4В_В' },
  { fileName: 'Split_rogaining_Final_Kubka - Ж4В.csv', title: 'Ж4В' },
  { fileName: 'Split_rogaining_Final_Kubka - Ж4Б_В.csv', title: 'Ж4Б_В' },
  { fileName: 'Split_rogaining_Final_Kubka - Ж4Б_СВ.csv', title: 'Ж4Б_СВ' },
  { fileName: 'Split_rogaining_Final_Kubka - Ж4Б_Ю.csv', title: 'Ж4Б_Ю' },
  { fileName: 'Split_rogaining_Final_Kubka - М4Б.csv', title: 'М4Б' },
  { fileName: 'Split_rogaining_Final_Kubka - М4В_В.csv', title: 'М4В_В' },
  { fileName: 'Split_rogaining_Final_Kubka - М4В.csv', title: 'М4В' },
  { fileName: 'Split_rogaining_Final_Kubka - МЖ4Б_В.csv', title: 'МЖ4Б_В' },
  { fileName: 'Split_rogaining_Final_Kubka - МЖ4Б_Ю.csv', title: 'МЖ4Б_Ю' },
  { fileName: 'Split_rogaining_Final_Kubka - МЖ4Б.csv', title: 'МЖ4Б' },
  { fileName: 'Split_rogaining_Final_Kubka - МЖ4В.csv', title: 'МЖ4В' },
];

const scales = {
  x: d3scaleLinear(),
  y: d3scaleLinear(),
};

let ratio;

let $feature;
let $checkpoints;

let d3checkpointGroups;

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

  d3checkpointGroups.attr('transform', d => `translate(${scales.x(d.x)}, ${scales.y(d.y)})`);
};

// Add resize event listener
window.addEventListener('resize', resize);

// Document DOMContentLoaded — create layout
const DOMContentLoaded = () => {
  // Create layout
  document.querySelector('.dl-feature-container').innerHTML = featureTemplate();

  $feature = document.querySelector('.dl-feature');
  $checkpoints = document.querySelector('.dl-checkpoints');

  // Get raw data
  const q = d3queue();

  races.forEach((r) => {
    q.defer(d3csv, `/data/${r.fileName}`);
  });

  q.defer(d3csv, '/data/Протокол.csv');
  q.defer(d3csv, '/data/Координаты.csv');

  q.awaitAll((error, rawData) => {
    if (error) throw error;

    // Parse races data
    const racesData = parseRacesData(rawData.slice(0, -1), races);

    // Parse coordinates data
    const coordinates = parseCoordinatesData(lastOf(rawData));

    const pixels = {
      start: {
        left: 820,
        top: 220,
        right: 802,
        bottom: 924,
      },
      common: {
        left: 696,
        top: 304,
        right: 926,
        bottom: 840,
      },
    };

    const commonCP = coordinates.find(c => c.name === '32');
    const startCP = coordinates.find(c => c.name === 'Старт');

    const mPerPx = (
      (Math.abs(startCP.y - commonCP.y) / Math.abs(pixels.start.top - pixels.common.top)) +
      (Math.abs(startCP.y - commonCP.y) / Math.abs(pixels.start.bottom - pixels.common.bottom)) +
      (Math.abs(startCP.x - commonCP.x) / Math.abs(pixels.start.left - pixels.common.left)) +
      (Math.abs(startCP.x - commonCP.x) / Math.abs(pixels.start.right - pixels.common.right))
    ) / 4;
    const xMin = -(pixels.start.left - (startCP.x / mPerPx)) * mPerPx;
    const xMax = (pixels.start.right + (startCP.x / mPerPx)) * mPerPx;
    const yMin = -(pixels.start.bottom - (startCP.y / mPerPx)) * mPerPx;
    const yMax = (pixels.start.top + (startCP.y / mPerPx)) * mPerPx;

    ratio = (xMax - xMin) / (yMax - yMin);
    scales.x.domain([xMin, xMax]);
    scales.y.domain([yMin, yMax]);

    // Add checkpoints
    d3checkpointGroups = d3select('.dl-checkpoints svg')
      .selectAll('g')
      .data(coordinates)
      .enter()
      .append('g')
      .attr('class', 'dl-checkpoints__checkpoint');

    d3checkpointGroups.append('text')
      .attr('class', 'dl-checkpoints__checkpoint-caption')
      .attr('y', -5)
      .text(d => d.name);

    d3checkpointGroups.append('circle')
      .attr('class', 'dl-checkpoints__checkpoint-mark')
      .attr('r', 5);

    // First resize
    resize();
  });
};

// Add DOMContentLoaded listener (entry point)
document.addEventListener('DOMContentLoaded', DOMContentLoaded);
