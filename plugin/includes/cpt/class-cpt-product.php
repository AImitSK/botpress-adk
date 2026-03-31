<?php

namespace Bpwc\Cpt;

class Cpt_Product extends Cpt_Base {

	protected function get_post_type(): string {
		return 'bpwc_product';
	}

	protected function get_args(): array {
		return $this->base_args(
			__( 'Product', 'botpress-webchat' ),
			__( 'Products', 'botpress-webchat' ),
			'dashicons-cart'
		);
	}

	protected function get_meta_fields(): array {
		return [
			'category'         => [ 'type' => 'string', 'sanitize_callback' => 'sanitize_text_field' ],
			'sku'              => [ 'type' => 'string', 'sanitize_callback' => 'sanitize_text_field' ],
			'inquiry_form_url' => [ 'type' => 'string', 'sanitize_callback' => 'esc_url_raw' ],
			'datasheet_url'    => [ 'type' => 'string', 'sanitize_callback' => 'esc_url_raw' ],
			'features'         => [ 'type' => 'string', 'sanitize_callback' => 'sanitize_textarea_field' ],
		];
	}
}
