import PropTypes from 'prop-types';

import {defaultElementHeight} from '../constants';

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
	vertical,
	width,
}) => {
	const timelineParams = {
		activeLevel,
		dayWidth,
		getX,
		mouseX,
		period,
		periodLimit,
		vertical,
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

LayerRow.propTypes = {
	LayerRowItemComponent: PropTypes.func,
	activeLevel: PropTypes.string,
	dayWidth: PropTypes.number,
	getX: PropTypes.func,
	layerRow: PropTypes.shape({
		elementHeight: PropTypes.any,
		items: PropTypes.array,
	}),
	layers: PropTypes.array,
	mapKey: PropTypes.string,
	mouseX: PropTypes.number,
	onLayerClick: PropTypes.func,
	period: PropTypes.object,
	periodLimit: PropTypes.object,
	toggleLayer: PropTypes.func,
	top: PropTypes.number,
	vertical: PropTypes.bool,
	width: PropTypes.number,
};

export default LayerRow;
