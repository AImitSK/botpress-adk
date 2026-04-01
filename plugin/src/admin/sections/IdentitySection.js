import { TextControl, TextareaControl, Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import MediaPicker from '../components/MediaPicker';

const PROMPT_DEFAULTS = {
	system_prompt: "Du bist ein freundlicher und kompetenter Support-Assistent für unsere Website.\nDeine Aufgabe ist es, Besuchern bei Fragen zu helfen — zu Produkten, Ansprechpartnern, Downloads und allgemeinen Informationen.\nNutze ausschließlich die verfügbaren Datenquellen, um Antworten zu geben.",
	fallback_behavior: "Wenn du die Antwort nicht in den Datenquellen findest, sage ehrlich:\n\"Das kann ich leider nicht beantworten. Soll ich Ihre Anfrage an unser Team weiterleiten? Dafür benötige ich Ihren Namen und eine E-Mail-Adresse oder Telefonnummer.\"",
	restrictions: "- Erfinde keine Informationen — antworte nur mit Daten aus den Datenquellen.\n- Nenne keine Preise, Verfügbarkeiten oder rechtliche Auskünfte, die nicht in den Daten stehen.\n- Gib keine medizinischen, rechtlichen oder finanziellen Ratschläge.\n- Leite bei Beschwerden oder dringenden Anliegen immer an einen echten Mitarbeiter weiter.",
};

export default function IdentitySection( { identity, onChange } ) {
	const update = ( key, value ) => {
		onChange( { ...identity, [ key ]: value } );
	};

	const resetPrompts = () => {
		onChange( { ...identity, ...PROMPT_DEFAULTS } );
	};

	return (
		<div className="bpwc-section">
			<h2>{ __( 'Bot Identity', 'botpress-webchat' ) }</h2>

			<div className="bpwc-field">
				<TextControl
					label={ __( 'Display Name', 'botpress-webchat' ) }
					help={ __( 'The name that appears in the chat header and conversations.', 'botpress-webchat' ) }
					value={ identity.bot_name }
					onChange={ ( v ) => update( 'bot_name', v ) }
				/>
			</div>

			<div className="bpwc-field">
				<TextareaControl
					label={ __( 'Bot Description', 'botpress-webchat' ) }
					help={ __( 'A brief description of your bot\'s purpose and capabilities.', 'botpress-webchat' ) }
					value={ identity.bot_description }
					onChange={ ( v ) => update( 'bot_description', v ) }
					rows={ 3 }
				/>
			</div>

			<MediaPicker
				label={ __( 'Bot Avatar', 'botpress-webchat' ) }
				help={ __( 'Image for the bot avatar. Leave empty for default.', 'botpress-webchat' ) }
				value={ identity.bot_avatar_url }
				onChange={ ( v ) => update( 'bot_avatar_url', v ) }
			/>

			<hr />
			<h3>{ __( 'Bot Behavior', 'botpress-webchat' ) }</h3>

			<div className="bpwc-field">
				<TextareaControl
					label={ __( 'Role & Task', 'botpress-webchat' ) }
					help={ __( 'Describe what the bot should do. This is the main instruction for the AI.', 'botpress-webchat' ) }
					value={ identity.system_prompt }
					onChange={ ( v ) => update( 'system_prompt', v ) }
					rows={ 4 }
				/>
			</div>

			<div className="bpwc-field">
				<TextareaControl
					label={ __( 'Fallback Behavior', 'botpress-webchat' ) }
					help={ __( 'What should the bot do when it cannot find the answer in the data sources?', 'botpress-webchat' ) }
					value={ identity.fallback_behavior }
					onChange={ ( v ) => update( 'fallback_behavior', v ) }
					rows={ 3 }
				/>
			</div>

			<div className="bpwc-field">
				<TextareaControl
					label={ __( 'Restrictions', 'botpress-webchat' ) }
					help={ __( 'What the bot must never do. One rule per line.', 'botpress-webchat' ) }
					value={ identity.restrictions }
					onChange={ ( v ) => update( 'restrictions', v ) }
					rows={ 4 }
				/>
			</div>

			<Button
				variant="secondary"
				isSmall
				onClick={ resetPrompts }
			>
				{ __( 'Reset to defaults', 'botpress-webchat' ) }
			</Button>

			<hr />
			<h3>{ __( 'Chat Interface', 'botpress-webchat' ) }</h3>

			<div className="bpwc-field">
				<TextControl
					label={ __( 'Message Placeholder', 'botpress-webchat' ) }
					help={ __( 'Placeholder text shown in the message input field.', 'botpress-webchat' ) }
					value={ identity.composer_placeholder }
					onChange={ ( v ) => update( 'composer_placeholder', v ) }
				/>
			</div>

			<div className="bpwc-field">
				<TextControl
					label={ __( 'Footer', 'botpress-webchat' ) }
					help={ __( 'Text displayed at the bottom of the chat interface.', 'botpress-webchat' ) }
					value={ identity.footer }
					onChange={ ( v ) => update( 'footer', v ) }
				/>
			</div>

			<MediaPicker
				label={ __( 'FAB Button Image', 'botpress-webchat' ) }
				help={ __( 'Custom image for the floating action button.', 'botpress-webchat' ) }
				value={ identity.fab_avatar_url }
				onChange={ ( v ) => update( 'fab_avatar_url', v ) }
			/>

			<hr />
			<h3>{ __( 'Contact', 'botpress-webchat' ) }</h3>

			<div className="bpwc-field-row">
				<TextControl
					label={ __( 'Email', 'botpress-webchat' ) }
					value={ identity.contact_email }
					onChange={ ( v ) => update( 'contact_email', v ) }
					type="email"
					placeholder="example@example.com"
				/>
				<TextControl
					label={ __( 'Phone', 'botpress-webchat' ) }
					value={ identity.contact_phone }
					onChange={ ( v ) => update( 'contact_phone', v ) }
					placeholder="+1 555 555 5555"
				/>
				<TextControl
					label={ __( 'Website', 'botpress-webchat' ) }
					value={ identity.contact_website }
					onChange={ ( v ) => update( 'contact_website', v ) }
					type="url"
					placeholder="https://example.com"
				/>
			</div>

			<div className="bpwc-field-row">
				<TextControl
					label={ __( 'Terms of Service URL', 'botpress-webchat' ) }
					value={ identity.terms_of_service_url }
					onChange={ ( v ) => update( 'terms_of_service_url', v ) }
					type="url"
				/>
				<TextControl
					label={ __( 'Privacy Policy URL', 'botpress-webchat' ) }
					value={ identity.privacy_policy_url }
					onChange={ ( v ) => update( 'privacy_policy_url', v ) }
					type="url"
				/>
			</div>
		</div>
	);
}
