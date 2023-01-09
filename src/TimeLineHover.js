import {isValidElement, Children, cloneElement, useContext} from 'react';
import PropTypes from 'prop-types';
import Context from '@gisatcz/cross-package-react-context';

const TimelineHover = ({getHoverContent, children}) => {
	const defaultHoverContext = 'TimeLineContext';
	const HoverContext = Context.getContext(defaultHoverContext);
	const context = useContext(HoverContext);

	const onHoverOut = context?.onHoverOut;
	const onHover = (evt, hoveredItems = []) => {
		const popupContent =
			(evt && getHoverContent(evt.x, evt.time, evt, context)) || null;
		if (
			popupContent &&
			(isValidElement(popupContent) || popupContent?.popup?.content)
		) {
			const hoverItem = {
				key: 'timeline',
				x: evt.x,
				y: evt.y,
			};
			if (typeof context?.onHover === 'function') {
				context?.onHover([hoverItem, ...hoveredItems], {
					popup: {
						x: evt.x,
						y: evt.y,
						content: popupContent,
					},
				});
			}
		} else {
			if (typeof context?.onHoverOut === 'function') {
				context?.onHoverOut();
			}
		}
	};

	const childrenElms = Children.map(children, child =>
		cloneElement(child, {
			...child.props,
			onHover,
			onHoverOut,
		})
	);

	return <>{childrenElms}</>;
};

TimelineHover.propTypes = {
	getHoverContent: PropTypes.func,
	children: PropTypes.node,
};

export default TimelineHover;
