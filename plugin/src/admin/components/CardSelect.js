import { __ } from '@wordpress/i18n';

export default function CardSelect( { label, description, options, value, onChange } ) {
	return (
		<div className="bpwc-card-select">
			<label className="bpwc-card-select__label">{ label }</label>
			{ description && <p className="bpwc-card-select__desc">{ description }</p> }
			<div className="bpwc-card-select__options">
				{ options.map( ( opt ) => (
					<button
						key={ opt.value }
						type="button"
						className={ `bpwc-card-select__card ${ value === opt.value ? 'is-selected' : '' }` }
						onClick={ () => onChange( opt.value ) }
					>
						{ opt.preview && (
							<div className="bpwc-card-select__preview">{ opt.preview }</div>
						) }
						<span className="bpwc-card-select__card-label">{ opt.label }</span>
					</button>
				) ) }
			</div>
		</div>
	);
}
