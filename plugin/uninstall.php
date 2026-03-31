<?php
/**
 * Uninstall handler for Botpress Webchat plugin.
 */

if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

delete_option( 'bpwc_settings' );
delete_option( 'bpwc_api_token_hash' );
