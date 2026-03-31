<?php

namespace Bpwc\Rest;

use Bpwc\Cpt\Cpt_Manager;

class Rest_Downloads extends Rest_Base_Controller {

	public function register_routes(): void {
		register_rest_route( self::NAMESPACE, '/bot/downloads', [
			'methods'             => \WP_REST_Server::READABLE,
			'callback'            => [ $this, 'get_items' ],
			'permission_callback' => [ $this, 'check_bot_token' ],
			'args'                => array_merge( $this->search_args(), [
				'file_type' => [
					'type'              => 'string',
					'sanitize_callback' => 'sanitize_text_field',
					'default'           => '',
				],
				'product' => [
					'type'              => 'integer',
					'sanitize_callback' => 'absint',
					'default'           => 0,
				],
			] ),
		] );
	}

	public function get_items( \WP_REST_Request $request ): \WP_REST_Response {
		$cpt  = Cpt_Manager::get_instance( 'bpwc_download' );
		$args = [
			'posts_per_page' => $request->get_param( 'per_page' ),
		];

		$search = $request->get_param( 'search' );
		if ( ! empty( $search ) ) {
			$args['s'] = $search;
		}

		$meta_query = [];
		$file_type  = $request->get_param( 'file_type' );
		if ( ! empty( $file_type ) ) {
			$meta_query[] = [
				'key'     => 'file_type',
				'value'   => $file_type,
				'compare' => '=',
			];
		}

		$product = $request->get_param( 'product' );
		if ( ! empty( $product ) ) {
			$meta_query[] = [
				'key'     => 'related_product',
				'value'   => $product,
				'compare' => '=',
			];
		}

		if ( ! empty( $meta_query ) ) {
			$args['meta_query'] = $meta_query;
		}

		$result = $cpt->get_flat_items( $args );

		return $this->success( $result['items'], $result['total'] );
	}
}
