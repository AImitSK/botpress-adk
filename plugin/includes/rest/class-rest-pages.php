<?php

namespace Bpwc\Rest;

class Rest_Pages extends Rest_Base_Controller {

	public function register_routes(): void {
		register_rest_route( self::NAMESPACE, '/bot/pages', [
			'methods'             => \WP_REST_Server::READABLE,
			'callback'            => [ $this, 'get_items' ],
			'permission_callback' => [ $this, 'check_bot_token' ],
			'args'                => $this->search_args(),
		] );
	}

	public function get_items( \WP_REST_Request $request ): \WP_REST_Response {
		$args = [
			'post_type'      => 'page',
			'posts_per_page' => $request->get_param( 'per_page' ),
			'post_status'    => 'publish',
		];

		$search = $request->get_param( 'search' );
		if ( ! empty( $search ) ) {
			$args['s'] = $search;
		}

		$query = new \WP_Query( $args );
		$pages = [];

		foreach ( $query->posts as $post ) {
			$pages[] = [
				'id'      => $post->ID,
				'title'   => $post->post_title,
				'url'     => get_permalink( $post->ID ),
				'excerpt' => wp_trim_words( $post->post_content, 30 ),
			];
		}

		return $this->success( $pages, $query->found_posts );
	}
}
