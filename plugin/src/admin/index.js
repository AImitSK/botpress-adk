import { createRoot } from '@wordpress/element';
import { useState, useEffect } from '@wordpress/element';
import { Button, Spinner } from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';
import { __ } from '@wordpress/i18n';

import IdentitySection from './sections/IdentitySection';
import AppearanceSection from './sections/AppearanceSection';
import FeaturesSection from './sections/FeaturesSection';
import DataSourcesSection from './sections/DataSourcesSection';
import ConnectionSection from './sections/ConnectionSection';

import './style.css';

const NAV_ITEMS = [
	{ key: 'identity', label: 'Bot Identity', icon: 'businessman' },
	{ key: 'appearance', label: 'Bot Appearance', icon: 'art' },
	{ key: 'features', label: 'Features', icon: 'admin-settings' },
	{ key: 'data-sources', label: 'Data Sources', icon: 'database' },
	{ key: 'connection', label: 'Connection', icon: 'admin-links' },
];

function App() {
	const [ settings, setSettings ] = useState( null );
	const [ saving, setSaving ] = useState( false );
	const [ notice, setNotice ] = useState( null );
	const [ activeSection, setActiveSection ] = useState( 'identity' );

	useEffect( () => {
		apiFetch( { path: '/bpwc/v1/settings' } ).then( ( res ) => {
			if ( res.success ) {
				setSettings( res.data );
			}
		} );
	}, [] );

	const save = async ( updates ) => {
		setSaving( true );
		setNotice( null );
		try {
			const res = await apiFetch( {
				path: '/bpwc/v1/settings',
				method: 'POST',
				data: updates,
			} );
			if ( res.success ) {
				setSettings( res.data );
				setNotice( { type: 'success', text: __( 'Settings saved.', 'botpress-webchat' ) } );
			}
			setSaving( false );
			return res;
		} catch ( err ) {
			setNotice( { type: 'error', text: __( 'Error saving settings.', 'botpress-webchat' ) } );
			setSaving( false );
			return null;
		}
	};

	if ( ! settings ) {
		return (
			<div className="bpwc-admin bpwc-admin--loading">
				<Spinner />
			</div>
		);
	}

	const previewConfig = {
		botName: settings.identity?.bot_name || 'Bot',
		botAvatar: settings.identity?.bot_avatar_url || '',
		color: settings.appearance?.primary_color || '#3276EA',
		themeMode: settings.appearance?.theme_mode || 'light',
		headerVariant: settings.appearance?.header_variant || 'glass',
		variant: settings.appearance?.message_variant || 'solid',
		radius: settings.appearance?.corner_radius ?? 1,
		composerPlaceholder: settings.identity?.composer_placeholder || 'Type your message...',
	};

	const renderSection = () => {
		switch ( activeSection ) {
			case 'identity':
				return (
					<IdentitySection
						identity={ settings.identity }
						onChange={ ( v ) => setSettings( { ...settings, identity: v } ) }
					/>
				);
			case 'appearance':
				return (
					<AppearanceSection
						appearance={ settings.appearance }
						onChange={ ( v ) => setSettings( { ...settings, appearance: v } ) }
					/>
				);
			case 'features':
				return (
					<FeaturesSection
						features={ settings.features }
						onChange={ ( v ) => setSettings( { ...settings, features: v } ) }
					/>
				);
			case 'data-sources':
				return (
					<DataSourcesSection
						dataSources={ settings.data_sources }
						general={ settings.general }
						onChange={ ( ds, gen ) => setSettings( { ...settings, data_sources: ds, general: gen } ) }
					/>
				);
			case 'connection':
				return (
					<ConnectionSection
						settings={ settings }
						onSave={ save }
						saving={ saving }
					/>
				);
			default:
				return null;
		}
	};

	return (
		<div className="bpwc-admin">
			<div className="bpwc-admin__sidebar">
				<div className="bpwc-admin__logo">
					<span className="dashicons dashicons-format-chat" />
					<h2>Webchat</h2>
				</div>
				<nav className="bpwc-admin__nav">
					{ NAV_ITEMS.map( ( item ) => (
						<button
							key={ item.key }
							type="button"
							className={ `bpwc-admin__nav-item ${ activeSection === item.key ? 'is-active' : '' }` }
							onClick={ () => setActiveSection( item.key ) }
						>
							<span className={ `dashicons dashicons-${ item.icon }` } />
							{ item.label }
						</button>
					) ) }
				</nav>
			</div>

			<div className="bpwc-admin__content">
				<div className="bpwc-admin__header">
					<h1>{ NAV_ITEMS.find( ( i ) => i.key === activeSection )?.label }</h1>
					{ activeSection !== 'connection' && (
						<Button
							variant="primary"
							className="bpwc-admin__save-btn"
							onClick={ () => {
								const updates = {};
								if ( activeSection === 'identity' ) updates.identity = settings.identity;
								if ( activeSection === 'appearance' ) updates.appearance = settings.appearance;
								if ( activeSection === 'features' ) updates.features = settings.features;
								if ( activeSection === 'data-sources' ) {
									updates.data_sources = settings.data_sources;
									updates.general = settings.general;
								}
								save( updates );
							} }
							isBusy={ saving }
							disabled={ saving }
						>
							{ __( 'Publish Changes', 'botpress-webchat' ) }
						</Button>
					) }
				</div>

				{ notice && (
					<div className={ `notice notice-${ notice.type } is-dismissible` } style={ { margin: '0 0 16px' } }>
						<p>{ notice.text }</p>
					</div>
				) }

				<div className="bpwc-admin__main">
					<div className="bpwc-admin__form">
						{ renderSection() }
					</div>

					{ [ 'identity', 'appearance', 'features' ].includes( activeSection ) && (
						<div className="bpwc-admin__preview">
							<div
								className={ `bpwc-preview ${ previewConfig.themeMode === 'dark' ? 'bpwc-preview--dark' : '' }` }
								style={ { '--bpwc-color': previewConfig.color, '--bpwc-radius': `${ previewConfig.radius * 16 }px` } }
							>
								<div className={ `bpwc-preview__header ${ previewConfig.headerVariant === 'solid' ? 'bpwc-preview__header--solid' : '' }` }>
									<div className="bpwc-preview__avatar">
										{ previewConfig.botAvatar
											? <img src={ previewConfig.botAvatar } alt="" />
											: previewConfig.botName.charAt( 0 ) }
									</div>
									<span className="bpwc-preview__name">{ previewConfig.botName }</span>
								</div>
								<div className="bpwc-preview__messages">
									<div className="bpwc-preview__avatar-large">
										{ previewConfig.botAvatar
											? <img src={ previewConfig.botAvatar } alt="" />
											: previewConfig.botName.charAt( 0 ) }
									</div>
									<div className="bpwc-preview__bot-label">{ previewConfig.botName }</div>
								</div>
								<div className="bpwc-preview__composer">
									<span className="bpwc-preview__placeholder">{ previewConfig.composerPlaceholder }</span>
								</div>
								<div className="bpwc-preview__fab">
									<svg width="20" height="20" viewBox="0 0 24 24" fill="white">
										<path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
									</svg>
								</div>
							</div>
						</div>
					) }
				</div>
			</div>
		</div>
	);
}

const root = document.getElementById( 'bpwc-admin-root' );
if ( root ) {
	createRoot( root ).render( <App /> );
}
