import { useState, useEffect } from '@wordpress/element';
import { Button, Spinner } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import ConversationFilters from '../components/ConversationFilters';
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
			if ( token ) {
				params.set( 'next_token', token );
			}
			const res = await apiFetch( {
				path: `/bpwc/v1/conversations?${ params.toString() }`,
			} );
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

	useEffect( () => {
		fetchConversations();
	}, [ limit ] );

	const filtered = search
		? conversations.filter( ( c ) => {
				const id = c.id || '';
				const tags = JSON.stringify( c.tags || {} );
				return (
					id.toLowerCase().includes( search.toLowerCase() ) ||
					tags.toLowerCase().includes( search.toLowerCase() )
				);
		  } )
		: conversations;

	return (
		<div className="bpwc-conversations">
			<div className="bpwc-conversations__header">
				<h2>{ __( 'Conversations', 'botpress-webchat' ) }</h2>
				<ExportButton />
			</div>

			<ConversationFilters
				search={ search }
				onSearchChange={ setSearch }
				limit={ limit }
				onLimitChange={ setLimit }
			/>

			{ error && <div className="notice notice-error"><p>{ error }</p></div> }

			{ loading ? (
				<Spinner />
			) : filtered.length === 0 ? (
				<p>{ __( 'No conversations found.', 'botpress-webchat' ) }</p>
			) : (
				<table className="wp-list-table widefat fixed striped">
					<thead>
						<tr>
							<th>{ __( 'Date', 'botpress-webchat' ) }</th>
							<th>{ __( 'Conversation ID', 'botpress-webchat' ) }</th>
							<th>{ __( 'Channel', 'botpress-webchat' ) }</th>
							<th>{ __( 'Actions', 'botpress-webchat' ) }</th>
						</tr>
					</thead>
					<tbody>
						{ filtered.map( ( convo ) => (
							<tr key={ convo.id }>
								<td>
									{ convo.createdAt
										? new Date( convo.createdAt ).toLocaleString()
										: '—' }
								</td>
								<td>
									<code>{ convo.id?.substring( 0, 16 ) }...</code>
								</td>
								<td>{ convo.channel || convo.integration || '—' }</td>
								<td>
									<Button
										variant="link"
										onClick={ () => onSelect( convo.id ) }
									>
										{ __( 'View', 'botpress-webchat' ) }
									</Button>
								</td>
							</tr>
						) ) }
					</tbody>
				</table>
			) }

			{ nextToken && ! loading && (
				<div className="bpwc-conversations__pagination">
					<Button
						variant="secondary"
						onClick={ () => fetchConversations( nextToken ) }
					>
						{ __( 'Load more', 'botpress-webchat' ) }
					</Button>
				</div>
			) }
		</div>
	);
}
