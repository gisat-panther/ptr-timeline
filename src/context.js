import PropTypes from 'prop-types';
import {createContext} from 'react';
export const Context = createContext({
	updateContext: null,
	width: null,
	height: null,
	getX: null,
	getTime: null,
	centerTime: null,
	centerTimeUtc: null,
	getActiveLevel: null,
	dayWidth: null,
	maxDayWidth: null,
	minDayWidth: null,
	periodLimit: null,
	period: null,
	mouseX: null,
	activeLevel: null,
	periodLimitVisible: null,
	onClick: null,
	onHover: null,
	vertical: null,
	periodLimitOnCenter: null,
	selectMode: null,
	moving: null,
});

export const ContextProvider = ({children, ...rest}) => {
	return (
		<Context.Provider value={{...rest.value}}>{children}</Context.Provider>
	);
};

ContextProvider.propTypes = {
	children: PropTypes.node,
};
