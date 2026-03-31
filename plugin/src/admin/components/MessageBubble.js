import { __ } from '@wordpress/i18n';

export default function MessageBubble( { message } ) {
	const isUser = message.direction === 'incoming';
	const text = message.payload?.text || message.payload?.wrapped?.text || '';
	const time = message.createdAt
		? new Date( message.createdAt ).toLocaleTimeString( [], {
				hour: '2-digit',
				minute: '2-digit',
		  } )
		: '';

	if ( ! text ) {
		return null;
	}

	return (
		<div className={ `bpwc-bubble ${ isUser ? 'bpwc-bubble--user' : 'bpwc-bubble--bot' }` }>
			<div className="bpwc-bubble__label">
				{ isUser ? __( 'Visitor', 'botpress-webchat' ) : __( 'Bot', 'botpress-webchat' ) }
				{ time && <span className="bpwc-bubble__time">{ time }</span> }
			</div>
			<div className="bpwc-bubble__text">{ text }</div>
		</div>
	);
}
