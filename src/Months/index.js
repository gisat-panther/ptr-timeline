import React from 'react';
import PropTypes from 'prop-types';
import {map as _map} from 'lodash';
import moment from 'moment';
import utils from '../utils';
import MonthDash from './MonthDash';
import YearDash from '../Years/YearDash';
import './style.scss';

const Months = props => {
	const {period, getX, dayWidth, height, vertical} = props;
	const periodStart = moment(period.start);
	const periodEnd = moment(period.end);
	const monthsCfg = utils.interval.getMonths(periodStart, periodEnd);
	const yearsCfg = utils.interval.getYears(periodStart, periodEnd);

	const months = _map(monthsCfg, month => {
		if (month.month !== '01') {
			let x = getX(month.start);

			return (
				<MonthDash
					key={`${month.year}-${month.month}`}
					x={x}
					vertical={vertical}
					height={2}
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

	return (
		<g className={'levels'}>
			{months}
			{years.reverse()}
		</g>
	);
};

Months.propTypes = {
	period: PropTypes.shape({
		start: PropTypes.string,
		end: PropTypes.string,
	}).isRequired,
	getX: PropTypes.func.isRequired,
	dayWidth: PropTypes.number.isRequired,
	height: PropTypes.number.isRequired,
	vertical: PropTypes.bool,
};

Months.defaultProps = {
	vertical: false,
};

export default Months;
