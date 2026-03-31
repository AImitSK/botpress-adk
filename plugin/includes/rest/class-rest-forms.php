<?php

namespace Bpwc\Rest;

class Rest_Forms extends Rest_Base_Controller {

	public function register_routes(): void {
		register_rest_route( self::NAMESPACE, '/bot/forms', [
			'methods'             => \WP_REST_Server::READABLE,
			'callback'            => [ $this, 'get_items' ],
			'permission_callback' => [ $this, 'check_bot_token' ],
			'args'                => $this->search_args(),
		] );
	}

	public function get_items( \WP_REST_Request $request ): \WP_REST_Response {
		$forms  = [];
		$search = strtolower( $request->get_param( 'search' ) );

		// Contact Form 7.
		if ( post_type_exists( 'wpcf7_contact_form' ) ) {
			$forms = array_merge( $forms, $this->get_cf7_forms( $search ) );
		}

		// Gravity Forms.
		if ( class_exists( 'GFAPI' ) ) {
			$forms = array_merge( $forms, $this->get_gravity_forms( $search ) );
		}

		// WPForms.
		if ( function_exists( 'wpforms' ) ) {
			$forms = array_merge( $forms, $this->get_wpforms( $search ) );
		}

		return $this->success( $forms, count( $forms ) );
	}

	private function get_cf7_forms( string $search ): array {
		$query = new \WP_Query( [
			'post_type'      => 'wpcf7_contact_form',
			'posts_per_page' => 20,
			'post_status'    => 'publish',
			's'              => $search,
		] );

		$forms = [];
		foreach ( $query->posts as $post ) {
			$forms[] = [
				'id'     => $post->ID,
				'title'  => $post->post_title,
				'plugin' => 'cf7',
				'url'    => $this->find_page_with_shortcode( '[contact-form-7 id="' . $post->ID . '"' ),
			];
		}

		return $forms;
	}

	private function get_gravity_forms( string $search ): array {
		$gf_forms = \GFAPI::get_forms( true );
		$forms    = [];

		foreach ( $gf_forms as $form ) {
			if ( ! empty( $search ) && false === stripos( $form['title'], $search ) ) {
				continue;
			}
			$forms[] = [
				'id'     => $form['id'],
				'title'  => $form['title'],
				'plugin' => 'gravity',
				'url'    => $this->find_page_with_shortcode( '[gravityform id="' . $form['id'] . '"' ),
			];
		}

		return $forms;
	}

	private function get_wpforms( string $search ): array {
		$query = new \WP_Query( [
			'post_type'      => 'wpforms',
			'posts_per_page' => 20,
			'post_status'    => 'publish',
			's'              => $search,
		] );

		$forms = [];
		foreach ( $query->posts as $post ) {
			$forms[] = [
				'id'     => $post->ID,
				'title'  => $post->post_title,
				'plugin' => 'wpforms',
				'url'    => $this->find_page_with_shortcode( '[wpforms id="' . $post->ID . '"' ),
			];
		}

		return $forms;
	}

	private function find_page_with_shortcode( string $shortcode_prefix ): string {
		global $wpdb;

		$page_id = $wpdb->get_var(
			$wpdb->prepare(
				"SELECT ID FROM {$wpdb->posts}
				 WHERE post_status = 'publish'
				   AND post_type IN ('page', 'post')
				   AND post_content LIKE %s
				 LIMIT 1",
				'%' . $wpdb->esc_like( $shortcode_prefix ) . '%'
			)
		);

		return $page_id ? get_permalink( $page_id ) : '';
	}
}
