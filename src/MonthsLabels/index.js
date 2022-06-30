import {createElement} from 'react';
import PropTypes from 'prop-types';
import {map as _map} from 'lodash';
import moment from 'moment';
import utils from '../utils';
import './style.scss';

const MonthsLabel = props => {
	const {period, getX, height, vertical, dayWidth} = props;
	const periodStart = moment(period.start);
	const periodEnd = moment(period.end);
	const monthsCfg = utils.interval.getMonths(periodStart, periodEnd);

	let className = 'ptr-timeline-month-label';
	if (dayWidth > 30) {
		className = `${className} large`;
	}

	const months = _map(monthsCfg, month => {
		if (month.month !== '01') {
			const labelXCorrection = -3;
			let x = getX(month.start) + labelXCorrection;
			let label = createElement(utils.textLabel.default, {
				label: month.month,
				vertical,
				x,
				height,
				className,
			});
			return (
				<g
					className={'ptr-timeline-month'}
					key={`${month.year}-${month.month}`}
				>
					{label}
				</g>
			);
		} else {
			return null;
		}
	});

	return <g className={'levels'}>{months}</g>;
};

MonthsLabel.propTypes = {
	period: PropTypes.shape({
		start: PropTypes.string,
		end: PropTypes.string,
	}).isRequired,
	getX: PropTypes.func.isRequired,
	dayWidth: PropTypes.number.isRequired,
	height: PropTypes.number.isRequired,
	vertical: PropTypes.bool,
};

MonthsLabel.defaultProps = {
	vertical: false,
};

export default MonthsLabel;
