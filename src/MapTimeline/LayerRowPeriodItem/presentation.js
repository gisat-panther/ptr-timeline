import React, {useEffect} from 'react';
import PropTypes from 'prop-types';
import {intersection as _intersection, last as _last} from 'lodash';
import moment from 'moment';

import Overlay from '../../Overlay';

const getOverlayKey = (top, start, end, layerState) => {
	return `${top}-${start}-${end}-${top}-${JSON.stringify(layerState)}`;
};

const getBackgroundColor = (layer, active) => {
	const activeStates = [...layer.activeStates];

	// TODO add active state, should be solved somewhere else
	if (active) {
		activeStates.push('active');
	}
	const states = layer.states;
	const activeStatesConfirmed = _intersection(activeStates, states);
	const lastState = _last(activeStatesConfirmed);
	const colors = layer.colors;

	const colorForLastState = colors[lastState];

	return colorForLastState;
};

const LayerRowPeriodItem = ({
	active,
	layer,
	originPeriod,
	parsedPeriod,
	height,
	onClick,
	top,

	//params from timeline wrapper
	activeLevel,
	dayWidth,
	getX,
	mouseX,
	period,
	periodLimit,
	verticel,
	width,
}) => {
	const timelineParams = {
		activeLevel,
		dayWidth,
		getX,
		mouseX,
		period,
		periodLimit,
		verticel,
		width,
	};

	const overlays = [];

	if (parsedPeriod) {
		const key = getOverlayKey(
			top,
			parsedPeriod.start,
			parsedPeriod.end,
			layer.layerState
		);
		const backgroundColor = getBackgroundColor(layer, active);
		overlays.push({
			key: key,
			originPeriod: originPeriod,
			originLayer: layer,
			start: moment(`${parsedPeriod.start}`),
			end: moment(`${parsedPeriod.end}`),
			backdroundColor: backgroundColor,
			height,
			top,
		});
		return (
			<Overlay
				key={key}
				overlays={overlays}
				onClick={onClick}
				{...timelineParams}
			/>
		);
	} else {
		return <></>;
	}
};

LayerRowPeriodItem.propTypes = {};

export default LayerRowPeriodItem;
