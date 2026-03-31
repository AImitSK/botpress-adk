import { SelectControl, TextareaControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import ColorPicker from '../components/ColorPicker';
import CardSelect from '../components/CardSelect';
import RangeSlider from '../components/RangeSlider';

const FONTS = [
	{ label: 'Inter', value: 'inter' },
	{ label: 'Roboto', value: 'roboto' },
	{ label: 'Open Sans', value: 'open sans' },
	{ label: 'Lato', value: 'lato' },
	{ label: 'Poppins', value: 'poppins' },
	{ label: 'Montserrat', value: 'montserrat' },
	{ label: 'Source Sans Pro', value: 'source sans pro' },
	{ label: 'Nunito', value: 'nunito' },
];

export default function AppearanceSection( { appearance, onChange } ) {
	const update = ( key, value ) => {
		onChange( { ...appearance, [ key ]: value } );
	};

	return (
		<div className="bpwc-section">
			<h2>{ __( 'Bot Appearance', 'botpress-webchat' ) }</h2>

			<ColorPicker
				label={ __( 'Primary Color', 'botpress-webchat' ) }
				value={ appearance.primary_color }
				onChange={ ( v ) => update( 'primary_color', v ) }
			/>

			<div className="bpwc-field">
				<SelectControl
					label={ __( 'Font', 'botpress-webchat' ) }
					help={ __( 'Select the primary font family for your interface.', 'botpress-webchat' ) }
					value={ appearance.font_family }
					options={ FONTS }
					onChange={ ( v ) => update( 'font_family', v ) }
				/>
			</div>

			<CardSelect
				label={ __( 'Theme Mode', 'botpress-webchat' ) }
				description={ __( 'Choose between light and dark appearance modes.', 'botpress-webchat' ) }
				options={ [
					{
						value: 'light',
						label: __( 'Light', 'botpress-webchat' ),
						preview: (
							<div className="bpwc-theme-preview bpwc-theme-preview--light">
								<div className="bpwc-theme-preview__bar" />
								<div className="bpwc-theme-preview__toggle" />
							</div>
						),
					},
					{
						value: 'dark',
						label: __( 'Dark', 'botpress-webchat' ),
						preview: (
							<div className="bpwc-theme-preview bpwc-theme-preview--dark">
								<div className="bpwc-theme-preview__bar" />
								<div className="bpwc-theme-preview__toggle" />
							</div>
						),
					},
				] }
				value={ appearance.theme_mode }
				onChange={ ( v ) => update( 'theme_mode', v ) }
			/>

			<CardSelect
				label={ __( 'Header Style', 'botpress-webchat' ) }
				description={ __( 'Choose the chat header appearance and styling.', 'botpress-webchat' ) }
				options={ [
					{
						value: 'glass',
						label: __( 'Glass', 'botpress-webchat' ),
						preview: (
							<div className="bpwc-header-preview bpwc-header-preview--glass">
								<span className="bpwc-header-preview__dot" />
								<span>Bot</span>
							</div>
						),
					},
					{
						value: 'solid',
						label: __( 'Solid', 'botpress-webchat' ),
						preview: (
							<div className="bpwc-header-preview bpwc-header-preview--solid">
								<span className="bpwc-header-preview__dot" />
								<span>Bot</span>
							</div>
						),
					},
				] }
				value={ appearance.header_variant }
				onChange={ ( v ) => update( 'header_variant', v ) }
			/>

			<CardSelect
				label={ __( 'Message Styling', 'botpress-webchat' ) }
				description={ __( 'Customize the appearance of chat messages.', 'botpress-webchat' ) }
				options={ [
					{
						value: 'soft',
						label: __( 'Soft', 'botpress-webchat' ),
						preview: (
							<div className="bpwc-msg-preview">
								<div className="bpwc-msg-preview__bubble bpwc-msg-preview__bubble--soft-in">Hi</div>
								<div className="bpwc-msg-preview__bubble bpwc-msg-preview__bubble--soft-out">Hey</div>
							</div>
						),
					},
					{
						value: 'solid',
						label: __( 'Solid', 'botpress-webchat' ),
						preview: (
							<div className="bpwc-msg-preview">
								<div className="bpwc-msg-preview__bubble bpwc-msg-preview__bubble--solid-in">Hi</div>
								<div className="bpwc-msg-preview__bubble bpwc-msg-preview__bubble--solid-out">Hey</div>
							</div>
						),
					},
				] }
				value={ appearance.message_variant }
				onChange={ ( v ) => update( 'message_variant', v ) }
			/>

			<RangeSlider
				label={ __( 'Corner Radius', 'botpress-webchat' ) }
				description={ __( 'Adjust the roundness of interface elements and components.', 'botpress-webchat' ) }
				value={ appearance.corner_radius }
				onChange={ ( v ) => update( 'corner_radius', v ) }
				min={ 0 }
				max={ 1 }
				step={ 0.05 }
				leftLabel={ __( 'Sharp', 'botpress-webchat' ) }
				rightLabel={ __( 'Round', 'botpress-webchat' ) }
			/>

			<div className="bpwc-field">
				<TextareaControl
					label={ __( 'Custom CSS', 'botpress-webchat' ) }
					help={ __( 'Additional CSS styles for the webchat widget.', 'botpress-webchat' ) }
					value={ appearance.custom_css }
					onChange={ ( v ) => update( 'custom_css', v ) }
					rows={ 6 }
				/>
			</div>
		</div>
	);
}
