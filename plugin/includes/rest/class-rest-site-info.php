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
		$lang_settings = Settings::get_all()['language'] ?? [];

		$info = [
			'site_name'            => get_bloginfo( 'name' ),
			'site_url'             => home_url(),
			'language'             => Settings::get( 'general.language', 'de' ),
			'system_prompt'        => Settings::get( 'identity.system_prompt', '' ),
			'fallback_behavior'    => Settings::get( 'identity.fallback_behavior', '' ),
			'restrictions'         => Settings::get( 'identity.restrictions', '' ),
			'contact_email'        => Settings::get( 'identity.contact_email', '' ),
			'contact_phone'        => Settings::get( 'identity.contact_phone', '' ),
			'multilingual'         => ! empty( $lang_settings['multilingual'] ),
			'detection_method'     => $lang_settings['detection_method'] ?? 'url_prefix',
			'available_languages'  => $lang_settings['available_languages'] ?? '',
			'wpml_active'          => ! empty( $lang_settings['wpml_active'] ),
		];

		return $this->success( [ $info ], 1 );
	}
}
