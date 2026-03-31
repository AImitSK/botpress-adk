<?php

namespace Bpwc;

class Activation {

	public static function activate(): void {
		$settings = Settings::get_all();
		update_option( 'bpwc_settings', $settings );

		flush_rewrite_rules();
	}

	public static function deactivate(): void {
		flush_rewrite_rules();
	}
}
