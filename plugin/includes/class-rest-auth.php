<?php

namespace Bpwc;

class Rest_Auth {

	public static function verify_bearer_token( \WP_REST_Request $request ): bool|\WP_Error {
		$header = $request->get_header( 'Authorization' );

		if ( empty( $header ) ) {
			return new \WP_Error(
				'rest_forbidden',
				__( 'Authorization header missing.', 'botpress-webchat' ),
				[ 'status' => 401 ]
			);
		}

		if ( ! str_starts_with( $header, 'Bearer ' ) ) {
			return new \WP_Error(
				'rest_forbidden',
				__( 'Invalid authorization scheme.', 'botpress-webchat' ),
				[ 'status' => 401 ]
			);
		}

		$token = substr( $header, 7 );

		if ( ! Settings::verify_api_token( $token ) ) {
			return new \WP_Error(
				'rest_forbidden',
				__( 'Invalid API token.', 'botpress-webchat' ),
				[ 'status' => 401 ]
			);
		}

		return true;
	}
}
