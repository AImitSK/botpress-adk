import { useState } from '@wordpress/element';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';

export default function ExportButton() {
	const [ exporting, setExporting ] = useState( false );

	const handleExport = async () => {
		setExporting( true );
		try {
			const res = await apiFetch( { path: '/bpwc/v1/conversations/export' } );
			if ( res.success && res.csv ) {
				const blob = new Blob( [ res.csv ], { type: 'text/csv;charset=utf-8;' } );
				const url = URL.createObjectURL( blob );
				const link = document.createElement( 'a' );
				link.href = url;
				link.download = res.filename || 'conversations.csv';
				link.click();
				URL.revokeObjectURL( url );
			}
		} catch ( err ) {
			// Silently handled.
		}
		setExporting( false );
	};

	return (
		<Button
			variant="secondary"
			onClick={ handleExport }
			isBusy={ exporting }
			disabled={ exporting }
			className="bpwc-export-btn"
		>
			{ __( 'Export CSV', 'botpress-webchat' ) }
		</Button>
	);
}
