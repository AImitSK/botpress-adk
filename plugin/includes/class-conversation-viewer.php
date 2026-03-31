<?php

namespace Bpwc;

class Conversation_Viewer {

	public static function register(): void {
		add_submenu_page(
			'botpress-webchat',
			__( 'Conversations', 'botpress-webchat' ),
			__( 'Conversations', 'botpress-webchat' ),
			'manage_options',
			'bpwc-conversations',
			[ self::class, 'render' ]
		);
	}

	public static function render(): void {
		echo '<div class="wrap"><div id="bpwc-conversations-root"></div></div>';
	}

	public static function enqueue_assets( string $hook ): void {
		if ( 'botpress-webchat_page_bpwc-conversations' !== $hook ) {
			return;
		}

		$asset_file = BPWC_PLUGIN_DIR . 'build/conversations.asset.php';

		if ( ! file_exists( $asset_file ) ) {
			return;
		}

		$asset = require $asset_file;

		wp_enqueue_script(
			'bpwc-conversations',
			BPWC_PLUGIN_URL . 'build/conversations.js',
			$asset['dependencies'],
			$asset['version'],
			true
		);

		wp_enqueue_style(
			'bpwc-conversations',
			BPWC_PLUGIN_URL . 'build/conversations.css',
			[ 'wp-components' ],
			$asset['version']
		);

		wp_enqueue_style( 'wp-components' );
	}
}
