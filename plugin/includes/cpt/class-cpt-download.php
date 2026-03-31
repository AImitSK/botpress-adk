<?php

namespace Bpwc\Cpt;

class Cpt_Download extends Cpt_Base {

	protected function get_post_type(): string {
		return 'bpwc_download';
	}

	protected function get_args(): array {
		return $this->base_args(
			__( 'Download', 'botpress-webchat' ),
			__( 'Downloads', 'botpress-webchat' ),
			'dashicons-download'
		);
	}

	protected function get_meta_fields(): array {
		return [
			'file_url'        => [ 'type' => 'string', 'sanitize_callback' => 'esc_url_raw' ],
			'file_type'       => [ 'type' => 'string', 'sanitize_callback' => 'sanitize_text_field' ],
			'file_size'       => [ 'type' => 'string', 'sanitize_callback' => 'sanitize_text_field' ],
			'related_product' => [ 'type' => 'integer', 'sanitize_callback' => 'absint' ],
		];
	}
}
