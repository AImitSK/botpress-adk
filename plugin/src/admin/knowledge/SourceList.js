import { Button, Spinner } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

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

function getSourceMeta( source ) {
	const meta = TYPE_META[ source.type ] || { icon: '📦', label: source.type, color: '#f5f5f5' };

	let detail = '';
	if ( source.type === 'text' ) {
		const len = ( source.config?.content || '' ).length;
		detail = `${ len } characters`;
	} else if ( source.type === 'table' ) {
		const rows = ( source.config?.rows || [] ).length;
		const cols = ( source.config?.columns || [] ).length;
		detail = `${ rows } rows, ${ cols } columns`;
	} else if ( source.type === 'file' ) {
		detail = source.config?.file_name || 'No file';
	} else if ( source.type === 'wp_data' ) {
		const pt = source.config?.post_type || '';
		const fields = Object.keys( source.config?.field_map || {} ).length;
		detail = `${ pt } — ${ fields } fields mapped`;
	}

	return { ...meta, detail };
}

export default function SourceList( { sources, loading, onAdd, onEdit, onToggleStatus } ) {
	if ( loading ) {
		return (
			<div className="bpwc-kb__loading">
				<Spinner />
			</div>
		);
	}

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
									</div>
									{ source.prompt && (
										<div className="bpwc-kb__card-prompt">
											{ source.prompt.substring( 0, 80 ) }{ source.prompt.length > 80 ? '...' : '' }
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
