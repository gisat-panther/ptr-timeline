import React from 'react';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import utils from '../utils';
const MonthDash = props => {
	const {x, label, vertical, height, secondary} = props;

	const classes = classnames('ptr-timeline-month', {
		secondary,
	});

	return (
		<g className={classes}>
			{/* {height === 2 ? React.createElement(utils.dash.D2, {x,vertical}) : null} */}
			{/* {height === 1 ? React.createElement(utils.dash.D1, {x,vertical}) : null} */}
			{React.createElement(utils.dash.D1, {x, vertical})}
			{label}
		</g>
	);
};

MonthDash.propTypes = {
	x: PropTypes.number,
	label: PropTypes.element,
	vertical: PropTypes.bool,
	secondary: PropTypes.bool,
};

MonthDash.defaultProps = {
	vertical: false,
	label: null,
};

export default MonthDash;
