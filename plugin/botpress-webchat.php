<?php
/**
 * Plugin Name: Botpress Webchat
 * Description: Botpress Webchat Widget with AI Support Bot
 * Version: 0.1.0
 * Author: Botpress Webchat
 * Text Domain: botpress-webchat
 * Requires PHP: 8.0
 * Requires at least: 6.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'BPWC_VERSION', '0.1.0' );
define( 'BPWC_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'BPWC_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

// PSR-4 Autoloader.
spl_autoload_register( function ( string $class ) {
	$prefix = 'Bpwc\\';
	if ( ! str_starts_with( $class, $prefix ) ) {
		return;
	}

	$relative = substr( $class, strlen( $prefix ) );
	// Convert namespace separators and class name to file path.
	// Bpwc\Rest\Rest_Settings → rest/class-rest-settings.php
	$parts = explode( '\\', $relative );
	$file  = array_pop( $parts );
	$file  = 'class-' . str_replace( '_', '-', strtolower( $file ) ) . '.php';

	$path = BPWC_PLUGIN_DIR . 'includes/';
	if ( ! empty( $parts ) ) {
		$path .= strtolower( implode( '/', $parts ) ) . '/';
	}
	$path .= $file;

	if ( file_exists( $path ) ) {
		require_once $path;
	}
} );

// Activation / Deactivation.
register_activation_hook( __FILE__, [ \Bpwc\Activation::class, 'activate' ] );
register_deactivation_hook( __FILE__, [ \Bpwc\Activation::class, 'deactivate' ] );

// Boot plugin.
add_action( 'plugins_loaded', function () {
	\Bpwc\Plugin::instance();
} );
