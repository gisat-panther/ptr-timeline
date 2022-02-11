import {isValidElement, Children, cloneElement} from 'react';
import {PureComponent} from 'react';
import PropTypes from 'prop-types';

import hoverContext from './HoverHandler/context';

class TimelineHover extends PureComponent {
	static propTypes = {
		getHoverContent: PropTypes.func,
		children: PropTypes.node,
	};

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
			(isValidElement(popupContent) || popupContent?.popup?.content)
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
		const children = Children.map(this.props.children, child =>
			cloneElement(child, {...child.props, onHover: this.onHover})
		);

		return <>{children}</>;
	}
}

export default TimelineHover;
