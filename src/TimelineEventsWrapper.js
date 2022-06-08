import PropTypes from 'prop-types';
import {useEffect, useRef, useState, useContext} from 'react';
import moment from 'moment';
import {Context as TimeLineContext} from './context';

/**
 *
 * @param {Event} evt
 * @param {boolean} vertical
 */
const getPageXFromEvent = (evt, vertical = false, targetBoudingBox) => {
	let clientX;
	const touch =
		(evt.touches && evt.touches[0]) ||
		(evt.changedTouches && evt.changedTouches[0]);
	const scrollLeft = window.document.documentElement.scrollLeft;
	const scrollTop = window.document.documentElement.scrollTop;
	if (touch) {
		clientX = vertical ? touch.pageY - scrollTop : touch.pageX - scrollLeft;
	} else {
		clientX = vertical ? evt.pageY - scrollTop : evt.pageX - scrollLeft;
	}

	if (vertical) {
		clientX = clientX - targetBoudingBox.top; //y position within the element.
	} else {
		clientX = clientX - targetBoudingBox.left; //y position within the element.
	}

	return clientX;
};

/**
 *
 * @param {Event} evt
 * @param {boolean} vertical
 */
const getPageYFromEvent = (evt, vertical = false, targetBoudingBox) => {
	let clientY;
	const touch =
		(evt.touches && evt.touches[0]) ||
		(evt.changedTouches && evt.changedTouches[0]);
	const scrollLeft = window.document.documentElement.scrollLeft;
	const scrollTop = window.document.documentElement.scrollTop;
	if (touch) {
		clientY = vertical ? touch.pageX - scrollTop : touch.pageY - scrollLeft;
	} else {
		clientY = vertical ? evt.pageX - scrollTop : evt.pageY - scrollLeft;
	}

	if (vertical) {
		clientY = clientY - targetBoudingBox.left; //y position within the element.
	} else {
		clientY = clientY - targetBoudingBox.top; //y position within the element.
	}

	return clientY;
};

const calculateEventDistance = (point1, point2) => {
	return Math.hypot(
		point1.clientX - point2.clientX,
		point1.clientY - point2.clientY
	);
};

const getPoint = (index, cachedEvents, tpCache, targetTouches) => {
	const identifier = tpCache[index].identifier;
	let evIndex = null;
	for (let i = 0; i < targetTouches.length; i++) {
		const equals = targetTouches[i].identifier === identifier;
		if (equals) {
			evIndex = i;
		}
	}

	if (evIndex) {
		return targetTouches[evIndex];
	} else {
		return tpCache[index];
	}
};

const TimelineEventsWrapper = ({children}) => {
	const context = useContext(TimeLineContext);
	const node = useRef();

	const decelerating = useRef(false);
	const decVelX = useRef(0);

	// improvement everything to useRef?
	const [_drag, set_drag] = useState(null);
	const [_lastX, set_lastX] = useState(null);
	const [_mouseDownX, set_mouseDownX] = useState(null);
	const [_pointerLastX, set_pointerLastX] = useState(null);
	const [multiplier] = useState(5);
	const [friction] = useState(0.91); //default 0.92
	const [stopThreshold] = useState(0.3);
	const [trackingPoints, setTrackingPoints] = useState([]);
	// Global vars to cache event state
	const [tpCache, setTpCache] = useState([]);

	const clearTouchEventCache = () => {
		setTpCache([]);
	};

	const removeTouchEventByIdentifier = identifier => {
		setTpCache(
			tpCache.filter(ev => {
				return ev.identifier !== identifier;
			})
		);
	};

	const cacheEvents = evts => {
		const tmp = [];
		for (let i = 0; i < evts.length; i++) {
			tmp.push(evts[i]);
		}
		setTpCache([...tpCache, ...tmp]);
	};

	const resetMouseTouchProps = () => {
		set_drag(false);
		set_lastX(null);
		set_mouseDownX(null);
	};

	/**
	 * When the user drags the timeline, if it is still permitted, it updates the available and visible periodLimit and
	 * therefore redraws the information.
	 * @param dragInfo {Object}
	 * @param dragInfo.distance {Number} Amount of pixels to move in given direction
	 * @param dragInfo.direction {String} Either past or future. Based on this.
	 * @param dragInfo.clientX {Number} Mouse position
	 */
	const onDrag = dragInfo => {
		const {
			dayWidth,
			periodLimit,
			period,
			width,
			updateContext,
			periodLimitOnCenter,
		} = context;
		const allDays = width / dayWidth;
		const periodStart = moment(periodLimit.start);
		const periodEnd = moment(periodLimit.end);
		let periodLimitStart = moment(period.start);
		let periodLimitEnd = moment(period.end);

		//center time
		const halfDays = allDays / 2;
		let periodLimitCenter = moment(period.end).subtract(
			halfDays * (60 * 60 * 24 * 1000),
			'ms'
		);
		// Either add  to start and end.
		let daysChange = Math.abs(dragInfo.distance) / dayWidth;
		if (dragInfo.direction === 'past') {
			periodLimitStart.subtract(daysChange * (60 * 60 * 24 * 1000), 'ms');
			periodLimitEnd.subtract(daysChange * (60 * 60 * 24 * 1000), 'ms');
			if (periodLimitOnCenter) {
				periodLimitCenter.subtract(daysChange * (60 * 60 * 24 * 1000), 'ms');

				if (periodLimitCenter.isBefore(periodStart)) {
					//use last periodLimit limit
					periodLimitStart = moment(period.start);
					periodLimitEnd = moment(period.end);
				}
			} else {
				if (periodLimitStart.isBefore(periodStart)) {
					//use last periodLimit limit
					periodLimitStart = moment(period.start);
					periodLimitEnd = moment(period.end);
				}
			}
		} else {
			periodLimitStart.add(daysChange * (60 * 60 * 24 * 1000), 'ms');
			periodLimitEnd.add(daysChange * (60 * 60 * 24 * 1000), 'ms');
			periodLimitCenter.add(daysChange * (60 * 60 * 24 * 1000), 'ms');

			if (periodLimitOnCenter) {
				if (periodLimitCenter.isAfter(periodEnd)) {
					//use last periodLimit limit
					periodLimitStart = moment(period.start);
					periodLimitEnd = moment(period.end);
				}
			} else {
				if (periodLimitEnd.isAfter(periodEnd)) {
					//use last periodLimit limit
					periodLimitStart = moment(period.start);
					periodLimitEnd = moment(period.end);
				}
			}
		}

		let widthOfTimeline = width;
		// If the result is smaller than width of the timeline
		let widthOfResult =
			(periodLimitEnd.diff(periodLimitStart, 'ms') / (60 * 60 * 24 * 1000)) *
			dayWidth;
		// Make sure that we stay within the limits.
		if (widthOfResult < widthOfTimeline) {
			let daysNeededToUpdate = (widthOfTimeline - widthOfResult) / dayWidth;
			if (dragInfo.direction === 'past') {
				periodLimitEnd.add(daysNeededToUpdate * (60 * 60 * 24 * 1000), 'ms');
			} else {
				periodLimitStart.subtract(
					daysNeededToUpdate * (60 * 60 * 24 * 1000),
					'ms'
				);
			}
		}

		updateContext({
			...(dragInfo.clientX ? {mouseX: dragInfo.clientX} : {}),
			period: {
				end: periodLimitEnd.toDate().toString(),
				start: periodLimitStart.toDate().toString(),
			},
		});
	};

	/**
	 * Records movement for the last 100ms
	 * @param {number} x
	 */
	const addTrackingPoint = x => {
		const time = Date.now();
		const tmpTrackingPoints = [...trackingPoints];
		while (tmpTrackingPoints.length > 0) {
			if (time - tmpTrackingPoints[0].time <= 100) {
				break;
			}
			tmpTrackingPoints.shift();
		}
		setTrackingPoints([...tmpTrackingPoints, {x, time}]);
	};

	const onPointerDown = clientX => {
		setMoving(true);
		set_drag(true);
		setTrackingPoints([]);
		set_lastX(clientX);
		set_pointerLastX(clientX);
		set_mouseDownX(clientX);
		addTrackingPoint(clientX);
	};

	/**
	 * Handles move events
	 * @param  {clientX} ev Normalized event
	 */
	const registerMovements = clientX => {
		set_lastX(clientX);
		if (_drag) {
			addTrackingPoint(clientX);
		}
		set_pointerLastX(clientX);
	};

	const onPointerMove = clientX => {
		const distance = clientX - _lastX;
		if (distance !== 0) {
			onDrag({
				distance: Math.abs(distance),
				direction: distance < 0 ? 'future' : 'past',
				clientX,
			});
			registerMovements(clientX);
		}
	};

	const setMoving = (moving = false) => {
		const {updateContext} = context;
		updateContext({
			moving: moving,
		});
	};

	const onClick = clientX => {
		const {onClick, getTime} = context;

		onClick({
			type: 'time',
			x: clientX,
			time: getTime(clientX),
		});
	};

	const clearScroll = () => {
		setMoving(false);
		decelerating.current = false;
	};

	/**
	 * Animates values slowing down
	 */
	const stepDecelAnim = () => {
		if (!decelerating.current) {
			return;
		}

		decVelX.current = decVelX.current * friction;

		if (Math.abs(decVelX.current) > stopThreshold) {
			onDrag({
				distance: Math.abs(decVelX.current),
				direction: decVelX.current < 0 ? 'future' : 'past',
			});

			requestAnimFrame(stepDecelAnimRef.current);
		} else {
			clearScroll();
		}
	};

	const stepDecelAnimRef = useRef(stepDecelAnim);

	//store animation callback to be able get actual context inside
	useEffect(() => {
		stepDecelAnimRef.current = stepDecelAnim;
	}, [context.period]);

	/**
	 * Initialize animation of values coming to a stop
	 */
	const startDecelAnim = () => {
		const firstPoint = trackingPoints[0];
		const lastPoint = trackingPoints[trackingPoints.length - 1];

		const xOffset = lastPoint.x - firstPoint.x;
		const timeOffset = lastPoint.time - firstPoint.time;

		const D = timeOffset / 15 / multiplier;

		decVelX.current = xOffset / D || 0; // prevent NaN

		//check difference start/stop
		if (Math.abs(decVelX.current) > 1) {
			decelerating.current = true;
			requestAnimFrame(() => stepDecelAnimRef.current());
		} else {
			clearScroll();
		}
	};

	/**
	 * Stops movement tracking, starts animation
	 */
	const stopTracking = () => {
		addTrackingPoint(_pointerLastX);

		startDecelAnim();
	};

	const onPointerUp = clientX => {
		const isClick = Math.abs(_mouseDownX - clientX) < 1;
		resetMouseTouchProps();
		if (isClick) {
			onClick(clientX);
		}

		stopTracking();
	};

	const zoom = (newDayWidth, x) => {
		const {
			mouseX,
			getTime,
			updateContext,
			periodLimit,
			period,
			periodLimitOnCenter,
			selectMode,
			maxDayWidth,
			minDayWidth,
			width,
		} = context;
		const zoomX = x || mouseX;
		const centerX = width / 2;
		const mouseTime = zoomX ? getTime(zoomX) : getTime(mouseX);
		const centerTime = getTime(centerX);
		const periodLimitStart = moment(period.start);
		const periodLimitEnd = moment(period.end);

		if (newDayWidth > maxDayWidth) {
			newDayWidth = maxDayWidth;
		}

		//don't allow zoom out outside initial zoom
		if (newDayWidth < minDayWidth) {
			newDayWidth = minDayWidth;
		}

		const allDays = width / newDayWidth;
		let start;
		let end;
		let beforeMouseDays;
		if (selectMode) {
			beforeMouseDays = zoomX / newDayWidth;
			start = moment(mouseTime).subtract(
				moment.duration(beforeMouseDays * (60 * 60 * 24 * 1000), 'ms')
			);
			end = moment(start).add(
				moment.duration(allDays * (60 * 60 * 24 * 1000), 'ms')
			);
		} else {
			beforeMouseDays = centerX / newDayWidth;
			start = moment(centerTime).subtract(
				moment.duration(beforeMouseDays * (60 * 60 * 24 * 1000), 'ms')
			);
			end = moment(start).add(
				moment.duration(allDays * (60 * 60 * 24 * 1000), 'ms')
			);
		}

		const center = moment(start).add(
			moment.duration((allDays / 2) * (60 * 60 * 24 * 1000), 'ms')
		);

		//Don't allow zoom center out of periodLimit
		if (periodLimitOnCenter) {
			if (center.isBefore(periodLimit.start)) {
				const diff = moment(periodLimit.start).diff(center, 'ms');
				start.add(diff, 'ms');
				end.add(diff, 'ms');
			}

			if (center.isAfter(periodLimit.end)) {
				const diff = moment(periodLimit.end).diff(center, 'ms');
				start.add(diff, 'ms');
				end.add(diff, 'ms');
			}
		} else {
			//Don`t allow show date out of periodLimit
			if (start.isBefore(periodLimit.start)) {
				const diff = moment(periodLimit.start).diff(periodLimitStart, 'ms');
				start.add(diff, 'ms');
				end.add(diff, 'ms');
			}

			if (end.isAfter(periodLimit.end)) {
				const diff = moment(periodLimit.end).diff(periodLimitEnd, 'ms');
				start.add(diff, 'ms');
				end.add(diff, 'ms');
			}
		}
		updateContext({
			period: {
				start: start.toDate().toString(),
				end: end.toDate().toString(),
			},
			//Its possible, that center for new limit is not same as current centerTime because rounding. New center time is usualy lower by one second.
			//this option lock modify select time on zoom when periodLimitOnCenter is set to true.
			lockCenter: periodLimitOnCenter,
		});
	};

	const onMouseUp = e => {
		const {vertical} = context;
		const clientX = getPageXFromEvent(
			e,
			vertical,
			node.current.getBoundingClientRect()
		);
		onPointerUp(clientX);
	};

	const onMouseLeave = () => {
		const {onHover, updateContext} = context;
		set_drag(false);
		set_lastX(null);
		set_mouseDownX(null);

		onHover(null);
		updateContext({
			mouseX: null,
			mouseTime: null,
		});
	};

	const onMouseDown = e => {
		const {vertical} = context;
		const clientX = getPageXFromEvent(
			e,
			vertical,
			node.current.getBoundingClientRect()
		);
		onPointerDown(clientX);
	};

	const onMouseMove = e => {
		const {vertical, getTime, updateContext, onHover, dayWidth} = context;
		const clientX = getPageXFromEvent(
			e,
			vertical,
			node.current.getBoundingClientRect()
		);
		const clientY = getPageYFromEvent(
			e,
			vertical,
			node.current.getBoundingClientRect()
		);
		onHover({
			x: e.pageX,
			y: e.pageY,
			clientX,
			clientY,
			time: getTime(clientX),
			dayWidth,
			vertical: vertical,
		});
		updateContext({
			mouseX: clientX,
			mouseTime: getTime(clientX).toDate(),
		});

		if (_drag) {
			onPointerMove(clientX);
			e.preventDefault();
		}
	};

	const end_handler = ev => {
		const {vertical} = context;

		// FIX comment ev.preventDefault(); for making touch "click" on overlay possible
		// ev.preventDefault();

		const clientX = getPageXFromEvent(
			ev,
			vertical,
			node.current.getBoundingClientRect()
		);

		//identify stop touch move by one touch
		if (ev.changedTouches.length === 1 && tpCache.length === 1) {
			onPointerUp(clientX);
		}

		//remove from cache by identifier
		for (let i = 0; i < ev.changedTouches.length; i++) {
			removeTouchEventByIdentifier(ev.changedTouches[i].identifier);
		}

		//FIX - sometime touchend or touchcancel is not called and touch stick in cache
		if (ev.touches.length === 0 && tpCache.length > 0) {
			clearTouchEventCache();
		}
	};

	const start_handler = ev => {
		const {vertical} = context;
		// If the user makes simultaneious touches, the browser will fire a
		// separate touchstart event for each touch point. Thus if there are
		// three simultaneous touches, the first touchstart event will have
		// targetTouches length of one, the second event will have a length
		// of two, and so on.

		// FIX comment ev.preventDefault(); for making touch "click" on overlay possible
		// ev.preventDefault();

		if (tpCache.length > 0) {
			for (let i = 0; i < ev.touches.length; i++) {
				removeTouchEventByIdentifier(ev.touches[i].identifier);
			}
		}
		// Cache the touch points for later processing of 2-touch pinch/zoom
		cacheEvents(ev.touches);

		//identify only one touch
		setTrackingPoints([]);
		set_pointerLastX(null);
		resetMouseTouchProps();
		if (tpCache.length === 1) {
			const clientX = getPageXFromEvent(
				ev,
				vertical,
				node.current.getBoundingClientRect()
			);
			onPointerDown(clientX);
		}
	};

	const onPinch = (scale, point) => {
		const {vertical, dayWidth} = context;
		let zoomX;
		if (vertical) {
			zoomX = point[1];
		} else {
			zoomX = point[0];
		}

		let change;
		if (scale === 1) {
			change = 1;
		} else if (scale > 1) {
			// zoom out
			change = 1 + scale / 10;
		} else {
			// zoom in
			change = 1 - scale / 10;
		}
		let newDayWidth = dayWidth * change;
		zoom(newDayWidth, zoomX);
	};

	// This is a very basic 2-touch move/pinch/zoom handler that does not include
	// error handling, only handles horizontal moves, etc.
	const handle_pinch_zoom = touches => {
		const cachedEvents = [];

		for (let i = 0; i < touches.length; i++) {
			const found = tpCache.findIndex(
				e => e.identifier === touches[i].identifier
			);
			if (found > -1) {
				cachedEvents[i] = found;
			}
		}

		const prevPoint1 = tpCache[0];
		const prevPoint2 = tpCache[1];
		const point1 = getPoint(0, cachedEvents, tpCache, touches);
		const point2 = getPoint(1, cachedEvents, tpCache, touches);
		const prevDist = calculateEventDistance(prevPoint1, prevPoint2);
		const dist = calculateEventDistance(point1, point2);

		clearTouchEventCache();

		// Cache the touch points for later processing of 2-touch pinch/zoom
		cacheEvents([point1, point2]);
		const targetBox = node.current.getBoundingClientRect();
		const centerPoint = [
			(point1.clientX + point2.clientX) / 2 - targetBox.left,
			(point1.clientY + point2.clientY) / 2 - targetBox.top,
		];
		onPinch(dist / prevDist, centerPoint);
	};

	const move_handler = ev => {
		const {vertical} = context;
		ev.preventDefault();
		//identify pinch/zoom touch
		if (tpCache.length === 2) {
			handle_pinch_zoom(ev.touches);
		}

		//identify touch by one touch
		if (tpCache.length === 1) {
			const clientX = getPageXFromEvent(
				ev,
				vertical,
				node.current.getBoundingClientRect()
			);
			onPointerMove(clientX);

			clearTouchEventCache();
			// Cache the touch points for later processing
			cacheEvents([ev.touches[0]]);
		}
	};

	/**
	 * Based on the amount of pixels the wheel moves update the size of the visible pixels.
	 * @param e {SyntheticEvent}
	 *
	 */
	const onWheel = e => {
		const {dayWidth} = context;
		e.preventDefault();
		let change;

		if (e.deltaY > 0) {
			// zoom out
			change = 1 - Math.abs(e.deltaY / (10 * 100));
		} else {
			// zoom in
			change = 1 + Math.abs(e.deltaY / (10 * 100));
		}

		let newDayWidth = dayWidth * change;
		zoom(newDayWidth);
	};

	const onWheelRef = useRef(onWheel);
	const end_handlerRfe = useRef(end_handler);
	const move_handlerRef = useRef(move_handler);
	const start_handlerRef = useRef(start_handler);
	useEffect(() => {
		onWheelRef.current = onWheel;
		end_handlerRfe.current = end_handler;
		move_handlerRef.current = move_handler;
		start_handlerRef.current = start_handler;
	});

	useEffect(() => {
		const start_handlerCb = e => start_handlerRef.current(e);
		node.current.addEventListener('touchstart', start_handlerCb);

		const move_handlerCb = e => move_handlerRef.current(e);
		node.current.addEventListener('touchmove', move_handlerCb);

		const end_handlerCb = e => end_handlerRfe.current(e);
		node.current.addEventListener('touchend', end_handlerCb);
		node.current.addEventListener('touchcancel', end_handlerCb);
		// fix bubling wheel event
		// https://github.com/facebook/react/issues/14856#issuecomment-586781399

		const onWheelCb = e => onWheelRef.current(e);
		node.current.addEventListener('wheel', onWheelCb, {
			passive: false,
			capture: true,
		});
		return () => {
			node?.current?.removeEventListener('touchstart', start_handlerCb);
			node?.current?.removeEventListener('touchmove', move_handlerCb);

			node?.current?.removeEventListener('touchend', end_handlerCb);
			node?.current?.removeEventListener('touchcancel', end_handlerCb);
			node?.current?.removeEventListener('wheel', onWheelCb);
		};
	}, []);

	return (
		<div
			className={'ptr-events-wrapper'}
			ref={node}
			onMouseLeave={onMouseLeave}
			onMouseDown={onMouseDown}
			onMouseUp={onMouseUp}
			onMouseMove={onMouseMove}
		>
			{children}
		</div>
	);
};

TimelineEventsWrapper.propTypes = {
	children: PropTypes.node,
};

/**
 * @see http://www.paulirish.com/2011/requestanimationframe-for-smart-animating/
 */
const requestAnimFrame = (function () {
	if (typeof window !== 'undefined') {
		return (
			window.requestAnimationFrame ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame ||
			function (callback) {
				window.setTimeout(callback, 1000 / 60);
			}
		);
	} else {
		return null;
	}
})();

export default TimelineEventsWrapper;
