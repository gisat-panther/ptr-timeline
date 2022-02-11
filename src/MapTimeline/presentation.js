import {useEffect, useRef, useState, Children} from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import ReactResizeDetector from 'react-resize-detector';

import {utils} from '@gisatcz/ptr-utils';

import Timeline from '../Timeline';
import TimeLineHover from '../TimeLineHover';
import HoverHandler from '../HoverHandler/HoverHandler';
import {getTootlipPosition} from '../HoverHandler/position';

import XAxis from '../XAxis';

import './style.scss';
import {isEqual as _isEqual} from 'lodash';

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
}) => {
	const wrapperRef = useRef();

	const [period, setPeriod] = useState({...initPeriod});
	const [dayWidth, setDayWidth] = useState(null);
	const [activeLevel, setActiveLevel] = useState(null);
	const [timelineWidth, setTimelineWidth] = useState(null);

	useEffect(() => {
		setPeriod(initPeriod);
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

	const getX = date => {
		date = moment(date);
		let diff = date.unix() - moment(period.start).unix();
		let diffDays = diff / (60 * 60 * 24);
		return diffDays * dayWidth;
	};

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
		if (change.dayWidth !== dayWidth) {
			setDayWidth(change.dayWidth);
		}
		if (!_isEqual(change.period, period)) {
			setPeriod(change.period);
		}
		if (change.activeLevel !== activeLevel) {
			setActiveLevel(change.activeLevel);
		}
	};

	return (
		<div ref={wrapperRef}>
			<XAxis
				period={period}
				getX={getX}
				dayWidth={dayWidth}
				vertical={vertical}
				activeLevel={activeLevel}
				passedWidth={timelineWidth}
			/>
			<div className={'ptr-maptimeline-scrollable'}>
				<div className={'ptr-maptimeline'}>
					{LegendComponent && !vertical ? (
						<LegendComponent layers={layers} />
					) : null}
					<div className={'ptr-maptimeline-wrapper'}>
						<ReactResizeDetector
							handleWidth
							skipOnMount={false}
							onResize={setTimelineWidth}
						>
							{timelineWidth ? (
								<HoverHandler getStyle={getHorizontalTootlipStyle()}>
									<TimeLineHover getHoverContent={getHoverContent}>
										<Timeline
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
										>
											{childArray}
										</Timeline>
									</TimeLineHover>
								</HoverHandler>
							) : null}
						</ReactResizeDetector>
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
};

export default MapTimeline;
