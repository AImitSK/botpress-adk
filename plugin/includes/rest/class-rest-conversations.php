<?php

namespace Bpwc\Rest;

use Bpwc\Botpress_Api;

class Rest_Conversations {

	private const NAMESPACE = 'bpwc/v1';

	public function register_routes(): void {
		register_rest_route( self::NAMESPACE, '/conversations', [
			'methods'             => \WP_REST_Server::READABLE,
			'callback'            => [ $this, 'list_conversations' ],
			'permission_callback' => [ $this, 'check_admin' ],
			'args'                => [
				'limit' => [
					'type'    => 'integer',
					'default' => 25,
				],
				'next_token' => [
					'type'    => 'string',
					'default' => '',
				],
			],
		] );

		register_rest_route( self::NAMESPACE, '/conversations/(?P<id>[a-zA-Z0-9_-]+)', [
			'methods'             => \WP_REST_Server::READABLE,
			'callback'            => [ $this, 'get_conversation' ],
			'permission_callback' => [ $this, 'check_admin' ],
		] );

		register_rest_route( self::NAMESPACE, '/conversations/export', [
			'methods'             => \WP_REST_Server::READABLE,
			'callback'            => [ $this, 'export_csv' ],
			'permission_callback' => [ $this, 'check_admin' ],
		] );
	}

	public function check_admin(): bool {
		return current_user_can( 'manage_options' );
	}

	public function list_conversations( \WP_REST_Request $request ): \WP_REST_Response {
		$api = new Botpress_Api();

		if ( ! $api->is_configured() ) {
			return new \WP_REST_Response( [
				'success' => false,
				'message' => __( 'Botpress API not configured. Please set Bot ID and Personal Access Token.', 'botpress-webchat' ),
			], 400 );
		}

		$result = $api->list_conversations(
			$request->get_param( 'limit' ),
			$request->get_param( 'next_token' )
		);

		if ( false === $result ) {
			return new \WP_REST_Response( [
				'success' => false,
				'message' => __( 'Failed to fetch conversations from Botpress.', 'botpress-webchat' ),
			], 502 );
		}

		return new \WP_REST_Response( [
			'success' => true,
			'data'    => $result,
		] );
	}

	public function get_conversation( \WP_REST_Request $request ): \WP_REST_Response {
		$api = new Botpress_Api();

		if ( ! $api->is_configured() ) {
			return new \WP_REST_Response( [
				'success' => false,
				'message' => __( 'Botpress API not configured.', 'botpress-webchat' ),
			], 400 );
		}

		$id = $request->get_param( 'id' );

		$conversation = $api->get_conversation( $id );
		$messages     = $api->list_messages( $id );

		if ( false === $conversation ) {
			return new \WP_REST_Response( [
				'success' => false,
				'message' => __( 'Conversation not found.', 'botpress-webchat' ),
			], 404 );
		}

		return new \WP_REST_Response( [
			'success' => true,
			'data'    => [
				'conversation' => $conversation,
				'messages'     => $messages['messages'] ?? [],
			],
		] );
	}

	public function export_csv( \WP_REST_Request $request ): \WP_REST_Response {
		$api = new Botpress_Api();

		if ( ! $api->is_configured() ) {
			return new \WP_REST_Response( [
				'success' => false,
				'message' => __( 'Botpress API not configured.', 'botpress-webchat' ),
			], 400 );
		}

		$conversations = $api->list_conversations( 100 );
		if ( false === $conversations || empty( $conversations['conversations'] ) ) {
			return new \WP_REST_Response( [
				'success' => false,
				'message' => __( 'No conversations found.', 'botpress-webchat' ),
			], 404 );
		}

		$rows = [];
		$rows[] = [ 'Date', 'Conversation ID', 'Messages', 'First Message' ];

		foreach ( $conversations['conversations'] as $convo ) {
			$messages  = $api->list_messages( $convo['id'], 5 );
			$first_msg = '';
			$msg_count = 0;

			if ( ! empty( $messages['messages'] ) ) {
				$msg_count = count( $messages['messages'] );
				foreach ( $messages['messages'] as $msg ) {
					if ( ! empty( $msg['payload']['text'] ) && 'user' === ( $msg['direction'] ?? '' ) ) {
						$first_msg = $msg['payload']['text'];
						break;
					}
				}
			}

			$rows[] = [
				$convo['createdAt'] ?? '',
				$convo['id'] ?? '',
				$msg_count,
				$first_msg,
			];
		}

		$csv = '';
		foreach ( $rows as $row ) {
			$csv .= implode( ',', array_map( function ( $field ) {
				return '"' . str_replace( '"', '""', (string) $field ) . '"';
			}, $row ) ) . "\n";
		}

		return new \WP_REST_Response( [
			'success'  => true,
			'csv'      => $csv,
			'filename' => 'conversations_' . gmdate( 'Y-m-d' ) . '.csv',
		] );
	}
}
