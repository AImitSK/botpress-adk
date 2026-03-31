import { useState, useEffect } from '@wordpress/element';
import { Button, Notice } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

export default function ConnectionTab( { settings, onSave, saving } ) {
	const conn = settings.connection;
	const hasBot = !! conn.bot_id && !! conn.webchat_id;
	const [ regStatus, setRegStatus ] = useState( null );

	const handleConnect = async () => {
		const result = await onSave( { connection: conn } );
		if ( result?.registration ) {
			setRegStatus( result.registration );
		}
	};

	return (
		<div className="bpwc-tab-content">
			<h3>{ __( 'Bot Connection', 'botpress-webchat' ) }</h3>

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
					<table className="form-table">
						<tbody>
							<tr>
								<th>{ __( 'Status', 'botpress-webchat' ) }</th>
								<td><span className="bpwc-status bpwc-status--ok">{ __( 'Configured', 'botpress-webchat' ) }</span></td>
							</tr>
							<tr>
								<th>{ __( 'Bot ID', 'botpress-webchat' ) }</th>
								<td><code>{ conn.bot_id.substring( 0, 16 ) }...</code></td>
							</tr>
							<tr>
								<th>{ __( 'Webchat ID', 'botpress-webchat' ) }</th>
								<td><code>{ conn.webchat_id }</code></td>
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
					<p>
						<strong>{ __( 'Bot not configured.', 'botpress-webchat' ) }</strong>
					</p>
					<p>
						{ __( 'Please upload the developer-config.php file you received from your developer to the plugin folder (wp-content/plugins/botpress-webchat/).', 'botpress-webchat' ) }
					</p>
				</Notice>
			) }
		</div>
	);
}
