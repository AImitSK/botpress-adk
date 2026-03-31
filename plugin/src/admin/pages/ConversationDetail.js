import { useState, useEffect } from '@wordpress/element';
import { Button, Spinner } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import MessageBubble from '../components/MessageBubble';

export default function ConversationDetail( { conversationId, onBack } ) {
	const [ data, setData ] = useState( null );
	const [ loading, setLoading ] = useState( true );
	const [ error, setError ] = useState( '' );

	useEffect( () => {
		const fetchDetail = async () => {
			setLoading( true );
			setError( '' );
			try {
				const res = await apiFetch( {
					path: `/bpwc/v1/conversations/${ conversationId }`,
				} );
				if ( res.success ) {
					setData( res.data );
				} else {
					setError( res.message || __( 'Could not load conversation.', 'botpress-webchat' ) );
				}
			} catch ( err ) {
				setError( err.message || __( 'Failed to load conversation.', 'botpress-webchat' ) );
			}
			setLoading( false );
		};

		fetchDetail();
	}, [ conversationId ] );

	if ( loading ) {
		return <Spinner />;
	}

	if ( error ) {
		return (
			<div>
				<Button variant="link" onClick={ onBack }>
					&larr; { __( 'Back to list', 'botpress-webchat' ) }
				</Button>
				<div className="notice notice-error"><p>{ error }</p></div>
			</div>
		);
	}

	const convo = data?.conversation?.conversation || data?.conversation || {};
	const messages = data?.messages || [];

	// Sort messages oldest first.
	const sorted = [ ...messages ].sort(
		( a, b ) => new Date( a.createdAt ) - new Date( b.createdAt )
	);

	return (
		<div className="bpwc-detail">
			<div className="bpwc-detail__header">
				<Button variant="link" onClick={ onBack }>
					&larr; { __( 'Back to list', 'botpress-webchat' ) }
				</Button>
				<h2>
					{ __( 'Conversation', 'botpress-webchat' ) }{ ' ' }
					<code>{ conversationId.substring( 0, 16 ) }...</code>
				</h2>
				{ convo.createdAt && (
					<p className="description">
						{ __( 'Started:', 'botpress-webchat' ) }{ ' ' }
						{ new Date( convo.createdAt ).toLocaleString() }
					</p>
				) }
			</div>

			<div className="bpwc-detail__messages">
				{ sorted.length === 0 ? (
					<p>{ __( 'No messages in this conversation.', 'botpress-webchat' ) }</p>
				) : (
					sorted.map( ( msg ) => (
						<MessageBubble key={ msg.id } message={ msg } />
					) )
				) }
			</div>
		</div>
	);
}
