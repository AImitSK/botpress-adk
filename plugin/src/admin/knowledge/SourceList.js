import { useState } from '@wordpress/element';
import { Button, Spinner } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';

const TYPE_META = {
	text:           { icon: '📝', label: 'Text / FAQ',        color: '#E8F5E9' },
	table:          { icon: '📊', label: 'Table',             color: '#E3F2FD' },
	wp_data:        { icon: '🗄️', label: 'WordPress Data',    color: '#F3E5F5' },
	internal_pages: { icon: '📄', label: 'Internal Pages',    color: '#FFF3E0' },
	external_pages: { icon: '🌐', label: 'External Pages',    color: '#E0F7FA' },
	sitemap:        { icon: '🗺️', label: 'Sitemap',           color: '#FBE9E7' },
	rss:            { icon: '📡', label: 'RSS Feed',           color: '#F1F8E9' },
	file:           { icon: '📎', label: 'File Upload',        color: '#EFEBE9' },
};

const SYNCABLE = [ 'external_pages', 'sitemap', 'rss' ];

function estimateTokens( source ) {
	let chars = 0;
	if ( source.type === 'text' ) {
		chars = ( source.config?.content || '' ).length;
	} else if ( source.cached_content ) {
		chars = source.cached_content.length;
	} else if ( source.type === 'table' ) {
		chars = JSON.stringify( source.config?.rows || [] ).length;
	}
	if ( chars === 0 ) return null;
	return Math.ceil( chars / 4 );
}

function getSourceMeta( source ) {
	const meta = TYPE_META[ source.type ] || { icon: '📦', label: source.type, color: '#f5f5f5' };

	let detail = '';
	if ( source.type === 'text' ) {
		const len = ( source.config?.content || '' ).length;
		detail = `${ len.toLocaleString() } chars`;
	} else if ( source.type === 'table' ) {
		const rows = ( source.config?.rows || [] ).length;
		const cols = ( source.config?.columns || [] ).length;
		detail = `${ rows } rows, ${ cols } cols`;
	} else if ( source.type === 'file' ) {
		detail = source.config?.file_name || 'No file';
	} else if ( source.type === 'wp_data' ) {
		const pt = source.config?.post_type || '';
		const fields = Object.keys( source.config?.field_map || {} ).length;
		detail = `${ pt } — ${ fields } fields`;
	} else if ( source.type === 'internal_pages' ) {
		const count = ( source.config?.post_ids || [] ).length;
		detail = `${ count } pages`;
	} else if ( source.type === 'external_pages' ) {
		const count = ( source.config?.urls || [] ).length;
		detail = `${ count } URLs`;
	} else if ( source.type === 'sitemap' ) {
		detail = source.config?.sitemap_url ? 'Configured' : 'Not configured';
	} else if ( source.type === 'rss' ) {
		detail = source.config?.feed_url ? 'Configured' : 'Not configured';
	}

	return { ...meta, detail };
}

function timeAgo( dateStr ) {
	if ( ! dateStr ) return null;
	const date = new Date( dateStr );
	const now = new Date();
	const diff = Math.floor( ( now - date ) / 1000 );

	if ( diff < 60 ) return __( 'just now', 'botpress-webchat' );
	if ( diff < 3600 ) return `${ Math.floor( diff / 60 ) }m ago`;
	if ( diff < 86400 ) return `${ Math.floor( diff / 3600 ) }h ago`;
	return `${ Math.floor( diff / 86400 ) }d ago`;
}

export default function SourceList( { sources, loading, onAdd, onEdit, onToggleStatus } ) {
	const [ syncingId, setSyncingId ] = useState( null );

	const handleSync = async ( e, source ) => {
		e.stopPropagation();
		setSyncingId( source.id );
		try {
			await apiFetch( {
				path: `/bpwc/v1/sources/${ source.id }/sync`,
				method: 'POST',
			} );
		} catch ( err ) {
			// Silent fail — status will show in UI.
		}
		setSyncingId( null );
		// Trigger parent refresh.
		onToggleStatus( { ...source, status: source.status } );
	};

	if ( loading ) {
		return (
			<div className="bpwc-kb__loading">
				<Spinner />
			</div>
		);
	}

	// Totals.
	const totalSources = sources.filter( ( s ) => s.status === 'active' ).length;
	const totalTokens = sources
		.filter( ( s ) => s.status === 'active' )
		.reduce( ( sum, s ) => sum + ( estimateTokens( s ) || 0 ), 0 );

	return (
		<div className="bpwc-kb__list">
			<div className="bpwc-kb__list-header">
				<div>
					<h1>{ __( 'Knowledge Base', 'botpress-webchat' ) }</h1>
					<p className="bpwc-kb__subtitle">
						{ __( 'Manage the data sources your bot uses to answer questions.', 'botpress-webchat' ) }
					</p>
				</div>
				<Button variant="primary" className="bpwc-kb__add-btn" onClick={ onAdd }>
					+ { __( 'Add Source', 'botpress-webchat' ) }
				</Button>
			</div>

			{ sources.length > 0 && (
				<div className="bpwc-kb__stats-bar">
					<div className="bpwc-kb__stat">
						<span className="bpwc-kb__stat-value">{ totalSources }</span>
						<span className="bpwc-kb__stat-label">{ __( 'Active Sources', 'botpress-webchat' ) }</span>
					</div>
					<div className="bpwc-kb__stat">
						<span className="bpwc-kb__stat-value">{ totalTokens.toLocaleString() }</span>
						<span className="bpwc-kb__stat-label">{ __( 'Est. Tokens', 'botpress-webchat' ) }</span>
					</div>
					<div className="bpwc-kb__stat">
						<span className="bpwc-kb__stat-value">{ sources.length }</span>
						<span className="bpwc-kb__stat-label">{ __( 'Total Sources', 'botpress-webchat' ) }</span>
					</div>
				</div>
			) }

			{ sources.length === 0 ? (
				<div className="bpwc-kb__empty">
					<div className="bpwc-kb__empty-icon">📚</div>
					<h3>{ __( 'No data sources yet', 'botpress-webchat' ) }</h3>
					<p>{ __( 'Add your first data source so your bot can answer questions about your business.', 'botpress-webchat' ) }</p>
					<Button variant="primary" onClick={ onAdd }>
						+ { __( 'Add your first source', 'botpress-webchat' ) }
					</Button>
				</div>
			) : (
				<div className="bpwc-kb__cards">
					{ sources.map( ( source ) => {
						const meta = getSourceMeta( source );
						const tokens = estimateTokens( source );
						const synced = timeAgo( source.last_synced );
						const isSyncable = SYNCABLE.includes( source.type );

						return (
							<div
								key={ source.id }
								className={ `bpwc-kb__card ${ source.status === 'inactive' ? 'bpwc-kb__card--inactive' : '' }` }
								onClick={ () => onEdit( source.id ) }
							>
								<div className="bpwc-kb__card-icon" style={ { background: meta.color } }>
									{ meta.icon }
								</div>
								<div className="bpwc-kb__card-body">
									<div className="bpwc-kb__card-title">{ source.name }</div>
									<div className="bpwc-kb__card-meta">
										<span className="bpwc-kb__card-type">{ meta.label }</span>
										{ meta.detail && (
											<span className="bpwc-kb__card-detail">{ meta.detail }</span>
										) }
										{ tokens > 0 && (
											<span className="bpwc-kb__card-tokens">~{ tokens.toLocaleString() } tokens</span>
										) }
									</div>
									{ source.prompt && (
										<div className="bpwc-kb__card-prompt">
											{ source.prompt.substring( 0, 80 ) }{ source.prompt.length > 80 ? '...' : '' }
										</div>
									) }
									{ isSyncable && (
										<div className="bpwc-kb__card-sync">
											{ synced ? (
												<span className="bpwc-kb__card-synced">Synced { synced }</span>
											) : (
												<span className="bpwc-kb__card-not-synced">Not synced yet</span>
											) }
											<button
												className="bpwc-kb__card-sync-btn"
												onClick={ ( e ) => handleSync( e, source ) }
												disabled={ syncingId === source.id }
											>
												{ syncingId === source.id ? '...' : '↻' }
											</button>
										</div>
									) }
								</div>
								<div className="bpwc-kb__card-status">
									<button
										className={ `bpwc-kb__toggle ${ source.status === 'active' ? 'is-active' : '' }` }
										onClick={ ( e ) => {
											e.stopPropagation();
											onToggleStatus( source );
										} }
										title={ source.status === 'active' ? __( 'Active', 'botpress-webchat' ) : __( 'Inactive', 'botpress-webchat' ) }
									>
										<span className="bpwc-kb__toggle-knob" />
									</button>
								</div>
							</div>
						);
					} ) }
				</div>
			) }
		</div>
	);
}
