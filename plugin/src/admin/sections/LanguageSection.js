import { TextControl, SelectControl, CheckboxControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

const DETECTION_METHODS = [
	{ value: 'url_prefix', label: 'URL Prefix (/en/, /fr/, /pl/)' },
	{ value: 'url_param', label: 'URL Parameter (?lang=en)' },
	{ value: 'auto', label: 'Auto-detect (visitor language)' },
];

export default function LanguageSection( { general, language, onChange } ) {
	const updateGeneral = ( key, value ) => {
		onChange( 'general', { ...general, [ key ]: value } );
	};

	const updateLang = ( key, value ) => {
		onChange( 'language', { ...language, [ key ]: value } );
	};

	return (
		<div className="bpwc-section">
			<h2>{ __( 'Language Settings', 'botpress-webchat' ) }</h2>

			<div className="bpwc-field">
				<SelectControl
					label={ __( 'Default Language', 'botpress-webchat' ) }
					help={ __( 'The primary language of the bot.', 'botpress-webchat' ) }
					value={ general.language || 'de' }
					options={ [
						{ value: 'de', label: 'Deutsch' },
						{ value: 'en', label: 'English' },
						{ value: 'fr', label: 'Français' },
						{ value: 'nl', label: 'Nederlands' },
						{ value: 'it', label: 'Italiano' },
						{ value: 'pl', label: 'Polski' },
						{ value: 'es', label: 'Español' },
						{ value: 'pt', label: 'Português' },
						{ value: 'zh', label: '中文' },
						{ value: 'ja', label: '日本語' },
					] }
					onChange={ ( v ) => updateGeneral( 'language', v ) }
				/>
			</div>

			<hr />
			<h3>{ __( 'Multilingual', 'botpress-webchat' ) }</h3>

			<div className="bpwc-feature-card" style={ { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' } }>
				<div>
					<strong>{ __( 'Multilingual Mode', 'botpress-webchat' ) }</strong>
					<p className="description" style={ { margin: '4px 0 0' } }>
						{ __( 'The bot detects the visitor\'s language and responds accordingly.', 'botpress-webchat' ) }
					</p>
				</div>
				<button
					className={ `bpwc-toggle ${ language.multilingual ? 'is-active' : '' }` }
					onClick={ () => updateLang( 'multilingual', ! language.multilingual ) }
					type="button"
				>
					<span className="bpwc-toggle__knob" />
				</button>
			</div>

			{ language.multilingual && (
				<>
					<div className="bpwc-field">
						<SelectControl
							label={ __( 'Language Detection', 'botpress-webchat' ) }
							help={ __( 'How to detect the visitor\'s language.', 'botpress-webchat' ) }
							value={ language.detection_method || 'url_prefix' }
							options={ DETECTION_METHODS }
							onChange={ ( v ) => updateLang( 'detection_method', v ) }
						/>
					</div>

					{ language.detection_method !== 'auto' && (
						<div className="bpwc-field">
							<TextControl
								label={ __( 'Additional Languages (URL prefixes)', 'botpress-webchat' ) }
								help={ __( 'Comma-separated language codes that have a URL prefix, e.g. en,fr,nl,it,pl,es — do NOT include the default language (it has no prefix).', 'botpress-webchat' ) }
								value={ language.available_languages || '' }
								onChange={ ( v ) => updateLang( 'available_languages', v ) }
								placeholder="de,en,fr"
							/>
						</div>
					) }

					<div className="bpwc-feature-card" style={ { display: 'flex', alignItems: 'center', justifyContent: 'space-between' } }>
						<div>
							<strong>{ __( 'WPML / Polylang', 'botpress-webchat' ) }</strong>
							<p className="description" style={ { margin: '4px 0 0' } }>
								{ __( 'Pass language to WordPress API so translated content is returned.', 'botpress-webchat' ) }
							</p>
						</div>
						<button
							className={ `bpwc-toggle ${ language.wpml_active ? 'is-active' : '' }` }
							onClick={ () => updateLang( 'wpml_active', ! language.wpml_active ) }
							type="button"
						>
							<span className="bpwc-toggle__knob" />
						</button>
					</div>
				</>
			) }
		</div>
	);
}
