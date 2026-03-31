import { useState } from '@wordpress/element';
import { TextControl, Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

export default function TableSourceConfig( { config, onChange } ) {
	const columns = config.columns || [];
	const rows = config.rows || [];

	const updateConfig = ( cols, rws ) => {
		onChange( { ...config, columns: cols, rows: rws } );
	};

	// Add column.
	const addColumn = () => {
		const name = prompt( __( 'Column name:', 'botpress-webchat' ) );
		if ( ! name ) return;
		const newCols = [ ...columns, name ];
		const newRows = rows.map( ( row ) => [ ...row, '' ] );
		updateConfig( newCols, newRows );
	};

	// Remove column.
	const removeColumn = ( idx ) => {
		const newCols = columns.filter( ( _, i ) => i !== idx );
		const newRows = rows.map( ( row ) => row.filter( ( _, i ) => i !== idx ) );
		updateConfig( newCols, newRows );
	};

	// Add row.
	const addRow = () => {
		updateConfig( columns, [ ...rows, new Array( columns.length ).fill( '' ) ] );
	};

	// Remove row.
	const removeRow = ( idx ) => {
		updateConfig( columns, rows.filter( ( _, i ) => i !== idx ) );
	};

	// Update cell.
	const updateCell = ( rowIdx, colIdx, value ) => {
		const newRows = rows.map( ( row, ri ) =>
			ri === rowIdx ? row.map( ( cell, ci ) => ( ci === colIdx ? value : cell ) ) : row
		);
		updateConfig( columns, newRows );
	};

	// CSV import.
	const handleCSVImport = ( e ) => {
		const file = e.target.files[ 0 ];
		if ( ! file ) return;

		const reader = new FileReader();
		reader.onload = ( ev ) => {
			const text = ev.target.result;
			const lines = text.split( '\n' ).filter( ( l ) => l.trim() );
			if ( lines.length === 0 ) return;

			const separator = lines[ 0 ].includes( ';' ) ? ';' : ',';
			const parsed = lines.map( ( line ) =>
				line.split( separator ).map( ( cell ) => cell.replace( /^"|"$/g, '' ).trim() )
			);

			const newCols = parsed[ 0 ];
			const newRows = parsed.slice( 1 );
			updateConfig( newCols, newRows );
		};
		reader.readAsText( file );
	};

	return (
		<div className="bpwc-kb__config">
			<div className="bpwc-kb__table-actions">
				<Button variant="secondary" onClick={ addColumn } disabled={ columns.length >= 10 }>
					+ { __( 'Add Column', 'botpress-webchat' ) }
				</Button>
				<Button variant="secondary" onClick={ addRow } disabled={ columns.length === 0 }>
					+ { __( 'Add Row', 'botpress-webchat' ) }
				</Button>
				<label className="bpwc-kb__csv-import">
					<input type="file" accept=".csv,.txt" onChange={ handleCSVImport } hidden />
					<Button variant="tertiary" as="span">
						{ __( 'Import CSV', 'botpress-webchat' ) }
					</Button>
				</label>
			</div>

			{ columns.length === 0 ? (
				<div className="bpwc-kb__table-empty">
					<p>{ __( 'Add columns to build your table, or import a CSV file.', 'botpress-webchat' ) }</p>
				</div>
			) : (
				<div className="bpwc-kb__table-wrapper">
					<table className="bpwc-kb__table">
						<thead>
							<tr>
								{ columns.map( ( col, ci ) => (
									<th key={ ci }>
										<div className="bpwc-kb__table-th">
											<span>{ col }</span>
											<button
												className="bpwc-kb__table-remove-col"
												onClick={ () => removeColumn( ci ) }
												title={ __( 'Remove column', 'botpress-webchat' ) }
											>
												&times;
											</button>
										</div>
									</th>
								) ) }
								<th className="bpwc-kb__table-actions-col" />
							</tr>
						</thead>
						<tbody>
							{ rows.map( ( row, ri ) => (
								<tr key={ ri }>
									{ row.map( ( cell, ci ) => (
										<td key={ ci }>
											<input
												type="text"
												value={ cell }
												onChange={ ( e ) => updateCell( ri, ci, e.target.value ) }
												className="bpwc-kb__table-input"
											/>
										</td>
									) ) }
									<td className="bpwc-kb__table-actions-col">
										<button
											className="bpwc-kb__table-remove-row"
											onClick={ () => removeRow( ri ) }
											title={ __( 'Remove row', 'botpress-webchat' ) }
										>
											&times;
										</button>
									</td>
								</tr>
							) ) }
						</tbody>
					</table>
				</div>
			) }

			{ rows.length > 0 && (
				<div className="bpwc-kb__content-stats">
					{ columns.length } { __( 'columns', 'botpress-webchat' ) } / { rows.length } { __( 'rows', 'botpress-webchat' ) }
				</div>
			) }
		</div>
	);
}
