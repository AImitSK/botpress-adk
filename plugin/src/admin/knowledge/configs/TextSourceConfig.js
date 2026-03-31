import { TextareaControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

export default function TextSourceConfig( { config, onChange } ) {
	return (
		<div className="bpwc-kb__config">
			<TextareaControl
				label={ __( 'Content', 'botpress-webchat' ) }
				help={ __( 'Enter text, FAQ, markdown — any information the bot should know.', 'botpress-webchat' ) }
				value={ config.content || '' }
				onChange={ ( v ) => onChange( { ...config, content: v } ) }
				rows={ 12 }
				placeholder={ __(
					'Example:\n\nOpening Hours: Mon-Fri 8am-5pm\nAddress: 123 Main Street\n\nQ: How can I reach support?\nA: Call +49 123 456 or email support@company.com',
					'botpress-webchat'
				) }
			/>
			{ config.content && (
				<div className="bpwc-kb__content-stats">
					{ config.content.length.toLocaleString() } { __( 'characters', 'botpress-webchat' ) }
					{ ' / ~' }{ Math.ceil( config.content.length / 4 ).toLocaleString() } { __( 'tokens', 'botpress-webchat' ) }
				</div>
			) }
		</div>
	);
}
