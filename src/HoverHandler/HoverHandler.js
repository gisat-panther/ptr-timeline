import React, {useRef, useState} from 'react';
import PropTypes from 'prop-types';
import {isNumber as _isNumber} from 'lodash';
import {stateManagement} from '@gisatcz/ptr-utils';

import HoverContext from './context';
import Popup from './Popup/Popup';

const HoverHandler = ({
	children,
	getStyle,
	popupContentComponent,
	compressedPopups,
}) => {
	const [state, setState] = useState({
		hoveredItems: [],
		popupContent: null,
		x: null,
		y: null,
		data: null,
	});
	const ref = useRef();
	const tmpHoveredItems = useRef([]);

	const onHoverOut = hoveredItemsToRemove => {
		let updateHoveredItems = tmpHoveredItems.current || [];

		if (hoveredItemsToRemove?.length > 0) {
			// remove hoveredItems from context

			hoveredItemsToRemove.forEach(overlay => {
				const hoverdItemIndex = updateHoveredItems.findIndex(
					i => i?.key === overlay.key
				);
				if (_isNumber(hoverdItemIndex)) {
					updateHoveredItems = stateManagement.removeItemByIndex(
						updateHoveredItems,
						hoverdItemIndex
					);
				}
			});
		} else {
			// else clear all hoveredItems
			updateHoveredItems = [];
		}

		tmpHoveredItems.current = updateHoveredItems;
		setState(prevState => ({
			...prevState,
			...{
				popupContent: null,
				data: null,
				fidColumnName: null,
			},
		}));
	};

	const onHover = (newHoveredItems = [], options) => {
		// TODO what is wrong with attributes? Just bad signal? Else try single layer

		// TODO check popup coordinates -> if the same -> merge data / else -> overwrite
		// TODO if empty hovered items && nothing in state -> set state with nulls

		let update = {};
		let coordChanged = false;

		// for older versions compatibility
		if (
			options &&
			options.popup &&
			(options.popup.content || options.popup.content === null)
		) {
			update.popupContent = options.popup.content;
		}

		// check if coordinates has been changed
		if (options.popup.x && options.popup.y) {
			if (state.x !== options.popup.x || state.y !== options.popup.y) {
				coordChanged = true;
				update.x = options.popup.x;
				update.y = options.popup.y;
			}
		}

		// handle data according to coordinates change
		// TODO fid column name should be part of data
		const hoveredItemsKeys =
			newHoveredItems.map(i => i?.key).filter(i => i) || [];
		const stateHoveredItemWithoutByKey = tmpHoveredItems.current?.filter(
			i => !hoveredItemsKeys.includes(i?.key)
		);

		if (coordChanged) {
			update.data = options.popup.data;
			update.fidColumnName = options.popup.fidColumnName;
		} else {
			if (state.data && options.popup.data && options.popup.data.length) {
				update.data = [...state.data, ...options.popup.data];
				update.fidColumnName = options.popup.fidColumnName;
			}
		}

		tmpHoveredItems.current = [
			...stateHoveredItemWithoutByKey,
			...newHoveredItems,
		];

		if (!_.isEmpty(update)) {
			setState(prevState => ({...prevState, ...update}));
		}
	};

	const renderPopup = () => {
		const {data, hoveredItems, fidColumnName, popupContent, x, y} = state;

		return (
			<Popup
				x={x}
				y={y}
				content={
					popupContentComponent
						? React.createElement(popupContentComponent, {
								data: data,
								featureKeys: hoveredItems,
								fidColumnName: fidColumnName,
						  })
						: popupContent
				}
				getStyle={getStyle}
				hoveredElemen={ref.current}
				compressed={compressedPopups}
			/>
		);
	};

	return (
		<HoverContext.Provider
			value={{
				hoveredItems: tmpHoveredItems.current,
				selectedItems: state.selectedItems,
				onHover: onHover,
				onHoverOut: onHoverOut,
				x: state.x,
				y: state.y,
			}}
		>
			<div ref={ref} style={{height: '100%', width: '100%'}}>
				{children}
				{/* {popup ? this.renderPopup() : null} */}
				{state.popupContent || state.data ? renderPopup() : null}
			</div>
		</HoverContext.Provider>
	);
};

export default HoverHandler;
