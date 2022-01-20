import React from 'react';
import PropTypes from 'prop-types';

import {defaultElementHeight, defaultLineHeight} from '../constants';
// import LayerRowItem from '../LayerRowItem';

const LayerRow = ({
	layerRow,
	LayerRowItemComponent,
	layers,
	onLayerClick,
	toggleLayer,
	top,
	mapKey,

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

	const onClick = (timelineLayerPeriodItem, timelineLayer) => {
		// todo dispatch onLayerClick
		if (typeof toggleLayer === 'function') {
			toggleLayer(
				timelineLayerPeriodItem,
				timelineLayer,
				mapKey,
				layerRow,
				layers
			);
		}

		if (typeof onLayerClick === 'function') {
			onLayerClick(
				timelineLayerPeriodItem,
				timelineLayer,
				mapKey,
				layerRow,
				layers
			);
		}
	};

	const elementHeight = layerRow.elementHeight || defaultElementHeight;

	const getLayer = layer => {
		return (
			<LayerRowItemComponent
				key={`${JSON.stringify(layer)}`}
				layer={layer}
				top={top}
				height={elementHeight}
				onClick={timelineLayerPeriodItem =>
					onClick(timelineLayerPeriodItem, layer)
				}
				mapKey={mapKey}
				{...timelineParams}
			/>
		);
	};

	let layerRowsElms = [];
	if (layerRow?.items.length > 0) {
		layerRowsElms = layerRow.items.map(getLayer);
	}

	return <>{layerRowsElms}</>;
};

LayerRow.propTypes = {};

export default LayerRow;
