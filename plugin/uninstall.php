<?php
/**
 * Uninstall handler for Botpress Webchat plugin.
 */

if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

delete_option( 'bpwc_settings' );
delete_option( 'bpwc_api_token_hash' );
delete_option( 'bpwc_kb_db_version' );

global $wpdb;
$wpdb->query( "DROP TABLE IF EXISTS {$wpdb->prefix}bpwc_sources" );
