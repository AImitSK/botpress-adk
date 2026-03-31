<?php

namespace Bpwc;

class Activation {

	public static function activate(): void {
		$settings = Settings::get_all();
		update_option( 'bpwc_settings', $settings );

		Knowledge_Db::install();
		flush_rewrite_rules();

		// Auto-connect to Botpress if developer-config has bot_id.
		if ( ! empty( $settings['connection']['bot_id'] ) ) {
			Auto_Register::sync();
		}
	}

	public static function deactivate(): void {
		flush_rewrite_rules();
	}
}
