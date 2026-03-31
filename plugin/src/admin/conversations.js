import { createRoot } from '@wordpress/element';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

import ConversationsPage from './pages/ConversationsPage';
import ConversationDetail from './pages/ConversationDetail';

import './conversations.css';

function App() {
	const [ selectedId, setSelectedId ] = useState( null );

	if ( selectedId ) {
		return (
			<ConversationDetail
				conversationId={ selectedId }
				onBack={ () => setSelectedId( null ) }
			/>
		);
	}

	return <ConversationsPage onSelect={ setSelectedId } />;
}

const root = document.getElementById( 'bpwc-conversations-root' );
if ( root ) {
	createRoot( root ).render( <App /> );
}
