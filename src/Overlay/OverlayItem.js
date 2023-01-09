import {useContext} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Context from '@gisatcz/cross-package-react-context';
import './style.scss';

const MIN_OVERLAY_WIDTH = 5; //in pixels

const OverlayItem = ({overlay, getX, vertical, onClick}) => {
	const defaultHoverContext = 'TimeLineContext';
	const HoverContext = Context.getContext(defaultHoverContext);
	const context = useContext(HoverContext);

	const start = getX(overlay.start);
	const end = getX(overlay.end);
	let label = null;

	const MIN_WIDTH_MODE = end - start > MIN_OVERLAY_WIDTH ? false : true;
	const diff = MIN_WIDTH_MODE ? MIN_OVERLAY_WIDTH : end - start;
	const x = vertical ? overlay.top : MIN_WIDTH_MODE ? start - diff / 2 : start;
	const yL = vertical ? start : overlay.top + overlay.height - 2;
	const yR = vertical ? start : overlay.top;
	const eHeight = vertical ? diff : overlay.height;
	const width = vertical ? overlay.height : diff;

	const onOverlayClick = () => {
		if (typeof onClick === 'function') {
			onClick(overlay);
		}
	};

	const onMouseEnter = evt => {
		context.onHover(
			{
				x: evt.pageX,
				y: evt.pageY,
			},
			[
				{
					key: overlay.key,
					overlay,
				},
			]
		);
	};

	const onMouseLeave = () => {
		context.onHoverOut([
			{
				key: overlay.key,
				overlay,
			},
		]);
	};

	//TODO - solve label in vertical
	if (!overlay.hideLabel && overlay.label && !vertical) {
		label = (
			<text x={x} y={yL} className="ptr-timeline-overlay-label">
				{overlay.label}
			</text>
		);
	}
	return (
		<g
			key={`${overlay.key}`}
			className={classNames('ptr-timeline-overlay', overlay.classes)}
			onClick={onOverlayClick}
			onMouseEnter={onMouseEnter}
			onMouseLeave={onMouseLeave}
		>
			<rect
				x={x}
				width={width}
				y={yR}
				rx={eHeight / 2}
				ry={eHeight / 2}
				height={eHeight}
				fill={overlay.backgound}
			/>
			{label}
		</g>
	);
};

OverlayItem.propTypes = {
	getX: PropTypes.func,
	overlay: PropTypes.object,
	vertical: PropTypes.bool,
	onClick: PropTypes.func,
};

OverlayItem.defaultProps = {
	getX: () => {},
	overlay: {},
	vertical: false,
	onClick: () => {},
};

export default OverlayItem;
