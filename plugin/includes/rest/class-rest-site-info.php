<?php

namespace Bpwc\Rest;

use Bpwc\Settings;

class Rest_Site_Info extends Rest_Base_Controller {

	public function register_routes(): void {
		register_rest_route( self::NAMESPACE, '/bot/site-info', [
			'methods'             => \WP_REST_Server::READABLE,
			'callback'            => [ $this, 'get_info' ],
			'permission_callback' => [ $this, 'check_bot_token' ],
		] );
	}

	public function get_info( \WP_REST_Request $request ): \WP_REST_Response {
		$data_sources = Settings::get_all()['data_sources'];

		$info = [
			'site_name'    => get_bloginfo( 'name' ),
			'site_url'     => home_url(),
			'language'     => Settings::get( 'general.language', 'de' ),
			'data_sources' => [
				'contacts'     => ! empty( $data_sources['enable_contacts'] ),
				'products'     => ! empty( $data_sources['enable_products'] ),
				'downloads'    => ! empty( $data_sources['enable_downloads'] ),
				'country_reps' => ! empty( $data_sources['enable_country_reps'] ),
			],
		];

		return $this->success( [ $info ], 1 );
	}
}
