import { useState, useEffect } from '@wordpress/element';
import { SelectControl, TextControl, Button, Spinner } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';

export default function WpDataSourceConfig( { config, onChange } ) {
	const [ postTypes, setPostTypes ] = useState( [] );
	const [ loading, setLoading ] = useState( true );
	const [ newFieldName, setNewFieldName ] = useState( '' );
	const [ showAddField, setShowAddField ] = useState( false );

	const selectedType = config.post_type || '';
	const fieldMap = config.field_map || {};

	useEffect( () => {
		apiFetch( { path: '/bpwc/v1/post-types' } ).then( ( res ) => {
			if ( res.success ) {
				setPostTypes( res.data );
			}
			setLoading( false );
		} );
	}, [] );

	const selectedPT = postTypes.find( ( pt ) => pt.name === selectedType );
	const availableFields = selectedPT?.fields || [];

	const updateFieldMap = ( botField, wpField ) => {
		const newMap = { ...fieldMap, [ botField ]: wpField };
		onChange( { ...config, field_map: newMap } );
	};

	const addMapping = () => {
		if ( ! newFieldName.trim() ) return;
		const newMap = { ...fieldMap, [ newFieldName.trim() ]: '' };
		onChange( { ...config, field_map: newMap } );
		setNewFieldName( '' );
		setShowAddField( false );
	};

	const removeMapping = ( key ) => {
		const newMap = { ...fieldMap };
		delete newMap[ key ];
		onChange( { ...config, field_map: newMap } );
	};

	if ( loading ) {
		return <Spinner />;
	}

	return (
		<div className="bpwc-kb__config">
			<div className="bpwc-kb__field">
				<SelectControl
					label={ __( 'Post Type', 'botpress-webchat' ) }
					help={ __( 'Select which WordPress content type to use as data source.', 'botpress-webchat' ) }
					value={ selectedType }
					options={ [
						{ label: __( '-- Select Post Type --', 'botpress-webchat' ), value: '' },
						...postTypes.map( ( pt ) => ( {
							label: `${ pt.label } (${ pt.name }) -- ${ pt.count } entries`,
							value: pt.name,
						} ) ),
					] }
					onChange={ ( v ) => onChange( { ...config, post_type: v, field_map: {} } ) }
				/>
			</div>

			{ selectedType && (
				<>
					<div className="bpwc-kb__mapping">
						<div className="bpwc-kb__mapping-header">
							<h4>{ __( 'Field Mapping', 'botpress-webchat' ) }</h4>
							{ ! showAddField && (
								<Button
									variant="secondary"
									onClick={ () => setShowAddField( true ) }
									className="bpwc-kb__mapping-add"
								>
									+ { __( 'Add Field', 'botpress-webchat' ) }
								</Button>
							) }
						</div>
						<p className="bpwc-kb__mapping-desc">
							{ __( 'Map WordPress fields to bot-friendly names. The bot will use the left names to understand the data.', 'botpress-webchat' ) }
						</p>

						{ showAddField && (
							<div className="bpwc-kb__add-field-row">
								<TextControl
									placeholder={ __( 'Field name, e.g. "email", "phone"', 'botpress-webchat' ) }
									value={ newFieldName }
									onChange={ setNewFieldName }
									onKeyDown={ ( e ) => {
										if ( e.key === 'Enter' ) addMapping();
										if ( e.key === 'Escape' ) setShowAddField( false );
									} }
								/>
								<Button variant="primary" onClick={ addMapping } disabled={ ! newFieldName.trim() }>
									{ __( 'Add', 'botpress-webchat' ) }
								</Button>
								<Button variant="tertiary" onClick={ () => setShowAddField( false ) }>
									{ __( 'Cancel', 'botpress-webchat' ) }
								</Button>
							</div>
						) }

						{ Object.keys( fieldMap ).length === 0 && ! showAddField && (
							<div className="bpwc-kb__mapping-empty">
								<p>{ __( 'No fields mapped yet. Add fields to tell the bot what data to use.', 'botpress-webchat' ) }</p>
							</div>
						) }

						<div className="bpwc-kb__mapping-rows">
							{ Object.entries( fieldMap ).map( ( [ botField, wpField ] ) => (
								<div key={ botField } className="bpwc-kb__mapping-row">
									<div className="bpwc-kb__mapping-bot-field">
										<span className="bpwc-kb__mapping-label">Bot</span>
										<div className="bpwc-kb__mapping-value">{ botField }</div>
									</div>
									<span className="bpwc-kb__mapping-arrow">&rarr;</span>
									<div className="bpwc-kb__mapping-wp-field">
										<span className="bpwc-kb__mapping-label">WordPress</span>
										<SelectControl
											value={ wpField }
											options={ [
												{ label: __( '-- Select --', 'botpress-webchat' ), value: '' },
												...availableFields.map( ( f ) => ( {
													label: f.label,
													value: f.key,
												} ) ),
											] }
											onChange={ ( v ) => updateFieldMap( botField, v ) }
											__nextHasNoMarginBottom
										/>
									</div>
									<button
										className="bpwc-kb__mapping-remove"
										onClick={ () => removeMapping( botField ) }
										title={ __( 'Remove', 'botpress-webchat' ) }
									>
										&times;
									</button>
								</div>
							) ) }
						</div>
					</div>

					{ Object.keys( fieldMap ).length > 0 && Object.values( fieldMap ).some( ( v ) => v ) && (
						<div className="bpwc-kb__mapping-info">
							<strong>{ selectedPT?.count || 0 }</strong> { __( 'entries available', 'botpress-webchat' ) }
							{ ' -- ' }
							<strong>{ Object.keys( fieldMap ).length }</strong> { __( 'fields mapped', 'botpress-webchat' ) }
						</div>
					) }
				</>
			) }
		</div>
	);
}
