import {useContext, Children, cloneElement} from 'react';

import {Context as TimeLineContext} from './context';

import TimelineEventsWrapper from './TimelineEventsWrapper';

import propTypes from 'prop-types';

import './style.scss';

const TimelineContent = ({children, ...propsWithoutChildren}) => {
	const context = useContext(TimeLineContext);
	const {
		periodLimit,
		height,
		width,
		dayWidth,
		period,
		mouseX,
		vertical,
		activeLevel,
	} = context;

	const elementWidth = vertical ? height : width;
	const elementHeight = vertical ? width : height;
	const transform = vertical ? `scale(-1,1) translate(-${height},0)` : '';

	const childrenWithProps = [];
	Children.forEach(children, child => {
		childrenWithProps.push(
			cloneElement(child, {
				...propsWithoutChildren,
				period: period,
				periodLimit: periodLimit,
				getX: dayWidth => context.getX(dayWidth),
				height: height,
				width: width,
				dayWidth: dayWidth,
				vertical: vertical,
				mouseX: mouseX,
				activeLevel: activeLevel,
			})
		);
	});

	return (
		<TimelineEventsWrapper>
			<div className="ptr-timeline-content" style={{height: elementHeight}}>
				<svg
					version={'1.1'}
					xmlns={'http://www.w3.org/2000/svg'}
					xmlnsXlink={'http://www.w3.org/1999/xlink'}
					width={elementWidth}
					height={elementHeight}
				>
					<g transform={transform}>{childrenWithProps}</g>
				</svg>
			</div>
		</TimelineEventsWrapper>
	);
};

TimelineContent.propTypes = {
	children: propTypes.node,
};

export default TimelineContent;
