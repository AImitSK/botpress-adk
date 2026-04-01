<?php
/**
 * Uninstall handler for Botpress Webchat plugin.
 * Removes ALL plugin data from the database.
 */

if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

global $wpdb;

// Delete all known options.
delete_option( 'bpwc_settings' );
delete_option( 'bpwc_api_token_hash' );
delete_option( 'bpwc_kb_db_version' );
delete_option( 'bpwc_inquiry_db_version' );
delete_option( 'bpwc_budget_notified' );

// Delete any remaining bpwc_ options (future-proof).
$wpdb->query( "DELETE FROM {$wpdb->options} WHERE option_name LIKE 'bpwc\_%'" );

// Delete all bpwc_ transients.
$wpdb->query( "DELETE FROM {$wpdb->options} WHERE option_name LIKE '_transient_bpwc\_%'" );
$wpdb->query( "DELETE FROM {$wpdb->options} WHERE option_name LIKE '_transient_timeout_bpwc\_%'" );

// Drop custom tables.
$wpdb->query( "DROP TABLE IF EXISTS {$wpdb->prefix}bpwc_sources" );
$wpdb->query( "DROP TABLE IF EXISTS {$wpdb->prefix}bpwc_inquiries" );
