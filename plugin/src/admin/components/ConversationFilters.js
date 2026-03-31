import { SelectControl, TextControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

export default function ConversationFilters( { search, onSearchChange, limit, onLimitChange } ) {
	return (
		<div className="bpwc-filters">
			<TextControl
				label={ __( 'Search', 'botpress-webchat' ) }
				value={ search }
				onChange={ onSearchChange }
				placeholder={ __( 'Filter conversations...', 'botpress-webchat' ) }
				className="bpwc-filters__search"
			/>
			<SelectControl
				label={ __( 'Per page', 'botpress-webchat' ) }
				value={ String( limit ) }
				options={ [
					{ label: '10', value: '10' },
					{ label: '25', value: '25' },
					{ label: '50', value: '50' },
				] }
				onChange={ ( v ) => onLimitChange( parseInt( v, 10 ) ) }
				className="bpwc-filters__limit"
			/>
		</div>
	);
}
