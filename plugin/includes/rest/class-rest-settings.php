<?php

namespace Bpwc\Rest;

use Bpwc\Settings;
use Bpwc\Auto_Register;

class Rest_Settings {

	private const NAMESPACE = 'bpwc/v1';

	public function register_routes(): void {
		register_rest_route( self::NAMESPACE, '/settings', [
			[
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => [ $this, 'get_settings' ],
				'permission_callback' => [ $this, 'check_admin' ],
			],
			[
				'methods'             => \WP_REST_Server::CREATABLE,
				'callback'            => [ $this, 'update_settings' ],
				'permission_callback' => [ $this, 'check_admin' ],
			],
		] );

		register_rest_route( self::NAMESPACE, '/generate-token', [
			[
				'methods'             => \WP_REST_Server::CREATABLE,
				'callback'            => [ $this, 'generate_token' ],
				'permission_callback' => [ $this, 'check_admin' ],
			],
		] );
	}

	public function check_admin(): bool {
		return current_user_can( 'manage_options' );
	}

	public function get_settings( \WP_REST_Request $request ): \WP_REST_Response {
		$settings = Settings::get_all();
		// Never expose the token hash to the frontend.
		unset( $settings['connection']['api_token'] );

		return new \WP_REST_Response( [
			'success' => true,
			'data'    => $settings,
		] );
	}

	public function update_settings( \WP_REST_Request $request ): \WP_REST_Response {
		$body = $request->get_json_params();

		if ( empty( $body ) || ! is_array( $body ) ) {
			return new \WP_REST_Response( [
				'success' => false,
				'message' => __( 'Invalid request body.', 'botpress-webchat' ),
			], 400 );
		}

		// Prevent overwriting the token through settings update.
		unset( $body['connection']['api_token'] );

		Settings::update( $body );

		// Auto-register with Botpress Cloud if connection settings changed.
		$registration = null;
		if ( isset( $body['connection'] ) ) {
			$registration = Auto_Register::sync();
		}

		$response = [
			'success' => true,
			'data'    => Settings::get_all(),
		];

		if ( null !== $registration ) {
			$response['registration'] = $registration;
		}

		return new \WP_REST_Response( $response );
	}

	public function generate_token( \WP_REST_Request $request ): \WP_REST_Response {
		$token = Settings::generate_api_token();

		return new \WP_REST_Response( [
			'success' => true,
			'token'   => $token,
		] );
	}
}
