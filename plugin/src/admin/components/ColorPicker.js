import { useState } from '@wordpress/element';
import { ColorIndicator } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

export default function ColorPicker( { label, value, onChange } ) {
	const [ isOpen, setIsOpen ] = useState( false );

	return (
		<div className="bpwc-color-picker">
			<label className="bpwc-color-picker__label">{ label }</label>
			<div className="bpwc-color-picker__row">
				<input
					type="color"
					value={ value }
					onChange={ ( e ) => onChange( e.target.value ) }
					className="bpwc-color-picker__input"
				/>
				<input
					type="text"
					value={ value }
					onChange={ ( e ) => onChange( e.target.value ) }
					className="bpwc-color-picker__hex"
					maxLength={ 7 }
				/>
			</div>
		</div>
	);
}
