import PropTypes from 'prop-types';
import {D1, D2} from '../utils/dash';

const DaysDash = ({x, label, vertical, height}) => {
	return (
		<g className={'ptr-timeline-day'}>
			{height === 1 ? <D1 x={x} vertical={vertical} /> : null}
			{height === 2 ? <D2 x={x} vertical={vertical} /> : null}
			{label}
		</g>
	);
};

DaysDash.propTypes = {
	x: PropTypes.number.isRequired,
	label: PropTypes.element,
	vertical: PropTypes.bool,
	height: PropTypes.number,
};

DaysDash.defaultProps = {
	vertical: false,
	label: null,
};

export default DaysDash;
