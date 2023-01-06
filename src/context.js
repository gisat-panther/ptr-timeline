import Context from '@gisatcz/cross-package-react-context';

const defaultContextValue = {
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
	onHoverOut: null,
	vertical: null,
	periodLimitOnCenter: null,
	selectMode: null,
	moving: null,
};

export default () => {
	Context.getContext('TimeLineContext', defaultContextValue);
};
