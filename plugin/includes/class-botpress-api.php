<?php

namespace Bpwc;

class Botpress_Api {

	private const API_BASE = 'https://api.botpress.cloud/v1';
	private const CACHE_TTL = 300; // 5 minutes.

	private string $pat;
	private string $bot_id;

	public function __construct() {
		$this->pat    = Settings::get( 'connection.botpress_pat', '' );
		$this->bot_id = Settings::get( 'connection.bot_id', '' );
	}

	public function is_configured(): bool {
		return ! empty( $this->pat ) && ! empty( $this->bot_id );
	}

	/**
	 * List conversations with pagination.
	 */
	public function list_conversations( int $limit = 25, string $next_token = '' ): array|false {
		$cache_key = 'bpwc_convos_' . md5( $limit . $next_token );
		$cached    = get_transient( $cache_key );

		if ( false !== $cached ) {
			return $cached;
		}

		$params = [ 'limit' => $limit ];
		if ( ! empty( $next_token ) ) {
			$params['nextToken'] = $next_token;
		}

		$result = $this->request( 'chat/conversations', $params );

		if ( false !== $result ) {
			set_transient( $cache_key, $result, self::CACHE_TTL );
		}

		return $result;
	}

	/**
	 * Get a single conversation by ID.
	 */
	public function get_conversation( string $conversation_id ): array|false {
		$cache_key = 'bpwc_convo_' . md5( $conversation_id );
		$cached    = get_transient( $cache_key );

		if ( false !== $cached ) {
			return $cached;
		}

		$result = $this->request( 'chat/conversations/' . $conversation_id );

		if ( false !== $result ) {
			set_transient( $cache_key, $result, self::CACHE_TTL );
		}

		return $result;
	}

	/**
	 * List messages for a conversation.
	 */
	public function list_messages( string $conversation_id, int $limit = 100, string $next_token = '' ): array|false {
		$cache_key = 'bpwc_msgs_' . md5( $conversation_id . $limit . $next_token );
		$cached    = get_transient( $cache_key );

		if ( false !== $cached ) {
			return $cached;
		}

		$params = [
			'conversationId' => $conversation_id,
			'limit'          => $limit,
		];
		if ( ! empty( $next_token ) ) {
			$params['nextToken'] = $next_token;
		}

		$result = $this->request( 'chat/messages', $params );

		if ( false !== $result ) {
			set_transient( $cache_key, $result, self::CACHE_TTL );
		}

		return $result;
	}

	/**
	 * Make an authenticated GET request to the Botpress Cloud API.
	 */
	private function request( string $endpoint, array $params = [] ): array|false {
		$url = self::API_BASE . '/' . $endpoint;

		if ( ! empty( $params ) ) {
			$url .= '?' . http_build_query( $params );
		}

		$response = wp_remote_get( $url, [
			'headers' => [
				'Authorization' => 'Bearer ' . $this->pat,
				'x-bot-id'     => $this->bot_id,
				'Content-Type'  => 'application/json',
			],
			'timeout' => 15,
		] );

		if ( is_wp_error( $response ) ) {
			return false;
		}

		$code = wp_remote_retrieve_response_code( $response );
		if ( $code < 200 || $code >= 300 ) {
			return false;
		}

		$body = wp_remote_retrieve_body( $response );
		return json_decode( $body, true ) ?: false;
	}
}
