import { ToggleControl, SelectControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

export default function FeaturesSection( { features, onChange } ) {
	const update = ( key, value ) => {
		onChange( { ...features, [ key ]: value } );
	};

	return (
		<div className="bpwc-section">
			<h2>{ __( 'Features', 'botpress-webchat' ) }</h2>

			<div className="bpwc-feature-card">
				<ToggleControl
					label={ __( 'Message Feedback', 'botpress-webchat' ) }
					help={ __( 'Enables thumbs up/down reactions on bot messages for user feedback.', 'botpress-webchat' ) }
					checked={ features.message_feedback }
					onChange={ ( v ) => update( 'message_feedback', v ) }
				/>
			</div>

			<div className="bpwc-feature-card">
				<ToggleControl
					label={ __( 'Allow File Upload', 'botpress-webchat' ) }
					help={ __( 'Allow users to upload and share files in the chat conversation.', 'botpress-webchat' ) }
					checked={ features.allow_file_upload }
					onChange={ ( v ) => update( 'allow_file_upload', v ) }
				/>
			</div>

			<div className="bpwc-feature-card">
				<ToggleControl
					label={ __( 'Message Notification Sound', 'botpress-webchat' ) }
					help={ __( 'Plays an alert when a new message arrives in the chat. Requires v3.3+.', 'botpress-webchat' ) }
					checked={ features.notification_sound }
					onChange={ ( v ) => update( 'notification_sound', v ) }
				/>
			</div>

			<div className="bpwc-feature-card">
				<ToggleControl
					label={ __( 'Conversation History', 'botpress-webchat' ) }
					help={ __( 'Allow users to view and continue previous conversations. Requires v3.6+.', 'botpress-webchat' ) }
					checked={ features.conversation_history }
					onChange={ ( v ) => update( 'conversation_history', v ) }
				/>
			</div>

			<div className="bpwc-feature-card">
				<SelectControl
					label={ __( 'Chat History Reset', 'botpress-webchat' ) }
					help={ __( 'Choose when to clear the chat history stored in the user\'s browser.', 'botpress-webchat' ) }
					value={ features.chat_history_reset }
					options={ [
						{ label: __( 'Never (localStorage)', 'botpress-webchat' ), value: 'localStorage' },
						{ label: __( 'On Tab Close (sessionStorage)', 'botpress-webchat' ), value: 'sessionStorage' },
					] }
					onChange={ ( v ) => update( 'chat_history_reset', v ) }
				/>
			</div>
		</div>
	);
}
