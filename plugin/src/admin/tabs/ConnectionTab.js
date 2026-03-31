import { useState } from '@wordpress/element';
import { TextControl, Button, Notice } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

export default function ConnectionTab( { settings, onSave, saving } ) {
	const [ conn, setConn ] = useState( settings.connection );
	const [ regStatus, setRegStatus ] = useState( null );

	const update = ( key, value ) => {
		setConn( { ...conn, [ key ]: value } );
	};

	const handleSave = async () => {
		const result = await onSave( { connection: conn } );
		if ( result?.registration ) {
			setRegStatus( result.registration );
		}
	};

	return (
		<div className="bpwc-tab-content">
			{ regStatus && (
				<Notice
					status={ regStatus.success ? 'success' : 'error' }
					isDismissible={ true }
					onDismiss={ () => setRegStatus( null ) }
				>
					{ regStatus.message }
				</Notice>
			) }

			<div className="bpwc-field">
				<TextControl
					label={ __( 'Bot ID', 'botpress-webchat' ) }
					value={ conn.bot_id }
					onChange={ ( v ) => update( 'bot_id', v ) }
					help={ __( 'Your Botpress Bot ID. Pre-filled from developer config.', 'botpress-webchat' ) }
				/>
			</div>
			<div className="bpwc-field">
				<TextControl
					label={ __( 'Webchat ID', 'botpress-webchat' ) }
					value={ conn.webchat_id }
					onChange={ ( v ) => update( 'webchat_id', v ) }
					help={ __( 'The Webchat integration ID from Botpress.', 'botpress-webchat' ) }
				/>
			</div>
			<div className="bpwc-field">
				<TextControl
					label={ __( 'WordPress API URL', 'botpress-webchat' ) }
					value={ conn.wp_api_url }
					onChange={ ( v ) => update( 'wp_api_url', v ) }
					help={ __( 'Leave empty to auto-detect. Only set if your site uses a custom URL.', 'botpress-webchat' ) }
					placeholder={ window.location.origin + '/wp-json' }
				/>
			</div>

			<div className="bpwc-actions">
				<Button
					variant="primary"
					onClick={ handleSave }
					isBusy={ saving }
					disabled={ saving }
				>
					{ __( 'Save & Connect to Bot', 'botpress-webchat' ) }
				</Button>
				<p className="description" style={ { marginTop: '8px' } }>
					{ __( 'Saves settings and automatically registers this website with the Botpress bot.', 'botpress-webchat' ) }
				</p>
			</div>
		</div>
	);
}
