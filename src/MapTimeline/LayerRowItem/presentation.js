import {useEffect} from 'react';
import PropTypes from 'prop-types';

// import LayerRowPeriodItem from '../LayerRowPeriodItem';
import {isPlainObject as _isPlainObject} from 'lodash';

const LayerRowItem = ({
	layer,
	LayerRowPeriodItemComponent,
	height,
	onClick,
	top,
	mapKey,
	usePeriods,
	periodKeys,
	periodsByConfig,

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

	useEffect(() => {
		if (_isPlainObject(layer?.periods) && typeof usePeriods === 'function') {
			usePeriods(layer.periods);
		}
	}, []);
	const getOverlayes = () => {
		if (layer?.periods.length > 0) {
			// prepare overlay for each period
			return layer.periods.map((period, i) => (
				<LayerRowPeriodItemComponent
					key={`${JSON.stringify(layer)}_${JSON.stringify(
						period
					)}_${i}_LayerRowPeriodItem`}
					mapKey={mapKey}
					originPeriod={period}
					layer={layer}
					height={height}
					top={top}
					onClick={onClick}
					{...timelineParams}
				/>
			));
		} else if (periodKeys?.length > 0) {
			// prepare overlay for each period
			return periodKeys.map((periodKey, i) => {
				const periodByConfig =
					periodsByConfig && periodKey
						? periodsByConfig.find(p => p.key === periodKey)
						: null;
				if (periodByConfig) {
					return (
						<LayerRowPeriodItemComponent
							key={`${JSON.stringify(
								layer
							)}_${periodKey}_${i}_LayerRowPeriodItem`}
							mapKey={mapKey}
							originPeriod={periodByConfig}
							layer={layer}
							height={height}
							top={top}
							onClick={onClick}
							{...timelineParams}
						/>
					);
				}
			});
		} else {
			// period is not defined
			return [];
		}
	};

	const overlays = getOverlayes();

	return [overlays];
};

LayerRowItem.propTypes = {
	LayerRowPeriodItemComponent: PropTypes.elementType,
	activeLevel: PropTypes.string,
	dayWidth: PropTypes.number,
	getX: PropTypes.func,
	height: PropTypes.number,
	layer: PropTypes.shape({
		periods: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
	}),
	mapKey: PropTypes.string,
	mouseX: PropTypes.number,
	onClick: PropTypes.func,
	period: PropTypes.object,
	periodKeys: PropTypes.array,
	periodLimit: PropTypes.object,
	periodsByConfig: PropTypes.array,
	top: PropTypes.number,
	usePeriods: PropTypes.func,
	vertical: PropTypes.bool,
	width: PropTypes.number,
};

export default LayerRowItem;
