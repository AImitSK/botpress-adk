<?php

namespace Bpwc\Rest;

use Bpwc\Rest_Auth;

abstract class Rest_Base_Controller {

	protected const NAMESPACE = 'bpwc/v1';

	abstract public function register_routes(): void;

	public function check_bot_token( \WP_REST_Request $request ): bool|\WP_Error {
		return Rest_Auth::verify_bearer_token( $request );
	}

	protected function success( array $data, int $total ): \WP_REST_Response {
		return new \WP_REST_Response( [
			'success' => true,
			'data'    => $data,
			'total'   => $total,
		] );
	}

	protected function search_args(): array {
		return [
			'search' => [
				'type'              => 'string',
				'sanitize_callback' => 'sanitize_text_field',
				'default'           => '',
			],
			'per_page' => [
				'type'              => 'integer',
				'sanitize_callback' => 'absint',
				'default'           => 20,
				'maximum'           => 100,
			],
		];
	}
}
