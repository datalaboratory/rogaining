// Imports
import { csv as d3csv } from 'd3-request/build/d3-request';
import { queue as d3queue } from 'd3-queue';
import {
  scaleLinear as d3scaleLinear,
  scaleOrdinal as d3scaleOrdinal,
  schemeCategory20 as d3schemeCategory20,
} from 'd3-scale';
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

const margin = {
  top: 20,
  right: 10,
  bottom: 20,
  left: 10,
};

const scales = {
  x: d3scaleLinear(),
  y: d3scaleLinear(),
  color: d3scaleOrdinal(d3schemeCategory20),
};

let racesData;
let selectedRace = 'Ж4Б_В';
let selectedRaceData;
let currentTime = 0;

let startCP;
let ratio;

let $featureMapContainer;
let $map;

let d3checkpointGroups;
let d3participantsGroup;
let d3participantGroups;

// Set participants coordinates
const setParticipantsCoordinates = (participants, reset = false) => {
  if (reset) {
    participants.forEach((p) => {
      p.x = startCP.x;
      p.y = startCP.y;
    });
  } else { }
};

// Init participant groups
const initParicipantGroups = (participants) => {
  d3participantsGroup
    .selectAll('*')
    .remove();

  d3participantGroups = d3participantsGroup
    .selectAll('g')
    .data(participants)
    .enter()
    .append('g')
    .attr('class', 'dl-map__g-participant');

  d3participantGroups
    .append('circle')
    .attr('class', 'dl-map__g-participant-mark')
    .attr('r', 2)
    .attr('fill', d => scales.color(d.teamName));
};

// Place participants on map
const placeParticipantsOnMap = () => {
  d3participantGroups.attr('transform', d => `translate(${scales.x(d.x)}, ${scales.y(d.y)})`);
};

// Window resize — set calculated size
const resize = () => {
  const { width, height } = $featureMapContainer.getBoundingClientRect();

  let mapWidth = width;
  let mapHeight = height;

  if (width > height * ratio) {
    mapWidth = height * ratio;
  } else if (height > width / ratio) {
    mapHeight = width / ratio;
  }

  $map.style.width = `${mapWidth}px`;
  $map.style.height = `${mapHeight}px`;

  scales.x.range([0, mapWidth - margin.left - margin.right]);
  scales.y.range([mapHeight - margin.top - margin.bottom, 0]);

  d3checkpointGroups.attr('transform', d => `translate(${scales.x(d.x)}, ${scales.y(d.y)})`);

  placeParticipantsOnMap();
};

// Add resize event listener
window.addEventListener('resize', resize);

// Document DOMContentLoaded — create layout
const DOMContentLoaded = () => {
  // Create layout
  document.querySelector('.dl-feature-container').innerHTML = featureTemplate(races);

  const $featureRaceSelector = document.querySelector('.dl-feature__race-selector');

  document.querySelector('.dl-feature__race-selector').addEventListener('change', () => {
    selectedRace = $featureRaceSelector.value;
    selectedRaceData = racesData.find(rd => rd.title === selectedRace).participants;
    currentTime = 0;

    setParticipantsCoordinates(selectedRaceData, true);
    initParicipantGroups(selectedRaceData);
    placeParticipantsOnMap();
  });

  $featureMapContainer = document.querySelector('.dl-feature__map-container');
  $map = document.querySelector('.dl-map');
  const $mapBackgroundImage = document.querySelector('.dl-map__background-image');

  $mapBackgroundImage.style.top = `${margin.top}px`;
  $mapBackgroundImage.style.left = `${margin.left}px`;
  $mapBackgroundImage.style.width = `calc(100% - ${margin.left + margin.right}px`;
  $mapBackgroundImage.style.height = `calc(100% - ${margin.top + margin.bottom}px`;

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
    racesData = parseRacesData(rawData.slice(0, -1), races);
    selectedRaceData = racesData.find(rd => rd.title === selectedRace).participants;

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
    startCP = coordinates.find(c => c.name === 'Старт');

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
    const d3RootGroup = d3select('.dl-map svg')
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    d3checkpointGroups = d3RootGroup
      .append('g')
      .attr('class', 'dl-map__g-checkpoints')
      .selectAll('g')
      .data(coordinates)
      .enter()
      .append('g')
      .attr('class', 'dl-map__g-checkpoint');

    d3checkpointGroups
      .append('text')
      .attr('class', 'dl-map__g-checkpoint-caption')
      .attr('y', -5)
      .text(d => d.name);

    d3checkpointGroups
      .append('circle')
      .attr('class', 'dl-map__g-checkpoint-mark')
      .attr('r', 5);

    // Add participants
    d3participantsGroup = d3RootGroup
      .append('g')
      .attr('class', 'dl-map__g-participants');

    setParticipantsCoordinates(selectedRaceData, true);
    initParicipantGroups(selectedRaceData);
    placeParticipantsOnMap();

    // First resize
    resize();
  });
};

// Add DOMContentLoaded listener (entry point)
document.addEventListener('DOMContentLoaded', DOMContentLoaded);
