import {useEffect, useRef, useState, Children} from 'react';
import PropTypes from 'prop-types';

import {utils} from '@gisatcz/ptr-utils';

import Timeline from '../Timeline';
import TimeLineHover from '../TimeLineHover';
import {HoverHandler, getTootlipPosition} from '@gisatcz/ptr-core';

import XAxis from '../XAxis';

import './style.scss';
import {isEqual as _isEqual, isEmpty as _isEmpty} from 'lodash';

const TOOLTIP_PADDING = 5;
const MIN_TIMELINE_HEIGHT = 4;

const MapTimeline = ({
	LayerRowComponent,
	levels,
	periodLimit,
	initPeriod,
	onHover,
	onClick,
	vertical,
	children,
	getHoverContent,
	periodLimitOnCenter,
	selectMode,
	onLayerClick,
	layers,
	mapKey,
	LegendComponent,
	minTimelineHeight,
	contentHeight,
}) => {
	const wrapperRef = useRef();

	const [timelineState, setTimelineState] = useState({
		period: {...initPeriod},
		dayWidth: null,
		activeLevel: null,
	});
	const [timelineWidth, setTimelineWidth] = useState(null);

	useEffect(() => {
		setTimelineState({
			...timelineState,
			period: initPeriod,
		});
	}, [initPeriod]);

	minTimelineHeight =
		minTimelineHeight || MIN_TIMELINE_HEIGHT * utils.getRemSize();

	let top = 0;
	const overlays = layers.map(layerRow => {
		top = top + (layerRow.lineHeight - layerRow.elementHeight) / 2;
		const lr = (
			<LayerRowComponent
				key={`${JSON.stringify(layerRow)}`}
				layers={layers}
				layerRow={layerRow}
				onLayerClick={onLayerClick}
				top={top}
				mapKey={mapKey}
			/>
		);
		top =
			top +
			layerRow.elementHeight +
			(layerRow.lineHeight - layerRow.elementHeight) / 2;
		return lr;
	});

	const contentHeightByLayers = top;

	const childArray = [...Children.toArray(children), ...overlays];

	const getHorizontalTootlipStyle = () => {
		const referencePoint = 'center';

		return () => {
			const windowScrollTop = window.document.documentElement.scrollTop;
			const windowScrollLeft = window.document.documentElement.scrollLeft;
			const windowHeight = window.document.documentElement.clientHeight;
			const windowWidth = window.document.documentElement.clientWidth;

			//map box

			const windowBBox = [
				windowScrollTop,
				windowScrollLeft + windowWidth,
				windowScrollTop + windowHeight,
				windowScrollLeft,
			];
			// return (position,origPosX,origPosY,width,height,hoveredElemen) => {
			return (origPosX, origPosY, width, height) => {
				const position = getTootlipPosition(
					referencePoint,
					['bottom', 'top'],
					windowBBox,
					TOOLTIP_PADDING
				)(origPosX, origPosY, width, height, wrapperRef.current);
				return {top: position.top, left: position.left};
			};
		};
	};

	const onChange = change => {
		const update = {};
		if (change.dayWidth !== timelineState.dayWidth) {
			update['dayWidth'] = change.dayWidth;
		}
		if (!_isEqual(change.centerTime, timelineState.time)) {
			update['time'] = change.centerTime;
		}
		if (change.activeLevel !== timelineState.activeLevel) {
			update['activeLevel'] = change.activeLevel;
		}

		if (!_isEmpty(update)) {
			setTimelineState({...timelineState, ...update});
		}
	};

	const onResize = width => {
		setTimelineWidth(width);
	};

	return (
		<div ref={wrapperRef}>
			{timelineWidth ? (
				<div className={'ptr-timeline-x-axe'}>
					<div className={'ptr-timeline-legend-placeholder'}></div>
					<Timeline
						time={timelineState.time}
						dayWidth={timelineState.dayWidth}
						periodLimit={periodLimit}
						periodLimitOnCenter={periodLimitOnCenter}
						onChange={onChange}
						vertical={vertical}
						levels={levels}
						contentHeight={28}
						selectMode={selectMode}
						width={timelineWidth}
					>
						<XAxis key={'maptimeline-xaxis'} />
					</Timeline>
				</div>
			) : null}

			<div
				className={'ptr-maptimeline-scrollable'}
				style={{...(contentHeight ? {height: contentHeight} : {})}}
			>
				<div className={'ptr-maptimeline'}>
					{LegendComponent && !vertical ? (
						<LegendComponent layers={layers} />
					) : null}
					<div className={'ptr-maptimeline-wrapper'}>
						<HoverHandler
							getStyle={getHorizontalTootlipStyle()}
							conextId={'TimeLineContext'}
						>
							<TimeLineHover getHoverContent={getHoverContent}>
								<Timeline
									dayWidth={timelineState.dayWidth}
									time={timelineState.time}
									periodLimit={periodLimit}
									periodLimitOnCenter={periodLimitOnCenter}
									onChange={onChange}
									onHover={onHover}
									onClick={onClick}
									vertical={vertical}
									levels={levels}
									contentHeight={Math.max(
										contentHeightByLayers,
										minTimelineHeight
									)}
									selectMode={selectMode}
									onResize={onResize}
								>
									{childArray}
								</Timeline>
							</TimeLineHover>
						</HoverHandler>
					</div>
				</div>
			</div>
		</div>
	);
};

MapTimeline.propTypes = {
	LayerRowComponent: PropTypes.func,
	LegendComponent: PropTypes.func,
	children: PropTypes.node,
	getHoverContent: PropTypes.func,
	initPeriod: PropTypes.object,
	layers: PropTypes.array,
	levels: PropTypes.array,
	mapKey: PropTypes.string,
	onClick: PropTypes.func,
	onHover: PropTypes.func,
	onLayerClick: PropTypes.func,
	periodLimit: PropTypes.object,
	periodLimitOnCenter: PropTypes.bool,
	selectMode: PropTypes.bool,
	vertical: PropTypes.bool,
	minTimelineHeight: PropTypes.number,
	contentHeight: PropTypes.number,
};

export default MapTimeline;
