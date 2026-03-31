import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

export default function FileSourceConfig( { config, onChange } ) {
	const attachmentId = config.attachment_id || 0;
	const fileName = config.file_name || '';
	const fileSize = config.file_size || '';
	const mimeType = config.mime_type || '';

	const openMedia = () => {
		const frame = wp.media( {
			title: __( 'Select File', 'botpress-webchat' ),
			multiple: false,
			library: {
				type: [ 'text/plain', 'text/csv', 'application/pdf' ],
			},
			button: { text: __( 'Use this file', 'botpress-webchat' ) },
		} );

		frame.on( 'select', () => {
			const attachment = frame.state().get( 'selection' ).first().toJSON();
			onChange( {
				...config,
				attachment_id: attachment.id,
				file_name: attachment.filename,
				file_size: attachment.filesizeHumanReadable || '',
				mime_type: attachment.mime,
				file_url: attachment.url,
			} );
		} );

		frame.open();
	};

	const removeFile = () => {
		onChange( {
			...config,
			attachment_id: 0,
			file_name: '',
			file_size: '',
			mime_type: '',
			file_url: '',
		} );
	};

	const getMimeIcon = ( mime ) => {
		if ( mime === 'application/pdf' ) return '📕';
		if ( mime === 'text/csv' ) return '📊';
		return '📄';
	};

	return (
		<div className="bpwc-kb__config">
			<p className="bpwc-kb__config-desc">
				{ __( 'Upload a file to extract its text content. Supported formats: TXT, CSV, PDF, Markdown.', 'botpress-webchat' ) }
			</p>

			{ attachmentId ? (
				<div className="bpwc-kb__file-preview">
					<div className="bpwc-kb__file-icon">
						{ getMimeIcon( mimeType ) }
					</div>
					<div className="bpwc-kb__file-info">
						<div className="bpwc-kb__file-name">{ fileName }</div>
						<div className="bpwc-kb__file-meta">
							{ mimeType && <span>{ mimeType }</span> }
							{ fileSize && <span>{ fileSize }</span> }
						</div>
					</div>
					<div className="bpwc-kb__file-actions">
						<Button variant="secondary" onClick={ openMedia }>
							{ __( 'Replace', 'botpress-webchat' ) }
						</Button>
						<Button variant="tertiary" isDestructive onClick={ removeFile }>
							{ __( 'Remove', 'botpress-webchat' ) }
						</Button>
					</div>
				</div>
			) : (
				<div className="bpwc-kb__file-dropzone" onClick={ openMedia }>
					<div className="bpwc-kb__file-dropzone-icon">📎</div>
					<p>{ __( 'Click to select a file from the Media Library', 'botpress-webchat' ) }</p>
					<span className="bpwc-kb__file-dropzone-formats">
						TXT, CSV, PDF, Markdown
					</span>
				</div>
			) }

			{ attachmentId > 0 && mimeType === 'application/pdf' && (
				<div className="bpwc-kb__file-notice">
					{ __( 'Note: PDF text extraction works best with text-based PDFs. Scanned documents may not extract properly.', 'botpress-webchat' ) }
				</div>
			) }
		</div>
	);
}
