import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

export default function MediaPicker( { label, help, value, onChange } ) {
	const openMedia = () => {
		const frame = wp.media( {
			title: label,
			multiple: false,
			library: { type: 'image' },
			button: { text: __( 'Select', 'botpress-webchat' ) },
		} );

		frame.on( 'select', () => {
			const attachment = frame.state().get( 'selection' ).first().toJSON();
			onChange( attachment.url );
		} );

		frame.open();
	};

	return (
		<div className="bpwc-media-picker">
			<label className="bpwc-media-picker__label">{ label }</label>
			{ help && <p className="bpwc-media-picker__help">{ help }</p> }
			<div className="bpwc-media-picker__row">
				{ value ? (
					<div className="bpwc-media-picker__preview">
						<img src={ value } alt="" />
						<Button
							variant="link"
							isDestructive
							onClick={ () => onChange( '' ) }
							className="bpwc-media-picker__remove"
						>
							{ __( 'Remove', 'botpress-webchat' ) }
						</Button>
					</div>
				) : (
					<Button variant="secondary" onClick={ openMedia }>
						{ __( 'Select Image', 'botpress-webchat' ) }
					</Button>
				) }
			</div>
		</div>
	);
}
