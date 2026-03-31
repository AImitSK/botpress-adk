<?php

namespace Bpwc\Cpt;

abstract class Cpt_Base {

	abstract protected function get_post_type(): string;
	abstract protected function get_args(): array;
	abstract protected function get_meta_fields(): array;

	public function register(): void {
		register_post_type( $this->get_post_type(), $this->get_args() );
		$this->register_meta();
	}

	protected function register_meta(): void {
		foreach ( $this->get_meta_fields() as $key => $schema ) {
			register_post_meta(
				$this->get_post_type(),
				$key,
				array_merge(
					[
						'show_in_rest'  => true,
						'single'        => true,
						'auth_callback' => fn() => current_user_can( 'edit_posts' ),
					],
					$schema
				)
			);
		}
	}

	protected function base_args( string $singular, string $plural, string $icon ): array {
		return [
			'labels'       => [
				'name'               => $plural,
				'singular_name'      => $singular,
				'add_new_item'       => sprintf( __( 'Add New %s', 'botpress-webchat' ), $singular ),
				'edit_item'          => sprintf( __( 'Edit %s', 'botpress-webchat' ), $singular ),
				'new_item'           => sprintf( __( 'New %s', 'botpress-webchat' ), $singular ),
				'view_item'          => sprintf( __( 'View %s', 'botpress-webchat' ), $singular ),
				'search_items'       => sprintf( __( 'Search %s', 'botpress-webchat' ), $plural ),
				'not_found'          => sprintf( __( 'No %s found', 'botpress-webchat' ), strtolower( $plural ) ),
				'not_found_in_trash' => sprintf( __( 'No %s found in Trash', 'botpress-webchat' ), strtolower( $plural ) ),
			],
			'public'       => false,
			'show_ui'      => true,
			'show_in_rest' => true,
			'menu_icon'    => $icon,
			'supports'     => [ 'title', 'custom-fields' ],
			'has_archive'  => false,
		];
	}

	public function get_flat_items( array $args = [] ): array {
		$defaults = [
			'post_type'      => $this->get_post_type(),
			'posts_per_page' => 50,
			'post_status'    => 'publish',
		];

		$query = new \WP_Query( array_merge( $defaults, $args ) );
		$items = [];

		foreach ( $query->posts as $post ) {
			$item = [ 'id' => $post->ID, 'title' => $post->post_title ];
			foreach ( array_keys( $this->get_meta_fields() ) as $key ) {
				$item[ $key ] = get_post_meta( $post->ID, $key, true );
			}
			$items[] = $item;
		}

		return [
			'items' => $items,
			'total' => $query->found_posts,
		];
	}
}
