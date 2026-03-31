<?php

namespace Bpwc\Rest;

use Bpwc\Cpt\Cpt_Manager;

class Rest_Contacts extends Rest_Base_Controller {

	public function register_routes(): void {
		register_rest_route( self::NAMESPACE, '/bot/contacts', [
			'methods'             => \WP_REST_Server::READABLE,
			'callback'            => [ $this, 'get_items' ],
			'permission_callback' => [ $this, 'check_bot_token' ],
			'args'                => array_merge( $this->search_args(), [
				'department' => [
					'type'              => 'string',
					'sanitize_callback' => 'sanitize_text_field',
					'default'           => '',
				],
				'role' => [
					'type'              => 'string',
					'sanitize_callback' => 'sanitize_text_field',
					'default'           => '',
				],
			] ),
		] );
	}

	public function get_items( \WP_REST_Request $request ): \WP_REST_Response {
		$cpt  = Cpt_Manager::get_instance( 'bpwc_contact' );
		$args = [
			'posts_per_page' => $request->get_param( 'per_page' ),
		];

		$search = $request->get_param( 'search' );
		if ( ! empty( $search ) ) {
			$args['s'] = $search;
		}

		$meta_query = [];
		$department = $request->get_param( 'department' );
		if ( ! empty( $department ) ) {
			$meta_query[] = [
				'key'     => 'department',
				'value'   => $department,
				'compare' => 'LIKE',
			];
		}

		$role = $request->get_param( 'role' );
		if ( ! empty( $role ) ) {
			$meta_query[] = [
				'key'     => 'role',
				'value'   => $role,
				'compare' => 'LIKE',
			];
		}

		if ( ! empty( $meta_query ) ) {
			$args['meta_query'] = $meta_query;
		}

		$result = $cpt->get_flat_items( $args );

		return $this->success( $result['items'], $result['total'] );
	}
}
