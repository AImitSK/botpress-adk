<?php

namespace Bpwc;

class Shortcode {

	public static function init(): void {
		add_shortcode( 'botpress_webchat', [ Frontend::class, 'render_shortcode' ] );
	}
}
