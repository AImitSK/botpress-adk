<?php

namespace Bpwc\Cpt;

class Cpt_Country_Rep extends Cpt_Base {

	protected function get_post_type(): string {
		return 'bpwc_country_rep';
	}

	protected function get_args(): array {
		return $this->base_args(
			__( 'Country Representative', 'botpress-webchat' ),
			__( 'Country Representatives', 'botpress-webchat' ),
			'dashicons-admin-site-alt3'
		);
	}

	protected function get_meta_fields(): array {
		return [
			'country_code' => [ 'type' => 'string', 'sanitize_callback' => 'sanitize_text_field' ],
			'country_name' => [ 'type' => 'string', 'sanitize_callback' => 'sanitize_text_field' ],
			'region'       => [ 'type' => 'string', 'sanitize_callback' => 'sanitize_text_field' ],
			'rep_name'     => [ 'type' => 'string', 'sanitize_callback' => 'sanitize_text_field' ],
			'rep_email'    => [ 'type' => 'string', 'sanitize_callback' => 'sanitize_email' ],
			'rep_phone'    => [ 'type' => 'string', 'sanitize_callback' => 'sanitize_text_field' ],
			'rep_company'  => [ 'type' => 'string', 'sanitize_callback' => 'sanitize_text_field' ],
			'rep_website'  => [ 'type' => 'string', 'sanitize_callback' => 'esc_url_raw' ],
		];
	}
}
