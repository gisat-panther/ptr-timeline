import {useEffect, useRef, useState} from 'react';
import PropTypes from 'prop-types';

const TextLabel = ({label, className = '', x, height, vertical = false}) => {
	const node = useRef();
	const [elSize, setElSize] = useState({elHeight: 0, elWidth: 0});

	useEffect(() => {
		const elHeight = node.current.getBoundingClientRect().height;
		const elWidth = node.current.getBoundingClientRect().width;
		setElSize({elHeight, elWidth});
	}, []);

	const {elHeight, elWidth} = elSize;

	const xTransform = vertical ? -height + 3 : x + 3;
	const yTransform = vertical ? x + elHeight + 3 : height - 2;
	const transform = vertical ? `scale(-1,1)` : '';
	// const xTransform = vertical ? x + elHeight + 3 : x + 3;
	// const transform = vertical ? `rotate(270, ${xTransform}, ${height})` : ''
	return (
		<g>
			<rect
				transform={transform}
				x={xTransform}
				y={yTransform - elHeight + 3}
				width={elWidth}
				height={elHeight}
				style={{stroke: 'none'}}
			></rect>
			<text
				ref={node}
				transform={transform}
				x={xTransform}
				y={yTransform}
				className={className}
			>
				{label}
			</text>
		</g>
	);
};

TextLabel.propTypes = {
	label: PropTypes.string.isRequired,
	className: PropTypes.string,
	x: PropTypes.number.isRequired,
	height: PropTypes.number.isRequired,
	vertical: PropTypes.bool,
};

export default TextLabel;
