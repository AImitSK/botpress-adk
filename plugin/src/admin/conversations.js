import { createRoot } from '@wordpress/element';
import { useState } from '@wordpress/element';

import ConversationsPage from './pages/ConversationsPage';
import ConversationDetail from './pages/ConversationDetail';

import './conversations.css';

function App() {
	const [ selectedId, setSelectedId ] = useState( null );

	return (
		<div className="bpwc-page">
			<div className="bpwc-page__topbar">
				<div className="bpwc-page__topbar-left">
					<span className="dashicons dashicons-format-chat" />
					<h1 className="bpwc-page__title">Webchat</h1>
					<span className="bpwc-page__breadcrumb">Conversations</span>
				</div>
			</div>

			<div className="bpwc-page__content" style={ { padding: '32px 48px' } }>
				{ selectedId ? (
					<ConversationDetail
						conversationId={ selectedId }
						onBack={ () => setSelectedId( null ) }
					/>
				) : (
					<ConversationsPage onSelect={ setSelectedId } />
				) }
			</div>
		</div>
	);
}

const root = document.getElementById( 'bpwc-conversations-root' );
if ( root ) {
	createRoot( root ).render( <App /> );
}
