import { useState, useEffect } from '@wordpress/element';
import { Button, Spinner, TextControl, SelectControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import ExportButton from '../components/ExportButton';

export default function ConversationsPage( { onSelect } ) {
	const [ conversations, setConversations ] = useState( [] );
	const [ loading, setLoading ] = useState( true );
	const [ nextToken, setNextToken ] = useState( '' );
	const [ search, setSearch ] = useState( '' );
	const [ limit, setLimit ] = useState( 25 );
	const [ error, setError ] = useState( '' );

	const fetchConversations = async ( token = '' ) => {
		setLoading( true );
		setError( '' );
		try {
			const params = new URLSearchParams( { limit: String( limit ) } );
			if ( token ) params.set( 'next_token', token );
			const res = await apiFetch( { path: `/bpwc/v1/conversations?${ params.toString() }` } );
			if ( res.success ) {
				setConversations( res.data.conversations || [] );
				setNextToken( res.data.meta?.nextToken || '' );
			} else {
				setError( res.message || __( 'Unknown error.', 'botpress-webchat' ) );
			}
		} catch ( err ) {
			setError( err.message || __( 'Failed to load conversations.', 'botpress-webchat' ) );
		}
		setLoading( false );
	};

	useEffect( () => { fetchConversations(); }, [ limit ] );

	const filtered = search
		? conversations.filter( ( c ) => {
				const str = JSON.stringify( c ).toLowerCase();
				return str.includes( search.toLowerCase() );
		  } )
		: conversations;

	return (
		<div className="bpwc-convos">
			<div className="bpwc-convos__header">
				<div>
					<h2>{ __( 'Conversations', 'botpress-webchat' ) }</h2>
					<p className="bpwc-convos__subtitle">
						{ __( 'View and analyze chat conversations from your website visitors.', 'botpress-webchat' ) }
					</p>
				</div>
				<ExportButton />
			</div>

			<div className="bpwc-convos__filters">
				<TextControl
					placeholder={ __( 'Search conversations...', 'botpress-webchat' ) }
					value={ search }
					onChange={ setSearch }
					className="bpwc-convos__filters-search"
				/>
				<SelectControl
					value={ String( limit ) }
					options={ [
						{ label: '10', value: '10' },
						{ label: '25', value: '25' },
						{ label: '50', value: '50' },
					] }
					onChange={ ( v ) => setLimit( parseInt( v, 10 ) ) }
					__nextHasNoMarginBottom
				/>
			</div>

			{ error && (
				<div className="bpwc-notice bpwc-notice--error">
					{ error }
				</div>
			) }

			{ loading ? (
				<div style={ { display: 'flex', justifyContent: 'center', padding: '60px' } }>
					<Spinner />
				</div>
			) : filtered.length === 0 ? (
				<div className="bpwc-empty">
					<div className="bpwc-empty__icon">💬</div>
					<h3>{ __( 'No conversations yet', 'botpress-webchat' ) }</h3>
					<p>{ __( 'Conversations will appear here once visitors start chatting with your bot.', 'botpress-webchat' ) }</p>
				</div>
			) : (
				<div className="bpwc-convos__list">
					{ filtered.map( ( convo ) => (
						<div
							key={ convo.id }
							className="bpwc-convos__item"
							onClick={ () => onSelect( convo.id ) }
						>
							<div className="bpwc-convos__item-icon">
								<span className="dashicons dashicons-format-chat" />
							</div>
							<div className="bpwc-convos__item-body">
								<div className="bpwc-convos__item-date">
									{ convo.createdAt ? new Date( convo.createdAt ).toLocaleString() : '—' }
								</div>
								<div className="bpwc-convos__item-meta">
									<span>{ convo.channel || convo.integration || 'webchat' }</span>
									<span className="bpwc-convos__item-id">{ convo.id?.substring( 0, 20 ) }...</span>
								</div>
							</div>
							<span className="bpwc-convos__item-arrow">›</span>
						</div>
					) ) }
				</div>
			) }

			{ nextToken && ! loading && (
				<div className="bpwc-convos__pagination">
					<Button variant="secondary" onClick={ () => fetchConversations( nextToken ) }>
						{ __( 'Load more', 'botpress-webchat' ) }
					</Button>
				</div>
			) }
		</div>
	);
}
