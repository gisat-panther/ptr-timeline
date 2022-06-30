import PropTypes from 'prop-types';
import './style.scss';
import {map as _map} from 'lodash';
import moment from 'moment';
import {getYears, getMonths, getDays, getHours} from '../utils/interval';
import HourDash from '../Hours/HourDash';
import DayDash from './DayDash';
import MonthDash from '../Months/MonthDash';
import YearDash from '../Years/YearDash';

const Days = ({period, getX, dayWidth, vertical}) => {
	const periodStart = moment(period.start);
	const periodEnd = moment(period.end);
	const daysCfg = getDays(periodStart, periodEnd);
	const monthsCfg = getMonths(periodStart, periodEnd);
	const yearsCfg = getYears(periodStart, periodEnd);

	const months = _map(monthsCfg, month => {
		if (month.month !== '01') {
			let x = getX(month.start);

			return (
				<MonthDash
					key={`${month.year}-${month.month}`}
					x={x}
					vertical={vertical}
					height={1}
				/>
			);
		} else {
			return null;
		}
	});

	const years = _map(yearsCfg, year => {
		let x = getX(year.start);

		return <YearDash key={year.year} x={x} vertical={vertical} />;
	});

	const days = _map(daysCfg, day => {
		let x = getX(day.start);

		return (
			<DayDash
				key={`${day.year}-${day.month}-${day.day}`}
				x={x}
				vertical={vertical}
				height={2}
			/>
		);
	});

	let hours = null;
	if (dayWidth > 150) {
		const hoursCfg = getHours(periodStart, periodEnd);
		hours = _map(hoursCfg, hour => {
			if (hour.hour === '12') {
				let x = getX(hour.start);
				return (
					<HourDash
						key={`${hour.year}-${hour.month}-${hour.day}-${hour.hour}`}
						x={x}
						vertical={vertical}
						height={3}
					/>
				);
			} else {
				return null;
			}
		});
	}

	return (
		<g className={'levels'}>
			{hours}
			{days}
			{months}
			{years.reverse()}
		</g>
	);
};

Days.propTypes = {
	period: PropTypes.shape({
		start: PropTypes.string,
		end: PropTypes.string,
	}).isRequired,
	getX: PropTypes.func.isRequired,
	dayWidth: PropTypes.number.isRequired,
	height: PropTypes.number.isRequired,
	vertical: PropTypes.bool,
};

Days.defaultProps = {
	vertical: false,
};

export default Days;
