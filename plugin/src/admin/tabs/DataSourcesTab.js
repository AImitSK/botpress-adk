import { useState } from '@wordpress/element';
import { ToggleControl, SelectControl, Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

export default function DataSourcesTab( { settings, onSave, saving } ) {
	const [ dataSources, setDataSources ] = useState( settings.data_sources );
	const [ general, setGeneral ] = useState( settings.general );

	const toggleSource = ( key ) => {
		setDataSources( { ...dataSources, [ key ]: ! dataSources[ key ] } );
	};

	const handleSave = () => {
		onSave( { data_sources: dataSources, general } );
	};

	return (
		<div className="bpwc-tab-content">
			<h3>{ __( 'Custom Post Types', 'botpress-webchat' ) }</h3>
			<p className="description">
				{ __( 'Enable the data types your bot needs. Enabled types will appear in the WordPress admin menu.', 'botpress-webchat' ) }
			</p>

			<div className="bpwc-field">
				<ToggleControl
					label={ __( 'Contacts', 'botpress-webchat' ) }
					help={ __( 'Staff directory for the bot to search.', 'botpress-webchat' ) }
					checked={ dataSources.enable_contacts }
					onChange={ () => toggleSource( 'enable_contacts' ) }
				/>
			</div>
			<div className="bpwc-field">
				<ToggleControl
					label={ __( 'Products', 'botpress-webchat' ) }
					help={ __( 'Product catalog for recommendations.', 'botpress-webchat' ) }
					checked={ dataSources.enable_products }
					onChange={ () => toggleSource( 'enable_products' ) }
				/>
			</div>
			<div className="bpwc-field">
				<ToggleControl
					label={ __( 'Downloads', 'botpress-webchat' ) }
					help={ __( 'Datasheets, brochures, and other files.', 'botpress-webchat' ) }
					checked={ dataSources.enable_downloads }
					onChange={ () => toggleSource( 'enable_downloads' ) }
				/>
			</div>
			<div className="bpwc-field">
				<ToggleControl
					label={ __( 'Country Representatives', 'botpress-webchat' ) }
					help={ __( 'International sales reps and distributors.', 'botpress-webchat' ) }
					checked={ dataSources.enable_country_reps }
					onChange={ () => toggleSource( 'enable_country_reps' ) }
				/>
			</div>

			<h3>{ __( 'General', 'botpress-webchat' ) }</h3>
			<div className="bpwc-field">
				<SelectControl
					label={ __( 'Language', 'botpress-webchat' ) }
					value={ general.language }
					options={ [
						{ label: 'Deutsch', value: 'de' },
						{ label: 'English', value: 'en' },
						{ label: 'Fran\u00e7ais', value: 'fr' },
					] }
					onChange={ ( v ) => setGeneral( { ...general, language: v } ) }
				/>
			</div>
			<div className="bpwc-field">
				<ToggleControl
					label={ __( 'Enable Webchat', 'botpress-webchat' ) }
					checked={ general.enabled }
					onChange={ () => setGeneral( { ...general, enabled: ! general.enabled } ) }
				/>
			</div>
			<div className="bpwc-field">
				<SelectControl
					label={ __( 'Show On', 'botpress-webchat' ) }
					value={ general.show_on }
					options={ [
						{ label: __( 'All Pages', 'botpress-webchat' ), value: 'all' },
						{ label: __( 'Include specific pages', 'botpress-webchat' ), value: 'include' },
						{ label: __( 'Exclude specific pages', 'botpress-webchat' ), value: 'exclude' },
					] }
					onChange={ ( v ) => setGeneral( { ...general, show_on: v } ) }
				/>
			</div>

			<div className="bpwc-actions">
				<Button
					variant="primary"
					onClick={ handleSave }
					isBusy={ saving }
					disabled={ saving }
				>
					{ __( 'Save Data Sources', 'botpress-webchat' ) }
				</Button>
			</div>
		</div>
	);
}
