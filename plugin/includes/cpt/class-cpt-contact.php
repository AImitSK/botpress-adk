<?php

namespace Bpwc\Cpt;

class Cpt_Contact extends Cpt_Base {

	protected function get_post_type(): string {
		return 'bpwc_contact';
	}

	protected function get_args(): array {
		return $this->base_args(
			__( 'Contact', 'botpress-webchat' ),
			__( 'Contacts', 'botpress-webchat' ),
			'dashicons-businessman'
		);
	}

	protected function get_meta_fields(): array {
		return [
			'email'      => [ 'type' => 'string', 'sanitize_callback' => 'sanitize_email' ],
			'phone'      => [ 'type' => 'string', 'sanitize_callback' => 'sanitize_text_field' ],
			'department' => [ 'type' => 'string', 'sanitize_callback' => 'sanitize_text_field' ],
			'role'       => [ 'type' => 'string', 'sanitize_callback' => 'sanitize_text_field' ],
			'location'   => [ 'type' => 'string', 'sanitize_callback' => 'sanitize_text_field' ],
			'photo_url'  => [ 'type' => 'string', 'sanitize_callback' => 'esc_url_raw' ],
		];
	}
}
