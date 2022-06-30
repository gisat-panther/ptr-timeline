import PropTypes from 'prop-types';
import {map as _map} from 'lodash';
import moment from 'moment';
import {getDays} from '../utils/interval';
import Label from '../utils/textLabel';
import './style.scss';

const DaysLabels = props => {
	const {period, getX, height, vertical} = props;
	const periodStart = moment(period.start);
	const periodEnd = moment(period.end);
	const daysCfg = getDays(periodStart, periodEnd);
	const days = _map(daysCfg, day => {
		let x = getX(day.start);
		return (
			<g
				className={'ptr-timeline-day'}
				key={`${day.year}-${day.month}-${day.day}`}
			>
				<Label
					label={day.day}
					vertical={vertical}
					x={x}
					height={height}
					className={'ptr-timeline-day-label'}
				/>
			</g>
		);
	});

	return <g className={'levels'}>{days}</g>;
};

DaysLabels.propTypes = {
	period: PropTypes.shape({
		start: PropTypes.string,
		end: PropTypes.string,
	}).isRequired,
	getX: PropTypes.func.isRequired,
	dayWidth: PropTypes.number.isRequired,
	height: PropTypes.number.isRequired,
	vertical: PropTypes.bool,
};

DaysLabels.defaultProps = {
	vertical: false,
};

export default DaysLabels;
