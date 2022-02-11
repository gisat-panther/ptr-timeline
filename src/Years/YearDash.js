import {createElement} from 'react';
import PropTypes from 'prop-types';
import utils from '../utils';

const YearsDash = props => {
	const {x, label, vertical} = props;
	return (
		<g className={'ptr-timeline-year'}>
			{createElement(utils.dash.D1, {x, vertical})}
			{label}
		</g>
	);
};

YearsDash.propTypes = {
	x: PropTypes.number,
	label: PropTypes.element,
	vertical: PropTypes.bool,
};

YearsDash.defaultProps = {
	vertical: false,
	label: null,
};

export default YearsDash;
