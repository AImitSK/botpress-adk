<?php

namespace Bpwc\Rest;

use Bpwc\Cpt\Cpt_Manager;

class Rest_Products extends Rest_Base_Controller {

	public function register_routes(): void {
		register_rest_route( self::NAMESPACE, '/bot/products', [
			'methods'             => \WP_REST_Server::READABLE,
			'callback'            => [ $this, 'get_items' ],
			'permission_callback' => [ $this, 'check_bot_token' ],
			'args'                => array_merge( $this->search_args(), [
				'category' => [
					'type'              => 'string',
					'sanitize_callback' => 'sanitize_text_field',
					'default'           => '',
				],
			] ),
		] );
	}

	public function get_items( \WP_REST_Request $request ): \WP_REST_Response {
		$cpt  = Cpt_Manager::get_instance( 'bpwc_product' );
		$args = [
			'posts_per_page' => $request->get_param( 'per_page' ),
		];

		$search = $request->get_param( 'search' );
		if ( ! empty( $search ) ) {
			$args['s'] = $search;
		}

		$category = $request->get_param( 'category' );
		if ( ! empty( $category ) ) {
			$args['meta_query'] = [
				[
					'key'     => 'category',
					'value'   => $category,
					'compare' => 'LIKE',
				],
			];
		}

		$result = $cpt->get_flat_items( $args );

		return $this->success( $result['items'], $result['total'] );
	}
}
