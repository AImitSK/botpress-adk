import { useState } from '@wordpress/element';
import { TextControl, Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';

export default function ConnectionTab( { settings, onSave, saving } ) {
	const [ conn, setConn ] = useState( settings.connection );
	const [ token, setToken ] = useState( '' );
	const [ generating, setGenerating ] = useState( false );

	const update = ( key, value ) => {
		setConn( { ...conn, [ key ]: value } );
	};

	const handleSave = () => {
		onSave( { connection: conn } );
	};

	const generateToken = async () => {
		setGenerating( true );
		try {
			const res = await apiFetch( {
				path: '/bpwc/v1/generate-token',
				method: 'POST',
			} );
			if ( res.success ) {
				setToken( res.token );
			}
		} catch ( err ) {
			// Error handled silently.
		}
		setGenerating( false );
	};

	return (
		<div className="bpwc-tab-content">
			<div className="bpwc-field">
				<TextControl
					label={ __( 'Bot ID', 'botpress-webchat' ) }
					value={ conn.bot_id }
					onChange={ ( v ) => update( 'bot_id', v ) }
					help={ __( 'Your Botpress Bot ID.', 'botpress-webchat' ) }
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
					help={ __( 'The public URL to this site\'s REST API (e.g. https://example.com/wp-json).', 'botpress-webchat' ) }
					placeholder={ window.location.origin + '/wp-json' }
				/>
			</div>

			<div className="bpwc-field">
				<TextControl
					label={ __( 'Botpress Personal Access Token', 'botpress-webchat' ) }
					value={ conn.botpress_pat }
					onChange={ ( v ) => update( 'botpress_pat', v ) }
					type="password"
					help={ __( 'PAT from Botpress Cloud — required for the Conversation Viewer.', 'botpress-webchat' ) }
				/>
			</div>

			<h3>{ __( 'API Token', 'botpress-webchat' ) }</h3>
			<p className="description">
				{ __( 'Generate a token for the Botpress Agent to authenticate with your WordPress REST API.', 'botpress-webchat' ) }
			</p>
			<Button
				variant="secondary"
				onClick={ generateToken }
				isBusy={ generating }
				disabled={ generating }
			>
				{ __( 'Generate New Token', 'botpress-webchat' ) }
			</Button>
			{ token && (
				<div>
					<div className="bpwc-token-display">{ token }</div>
					<p className="description">
						{ __( 'Copy this token now. It will not be shown again. Enter it as wpApiToken in your Botpress Agent configuration.', 'botpress-webchat' ) }
					</p>
				</div>
			) }

			<div className="bpwc-actions">
				<Button
					variant="primary"
					onClick={ handleSave }
					isBusy={ saving }
					disabled={ saving }
				>
					{ __( 'Save Connection Settings', 'botpress-webchat' ) }
				</Button>
			</div>
		</div>
	);
}
