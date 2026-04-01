<?php

namespace Bpwc;

class Rest_Auth {

	public static function verify_bearer_token( \WP_REST_Request $request ): bool|\WP_Error {
		$header = self::get_authorization_header( $request );

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

	/**
	 * Get the Authorization header from multiple sources.
	 * Apache with CGI/FastCGI often strips the Authorization header.
	 */
	private static function get_authorization_header( \WP_REST_Request $request ): string {
		// 1. Standard WP request header.
		$header = $request->get_header( 'Authorization' );
		if ( ! empty( $header ) ) {
			return $header;
		}

		// 2. Apache passes it via REDIRECT_HTTP_AUTHORIZATION.
		if ( ! empty( $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ) ) {
			return $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
		}

		// 3. Some setups use HTTP_AUTHORIZATION.
		if ( ! empty( $_SERVER['HTTP_AUTHORIZATION'] ) ) {
			return $_SERVER['HTTP_AUTHORIZATION'];
		}

		// 4. Try getallheaders() (Apache module).
		if ( function_exists( 'getallheaders' ) ) {
			$headers = getallheaders();
			foreach ( $headers as $name => $value ) {
				if ( strtolower( $name ) === 'authorization' ) {
					return $value;
				}
			}
		}

		// 5. Try apache_request_headers().
		if ( function_exists( 'apache_request_headers' ) ) {
			$headers = apache_request_headers();
			foreach ( $headers as $name => $value ) {
				if ( strtolower( $name ) === 'authorization' ) {
					return $value;
				}
			}
		}

		return '';
	}
}
