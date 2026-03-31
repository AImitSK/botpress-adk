import { useState } from '@wordpress/element';
import { TextControl, Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';

export default function RssConfig( { config, onChange, sourceId } ) {
	const [ syncing, setSyncing ] = useState( false );
	const [ syncResult, setSyncResult ] = useState( null );

	const handleSync = async () => {
		if ( ! sourceId ) return;
		setSyncing( true );
		setSyncResult( null );
		try {
			const res = await apiFetch( {
				path: `/bpwc/v1/sources/${ sourceId }/sync`,
				method: 'POST',
			} );
			setSyncResult( res );
		} catch ( err ) {
			setSyncResult( { success: false, message: err.message } );
		}
		setSyncing( false );
	};

	return (
		<div className="bpwc-kb__config">
			<p className="bpwc-kb__config-desc">
				{ __( 'Enter an RSS or Atom feed URL to index the latest posts and news.', 'botpress-webchat' ) }
			</p>

			<TextControl
				label={ __( 'Feed URL', 'botpress-webchat' ) }
				value={ config.feed_url || '' }
				onChange={ ( v ) => onChange( { ...config, feed_url: v } ) }
				placeholder="https://example.com/feed/"
				type="url"
			/>

			{ sourceId > 0 && config.feed_url && (
				<div className="bpwc-kb__sync-section">
					<Button
						variant="secondary"
						onClick={ handleSync }
						isBusy={ syncing }
						disabled={ syncing }
					>
						{ __( 'Sync Now', 'botpress-webchat' ) }
					</Button>
					{ syncResult && (
						<span className={ `bpwc-kb__sync-result ${ syncResult.success ? 'is-success' : 'is-error' }` }>
							{ syncResult.message }
						</span>
					) }
				</div>
			) }
		</div>
	);
}
