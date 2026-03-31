import { useState, useEffect } from '@wordpress/element';
import { Button, TextControl, TextareaControl, SelectControl, Spinner } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';

import TextSourceConfig from './configs/TextSourceConfig';
import TableSourceConfig from './configs/TableSourceConfig';
import WpDataSourceConfig from './configs/WpDataSourceConfig';

const SOURCE_TYPES = [
	{ value: 'text', label: 'Text / FAQ' },
	{ value: 'table', label: 'Table' },
	{ value: 'wp_data', label: 'WordPress Data' },
	{ value: 'internal_pages', label: 'Internal Pages (coming soon)' },
	{ value: 'external_pages', label: 'External Pages (coming soon)' },
	{ value: 'file', label: 'File Upload (coming soon)' },
	{ value: 'sitemap', label: 'Sitemap (coming soon)' },
	{ value: 'rss', label: 'RSS Feed (coming soon)' },
];

const ENABLED_TYPES = [ 'text', 'table', 'wp_data' ];

export default function SourceEditor( { sourceId, onSave, onDelete, onBack } ) {
	const isNew = sourceId === 0;
	const [ source, setSource ] = useState( {
		name: '',
		type: 'text',
		config: {},
		prompt: '',
	} );
	const [ loading, setLoading ] = useState( ! isNew );
	const [ saving, setSaving ] = useState( false );

	useEffect( () => {
		if ( ! isNew ) {
			apiFetch( { path: `/bpwc/v1/sources/${ sourceId }` } ).then( ( res ) => {
				if ( res.success ) {
					setSource( res.data );
				}
				setLoading( false );
			} );
		}
	}, [ sourceId ] );

	const update = ( key, value ) => {
		setSource( { ...source, [ key ]: value } );
	};

	const handleSave = async () => {
		setSaving( true );
		await onSave( source );
		setSaving( false );
	};

	if ( loading ) {
		return (
			<div className="bpwc-kb__loading">
				<Spinner />
			</div>
		);
	}

	const renderConfig = () => {
		switch ( source.type ) {
			case 'text':
				return (
					<TextSourceConfig
						config={ source.config }
						onChange={ ( c ) => update( 'config', c ) }
					/>
				);
			case 'table':
				return (
					<TableSourceConfig
						config={ source.config }
						onChange={ ( c ) => update( 'config', c ) }
					/>
				);
			case 'wp_data':
				return (
					<WpDataSourceConfig
						config={ source.config }
						onChange={ ( c ) => update( 'config', c ) }
					/>
				);
			default:
				return (
					<div className="bpwc-kb__coming-soon">
						<p>{ __( 'This source type will be available in a future update.', 'botpress-webchat' ) }</p>
					</div>
				);
		}
	};

	return (
		<div className="bpwc-kb__editor">
			<div className="bpwc-kb__editor-header">
				<button className="bpwc-kb__back-btn" onClick={ onBack }>
					<span>&larr;</span> { __( 'Knowledge Base', 'botpress-webchat' ) }
				</button>
				<div className="bpwc-kb__editor-actions">
					{ ! isNew && (
						<Button
							variant="tertiary"
							isDestructive
							onClick={ () => {
								if ( window.confirm( __( 'Delete this source?', 'botpress-webchat' ) ) ) {
									onDelete( source.id );
								}
							} }
						>
							{ __( 'Delete', 'botpress-webchat' ) }
						</Button>
					) }
					<Button
						variant="primary"
						className="bpwc-kb__save-btn"
						onClick={ handleSave }
						isBusy={ saving }
						disabled={ saving || ! source.name }
					>
						{ isNew ? __( 'Create Source', 'botpress-webchat' ) : __( 'Save Changes', 'botpress-webchat' ) }
					</Button>
				</div>
			</div>

			<div className="bpwc-kb__editor-body">
				<div className="bpwc-kb__editor-main">
					{/* Basic Info */}
					<div className="bpwc-kb__panel">
						<h2>{ isNew ? __( 'New Data Source', 'botpress-webchat' ) : source.name }</h2>

						<div className="bpwc-kb__field">
							<TextControl
								label={ __( 'Source Name', 'botpress-webchat' ) }
								value={ source.name }
								onChange={ ( v ) => update( 'name', v ) }
								placeholder={ __( 'e.g. Team Members, Product Catalog, FAQ...', 'botpress-webchat' ) }
							/>
						</div>

						{ isNew && (
							<div className="bpwc-kb__type-grid">
								<label className="bpwc-kb__type-label">{ __( 'Source Type', 'botpress-webchat' ) }</label>
								<div className="bpwc-kb__type-cards">
									{ SOURCE_TYPES.map( ( t ) => {
										const enabled = ENABLED_TYPES.includes( t.value );
										return (
											<button
												key={ t.value }
												type="button"
												className={ `bpwc-kb__type-card ${ source.type === t.value ? 'is-selected' : '' } ${ ! enabled ? 'is-disabled' : '' }` }
												onClick={ () => {
													if ( enabled ) {
														setSource( ( prev ) => ( { ...prev, type: t.value, config: {} } ) );
													}
												} }
											>
												{ t.label }
											</button>
										);
									} ) }
								</div>
							</div>
						) }
					</div>

					{/* Type-specific config */}
					<div className="bpwc-kb__panel">
						<h3>{ __( 'Content', 'botpress-webchat' ) }</h3>
						{ renderConfig() }
					</div>

					{/* Bot Prompt */}
					<div className="bpwc-kb__panel bpwc-kb__panel--prompt">
						<h3>{ __( 'Bot Instructions', 'botpress-webchat' ) }</h3>
						<p className="bpwc-kb__panel-desc">
							{ __( 'Tell the bot what this data contains and when to use it. Be specific — this helps the bot decide which source to query.', 'botpress-webchat' ) }
						</p>
						<TextareaControl
							value={ source.prompt }
							onChange={ ( v ) => update( 'prompt', v ) }
							rows={ 4 }
							placeholder={ __( 'e.g. "Employee directory of the company. Contains name, email, phone and department. Use this data when someone is looking for a contact person or asking about a department."', 'botpress-webchat' ) }
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
