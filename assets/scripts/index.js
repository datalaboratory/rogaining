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
import getAngleBetweenPoints from './tools/getAngleBetweenPoints';
import getDistanceBetweenPoints from './tools/getDistanceBetweenPoints';
import getPossibleLinks from './services/getPossibleLinks';
import getSequentialColors from './services/getSequentialColors';
import hexWithAlphaToRGBA from './tools/hexWithAlphaToRGBA';
import lastOf from './tools/lastOf';
import parseCoordinatesData from './services/parseCoordinatesData';
import parseRacesData from './services/parseRacesData';
import tableTemplate from './templates/tableTemplate';

// Globals
const races = [
  {
    fileName: 'Split_rogaining_Final_Kubka - М4Б.csv',
    group: 'Мужчины',
    title: '4 часа бегом',
    id: 'М 4 (бег)',
  },
  {
    fileName: 'Split_rogaining_Final_Kubka - М4Б_Ю.csv',
    group: 'Мужчины',
    title: '4 часа бегом (юниоры)',
    id: 'М (ю) 4 (бег)',
  },
  {
    fileName: 'Split_rogaining_Final_Kubka - М4Б_В.csv',
    group: 'Мужчины',
    title: '4 часа бегом (ветераны)',
    id: 'М (в) 4 (бег)',
  },
  {
    fileName: 'Split_rogaining_Final_Kubka - М4Б_СВ.csv',
    group: 'Мужчины',
    title: '4 часа бегом (суперветераны)',
    id: 'М (св) 4 (бег)',
  },
  {
    fileName: 'Split_rogaining_Final_Kubka - М4В.csv',
    group: 'Мужчины',
    title: '4 часа на велосипеде',
    id: 'М 4 (вело)',
  },
  {
    fileName: 'Split_rogaining_Final_Kubka - М4В_В.csv',
    group: 'Мужчины',
    title: '4 часа на велосипеде (ветераны)',
    id: 'М (в) 4 (вело)',
  },
  {
    fileName: 'Split_rogaining_Final_Kubka - Ж4Б.csv',
    group: 'Женщины',
    title: '4 часа бегом',
    id: 'Ж 4 (бег)',
  },
  {
    fileName: 'Split_rogaining_Final_Kubka - Ж4Б_Ю.csv',
    group: 'Женщины',
    title: '4 часа бегом (юниоры)',
    id: 'Ж (ю) 4 (бег)',
  },
  {
    fileName: 'Split_rogaining_Final_Kubka - Ж4Б_В.csv',
    group: 'Женщины',
    title: '4 часа бегом (ветераны)',
    id: 'Ж (в) 4 (бег)',
  },
  {
    fileName: 'Split_rogaining_Final_Kubka - Ж4Б_СВ.csv',
    group: 'Женщины',
    title: '4 часа бегом (суперветераны)',
    id: 'Ж (св) 4 (бег)',
  },
  {
    fileName: 'Split_rogaining_Final_Kubka - Ж4В.csv',
    group: 'Женщины',
    title: '4 часа на велосипеде',
    id: 'Ж 4 (вело)',
  },
  {
    fileName: 'Split_rogaining_Final_Kubka - Ж4В_В.csv',
    group: 'Женщины',
    title: '4 часа на велосипеде (ветераны)',
    id: 'Ж (в) 4 (вело)',
  },
  {
    fileName: 'Split_rogaining_Final_Kubka - МЖ4Б.csv',
    group: 'Мужчины и женщины',
    title: '4 часа бегом',
    id: 'М+Ж 4 (бег)',
  },
  {
    fileName: 'Split_rogaining_Final_Kubka - МЖ4Б_Ю.csv',
    group: 'Мужчины и женщины',
    title: '4 часа бегом (юниоры)',
    id: 'М+Ж (ю) 4 (бег)',
  },
  {
    fileName: 'Split_rogaining_Final_Kubka - МЖ4Б_В.csv',
    group: 'Мужчины и женщины',
    title: '4 часа бегом (ветераны)',
    id: 'М+Ж (в) 4 (бег)',
  },
  {
    fileName: 'Split_rogaining_Final_Kubka - МЖ4В.csv',
    group: 'Мужчины и женщины',
    title: '4 часа на велосипеде',
    id: 'М+Ж 4 (вело)',
  },
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

const checkboxes = [
  { id: 'dl-show-checkpoints', label: 'Чекпоинты', checked: true },
  { id: 'dl-show-paths-popularity', label: 'Популярность путей', checked: true },
  { id: 'dl-show-map', label: 'Карта', checked: false },
];

const shownTeams = [];
const pathPieceLineStrokeWidth = 2;

let coordinates;
let links;
let racesData;
let selectedRace = 'М 4 (бег)';
let selectedRaceTeams;
let selectedRaceParticipants;
let maxTime;
let currentTime = 0;
let intervalId;

let $timeSlider;
let $playerButton;
let $mapCheckboxesContainer;
let $map;
let $mapBackgroundImage;
let $tableContainer;
let $tableHeader;
let $tableBody;

let tableHeaderOffsetTop;

let d3checkpointsGroup;
let d3checkpointMarks;
let d3checkpointCaptions;
let d3links;
let d3participantPathsGroup;
let d3participantMarksGroup;
let d3participantMarks;

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

// Draw participant paths
const drawParticipantPaths = () => {
  d3participantPathsGroup
    .selectAll('*')
    .remove();

  if (!shownTeams.length) return;

  const pathPieces = {};

  flatten(shownTeams.map(st => st.participants)).forEach((p) => {
    for (let i = 0; i < p.checkpoints.length - 1; i += 1) {
      const pieceId1 = `${p.checkpoints[i].name}-${p.checkpoints[i + 1].name}`;
      const pieceId2 = `${p.checkpoints[i + 1].name}-${p.checkpoints[i].name}`;

      if (pathPieces[pieceId1]) {
        pathPieces[pieceId1].push(p.teamName);
      } else if (pathPieces[pieceId2]) {
        pathPieces[pieceId2].push(p.teamName);
      } else {
        pathPieces[pieceId1] = [p.teamName];
      }
    }
  });

  Object.keys(pathPieces).forEach((key) => {
    const uniqPaths = uniq(pathPieces[key]);
    const p1 = coordinates.find(c => c.name === key.split('-')[0]);
    const p2 = coordinates.find(c => c.name === key.split('-')[1]);
    const angle = getAngleBetweenPoints(
      { x: scales.x(p2.x), y: scales.y(p2.y) },
      { x: scales.x(p1.x), y: scales.y(p1.y) },
    );

    const pathPieceGroup = d3participantPathsGroup
      .append('g')
      .attr('class', 'dl-map__path-piece')
      .attr('transform', () => `translate(${scales.x(p1.x)}, ${scales.y(p1.y)}) rotate(${angle})`);

    uniqPaths.forEach((up, i) => {
      pathPieceGroup
        .append('line')
        .attr('class', 'dl-map__path-piece-line')
        .attr('y1', (i - ((uniqPaths.length - 1) / 2)) * pathPieceLineStrokeWidth)
        .attr('x2', getDistanceBetweenPoints({ x: scales.x(p1.x), y: scales.y(p1.y) }, { x: scales.x(p2.x), y: scales.y(p2.y) }))
        .attr('y2', (i - ((uniqPaths.length - 1) / 2)) * pathPieceLineStrokeWidth)
        .style('stroke-width', pathPieceLineStrokeWidth)
        .style('stroke', scales.teamColor(up));
    });
  });
};

// Init participant groups
const initParicipantMarks = () => {
  d3participantMarksGroup
    .selectAll('*')
    .remove();

  d3participantMarks = d3participantMarksGroup
    .selectAll('circle')
    .data(selectedRaceParticipants)
    .enter()
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

// Place participants on map
const placeParticipantMarksOnMap = () => {
  d3participantMarks
    .attr('cx', d => scales.x(d.x))
    .attr('cy', d => scales.y(d.y));
};

// Add event listeners to table rows
const addTableRowsEventListeners = () => {
  document.querySelectorAll('.dl-table__body .dl-table__row').forEach(($tr, i) => {
    const team = selectedRaceTeams[i];

    $tr.addEventListener('mouseover', () => {
      if (!$tr.classList.contains('dl-table__row-opened')) {
        $tr.style.backgroundColor = hexWithAlphaToRGBA(scales.teamColor(team.name), 0.5);
      }
    });

    $tr.addEventListener('mouseout', () => {
      if (!$tr.classList.contains('dl-table__row-opened')) {
        $tr.style.backgroundColor = '';
      }
    });

    $tr.addEventListener('click', () => {
      $tr.classList.toggle('dl-table__row-opened');

      const isRowOpened = $tr.classList.contains('dl-table__row-opened');
      const teamParticipantMarks = d3participantMarks.filter(d => d.teamName === team.name);

      teamParticipantMarks
        .attr('r', isRowOpened ? 5 : 3)
        .style('fill', isRowOpened ? scales.teamColor(team.name) : '');

      teamParticipantMarks.each((d, j, selection) => {
        const parent = selection[j].parentNode;

        parent.removeChild(selection[j]);
        parent.appendChild(selection[j]);
      });

      if (isRowOpened) {
        shownTeams.push(team);
      } else {
        shownTeams.splice(shownTeams.findIndex(st => st.name === team.name), 1);
      }

      drawParticipantPaths();
    });
  });
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
  document.querySelector('.dl-feature-container').innerHTML = featureTemplate(races, selectedRace, checkboxes);

  // Race select
  const $raceSelect = document.querySelector('.dl-race-select');
  const $raceSelectToggle = document.querySelector('.dl-race-select__toggle');
  const $raceSelectDropdown = document.querySelector('.dl-race-select__dropdown');
  const $raceSelectOptions = document.querySelectorAll('.dl-race-select__option');

  $raceSelect.addEventListener('blur', () => {
    $raceSelectToggle.classList.remove('dl-race-select__toggle-activated');
    $raceSelectDropdown.classList.remove('dl-race-select__dropdown-shown');
  });

  $raceSelectToggle.addEventListener('click', () => {
    $raceSelectToggle.classList.toggle('dl-race-select__toggle-activated');
    $raceSelectDropdown.classList.toggle('dl-race-select__dropdown-shown');
  });

  $raceSelectOptions.forEach(($o1, i) => {
    $o1.addEventListener('click', () => {
      selectedRace = races[i].id;

      $raceSelectOptions.forEach(($o2) => {
        if ($o2.classList.contains('dl-race-select__option-selected')) {
          $o2.classList.remove('dl-race-select__option-selected');
        }
      });

      $o1.classList.add('dl-race-select__option-selected');
      $raceSelectToggle.innerHTML = selectedRace;
      $raceSelectToggle.classList.remove('dl-race-select__toggle-activated');
      $raceSelectDropdown.classList.remove('dl-race-select__dropdown-shown');

      selectedRaceTeams = racesData.find(rd => rd.id === selectedRace).teams;
      selectedRaceParticipants = flatten(selectedRaceTeams.map(srt => srt.participants));
      maxTime = Math.max(...selectedRaceTeams.map(srt => srt.time));
      currentTime = 0;

      $timeSlider.noUiSlider.updateOptions({
        range: {
          min: 0,
          max: maxTime,
        },
      });

      $timeSlider.noUiSlider.set(currentTime);

      $playerButton.classList.remove('dl-feature__player-button--stop');
      clearInterval(intervalId);

      updateCheckpoints();
      updateLinks();
      initParicipantMarks();
      setParticipantsCoordinates();
      placeParticipantMarksOnMap();

      $tableContainer.innerHTML = tableTemplate(selectedRaceTeams);

      addTableRowsEventListeners();
    });
  });

  // Checkboxes
  document.querySelector('.dl-checkboxes').style.marginTop = `${margin.top}px`;

  const $checkboxes = document.querySelectorAll('.dl-checkboxes input');

  $checkboxes.forEach(($c, i) => {
    $c.addEventListener('change', () => {
      if (checkboxes[i].id === 'dl-show-checkpoints') {
        d3checkpointsGroup.style('visibility', $c.checked ? 'visible' : 'hidden');
      } else if (checkboxes[i].id === 'dl-show-paths-popularity') {
        d3links.style('visibility', $c.checked ? 'visible' : 'hidden');
      } else {
        $mapBackgroundImage.style.visibility = $c.checked ? 'visible' : '';
      }
    });
  });

  // Set background image size
  $mapCheckboxesContainer = document.querySelector('.dl-feature__map-checkboxes-container');
  $map = document.querySelector('.dl-map');
  $mapBackgroundImage = document.querySelector('.dl-map__background-image');

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
    selectedRaceTeams = racesData.find(rd => rd.id === selectedRace).teams;
    selectedRaceParticipants = flatten(selectedRaceTeams.map(srt => srt.participants));
    maxTime = Math.max(...selectedRaceTeams.map(srt => srt.time));

    // Create time slider
    $timeSlider = document.querySelector('.dl-feature__time-slider');

    nouislider
      .create($timeSlider, {
        start: 0,
        connect: [
          true,
          false,
        ],
        range: {
          min: 0,
          max: maxTime,
        },
        step: 60,
        pips: {
          mode: 'steps',
          filter: value => (!(value % 3600) && value ? 1 : 0),
          format: {
            to: value => value / 3600,
          },
        },
      });

    $timeSlider.noUiSlider.on('slide', (values, handle) => {
      currentTime = +values[handle];

      setParticipantsCoordinates();
      placeParticipantMarksOnMap();
    });

    // Player
    $playerButton = document.querySelector('.dl-feature__player-button');

    $playerButton.addEventListener('click', () => {
      if ($playerButton.classList.contains('dl-feature__player-button--stop')) {
        $playerButton.classList.remove('dl-feature__player-button--stop');
        clearInterval(intervalId);
      } else {
        $playerButton.classList.add('dl-feature__player-button--stop');

        intervalId = setInterval(() => {
          if (currentTime === maxTime) {
            currentTime = 0;

            $timeSlider.noUiSlider.set(currentTime);

            $playerButton.classList.remove('dl-feature__player-button--stop');
            clearInterval(intervalId);
          } else {
            currentTime += 1;

            $timeSlider.noUiSlider.set(currentTime);

            setParticipantsCoordinates();
            placeParticipantMarksOnMap();
          }
        }, 1);
      }
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
    const ratio = (xMax - xMin) / (yMax - yMin);
    const { height } = $mapCheckboxesContainer.getBoundingClientRect();
    const width = height * ratio;

    $map.style.width = `${width}px`;
    $timeSlider.style.width = `${width}px`;

    scales.x
      .domain([xMin, xMax])
      .range([0, width - margin.left - margin.right]);

    scales.y
      .domain([yMin, yMax])
      .range([height - margin.top - margin.bottom, 0]);

    participantPathGenerator
      .x(d => scales.x(d.x))
      .y(d => scales.y(d.y));

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
      .attr('class', 'dl-map__link')
      .attr('x1', d => scales.x(d.x1))
      .attr('y1', d => scales.y(d.y1))
      .attr('x2', d => scales.x(d.x2))
      .attr('y2', d => scales.y(d.y2));

    // Add checkpoints
    d3checkpointsGroup = d3rootGroup
      .append('g')
      .attr('class', 'dl-map__checkpoints');

    const d3checkpointGroups = d3checkpointsGroup
      .selectAll('g')
      .data(coordinates)
      .enter()
      .append('g')
      .attr('class', 'dl-map__checkpoint')
      .attr('transform', d => `translate(${scales.x(d.x)}, ${scales.y(d.y)})`);

    d3checkpointMarks = d3checkpointGroups
      .append('circle')
      .attr('class', 'dl-map__checkpoint-mark')
      .style('fill', d => (d.name === 'Старт' ? '#fff' : scales.cpColor(d.name[0])))
      .style('stroke', d => (d.name === 'Старт' ? '#666' : '#fff'));

    d3checkpointCaptions = d3checkpointGroups
      .append('text')
      .attr('class', 'dl-map__checkpoint-caption')
      .text(d => d.name);

    // Add participant paths
    d3participantPathsGroup = d3rootGroup
      .append('g')
      .attr('class', 'dl-map__participant-paths');

    // Add participant marks
    d3participantMarksGroup = d3rootGroup
      .append('g')
      .attr('class', 'dl-map__participant-marks');

    updateCheckpoints();
    updateLinks();
    initParicipantMarks();
    setParticipantsCoordinates();
    placeParticipantMarksOnMap();

    $tableContainer = document.querySelector('.dl-feature__table-container');
    $tableContainer.innerHTML = tableTemplate(selectedRaceTeams);

    $tableHeader = document.querySelector('.dl-table__header');
    $tableBody = document.querySelector('.dl-table__body');
    tableHeaderOffsetTop = $tableHeader.offsetTop;

    addTableRowsEventListeners();
  });
};

window.addEventListener('scroll', scroll);
document.addEventListener('DOMContentLoaded', DOMContentLoaded);
