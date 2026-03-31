import { createRoot } from '@wordpress/element';
import { TabPanel } from '@wordpress/components';
import { useState, useEffect } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { __ } from '@wordpress/i18n';

import ConnectionTab from './tabs/ConnectionTab';
import StylingTab from './tabs/StylingTab';
import DataSourcesTab from './tabs/DataSourcesTab';

import './style.css';

const TABS = [
	{ name: 'connection', title: __( 'Connection', 'botpress-webchat' ) },
	{ name: 'styling', title: __( 'Styling', 'botpress-webchat' ) },
	{ name: 'data-sources', title: __( 'Data Sources', 'botpress-webchat' ) },
];

function App() {
	const [ settings, setSettings ] = useState( null );
	const [ saving, setSaving ] = useState( false );
	const [ notice, setNotice ] = useState( '' );

	useEffect( () => {
		apiFetch( { path: '/bpwc/v1/settings' } ).then( ( res ) => {
			if ( res.success ) {
				setSettings( res.data );
			}
		} );
	}, [] );

	const save = async ( updates ) => {
		setSaving( true );
		setNotice( '' );
		try {
			const res = await apiFetch( {
				path: '/bpwc/v1/settings',
				method: 'POST',
				data: updates,
			} );
			if ( res.success ) {
				setSettings( res.data );
				setNotice( __( 'Settings saved.', 'botpress-webchat' ) );
			}
			setSaving( false );
			return res;
		} catch ( err ) {
			setNotice( __( 'Error saving settings.', 'botpress-webchat' ) );
			setSaving( false );
			return null;
		}
	};

	if ( ! settings ) {
		return <p>{ __( 'Loading...', 'botpress-webchat' ) }</p>;
	}

	return (
		<div className="bpwc-admin">
			<h1>{ __( 'Botpress Webchat', 'botpress-webchat' ) }</h1>
			{ notice && <div className="notice notice-success"><p>{ notice }</p></div> }
			<TabPanel tabs={ TABS }>
				{ ( tab ) => {
					switch ( tab.name ) {
						case 'connection':
							return <ConnectionTab settings={ settings } onSave={ save } saving={ saving } />;
						case 'styling':
							return <StylingTab settings={ settings } onSave={ save } saving={ saving } />;
						case 'data-sources':
							return <DataSourcesTab settings={ settings } onSave={ save } saving={ saving } />;
						default:
							return null;
					}
				} }
			</TabPanel>
		</div>
	);
}

const root = document.getElementById( 'bpwc-admin-root' );
if ( root ) {
	createRoot( root ).render( <App /> );
}
