import PropTypes from 'prop-types';
import {map as _map} from 'lodash';
import moment from 'moment';
import utils from '../utils';
import YearDash from './YearDash';
import MonthDash from '../Months/MonthDash';
import './style.scss';

const Years = props => {
	const {period, getX, dayWidth, vertical} = props;
	const periodStart = moment(period.start);
	const periodEnd = moment(period.end);
	const yearsCfg = utils.interval.getYears(periodStart, periodEnd);

	const years = _map(yearsCfg, year => {
		let x = getX(year.start);
		return <YearDash key={year.year} x={x} vertical={vertical} />;
	});

	let months = [];

	if (dayWidth > 0.7) {
		const monthsCfg = utils.interval.getMonths(periodStart, periodEnd);
		months = _map(monthsCfg, month => {
			let x = getX(month.start);
			return (
				<MonthDash
					key={`${month.year}-${month.month}`}
					x={x}
					vertical={vertical}
					secondary
				/>
			);
		});
	}
	return (
		<g className={'levels'}>
			{months}
			{years.reverse()}
		</g>
	);
};

Years.propTypes = {
	period: PropTypes.shape({
		start: PropTypes.string,
		end: PropTypes.string,
	}).isRequired,
	getX: PropTypes.func.isRequired,
	dayWidth: PropTypes.number.isRequired,
	height: PropTypes.number.isRequired,
	vertical: PropTypes.bool,
};

Years.defaultProps = {
	vertical: false,
};

export default Years;
