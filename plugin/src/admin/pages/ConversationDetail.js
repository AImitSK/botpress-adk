import { useState, useEffect } from '@wordpress/element';
import { Spinner } from '@wordpress/components';
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
				const res = await apiFetch( { path: `/bpwc/v1/conversations/${ conversationId }` } );
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
		return (
			<div style={ { display: 'flex', justifyContent: 'center', padding: '60px' } }>
				<Spinner />
			</div>
		);
	}

	if ( error ) {
		return (
			<div className="bpwc-convo-detail">
				<button className="bpwc-convo-detail__back" onClick={ onBack }>
					&larr; { __( 'Back', 'botpress-webchat' ) }
				</button>
				<div className="bpwc-notice bpwc-notice--error">{ error }</div>
			</div>
		);
	}

	const convo = data?.conversation?.conversation || data?.conversation || {};
	const messages = data?.messages || [];
	const sorted = [ ...messages ].sort( ( a, b ) => new Date( a.createdAt ) - new Date( b.createdAt ) );

	return (
		<div className="bpwc-convo-detail">
			<button className="bpwc-convo-detail__back" onClick={ onBack }>
				&larr; { __( 'Back to conversations', 'botpress-webchat' ) }
			</button>

			<div className="bpwc-convo-detail__header">
				<h2>
					{ __( 'Conversation', 'botpress-webchat' ) }
				</h2>
				{ convo.createdAt && (
					<p className="description">
						{ new Date( convo.createdAt ).toLocaleString() }
						{ ' — ' }
						<code style={ { fontSize: 11 } }>{ conversationId.substring( 0, 24 ) }...</code>
					</p>
				) }
			</div>

			<div className="bpwc-convo-detail__messages">
				{ sorted.length === 0 ? (
					<p style={ { textAlign: 'center', color: 'var(--bpwc-text-muted)', padding: '40px' } }>
						{ __( 'No messages in this conversation.', 'botpress-webchat' ) }
					</p>
				) : (
					sorted.map( ( msg ) => (
						<MessageBubble key={ msg.id } message={ msg } />
					) )
				) }
			</div>
		</div>
	);
}
