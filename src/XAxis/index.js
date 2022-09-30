import PropTypes from 'prop-types';
import {createElement} from 'react';
import YearsLabels from '../YearsLabels';
import MonthsLabels from '../MonthsLabels';
import DaysLabels from '../DaysLabels';

import './style.scss';

const Levels = props => {
	const {activeLevel} = props;
	switch (activeLevel) {
		case 'year':
			return createElement(YearsLabels, {...props, key: 'year'});
		case 'month':
			return [
				createElement(MonthsLabels, {...props, key: 'month'}),
				createElement(YearsLabels, {...props, key: 'year'}),
			];
		case 'day':
			return [
				createElement(DaysLabels, {...props, key: 'day'}),
				createElement(MonthsLabels, {...props, key: 'month'}),
			];
	}
	return null;
};

Levels.propTypes = {
	activeLevel: PropTypes.string,
};

const XAxis = ({period, getX, dayWidth, vertical, activeLevel}) => {
	return (
		<Levels
			period={period}
			getX={getX}
			dayWidth={dayWidth}
			height={20}
			vertical={vertical}
			activeLevel={activeLevel}
		/>
	);
};

XAxis.propTypes = {
	getX: PropTypes.func,
	period: PropTypes.object,
	activeLevel: PropTypes.string,
	dayWidth: PropTypes.number,
	vertical: PropTypes.bool,
};

export default XAxis;
