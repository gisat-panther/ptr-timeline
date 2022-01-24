import React from 'react';
import PropTypes from 'prop-types';

import {utils} from '@gisatcz/ptr-utils';

const defaultLineHeight = utils.getRemSize();

const MapTimelineLegend = ({layers, lineHeight = defaultLineHeight}) => {
	const layersElms =
		layers?.map(layer => {
			return (
				<span
					key={layer.key || layer?.legend?.title}
					className={'ptr-maptimeline-legenditem'}
					style={{lineHeight: `${lineHeight}px`}}
					title={`${layer.legend.title}`}
				>
					{layer.legend.title}
				</span>
			);
		}) || [];

	return <div className={'ptr-maptimelinelegend'}>{layersElms}</div>;
};

export default MapTimelineLegend;
