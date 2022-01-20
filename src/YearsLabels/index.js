import React from 'react';
import PropTypes from 'prop-types';
import {map as _map} from 'lodash';
import moment from 'moment';
import utils from '../utils';
// import YearDash from '../Years/YearDash';
// import MonthDash from '../Months/MonthDash';
import './style.scss';

const YearsLabel = props => {
	const {period, getX, dayWidth, height, vertical} = props;
	const periodStart = moment(period.start);
	const periodEnd = moment(period.end);
	const yearsCfg = utils.interval.getYears(periodStart, periodEnd);

	const years = _map(yearsCfg, year => {
		const labelXCorrection = -3;
		let x = getX(year.start) + labelXCorrection;
		let label = React.createElement(utils.textLabel.default, {
			label: year.year,
			vertical,
			x,
			height,
			className: 'ptr-timeline-year-label',
		});
		return (
			<g className={'ptr-timeline-year'} key={year.year}>
				{label}
			</g>
		);
	});

	// let months = [];

	// if (dayWidth > 0.7) {
	// 	const monthsCfg = utils.interval.getMonths(periodStart, periodEnd);
	// 	months = _map(monthsCfg, month => {
	// 		if (month.month === '07') {
	// 			let x = getX(month.start);
	// 			return (
	// 				<MonthDash
	// 					key={`${month.year}-${month.month}`}
	// 					x={x}
	// 					vertical={vertical}
	// 				/>
	// 			);
	// 		} else {
	// 			return null;
	// 		}
	// 	});
	// }
	return (
		<g className={'levels'}>
			{/* {months} */}
			{years.reverse()}
		</g>
	);
};

YearsLabel.propTypes = {
	period: PropTypes.shape({
		start: PropTypes.string,
		end: PropTypes.string,
	}).isRequired,
	getX: PropTypes.func.isRequired,
	dayWidth: PropTypes.number.isRequired,
	height: PropTypes.number.isRequired,
	vertical: PropTypes.bool,
};

YearsLabel.defaultProps = {
	vertical: false,
};

export default YearsLabel;
