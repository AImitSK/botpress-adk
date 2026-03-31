<?php

namespace Bpwc;

class Admin_Page {

	public static function register(): void {
		add_menu_page(
			__( 'Botpress Webchat', 'botpress-webchat' ),
			__( 'Botpress Webchat', 'botpress-webchat' ),
			'manage_options',
			'botpress-webchat',
			[ self::class, 'render' ],
			'dashicons-format-chat',
			80
		);
	}

	public static function render(): void {
		echo '<div class="wrap"><div id="bpwc-admin-root"></div></div>';
	}

	public static function enqueue_assets( string $hook ): void {
		if ( 'toplevel_page_botpress-webchat' !== $hook ) {
			return;
		}

		$asset_file = BPWC_PLUGIN_DIR . 'build/index.asset.php';

		if ( ! file_exists( $asset_file ) ) {
			return;
		}

		$asset = require $asset_file;

		wp_enqueue_script(
			'bpwc-admin',
			BPWC_PLUGIN_URL . 'build/index.js',
			$asset['dependencies'],
			$asset['version'],
			true
		);

		wp_enqueue_style(
			'bpwc-admin',
			BPWC_PLUGIN_URL . 'build/style-index.css',
			[ 'wp-components' ],
			$asset['version']
		);

		wp_enqueue_style( 'wp-components' );
	}
}
