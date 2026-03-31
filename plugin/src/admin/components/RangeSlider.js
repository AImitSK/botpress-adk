export default function RangeSlider( { label, description, value, onChange, min = 0, max = 1, step = 0.1, leftLabel, rightLabel } ) {
	return (
		<div className="bpwc-range-slider">
			<label className="bpwc-range-slider__label">{ label }</label>
			{ description && <p className="bpwc-range-slider__desc">{ description }</p> }
			<div className="bpwc-range-slider__row">
				{ leftLabel && <span className="bpwc-range-slider__bound">{ leftLabel }</span> }
				<input
					type="range"
					min={ min }
					max={ max }
					step={ step }
					value={ value }
					onChange={ ( e ) => onChange( parseFloat( e.target.value ) ) }
					className="bpwc-range-slider__input"
				/>
				{ rightLabel && <span className="bpwc-range-slider__bound">{ rightLabel }</span> }
			</div>
		</div>
	);
}
