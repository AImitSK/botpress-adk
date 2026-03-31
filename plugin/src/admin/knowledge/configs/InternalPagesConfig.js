import { useState, useEffect } from '@wordpress/element';
import { Spinner, CheckboxControl, TextControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';

export default function InternalPagesConfig( { config, onChange } ) {
	const [ pages, setPages ] = useState( [] );
	const [ loading, setLoading ] = useState( true );
	const [ search, setSearch ] = useState( '' );

	const selectedIds = config.post_ids || [];

	useEffect( () => {
		apiFetch( { path: '/wp/v2/pages?per_page=100&status=publish' } ).then( ( data ) => {
			setPages( data.map( ( p ) => ( { id: p.id, title: p.title.rendered, url: p.link } ) ) );
			setLoading( false );
		} );
	}, [] );

	const togglePage = ( id ) => {
		const newIds = selectedIds.includes( id )
			? selectedIds.filter( ( i ) => i !== id )
			: [ ...selectedIds, id ];
		onChange( { ...config, post_ids: newIds } );
	};

	const selectAll = () => {
		onChange( { ...config, post_ids: pages.map( ( p ) => p.id ) } );
	};

	const deselectAll = () => {
		onChange( { ...config, post_ids: [] } );
	};

	const filtered = search
		? pages.filter( ( p ) => p.title.toLowerCase().includes( search.toLowerCase() ) )
		: pages;

	if ( loading ) {
		return <Spinner />;
	}

	return (
		<div className="bpwc-kb__config">
			<p className="bpwc-kb__config-desc">
				{ __( 'Select which pages the bot should know about. Content is read directly from the database — no scraping needed.', 'botpress-webchat' ) }
			</p>

			<div className="bpwc-kb__pages-toolbar">
				<TextControl
					placeholder={ __( 'Search pages...', 'botpress-webchat' ) }
					value={ search }
					onChange={ setSearch }
					className="bpwc-kb__pages-search"
				/>
				<span className="bpwc-kb__pages-count">
					{ selectedIds.length } / { pages.length } { __( 'selected', 'botpress-webchat' ) }
				</span>
				<button type="button" className="bpwc-kb__pages-link" onClick={ selectAll }>
					{ __( 'All', 'botpress-webchat' ) }
				</button>
				<button type="button" className="bpwc-kb__pages-link" onClick={ deselectAll }>
					{ __( 'None', 'botpress-webchat' ) }
				</button>
			</div>

			<div className="bpwc-kb__pages-list">
				{ filtered.map( ( page ) => (
					<label key={ page.id } className="bpwc-kb__pages-item">
						<CheckboxControl
							checked={ selectedIds.includes( page.id ) }
							onChange={ () => togglePage( page.id ) }
							__nextHasNoMarginBottom
						/>
						<span className="bpwc-kb__pages-title">{ page.title || __( '(no title)', 'botpress-webchat' ) }</span>
					</label>
				) ) }
				{ filtered.length === 0 && (
					<p className="bpwc-kb__pages-empty">{ __( 'No pages found.', 'botpress-webchat' ) }</p>
				) }
			</div>
		</div>
	);
}
