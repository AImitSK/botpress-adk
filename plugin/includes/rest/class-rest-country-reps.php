<?php

namespace Bpwc\Rest;

use Bpwc\Cpt\Cpt_Manager;

class Rest_Country_Reps extends Rest_Base_Controller {

	public function register_routes(): void {
		register_rest_route( self::NAMESPACE, '/bot/country-reps', [
			'methods'             => \WP_REST_Server::READABLE,
			'callback'            => [ $this, 'get_items' ],
			'permission_callback' => [ $this, 'check_bot_token' ],
			'args'                => array_merge( $this->search_args(), [
				'country' => [
					'type'              => 'string',
					'sanitize_callback' => 'sanitize_text_field',
					'default'           => '',
				],
				'region' => [
					'type'              => 'string',
					'sanitize_callback' => 'sanitize_text_field',
					'default'           => '',
				],
			] ),
		] );
	}

	public function get_items( \WP_REST_Request $request ): \WP_REST_Response {
		$cpt  = Cpt_Manager::get_instance( 'bpwc_country_rep' );
		$args = [
			'posts_per_page' => $request->get_param( 'per_page' ),
		];

		$search = $request->get_param( 'search' );
		if ( ! empty( $search ) ) {
			$args['s'] = $search;
		}

		$meta_query = [];
		$country    = $request->get_param( 'country' );
		if ( ! empty( $country ) ) {
			$meta_query[] = [
				'key'     => 'country_name',
				'value'   => $country,
				'compare' => 'LIKE',
			];
		}

		$region = $request->get_param( 'region' );
		if ( ! empty( $region ) ) {
			$meta_query[] = [
				'key'     => 'region',
				'value'   => $region,
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
