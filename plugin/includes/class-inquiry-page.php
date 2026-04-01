<?php

namespace Bpwc;

class Inquiry_Page {

	public static function register(): void {
		try {
			$count = Inquiry_Db::count_new();
		} catch ( \Throwable $e ) {
			$count = 0;
		}
		$bubble   = $count > 0 ? ' <span class="awaiting-mod">' . $count . '</span>' : '';

		add_submenu_page(
			'botpress-webchat',
			__( 'Inquiries', 'botpress-webchat' ),
			__( 'Inquiries', 'botpress-webchat' ) . $bubble,
			'manage_options',
			'bpwc-inquiries',
			[ self::class, 'render' ]
		);
	}

	public static function render(): void {
		echo '<div id="bpwc-inquiries-root"></div>';
	}

	public static function enqueue_assets( string $hook ): void {
		if ( 'botpress-webchat_page_bpwc-inquiries' !== $hook ) {
			return;
		}

		add_action( 'in_admin_header', function () {
			remove_all_actions( 'admin_notices' );
			remove_all_actions( 'all_admin_notices' );
		}, 999 );

		$asset_file = BPWC_PLUGIN_DIR . 'build/inquiries.asset.php';

		if ( ! file_exists( $asset_file ) ) {
			return;
		}

		$asset = require $asset_file;

		wp_enqueue_script(
			'bpwc-inquiries',
			BPWC_PLUGIN_URL . 'build/inquiries.js',
			$asset['dependencies'],
			$asset['version'],
			true
		);

		wp_enqueue_style(
			'bpwc-inquiries',
			BPWC_PLUGIN_URL . 'build/inquiries.css',
			[ 'wp-components' ],
			$asset['version']
		);

		wp_enqueue_style( 'wp-components' );
	}
}
