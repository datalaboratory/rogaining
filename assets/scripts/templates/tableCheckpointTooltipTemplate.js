import getPointsFromCpName from '../services/getPointsFromCpName';
import secondsToHHMMSS from '../tools/secondsToHHMMSS';

const tableCheckpointTooltipTemplate = ({
  name,
  timeFromStart,
  timeFromPrevious,
  color,
}) =>
  `
    <div class="dl-table__tooltip">
      <div>
        <span class="dl-table__tooltip-name">КП ${name}</span>
        <span 
          class="dl-table__tooltip-points"
          style="background: ${color}">+${(name.indexOf('-') === -1 ? getPointsFromCpName(name) : name.split('-')[1]) || 0}</span>
      </div>
      <div class="dl-table__tooltip-time">${secondsToHHMMSS(timeFromStart)}</div>
      <div class="dl-table__tooltip-time">+${secondsToHHMMSS(timeFromPrevious)}</div>
    </div>
`;

export default tableCheckpointTooltipTemplate;
