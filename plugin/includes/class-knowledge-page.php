<?php

namespace Bpwc;

class Knowledge_Page {

	public static function register(): void {
		add_submenu_page(
			'botpress-webchat',
			__( 'Knowledge Base', 'botpress-webchat' ),
			__( 'Knowledge Base', 'botpress-webchat' ),
			'manage_options',
			'bpwc-knowledge',
			[ self::class, 'render' ]
		);
	}

	public static function render(): void {
		echo '<div id="bpwc-knowledge-root"></div>';
	}

	public static function enqueue_assets( string $hook ): void {
		if ( 'botpress-webchat_page_bpwc-knowledge' !== $hook ) {
			return;
		}

		// Hide WP admin notices.
		add_action( 'in_admin_header', function () {
			remove_all_actions( 'admin_notices' );
			remove_all_actions( 'all_admin_notices' );
		}, 999 );

		$asset_file = BPWC_PLUGIN_DIR . 'build/knowledge.asset.php';

		if ( ! file_exists( $asset_file ) ) {
			return;
		}

		$asset = require $asset_file;

		wp_enqueue_script(
			'bpwc-knowledge',
			BPWC_PLUGIN_URL . 'build/knowledge.js',
			$asset['dependencies'],
			$asset['version'],
			true
		);

		wp_enqueue_style(
			'bpwc-knowledge',
			BPWC_PLUGIN_URL . 'build/knowledge.css',
			[ 'wp-components' ],
			$asset['version']
		);

		wp_enqueue_style( 'wp-components' );
	}
}
