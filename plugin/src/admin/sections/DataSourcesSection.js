import { useState } from '@wordpress/element';
import { ToggleControl, SelectControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

export default function DataSourcesSection( { dataSources, general, onChange } ) {
	const [ ds, setDs ] = useState( dataSources );
	const [ gen, setGen ] = useState( general );

	const toggleSource = ( key ) => {
		const updated = { ...ds, [ key ]: ! ds[ key ] };
		setDs( updated );
		onChange( updated, gen );
	};

	const updateGeneral = ( key, value ) => {
		const updated = { ...gen, [ key ]: value };
		setGen( updated );
		onChange( ds, updated );
	};

	return (
		<div className="bpwc-section">
			<h2>{ __( 'Custom Post Types', 'botpress-webchat' ) }</h2>
			<p className="bpwc-section__desc">
				{ __( 'Enable the data types your bot needs. Enabled types will appear in the WordPress admin menu.', 'botpress-webchat' ) }
			</p>

			<div className="bpwc-feature-card">
				<ToggleControl
					label={ __( 'Contacts', 'botpress-webchat' ) }
					help={ __( 'Staff directory for the bot to search.', 'botpress-webchat' ) }
					checked={ ds.enable_contacts }
					onChange={ () => toggleSource( 'enable_contacts' ) }
				/>
			</div>
			<div className="bpwc-feature-card">
				<ToggleControl
					label={ __( 'Products', 'botpress-webchat' ) }
					help={ __( 'Product catalog for recommendations.', 'botpress-webchat' ) }
					checked={ ds.enable_products }
					onChange={ () => toggleSource( 'enable_products' ) }
				/>
			</div>
			<div className="bpwc-feature-card">
				<ToggleControl
					label={ __( 'Downloads', 'botpress-webchat' ) }
					help={ __( 'Datasheets, brochures, and other files.', 'botpress-webchat' ) }
					checked={ ds.enable_downloads }
					onChange={ () => toggleSource( 'enable_downloads' ) }
				/>
			</div>
			<div className="bpwc-feature-card">
				<ToggleControl
					label={ __( 'Country Representatives', 'botpress-webchat' ) }
					help={ __( 'International sales reps and distributors.', 'botpress-webchat' ) }
					checked={ ds.enable_country_reps }
					onChange={ () => toggleSource( 'enable_country_reps' ) }
				/>
			</div>

			<hr />
			<h3>{ __( 'General', 'botpress-webchat' ) }</h3>

			<div className="bpwc-field">
				<SelectControl
					label={ __( 'Language', 'botpress-webchat' ) }
					value={ gen.language }
					options={ [
						{ label: 'Deutsch', value: 'de' },
						{ label: 'English', value: 'en' },
						{ label: 'Fran\u00e7ais', value: 'fr' },
					] }
					onChange={ ( v ) => updateGeneral( 'language', v ) }
				/>
			</div>

			<div className="bpwc-feature-card">
				<ToggleControl
					label={ __( 'Enable Webchat', 'botpress-webchat' ) }
					checked={ gen.enabled }
					onChange={ () => updateGeneral( 'enabled', ! gen.enabled ) }
				/>
			</div>
		</div>
	);
}
