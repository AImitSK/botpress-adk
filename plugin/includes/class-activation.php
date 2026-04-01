<?php

namespace Bpwc;

class Activation {

	public static function activate(): void {
		// Always force connection + notification values from developer-config.
		// These are the source of truth — DB values must not override them.
		self::apply_developer_config();

		Knowledge_Db::install();
		Inquiry_Db::install();
		flush_rewrite_rules();

		$settings = Settings::get_all();
		if ( ! empty( $settings['connection']['bot_id'] ) ) {
			Auto_Register::sync();
		}
	}

	public static function deactivate(): void {
		Knowledge_Sync::deactivate();
		Usage_Monitor::deactivate();
		flush_rewrite_rules();
	}

	/**
	 * Force developer-config values into the saved settings.
	 * This ensures a fresh install or reinstall always uses the correct credentials.
	 */
	private static function apply_developer_config(): void {
		$config_path = BPWC_PLUGIN_DIR . 'developer-config.php';

		if ( ! file_exists( $config_path ) ) {
			return;
		}

		$dev = (array) require $config_path;

		$overrides = [];

		// Connection values — always from developer-config.
		if ( ! empty( $dev['bot_id'] ) ) {
			$overrides['connection']['bot_id'] = $dev['bot_id'];
		}
		if ( ! empty( $dev['webchat_id'] ) ) {
			$overrides['connection']['webchat_id'] = $dev['webchat_id'];
		}
		if ( ! empty( $dev['botpress_pat'] ) ) {
			$overrides['connection']['botpress_pat'] = $dev['botpress_pat'];
		}

		// Language.
		if ( ! empty( $dev['default_language'] ) ) {
			$overrides['general']['language'] = $dev['default_language'];
		}

		// SendGrid values — from developer-config.
		if ( ! empty( $dev['sendgrid_api_key'] ) ) {
			$overrides['notifications']['sendgrid_api_key'] = $dev['sendgrid_api_key'];
		}
		if ( ! empty( $dev['sendgrid_from_email'] ) ) {
			$overrides['notifications']['sendgrid_from_email'] = $dev['sendgrid_from_email'];
		}

		if ( ! empty( $overrides ) ) {
			$current = get_option( 'bpwc_settings', [] );
			$merged  = array_replace_recursive( $current, $overrides );
			update_option( 'bpwc_settings', $merged );
		}
	}
}
