import {isValidElement, Children, cloneElement} from 'react';
import PropTypes from 'prop-types';

import hoverContext from './HoverHandler/context';
import {useContext} from 'react';

const TimelineHover = ({getHoverContent, children}) => {
	const context = useContext(hoverContext);

	const onHover = evt => {
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
			context.onHover([hoverItem], {
				popup: {
					x: evt.x,
					y: evt.y,
					content: popupContent,
				},
			});
		} else {
			context.onHoverOut();
		}
	};

	const childrenElms = Children.map(children, child =>
		cloneElement(child, {...child.props, onHover: onHover})
	);

	return <>{childrenElms}</>;
};

TimelineHover.propTypes = {
	getHoverContent: PropTypes.func,
	children: PropTypes.node,
};

export default TimelineHover;
