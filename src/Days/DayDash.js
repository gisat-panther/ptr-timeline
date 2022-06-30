import PropTypes from 'prop-types';
import {D1, D2} from '../utils/dash';

const DaysDash = ({x, vertical, height}) => {
	return (
		<g className={'ptr-timeline-day'}>
			{height === 1 ? <D1 x={x} vertical={vertical} /> : null}
			{height === 2 ? <D2 x={x} vertical={vertical} /> : null}
		</g>
	);
};

DaysDash.propTypes = {
	x: PropTypes.number.isRequired,
	vertical: PropTypes.bool,
	height: PropTypes.number,
};

DaysDash.defaultProps = {
	vertical: false,
};

export default DaysDash;
