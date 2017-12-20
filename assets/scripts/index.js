// Imports
import { queue as d3queue } from 'd3-queue';
import { csv as d3csv } from 'd3-request/build/d3-request';
import {
  scaleLinear as d3scaleLinear,
  scaleOrdinal as d3scaleOrdinal,
  scaleSqrt as d3scaleSqrt,
  schemeCategory10 as d3schemeCategory10,
} from 'd3-scale';
import { select as d3select } from 'd3-selection';
import { line as d3line } from 'd3-shape';
import flatten from 'lodash.flatten';
import uniq from 'lodash.uniq';
import nouislider from 'nouislider';

import featureTemplate from './templates/featureTemplate';
import getPossibleLinks from './services/getPossibleLinks';
import getSequentialColors from './services/getSequentialColors';
import hexWithAlphaToRGBA from './tools/hexWithAlphaToRGBA';
import lastOf from './tools/lastOf';
import parseCoordinatesData from './services/parseCoordinatesData';
import parseRacesData from './services/parseRacesData';
import tableTemplate from './templates/tableTemplate';

// Globals
const races = [
  { fileName: 'Split_rogaining_Final_Kubka - М4Б.csv', title: 'Мужчины, 4 часа бегом' },
  { fileName: 'Split_rogaining_Final_Kubka - М4Б_Ю.csv', title: 'Мужчины, 4 часа бегом (юниоры)' },
  { fileName: 'Split_rogaining_Final_Kubka - М4Б_В.csv', title: 'Мужчины, 4 часа бегом (ветераны)' },
  { fileName: 'Split_rogaining_Final_Kubka - М4Б_СВ.csv', title: 'Мужчины, 4 часа бегом (суперветераны)' },
  { fileName: 'Split_rogaining_Final_Kubka - М4В.csv', title: 'Мужчины, 4 часа на велосипеде' },
  { fileName: 'Split_rogaining_Final_Kubka - М4В_В.csv', title: 'Мужчины, 4 часа на велосипеде (ветераны)' },
  { fileName: 'Split_rogaining_Final_Kubka - Ж4Б.csv', title: 'Женщины, 4 часа бегом' },
  { fileName: 'Split_rogaining_Final_Kubka - Ж4Б_Ю.csv', title: 'Женщины, 4 часа бегом (юниоры)' },
  { fileName: 'Split_rogaining_Final_Kubka - Ж4Б_В.csv', title: 'Женщины, 4 часа бегом (ветераны)' },
  { fileName: 'Split_rogaining_Final_Kubka - Ж4Б_СВ.csv', title: 'Женщины, 4 часа бегом (суперветераны)' },
  { fileName: 'Split_rogaining_Final_Kubka - Ж4В.csv', title: 'Женщины, 4 часа на велосипеде' },
  { fileName: 'Split_rogaining_Final_Kubka - Ж4В_В.csv', title: 'Женщины, 4 часа на велосипеде (ветераны)' },
  { fileName: 'Split_rogaining_Final_Kubka - МЖ4Б.csv', title: 'Мужчины и женщины, 4 часа бегом' },
  { fileName: 'Split_rogaining_Final_Kubka - МЖ4Б_Ю.csv', title: 'Мужчины и женщины, 4 часа бегом (юниоры)' },
  { fileName: 'Split_rogaining_Final_Kubka - МЖ4Б_В.csv', title: 'Мужчины и женщины, 4 часа бегом (ветераны)' },
  { fileName: 'Split_rogaining_Final_Kubka - МЖ4В.csv', title: 'Мужчины и женщины, 4 часа на велосипеде' },
];

const margin = {
  top: 10,
  right: 30,
  bottom: 10,
  left: 30,
};

const scales = {
  x: d3scaleLinear(),
  y: d3scaleLinear(),
  teamColor: d3scaleOrdinal(d3schemeCategory10),
  cpColor: d3scaleOrdinal(),
  cpRadius: d3scaleSqrt()
    .range([5, 20]),
  linkWidth: d3scaleLinear()
    .range([0, 20]),
};

const participantPathGenerator = d3line();

let coordinates;
let links;
let racesData;
let selectedRace = 'Мужчины, 4 часа бегом';
let selectedRaceTeams;
let selectedRaceParticipants;
let currentTime = 0;

let ratio;

let $timeSlider;
let $mapContainer;
let $map;
let $tableContainer;
let $tableHeader;
let $tableBody;

let tableHeaderOffsetTop;

let d3checkpointMarks;
let d3checkpointCaptions;
let d3links;
let d3participantsGroup;
let d3participantGroups;

// Update checkpoints
const updateCheckpoints = () => {
  coordinates.forEach((c) => {
    if (c.name === 'Старт') {
      c.popularity = 0;
    } else {
      c.popularity = selectedRaceParticipants
        .map(srp => (srp.checkpoints.find(cp => cp.name === c.name) ? 1 : 0))
        .reduce((a, b) => a + b, 0);
    }
  });

  scales.cpRadius.domain([0, Math.max(...coordinates.map(c => c.popularity))]);

  d3checkpointMarks
    .attr('r', d => scales.cpRadius(d.popularity))
    .style('opacity', d => (d.popularity || d.name === 'Старт' ? 1 : 0.5));

  d3checkpointCaptions
    .attr('dx', d => scales.cpRadius(d.popularity) + 3)
    .style('opacity', d => (d.popularity || d.name === 'Старт' ? 1 : 0.5));
};

// Update links
const updateLinks = () => {
  links.forEach((l) => {
    l.popularity = selectedRaceParticipants
      .map((srp) => {
        const path = srp.checkpoints
          .map(cp => cp.name)
          .join('-');

        return (path.indexOf(`${l.from}-${l.to}`) !== -1 || path.indexOf(`${l.to}-${l.from}`) !== -1) ?
          1 :
          0;
      })
      .reduce((a, b) => a + b, 0);
  });

  scales.linkWidth.domain([0, Math.max(...links.map(l => l.popularity))]);

  d3links.style('stroke-width', d => scales.linkWidth(d.popularity));
};

// Init participant groups
const initParicipantGroups = () => {
  d3participantsGroup
    .selectAll('*')
    .remove();

  d3participantGroups = d3participantsGroup
    .selectAll('g')
    .data(selectedRaceParticipants)
    .enter()
    .append('g')
    .attr('class', 'dl-map__participant');

  d3participantGroups
    .append('path')
    .attr('class', 'dl-map__participant-path');

  d3participantGroups
    .append('circle')
    .attr('class', 'dl-map__participant-mark')
    .attr('r', 3);
};

// Set participants coordinates
const setParticipantsCoordinates = () => {
  selectedRaceParticipants.forEach((p) => {
    const nextCPIndex = p.checkpoints.findIndex(cp => cp.fromStart > currentTime);
    const nextCP = p.checkpoints[nextCPIndex];
    const currentCP = p.checkpoints[nextCPIndex - 1];

    if (!currentCP) {
      const currentCoordinates = coordinates.find(c => c.name === 'Старт');

      p.x = currentCoordinates.x;
      p.y = currentCoordinates.y;
    } else {
      const nextCoordinates = coordinates.find(c => c.name === nextCP.name);
      const currentCoordinates = coordinates.find(c => c.name === currentCP.name);
      const xSpeed = (nextCoordinates.x - currentCoordinates.x) /
        (nextCP.fromStart - currentCP.fromStart);
      const ySpeed = (nextCoordinates.y - currentCoordinates.y) /
        (nextCP.fromStart - currentCP.fromStart);

      p.x = currentCoordinates.x + ((currentTime - currentCP.fromStart) * xSpeed);
      p.y = currentCoordinates.y + ((currentTime - currentCP.fromStart) * ySpeed);
    }
  });
};

// Draw participant paths
const drawParticipantPaths = () => {
  d3participantGroups
    .select('.dl-map__participant-path')
    .attr('d', d => participantPathGenerator(d.checkpoints.map(cp => coordinates.find(c => c.name === cp.name))));
};

// Place participants on map
const placeParticipantsOnMap = () => {
  d3participantGroups
    .select('.dl-map__participant-mark')
    .attr('cx', d => scales.x(d.x))
    .attr('cy', d => scales.y(d.y));
};

// Add event listeners to table rows
const addTableRowsEventListeners = () => {
  document.querySelectorAll('.dl-table__body .dl-table__row').forEach(($tr, i) => {
    const teamName = selectedRaceTeams[i].name;

    $tr.addEventListener('mouseover', () => {
      if (!$tr.classList.contains('dl-table__row-opened')) {
        $tr.style.backgroundColor = hexWithAlphaToRGBA(scales.teamColor(teamName), 0.5);
      }
    });

    $tr.addEventListener('mouseout', () => {
      if (!$tr.classList.contains('dl-table__row-opened')) {
        $tr.style.backgroundColor = '';
      }
    });

    $tr.addEventListener('click', () => {
      $tr.classList.toggle('dl-table__row-opened');

      const teamParticipants = d3participantGroups.filter(d => d.teamName === teamName);


      teamParticipants
        .selectAll('.dl-map__participant-path')
        .style('stroke', $tr.classList.contains('dl-table__row-opened') ? scales.teamColor(teamName) : '');

      teamParticipants
        .selectAll('.dl-map__participant-mark')
        .attr('r', $tr.classList.contains('dl-table__row-opened') ? 5 : 3)
        .style('fill', $tr.classList.contains('dl-table__row-opened') ? scales.teamColor(teamName) : '');

      teamParticipants.each((d, j, selection) => {
        const parent = selection[j].parentNode;

        parent.removeChild(selection[j]);
        parent.appendChild(selection[j]);
      });
    });
  });
};

// Window resize — set calculated size
const resize = () => {
  const { width, height } = $mapContainer.getBoundingClientRect();

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

  participantPathGenerator
    .x(d => scales.x(d.x))
    .y(d => scales.y(d.y));

  d3checkpointMarks.attr('transform', d => `translate(${scales.x(d.x)}, ${scales.y(d.y)})`);
  d3checkpointCaptions.attr('transform', d => `translate(${scales.x(d.x)}, ${scales.y(d.y)})`);

  d3links
    .attr('x1', d => scales.x(d.x1))
    .attr('y1', d => scales.y(d.y1))
    .attr('x2', d => scales.x(d.x2))
    .attr('y2', d => scales.y(d.y2));

  drawParticipantPaths();
  placeParticipantsOnMap();
};

// Window scroll — fix table header if needed
const scroll = () => {
  if (document.documentElement.scrollTop > tableHeaderOffsetTop) {
    $tableHeader.classList.add('dl-table__header-stuck');
    $tableBody.classList.add('dl-table__body-with-offset');
  } else {
    $tableHeader.classList.remove('dl-table__header-stuck');
    $tableBody.classList.remove('dl-table__body-with-offset');
  }
};

// Document DOMContentLoaded — create layout
const DOMContentLoaded = () => {
  // Create layout
  document.querySelector('.dl-feature-container').innerHTML = featureTemplate(races, selectedRace);

  const $featureRaceSelect = document.querySelector('.dl-feature__race-select');

  $featureRaceSelect.addEventListener('change', () => {
    selectedRace = $featureRaceSelect.value;
    selectedRaceTeams = racesData.find(rd => rd.title === selectedRace).teams;
    selectedRaceParticipants = flatten(selectedRaceTeams.map(t => t.participants));
    currentTime = 0;

    $timeSlider.noUiSlider.updateOptions({
      range: {
        min: 0,
        max: Math.max(...selectedRaceTeams.map(p => p.time)),
      },
    });

    $timeSlider.noUiSlider.set(currentTime);

    updateCheckpoints();
    updateLinks();
    initParicipantGroups();
    drawParticipantPaths();
    setParticipantsCoordinates();
    placeParticipantsOnMap();

    $tableContainer.innerHTML = tableTemplate(selectedRaceTeams);

    addTableRowsEventListeners();
  });

  $timeSlider = document.querySelector('.dl-feature__time-slider');

  $mapContainer = document.querySelector('.dl-feature__map-container');
  $map = document.querySelector('.dl-map');
  const $mapBackgroundImage = document.querySelector('.dl-map__background-image');

  $mapBackgroundImage.style.top = `${margin.top}px`;
  $mapBackgroundImage.style.left = `${margin.left}px`;
  $mapBackgroundImage.style.width = `calc(100% - ${margin.left + margin.right}px`;
  $mapBackgroundImage.style.height = `calc(100% - ${margin.top + margin.bottom}px`;

  $tableContainer = document.querySelector('.dl-feature__table-container');

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
    selectedRaceTeams = racesData.find(rd => rd.title === selectedRace).teams;
    selectedRaceParticipants = flatten(selectedRaceTeams.map(t => t.participants));

    // Create time slider
    nouislider
      .create($timeSlider, {
        start: 0,
        connect: [
          true,
          false,
        ],
        range: {
          min: 0,
          max: Math.max(...selectedRaceTeams.map(p => p.time)),
        },
        step: 60,
        pips: {
          mode: 'steps',
          filter: value => (!(value % 3600) && value ? 1 : 0),
          format: {
            to: value => value / 3600,
          },
        },
      })
      .on('slide', (values, handle) => {
        currentTime = +values[handle];

        setParticipantsCoordinates();
        placeParticipantsOnMap();
      });

    // Parse coordinates data
    coordinates = parseCoordinatesData(lastOf(rawData));
    links = getPossibleLinks(coordinates);

    const uniqCpPoints = uniq(coordinates.map(c => +c.name[0]))
      .filter(Boolean)
      .sort((a, b) => a - b);

    scales.cpColor
      .domain(uniqCpPoints)
      .range(getSequentialColors(uniqCpPoints.length));

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

    const d3rootGroup = d3select('.dl-map svg')
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Add links
    d3links = d3rootGroup
      .append('g')
      .attr('class', 'dl-map__links')
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('class', 'dl-map__link');

    // Add checkpoints
    const d3checkpointsGroup = d3rootGroup
      .append('g')
      .attr('class', 'dl-map__checkpoints');

    d3checkpointMarks = d3checkpointsGroup
      .selectAll('circle')
      .data(coordinates)
      .enter()
      .append('circle')
      .attr('class', 'dl-map__checkpoint-mark')
      .style('fill', d => (d.name === 'Старт' ? '#fff' : scales.cpColor(d.name[0])))
      .style('stroke', d => (d.name === 'Старт' ? '#666' : '#fff'));

    d3checkpointCaptions = d3checkpointsGroup
      .selectAll('text')
      .data(coordinates)
      .enter()
      .append('text')
      .attr('class', 'dl-map__checkpoint-caption')
      .text(d => d.name);

    // Add participants
    d3participantsGroup = d3rootGroup
      .append('g')
      .attr('class', 'dl-map__participants');

    updateCheckpoints();
    updateLinks();
    initParicipantGroups();
    setParticipantsCoordinates();

    $tableContainer.innerHTML = tableTemplate(selectedRaceTeams);

    $tableHeader = document.querySelector('.dl-table__header');
    $tableBody = document.querySelector('.dl-table__body');
    tableHeaderOffsetTop = $tableHeader.offsetTop;

    addTableRowsEventListeners();

    // First resize
    resize();
  });
};

window.addEventListener('resize', resize);
window.addEventListener('scroll', scroll);
document.addEventListener('DOMContentLoaded', DOMContentLoaded);
