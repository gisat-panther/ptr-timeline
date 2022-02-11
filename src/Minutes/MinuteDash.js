import PropTypes from 'prop-types';
import {D1, D2, D3} from '../utils/dash';

const MinutesDash = ({x, label, vertical, height}) => {
	return (
		<g className={'ptr-timeline-minute'}>
			{height === 1 ? <D1 x={x} vertical={vertical} /> : null}
			{height === 2 ? <D2 x={x} vertical={vertical} /> : null}
			{height === 3 ? <D3 x={x} vertical={vertical} /> : null}
			{label}
		</g>
	);
};

MinutesDash.propTypes = {
	x: PropTypes.number.isRequired,
	label: PropTypes.element,
	vertical: PropTypes.bool,
	height: PropTypes.number,
};

MinutesDash.defaultProps = {
	vertical: false,
	label: null,
};

export default MinutesDash;
