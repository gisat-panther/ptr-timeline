import React, {useContext, useEffect} from 'react';

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

	// fix bubling wheel event
	// https://github.com/facebook/react/issues/14856#issuecomment-586781399
	useEffect(() => {
		const cancelWheel = event => event.preventDefault();

		document.body.addEventListener('wheel', cancelWheel, {passive: false});

		return () => {
			document.body.removeEventListener('wheel', cancelWheel);
		};
	}, []);

	const elementWidth = vertical ? height : width;
	const elementHeight = vertical ? width : height;
	const transform = vertical ? `scale(-1,1) translate(-${height},0)` : '';

	const childrenWithProps = [];
	React.Children.forEach(children, child => {
		childrenWithProps.push(
			React.cloneElement(child, {
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
			<div className="ptr-timeline-content">
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
	children: propTypes.array,
};

export default TimelineContent;
