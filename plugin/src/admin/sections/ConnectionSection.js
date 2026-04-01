import { useState } from '@wordpress/element';
import { Button, Notice } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

export default function ConnectionSection( { settings, onSave, saving, onChange } ) {
	const conn = settings.connection;
	const general = settings.general;
	const hasBot = !! conn.bot_id && !! conn.webchat_id;
	const isEnabled = !! general?.enabled;
	const [ regStatus, setRegStatus ] = useState( null );

	const toggleEnabled = () => {
		const updated = { ...general, enabled: ! isEnabled };
		onChange( { ...settings, general: updated } );
		onSave( { general: updated } );
	};

	const handleConnect = async () => {
		const result = await onSave( { connection: conn } );
		if ( result?.registration ) {
			setRegStatus( result.registration );
		}
	};

	return (
		<div className="bpwc-section">
			<h2>{ __( 'Bot Connection', 'botpress-webchat' ) }</h2>

			{ regStatus && (
				<Notice
					status={ regStatus.success ? 'success' : 'error' }
					isDismissible={ true }
					onDismiss={ () => setRegStatus( null ) }
				>
					{ regStatus.message }
				</Notice>
			) }

			{ hasBot ? (
				<div>
					<div className="bpwc-feature-card" style={ { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' } }>
						<div>
							<strong>{ __( 'Bot active', 'botpress-webchat' ) }</strong>
							<p className="description" style={ { margin: '4px 0 0' } }>
								{ isEnabled
									? __( 'The chatbot is visible to visitors.', 'botpress-webchat' )
									: __( 'The chatbot is hidden from visitors.', 'botpress-webchat' )
								}
							</p>
						</div>
						<button
							className={ `bpwc-toggle ${ isEnabled ? 'is-active' : '' }` }
							onClick={ toggleEnabled }
							type="button"
						>
							<span className="bpwc-toggle__knob" />
						</button>
					</div>

					<table className="form-table bpwc-connection-table">
						<tbody>
							<tr>
								<th>{ __( 'Status', 'botpress-webchat' ) }</th>
								<td><span className={ `bpwc-status ${ isEnabled ? 'bpwc-status--ok' : 'bpwc-status--off' }` }>{ isEnabled ? __( 'Active', 'botpress-webchat' ) : __( 'Paused', 'botpress-webchat' ) }</span></td>
							</tr>
							<tr>
								<th>{ __( 'Bot ID', 'botpress-webchat' ) }</th>
								<td><code>{ conn.bot_id.substring( 0, 16 ) }...</code></td>
							</tr>
							<tr>
								<th>{ __( 'Webchat ID', 'botpress-webchat' ) }</th>
								<td><code>{ conn.webchat_id.substring( 0, 16 ) }{ conn.webchat_id.length > 16 ? '...' : '' }</code></td>
							</tr>
						</tbody>
					</table>

					<div className="bpwc-actions">
						<Button
							variant="primary"
							onClick={ handleConnect }
							isBusy={ saving }
							disabled={ saving }
						>
							{ __( 'Reconnect to Bot', 'botpress-webchat' ) }
						</Button>
						<p className="description" style={ { marginTop: '8px' } }>
							{ __( 'Registers this website with the bot. Use after changing your site URL.', 'botpress-webchat' ) }
						</p>
					</div>
				</div>
			) : (
				<Notice status="warning" isDismissible={ false }>
					<p><strong>{ __( 'Bot not configured.', 'botpress-webchat' ) }</strong></p>
					<p>{ __( 'Please upload the developer-config.php file to the plugin folder.', 'botpress-webchat' ) }</p>
				</Notice>
			) }
		</div>
	);
}
