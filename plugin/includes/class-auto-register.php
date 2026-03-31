<?php

namespace Bpwc;

class Auto_Register {

	private const API_BASE = 'https://api.botpress.cloud/v1';

	/**
	 * Automatically register this WordPress site with the Botpress bot.
	 * Called after settings are saved — pushes wordpressBaseUrl and wpApiToken
	 * to the bot's configuration in Botpress Cloud.
	 */
	public static function sync(): array {
		$settings = Settings::get_all();
		$pat      = $settings['connection']['botpress_pat'];
		$bot_id   = $settings['connection']['bot_id'];

		if ( empty( $pat ) || empty( $bot_id ) ) {
			return [
				'success' => false,
				'message' => __( 'Bot ID or PAT missing.', 'botpress-webchat' ),
			];
		}

		// Ensure we have an API token for the bot.
		$token_hash = get_option( 'bpwc_api_token_hash', '' );
		if ( empty( $token_hash ) ) {
			$token = Settings::generate_api_token();
		} else {
			// Re-generate so we have the plain token to send.
			$token = Settings::generate_api_token();
		}

		// Determine the public WordPress URL.
		$wp_api_url = $settings['connection']['wp_api_url'];
		if ( empty( $wp_api_url ) ) {
			$wp_api_url = rest_url();
		}

		// Push configuration to Botpress Cloud.
		$response = wp_remote_request( self::API_BASE . '/bots/' . $bot_id, [
			'method'  => 'PUT',
			'headers' => [
				'Authorization' => 'Bearer ' . $pat,
				'Content-Type'  => 'application/json',
			],
			'body'    => wp_json_encode( [
				'configuration' => [
					'wordpressBaseUrl' => rtrim( $wp_api_url, '/' ),
					'wpApiToken'       => $token,
					'companyName'      => get_bloginfo( 'name' ),
					'language'         => $settings['general']['language'] ?? 'de',
				],
			] ),
			'timeout' => 15,
		] );

		if ( is_wp_error( $response ) ) {
			return [
				'success' => false,
				'message' => $response->get_error_message(),
			];
		}

		$code = wp_remote_retrieve_response_code( $response );
		if ( $code >= 200 && $code < 300 ) {
			return [
				'success' => true,
				'message' => __( 'Bot successfully connected to this website.', 'botpress-webchat' ),
			];
		}

		$body = wp_remote_retrieve_body( $response );
		return [
			'success' => false,
			'message' => sprintf( __( 'Botpress API error (%d): %s', 'botpress-webchat' ), $code, $body ),
		];
	}
}
