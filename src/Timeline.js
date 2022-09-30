import {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import {useResizeDetector} from 'react-resize-detector';

import usePrevious from './hooks/usePrevious';
import {ContextProvider} from './context';
import TimelineContent from './TimelineContent';

const CONTROLS_WIDTH = 0;

const DEFAULT_SIZE = 100;

export const LEVELS = [
	{
		end: 1,
		level: 'year',
	},
	{
		end: 10,
		level: 'month',
	},
	{
		end: 250,
		level: 'day',
	},
	{
		end: 15000,
		level: 'hour',
	},
	{
		end: 70000,
		level: 'minute',
	},
];

const DEFAULT_VERTICAL_HEIGHT = 70;
const DEFAULT_HORIZONTAL_HEIGHT = 45;

const Timeline = ({
	centerTime,
	children,
	contentHeight,
	dayWidth = 1.5,
	// height = 100,
	levels = LEVELS,
	onChange,
	onClick = () => {},
	onHover = () => {},
	period,
	periodLimit,
	periodLimitOnCenter,
	selectMode = false,
	time,
	vertical,
	onResize,
	width,
}) => {
	// constructor(props) {
	// 	super(props);

	// 	this.updateContext = this.updateContext.bind(this);
	// 	this.getX = this.getX.bind(this);
	// 	this.getTime = this.getTime.bind(this);
	// 	this.getActiveLevel = this.getActiveLevel.bind(this);

	// const size = useResizeDetector();
	const {ref, ...size} = useResizeDetector({
		refreshMode: 'debounce',
		refreshRate: 300,
		refreshOptions: {trailing: true},
		...(onResize ? {onResize} : {}),
	});
	const widthSelf = width || size.width;
	const height = size.height || 100;
	const prevTime = usePrevious(time);
	const prevDayWidth = usePrevious(dayWidth);
	const prevPeriodLimit = usePrevious(periodLimit);
	const prevWidth = usePrevious(widthSelf);
	const prevHeight = usePrevious(height);

	const getXAxisWidth = () => {
		const XAxisWidth = vertical
			? ref?.current?.getBoundingClientRect().height
			: ref?.current?.getBoundingClientRect().width;

		return XAxisWidth || DEFAULT_SIZE;
	};

	const getPeriodLimitByDayWidth = dayWidth => {
		const allDays = getXAxisWidth() / dayWidth;
		const halfMouseDays = allDays / 2;

		const start = moment(centerTime)
			.subtract(moment.duration(halfMouseDays * (60 * 60 * 24 * 1000), 'ms'))
			.toDate()
			.toString();
		const end = moment(centerTime)
			.add(moment.duration(halfMouseDays * (60 * 60 * 24 * 1000), 'ms'))
			.toDate()
			.toString();
		return {
			start,
			end,
		};
	};

	const getMaxDayWidth = (forLevels = levels) => {
		const lastLevel = forLevels[forLevels.length - 1];
		const maxDayWidth = lastLevel.end;
		return maxDayWidth;
	};

	const getDayWidthForPeriod = (
		periodLimit,
		axesWidth,
		maxDayWidth = getMaxDayWidth()
	) => {
		const start = moment(periodLimit.start);
		const end = moment(periodLimit.end);

		const diff = end.diff(start, 'ms');
		const diffDays = diff / (60 * 60 * 24 * 1000);

		let dayWidth = (axesWidth - CONTROLS_WIDTH) / diffDays;
		if (dayWidth > maxDayWidth) {
			dayWidth = maxDayWidth;
		}

		return dayWidth;
	};

	//Find first level with smaller start level.
	const getActiveLevel = dayWidth => {
		return levels.find(l => dayWidth <= l.end);
	};

	const getTime = (
		x,
		dayWidth = state.dayWidth,
		startTime = state.period.start
	) => {
		let diffDays = x / dayWidth;
		let diff = diffDays * (60 * 60 * 24 * 1000);
		return moment(startTime).add(moment.duration(diff, 'ms'));
	};

	const getPeriodLimitByTime = (
		time,
		axesWidth = getXAxisWidth(),
		periodLimit = state.periodLimit, //fixme
		dayWidth = state.dayWidth //fixme
	) => {
		const allDays = axesWidth / dayWidth;
		let setTime = moment(time);

		//check if setTime is in periodLimit
		if (setTime.isBefore(periodLimit.start)) {
			setTime = moment(periodLimit.start);
		}

		if (setTime.isAfter(periodLimit.end)) {
			setTime = moment(periodLimit.end);
		}

		const halfDays = allDays / 2;
		const start = moment(setTime)
			.subtract(moment.duration(halfDays * (60 * 60 * 24 * 1000), 'ms'))
			.toDate()
			.toString();
		const end = moment(setTime)
			.add(moment.duration(halfDays * (60 * 60 * 24 * 1000), 'ms'))
			.toDate()
			.toString();
		return {
			start,
			end,
		};
	};

	const getStateUpdate = options => {
		if (options) {
			const updateContext = {};
			Object.assign(updateContext, {...options});

			//on change dayWidth calculate period
			if (options.dayWidth) {
				Object.assign(updateContext, {
					period: getPeriodLimitByDayWidth(options.dayWidth),
				});
			}

			//on change period calculate dayWidth
			if (options.period) {
				Object.assign(updateContext, {
					dayWidth: getDayWidthForPeriod(options.period, getXAxisWidth()),
				});
			}

			if (updateContext.dayWidth) {
				Object.assign(updateContext, {
					activeLevel: getActiveLevel(updateContext.dayWidth, levels).level,
				});
			}

			if (
				updateContext.dayWidth &&
				!options.centerTime &&
				!options.lockCenter
			) {
				Object.assign(updateContext, {
					centerTime: getTime(
						getXAxisWidth() / 2,
						updateContext.dayWidth,
						updateContext.period.start
					).toDate(),
				});
			}

			if (options.centerTime && !updateContext.period) {
				Object.assign(updateContext, {
					period: getPeriodLimitByTime(
						options.centerTime,
						getXAxisWidth(),
						periodLimit,
						updateContext.dayWidth
					),
				});
			}

			if (updateContext.centerTime) {
				const utcTime = new Date(updateContext.centerTime);
				utcTime.setTime(
					utcTime.getTime() - utcTime.getTimezoneOffset() * 60 * 1000
				);
				Object.assign(updateContext, {centerTimeUtc: utcTime.toUTCString()});
			}
			return updateContext;
		} else {
			return {};
		}
	};

	const [state, setState] = useState(
		getStateUpdate({
			periodLimit: periodLimit,
			period: period || periodLimit,
			centerTime: time,
		})
	);

	useEffect(() => {
		if (typeof onChange === 'function') {
			// fixme test if state is defined
			onChange(state);
		}
	}, []);

	useEffect(() => {
		// const {dayWidth, time, width, height, periodLimit} = this.props;
		const timeHasChanged =
			prevTime &&
			time &&
			prevTime.toString() !== time.toString() &&
			state.centerTime.toString() !== time.toString();

		//if parent component set dayWidth
		if (
			prevDayWidth !== dayWidth &&
			state.dayWidth !== dayWidth &&
			!timeHasChanged
		) {
			updateContext({dayWidth, centerTime: time});
		}

		//if parent component set time
		if (timeHasChanged) {
			const xAxis = getXAxisWidth();
			const period = getPeriodLimitByTime(
				time,
				xAxis,
				state.periodLimit,
				dayWidth
			);
			//zoom to dayWidth
			updateContext({period, centerTime: time});
		}

		if (prevPeriodLimit !== periodLimit) {
			updateContext({period: periodLimit, periodLimit});
		}

		//if parent component set time
		if (prevWidth !== widthSelf || prevHeight !== height) {
			//přepočítat day width aby bylo v periodě

			//todo take time from state
			// const period = this.getPeriodLimitByTime(time);
			const xAxis = getXAxisWidth();
			const minPeriodDayWidth = getDayWidthForPeriod(periodLimit, xAxis);
			let dayWidth = state.dayWidth;
			if (minPeriodDayWidth >= state.dayWidth) {
				dayWidth = minPeriodDayWidth;
			}
			const period = getPeriodLimitByTime(
				state.centerTime,
				xAxis,
				periodLimit,
				dayWidth
			);

			//zoom to dayWidth
			updateContext({period});
		}
	}, [time, dayWidth, periodLimit, widthSelf, height]);

	const getX = date => {
		date = moment(date);
		let diff = date.unix() - moment(state.period.start).unix();
		let diffDays = diff / (60 * 60 * 24);
		return diffDays * state.dayWidth;
	};

	const updateContext = options => {
		if (options && height && widthSelf) {
			const stateUpdate = getStateUpdate(options);
			// setState(stateUpdate, () => {
			// 	if (typeof this.props.onChange === 'function') {
			// 		this.props.onChange(this.state);
			// 	}
			// });
			setState({
				...state,
				...stateUpdate,
			});

			// FIXME test
			if (typeof onChange === 'function') {
				onChange({
					...state,
					...stateUpdate,
				});
			}
		}
	};

	const getContentHeight = () => {
		return (
			contentHeight ||
			(vertical ? DEFAULT_VERTICAL_HEIGHT : DEFAULT_HORIZONTAL_HEIGHT)
		);
	};

	// render() {
	// 	const {
	// 		levels,
	// 		periodLimit,
	// 		onHover,
	// 		onClick,
	// 		vertical,
	// 		children,
	// 		periodLimitOnCenter,
	// 		selectMode,
	// 	} = this.props;
	const {dayWidth: stateDayWidth, period: statePeriod, mouseX, moving} = state;

	const maxDayWidth = getMaxDayWidth();
	const activeDayWidth =
		stateDayWidth >= maxDayWidth ? maxDayWidth : stateDayWidth;
	const activeLevel = getActiveLevel(activeDayWidth, levels).level;
	const minDayWidth = getDayWidthForPeriod(periodLimit, getXAxisWidth());
	return (
		<div className="ptr-timeline" ref={ref} style={{width: widthSelf}}>
			<ContextProvider
				value={{
					updateContext,
					width: getXAxisWidth(),
					height: getContentHeight(),
					getX: getX,
					getTime: getTime,
					centerTime: state.centerTime,
					getActiveLevel: getActiveLevel,
					dayWidth: stateDayWidth,
					maxDayWidth,
					minDayWidth,
					periodLimit,
					period: statePeriod,
					mouseX,
					activeLevel,
					periodLimitVisible: true,
					onClick,
					onHover,
					vertical,
					periodLimitOnCenter,
					selectMode,
					moving,
				}}
			>
				<TimelineContent>{children}</TimelineContent>
			</ContextProvider>
		</div>
	);
};

Timeline.propTypes = {
	centerTime: PropTypes.object,
	children: PropTypes.node,
	contentHeight: PropTypes.number,
	dayWidth: PropTypes.number,
	height: PropTypes.number,
	levels: PropTypes.arrayOf(
		PropTypes.shape({
			end: PropTypes.number,
			level: PropTypes.string,
		})
	), //ordered levels by higher level.end
	onChange: PropTypes.func,
	onClick: PropTypes.func,
	onHover: PropTypes.func,
	period: PropTypes.shape({
		end: PropTypes.string,
		start: PropTypes.string,
	}),
	periodLimit: PropTypes.shape({
		end: PropTypes.string,
		start: PropTypes.string,
	}).isRequired,
	periodLimitOnCenter: PropTypes.bool,
	selectMode: PropTypes.bool, //whether change time while zoom
	time: PropTypes.object,
	vertical: PropTypes.bool,
	width: PropTypes.number,
	onResize: PropTypes.func,
};

// export default withResizeDetector(Timeline);
export default Timeline;
