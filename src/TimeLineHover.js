import React from 'react';

import hoverContext from './HoverHandler/context';

class TimelineHover extends React.PureComponent {
	static contextType = hoverContext;
	constructor(props) {
		super(props);
		this.onHover = this.onHover.bind(this);
	}

	onHover(evt) {
		const popupContent =
			(evt && this.props.getHoverContent(evt.x, evt.time, evt, this.context)) ||
			null;
		if (
			popupContent &&
			(React.isValidElement(popupContent) || popupContent?.popup?.content)
		) {
			const hoverItem = {
				key: 'timeline',
				x: evt.x,
				y: evt.y,
			};
			this.context.onHover([hoverItem], {
				popup: {
					x: evt.x,
					y: evt.y,
					content: popupContent,
				},
			});
		} else {
			this.context.onHoverOut();
		}
	}

	render() {
		const children = React.Children.map(this.props.children, child =>
			React.cloneElement(child, {...child.props, onHover: this.onHover})
		);

		return <>{children}</>;
	}
}

export default TimelineHover;
