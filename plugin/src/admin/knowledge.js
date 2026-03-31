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
	const [ editingId, setEditingId ] = useState( null ); // null=list, 0=new, id=edit
	const [ notice, setNotice ] = useState( null );

	const fetchSources = async () => {
		setLoading( true );
		try {
			const res = await apiFetch( { path: '/bpwc/v1/sources' } );
			if ( res.success ) {
				setSources( res.data );
			}
		} catch ( err ) {
			setNotice( { type: 'error', text: err.message } );
		}
		setLoading( false );
	};

	useEffect( () => {
		fetchSources();
	}, [] );

	const handleSave = async ( source ) => {
		setNotice( null );
		try {
			let res;
			if ( source.id ) {
				res = await apiFetch( {
					path: `/bpwc/v1/sources/${ source.id }`,
					method: 'PUT',
					data: source,
				} );
			} else {
				res = await apiFetch( {
					path: '/bpwc/v1/sources',
					method: 'POST',
					data: source,
				} );
			}
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
			await apiFetch( {
				path: `/bpwc/v1/sources/${ id }`,
				method: 'DELETE',
			} );
			setEditingId( null );
			fetchSources();
		} catch ( err ) {
			setNotice( { type: 'error', text: err.message } );
		}
	};

	const handleToggleStatus = async ( source ) => {
		const newStatus = source.status === 'active' ? 'inactive' : 'active';
		await apiFetch( {
			path: `/bpwc/v1/sources/${ source.id }`,
			method: 'PUT',
			data: { status: newStatus },
		} );
		fetchSources();
	};

	return (
		<div className="bpwc-kb">
			{ notice && (
				<div className={ `bpwc-kb__notice bpwc-kb__notice--${ notice.type }` }>
					{ notice.text }
					<button onClick={ () => setNotice( null ) }>&times;</button>
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
	);
}

const root = document.getElementById( 'bpwc-knowledge-root' );
if ( root ) {
	createRoot( root ).render( <App /> );
}
