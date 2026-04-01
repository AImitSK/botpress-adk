<?php

namespace Bpwc\Rest;

use Bpwc\Inquiry_Db;
use Bpwc\Sendgrid;

class Rest_Inquiries extends Rest_Base_Controller {

	public function register_routes(): void {
		// Bot endpoint — agent creates inquiry.
		register_rest_route( self::NAMESPACE, '/bot/inquiry', [
			'methods'             => \WP_REST_Server::CREATABLE,
			'callback'            => [ $this, 'create_inquiry' ],
			'permission_callback' => [ $this, 'check_bot_token' ],
			'args'                => [
				'name'            => [ 'type' => 'string', 'required' => true ],
				'email'           => [ 'type' => 'string', 'default' => '' ],
				'phone'           => [ 'type' => 'string', 'default' => '' ],
				'message'         => [ 'type' => 'string', 'required' => true ],
				'conversation_id' => [ 'type' => 'string', 'default' => '' ],
			],
		] );

		// Admin endpoints.
		register_rest_route( self::NAMESPACE, '/inquiries', [
			'methods'             => \WP_REST_Server::READABLE,
			'callback'            => [ $this, 'list_inquiries' ],
			'permission_callback' => [ $this, 'check_admin' ],
			'args'                => [
				'limit'  => [ 'type' => 'integer', 'default' => 50 ],
				'offset' => [ 'type' => 'integer', 'default' => 0 ],
				'status' => [ 'type' => 'string', 'default' => '' ],
			],
		] );

		register_rest_route( self::NAMESPACE, '/inquiries/(?P<id>\d+)/status', [
			'methods'             => \WP_REST_Server::CREATABLE,
			'callback'            => [ $this, 'update_status' ],
			'permission_callback' => [ $this, 'check_admin' ],
			'args'                => [
				'status' => [ 'type' => 'string', 'required' => true, 'enum' => [ 'new', 'read', 'replied', 'archived' ] ],
			],
		] );
	}

	public function check_admin(): bool {
		return current_user_can( 'manage_options' );
	}

	/**
	 * POST /bot/inquiry — Agent creates an inquiry.
	 */
	public function create_inquiry( \WP_REST_Request $request ): \WP_REST_Response {
		$data = [
			'name'            => $request->get_param( 'name' ),
			'email'           => $request->get_param( 'email' ),
			'phone'           => $request->get_param( 'phone' ),
			'message'         => $request->get_param( 'message' ),
			'conversation_id' => $request->get_param( 'conversation_id' ),
		];

		$id = Inquiry_Db::create( $data );

		if ( ! $id ) {
			return new \WP_REST_Response( [
				'success' => false,
				'message' => 'Failed to save inquiry.',
			], 500 );
		}

		$inquiry = Inquiry_Db::get( $id );

		// Send notifications.
		$notify_sent  = Sendgrid::notify_team( $inquiry );
		$confirm_sent = Sendgrid::confirm_customer( $inquiry );

		// Update notification status.
		global $wpdb;
		$wpdb->update( Inquiry_Db::table(), [
			'notify_sent'  => $notify_sent ? 1 : 0,
			'confirm_sent' => $confirm_sent ? 1 : 0,
		], [ 'id' => $id ] );

		return new \WP_REST_Response( [
			'success'       => true,
			'inquiry_id'    => $id,
			'notify_sent'   => $notify_sent,
			'confirm_sent'  => $confirm_sent,
		] );
	}

	/**
	 * GET /inquiries — Admin list.
	 */
	public function list_inquiries( \WP_REST_Request $request ): \WP_REST_Response {
		$result = Inquiry_Db::list(
			$request->get_param( 'limit' ),
			$request->get_param( 'offset' ),
			$request->get_param( 'status' )
		);

		return new \WP_REST_Response( [
			'success' => true,
			'data'    => $result['items'],
			'total'   => $result['total'],
		] );
	}

	/**
	 * POST /inquiries/{id}/status — Update status.
	 */
	public function update_status( \WP_REST_Request $request ): \WP_REST_Response {
		$id     = (int) $request->get_param( 'id' );
		$status = $request->get_param( 'status' );

		$updated = Inquiry_Db::update_status( $id, $status );

		return new \WP_REST_Response( [
			'success' => $updated,
		] );
	}
}
