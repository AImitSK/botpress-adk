import { useState, useEffect } from '@wordpress/element';
import { Button, TextControl, TextareaControl, SelectControl, Spinner } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';

import TextSourceConfig from './configs/TextSourceConfig';
import TableSourceConfig from './configs/TableSourceConfig';

const SOURCE_TYPES = [
	{ value: 'text', label: '📝  Text / FAQ' },
	{ value: 'table', label: '📊  Table' },
	{ value: 'wp_data', label: '🗄️  WordPress Data (coming soon)', disabled: true },
	{ value: 'internal_pages', label: '📄  Internal Pages (coming soon)', disabled: true },
	{ value: 'external_pages', label: '🌐  External Pages (coming soon)', disabled: true },
	{ value: 'file', label: '📎  File Upload (coming soon)', disabled: true },
	{ value: 'sitemap', label: '🗺️  Sitemap (coming soon)', disabled: true },
	{ value: 'rss', label: '📡  RSS Feed (coming soon)', disabled: true },
];

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
							<div className="bpwc-kb__field">
								<SelectControl
									label={ __( 'Source Type', 'botpress-webchat' ) }
									value={ source.type }
									options={ SOURCE_TYPES }
									onChange={ ( v ) => {
										update( 'type', v );
										update( 'config', {} );
									} }
								/>
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
