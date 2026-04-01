<?php

namespace Bpwc;

class Usage_Page {

	public static function register(): void {
		add_submenu_page(
			'botpress-webchat',
			__( 'Usage', 'botpress-webchat' ),
			__( 'Usage', 'botpress-webchat' ),
			'manage_options',
			'bpwc-usage',
			[ self::class, 'render' ]
		);
	}

	public static function render(): void {
		echo '<div id="bpwc-usage-root"></div>';
	}

	public static function enqueue_assets( string $hook ): void {
		if ( 'botpress-webchat_page_bpwc-usage' !== $hook ) {
			return;
		}

		add_action( 'in_admin_header', function () {
			remove_all_actions( 'admin_notices' );
			remove_all_actions( 'all_admin_notices' );
		}, 999 );

		$asset_file = BPWC_PLUGIN_DIR . 'build/usage.asset.php';

		if ( ! file_exists( $asset_file ) ) {
			return;
		}

		$asset = require $asset_file;

		wp_enqueue_script(
			'bpwc-usage',
			BPWC_PLUGIN_URL . 'build/usage.js',
			$asset['dependencies'],
			$asset['version'],
			true
		);

		wp_enqueue_style(
			'bpwc-usage',
			BPWC_PLUGIN_URL . 'build/usage.css',
			[ 'wp-components' ],
			$asset['version']
		);

		wp_enqueue_style( 'wp-components' );
	}
}
