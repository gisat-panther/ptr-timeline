import PropTypes from 'prop-types';
import {map as _map} from 'lodash';
import moment from 'moment';

import {getOverlays} from '../utils/interval';

import OverlayItem from './OverlayItem';

import './style.scss';

const Overlay = ({period, overlays, getX, vertical, onClick}) => {
	if (period) {
		const periodStart = moment(period.start);
		const periodEnd = moment(period.end);

		const overlaysCfg = getOverlays(periodStart, periodEnd, overlays);

		const overlaysElms = _map(overlaysCfg, overlay => {
			return (
				<OverlayItem
					key={`${overlay.key}`}
					overlay={overlay}
					getX={getX}
					vertical={vertical}
					onClick={onClick}
				/>
			);
		});

		return <g>{overlaysElms}</g>;
	} else {
		return null;
	}
};

Overlay.propTypes = {
	period: PropTypes.shape({
		start: PropTypes.string,
		end: PropTypes.string,
	}),
	getX: PropTypes.func,
	overlays: PropTypes.array.isRequired,
	vertical: PropTypes.bool,
	onClick: PropTypes.func,
};

Overlay.defaultProps = {
	getX: () => {},
	overlays: [],
	vertical: false,
	onClick: () => {},
};

export default Overlay;
