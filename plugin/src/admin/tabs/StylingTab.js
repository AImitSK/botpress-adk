import { useState } from '@wordpress/element';
import { TextControl, SelectControl, TextareaControl, Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

export default function StylingTab( { settings, onSave, saving } ) {
	const [ styling, setStyling ] = useState( settings.styling );

	const update = ( key, value ) => {
		setStyling( { ...styling, [ key ]: value } );
	};

	const handleSave = () => {
		onSave( { styling } );
	};

	return (
		<div className="bpwc-tab-content">
			<div className="bpwc-field">
				<TextControl
					label={ __( 'Bot Name', 'botpress-webchat' ) }
					value={ styling.bot_name }
					onChange={ ( v ) => update( 'bot_name', v ) }
				/>
			</div>
			<div className="bpwc-field">
				<TextControl
					label={ __( 'Bot Avatar URL', 'botpress-webchat' ) }
					value={ styling.bot_avatar_url }
					onChange={ ( v ) => update( 'bot_avatar_url', v ) }
				/>
			</div>
			<div className="bpwc-field">
				<TextControl
					label={ __( 'Greeting Message', 'botpress-webchat' ) }
					value={ styling.greeting_message }
					onChange={ ( v ) => update( 'greeting_message', v ) }
				/>
			</div>
			<div className="bpwc-field">
				<TextControl
					label={ __( 'Primary Color', 'botpress-webchat' ) }
					value={ styling.primary_color }
					onChange={ ( v ) => update( 'primary_color', v ) }
					type="text"
					help={ __( 'Hex color code, e.g. #0066FF', 'botpress-webchat' ) }
				/>
			</div>
			<div className="bpwc-field">
				<TextControl
					label={ __( 'Background Color', 'botpress-webchat' ) }
					value={ styling.background_color }
					onChange={ ( v ) => update( 'background_color', v ) }
					type="text"
				/>
			</div>
			<div className="bpwc-field">
				<TextControl
					label={ __( 'Font Family', 'botpress-webchat' ) }
					value={ styling.font_family }
					onChange={ ( v ) => update( 'font_family', v ) }
					help={ __( 'CSS font-family value. Use "inherit" for the theme font.', 'botpress-webchat' ) }
				/>
			</div>
			<div className="bpwc-field">
				<SelectControl
					label={ __( 'Position', 'botpress-webchat' ) }
					value={ styling.position }
					options={ [
						{ label: __( 'Right', 'botpress-webchat' ), value: 'right' },
						{ label: __( 'Left', 'botpress-webchat' ), value: 'left' },
					] }
					onChange={ ( v ) => update( 'position', v ) }
				/>
			</div>
			<div className="bpwc-field">
				<TextControl
					label={ __( 'Z-Index', 'botpress-webchat' ) }
					value={ String( styling.z_index ) }
					onChange={ ( v ) => update( 'z_index', parseInt( v, 10 ) || 9999 ) }
					type="number"
				/>
			</div>
			<div className="bpwc-field">
				<TextareaControl
					label={ __( 'Custom CSS', 'botpress-webchat' ) }
					value={ styling.custom_css }
					onChange={ ( v ) => update( 'custom_css', v ) }
					rows={ 6 }
					help={ __( 'Additional CSS to style the webchat widget.', 'botpress-webchat' ) }
				/>
			</div>

			<div className="bpwc-actions">
				<Button
					variant="primary"
					onClick={ handleSave }
					isBusy={ saving }
					disabled={ saving }
				>
					{ __( 'Save Styling', 'botpress-webchat' ) }
				</Button>
			</div>
		</div>
	);
}
