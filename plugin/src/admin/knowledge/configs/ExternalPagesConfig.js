import { useState } from '@wordpress/element';
import { TextControl, Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';

export default function ExternalPagesConfig( { config, onChange, sourceId } ) {
	const urls = config.urls || [];
	const [ newUrl, setNewUrl ] = useState( '' );
	const [ syncing, setSyncing ] = useState( false );
	const [ syncResult, setSyncResult ] = useState( null );

	const addUrl = () => {
		if ( ! newUrl.trim() ) return;
		let url = newUrl.trim();
		if ( ! url.startsWith( 'http' ) ) {
			url = 'https://' + url;
		}
		onChange( { ...config, urls: [ ...urls, url ] } );
		setNewUrl( '' );
	};

	const removeUrl = ( idx ) => {
		onChange( { ...config, urls: urls.filter( ( _, i ) => i !== idx ) } );
	};

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
				{ __( 'Add external URLs to fetch and index. Content will be scraped and cached.', 'botpress-webchat' ) }
			</p>

			<div className="bpwc-kb__url-input-row">
				<TextControl
					placeholder="https://example.com/page"
					value={ newUrl }
					onChange={ setNewUrl }
					onKeyDown={ ( e ) => { if ( e.key === 'Enter' ) addUrl(); } }
				/>
				<Button variant="secondary" onClick={ addUrl } disabled={ ! newUrl.trim() }>
					{ __( 'Add', 'botpress-webchat' ) }
				</Button>
			</div>

			{ urls.length > 0 && (
				<div className="bpwc-kb__url-list">
					{ urls.map( ( url, idx ) => (
						<div key={ idx } className="bpwc-kb__url-item">
							<span className="bpwc-kb__url-text">{ url }</span>
							<button className="bpwc-kb__url-remove" onClick={ () => removeUrl( idx ) }>&times;</button>
						</div>
					) ) }
				</div>
			) }

			{ sourceId > 0 && urls.length > 0 && (
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
