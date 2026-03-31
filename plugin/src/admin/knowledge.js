import { createRoot } from '@wordpress/element';
import { useState, useEffect } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { __ } from '@wordpress/i18n';

import SourceList from './knowledge/SourceList';
import SourceEditor from './knowledge/SourceEditor';

import './knowledge.css';

function App() {
	const [ sources, setSources ] = useState( [] );
	const [ loading, setLoading ] = useState( true );
	const [ editingId, setEditingId ] = useState( null );
	const [ notice, setNotice ] = useState( null );

	const fetchSources = async () => {
		setLoading( true );
		try {
			const res = await apiFetch( { path: '/bpwc/v1/sources' } );
			if ( res.success ) setSources( res.data );
		} catch ( err ) {
			setNotice( { type: 'error', text: err.message } );
		}
		setLoading( false );
	};

	useEffect( () => { fetchSources(); }, [] );

	const handleSave = async ( source ) => {
		setNotice( null );
		try {
			const res = source.id
				? await apiFetch( { path: `/bpwc/v1/sources/${ source.id }`, method: 'PUT', data: source } )
				: await apiFetch( { path: '/bpwc/v1/sources', method: 'POST', data: source } );
			if ( res.success ) {
				setNotice( { type: 'success', text: __( 'Source saved.', 'botpress-webchat' ) } );
				setEditingId( null );
				fetchSources();
			}
		} catch ( err ) {
			setNotice( { type: 'error', text: err.message } );
		}
	};

	const handleDelete = async ( id ) => {
		try {
			await apiFetch( { path: `/bpwc/v1/sources/${ id }`, method: 'DELETE' } );
			setEditingId( null );
			fetchSources();
		} catch ( err ) {
			setNotice( { type: 'error', text: err.message } );
		}
	};

	const handleToggleStatus = async ( source ) => {
		const newStatus = source.status === 'active' ? 'inactive' : 'active';
		await apiFetch( { path: `/bpwc/v1/sources/${ source.id }`, method: 'PUT', data: { status: newStatus } } );
		fetchSources();
	};

	return (
		<div className="bpwc-page">
			<div className="bpwc-page__topbar">
				<div className="bpwc-page__topbar-left">
					<span className="dashicons dashicons-format-chat" />
					<h1 className="bpwc-page__title">Webchat</h1>
					<span className="bpwc-page__breadcrumb">Knowledge Base</span>
				</div>
			</div>

			<div className="bpwc-page__content" style={ { padding: '32px 48px' } }>
				{ notice && (
					<div className={ `bpwc-notice bpwc-notice--${ notice.type }` } style={ { maxWidth: 900 } }>
						{ notice.text }
						<button onClick={ () => setNotice( null ) } style={ { background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: 'inherit', opacity: 0.6 } }>&times;</button>
					</div>
				) }

				{ editingId !== null ? (
					<SourceEditor
						sourceId={ editingId }
						onSave={ handleSave }
						onDelete={ handleDelete }
						onBack={ () => setEditingId( null ) }
					/>
				) : (
					<SourceList
						sources={ sources }
						loading={ loading }
						onAdd={ () => setEditingId( 0 ) }
						onEdit={ ( id ) => setEditingId( id ) }
						onToggleStatus={ handleToggleStatus }
					/>
				) }
			</div>
		</div>
	);
}

const root = document.getElementById( 'bpwc-knowledge-root' );
if ( root ) {
	createRoot( root ).render( <App /> );
}
