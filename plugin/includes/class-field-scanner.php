<?php

namespace Bpwc;

class Field_Scanner {

	/**
	 * Get all public + show_ui post types with their fields.
	 */
	public static function get_post_types(): array {
		$post_types = get_post_types( [ 'show_ui' => true ], 'objects' );
		$result     = [];

		$exclude = [ 'attachment', 'wp_block', 'wp_template', 'wp_template_part', 'wp_navigation', 'wp_global_styles' ];

		foreach ( $post_types as $pt ) {
			if ( in_array( $pt->name, $exclude, true ) ) {
				continue;
			}

			$result[] = [
				'name'   => $pt->name,
				'label'  => $pt->label,
				'count'  => (int) wp_count_posts( $pt->name )->publish,
				'fields' => self::get_fields_for_post_type( $pt->name ),
			];
		}

		return $result;
	}

	/**
	 * Get all available fields for a post type.
	 */
	public static function get_fields_for_post_type( string $post_type ): array {
		$fields = [];

		// Core fields.
		$fields[] = [ 'key' => 'post_title', 'label' => 'Title', 'source' => 'core' ];
		$fields[] = [ 'key' => 'post_content', 'label' => 'Content', 'source' => 'core' ];
		$fields[] = [ 'key' => 'post_excerpt', 'label' => 'Excerpt', 'source' => 'core' ];
		$fields[] = [ 'key' => 'post_date', 'label' => 'Date', 'source' => 'core' ];
		$fields[] = [ 'key' => 'permalink', 'label' => 'Permalink', 'source' => 'core' ];

		// ACF fields.
		$fields = array_merge( $fields, self::get_acf_fields( $post_type ) );

		// Registered post meta.
		$fields = array_merge( $fields, self::get_registered_meta( $post_type ) );

		return $fields;
	}

	/**
	 * Get ACF field groups + fields for a post type.
	 */
	private static function get_acf_fields( string $post_type ): array {
		if ( ! function_exists( 'acf_get_field_groups' ) ) {
			return [];
		}

		$fields = [];
		$groups = acf_get_field_groups( [ 'post_type' => $post_type ] );

		foreach ( $groups as $group ) {
			$group_fields = acf_get_fields( $group['key'] );
			if ( ! $group_fields ) {
				continue;
			}

			foreach ( $group_fields as $field ) {
				$fields[] = [
					'key'    => 'acf.' . $field['name'],
					'label'  => $field['label'] . ' (ACF)',
					'source' => 'acf',
					'type'   => $field['type'],
					'group'  => $group['title'],
				];
			}
		}

		return $fields;
	}

	/**
	 * Get registered post meta fields.
	 */
	private static function get_registered_meta( string $post_type ): array {
		$registered = get_registered_meta_keys( 'post', $post_type );
		$fields     = [];
		$acf_keys   = [];

		// Collect ACF keys to avoid duplicates.
		if ( function_exists( 'acf_get_field_groups' ) ) {
			$groups = acf_get_field_groups( [ 'post_type' => $post_type ] );
			foreach ( $groups as $group ) {
				$group_fields = acf_get_fields( $group['key'] );
				if ( $group_fields ) {
					foreach ( $group_fields as $f ) {
						$acf_keys[] = $f['name'];
					}
				}
			}
		}

		foreach ( $registered as $key => $schema ) {
			// Skip internal/ACF meta.
			if ( str_starts_with( $key, '_' ) || in_array( $key, $acf_keys, true ) ) {
				continue;
			}

			$fields[] = [
				'key'    => 'meta.' . $key,
				'label'  => $key . ' (Meta)',
				'source' => 'meta',
				'type'   => $schema['type'] ?? 'string',
			];
		}

		return $fields;
	}

	/**
	 * Fetch data from a post type using field mapping.
	 */
	public static function query_mapped_data( string $post_type, array $field_map, string $search = '', int $per_page = 50 ): array {
		// Load all published posts, then filter in PHP.
		// This is more reliable than WP_Query meta_query for searching across
		// both post titles and arbitrary meta fields.
		$args = [
			'post_type'      => $post_type,
			'posts_per_page' => 200,
			'post_status'    => 'publish',
		];

		$query = new \WP_Query( $args );
		$items = [];

		foreach ( $query->posts as $post ) {
			$item = [];
			foreach ( $field_map as $bot_field => $wp_field ) {
				$item[ $bot_field ] = self::get_field_value( $post, $wp_field );
			}

			// Filter by search term — match against ANY mapped field value.
			if ( ! empty( $search ) ) {
				$match = false;
				foreach ( $item as $value ) {
					if ( is_string( $value ) && stripos( $value, $search ) !== false ) {
						$match = true;
						break;
					}
				}
				if ( ! $match ) {
					continue;
				}
			}

			$items[] = $item;
		}

		// Apply per_page limit after filtering.
		$total = count( $items );
		$items = array_slice( $items, 0, $per_page );

		return [
			'data'  => $items,
			'total' => $total,
		];
	}

	/**
	 * Resolve a field value from a post.
	 */
	private static function get_field_value( \WP_Post $post, string $field_key ): mixed {
		// Core fields.
		if ( 'post_title' === $field_key ) {
			return $post->post_title;
		}
		if ( 'post_content' === $field_key ) {
			return wp_strip_all_tags( $post->post_content );
		}
		if ( 'post_excerpt' === $field_key ) {
			return $post->post_excerpt;
		}
		if ( 'post_date' === $field_key ) {
			return $post->post_date;
		}
		if ( 'permalink' === $field_key ) {
			return get_permalink( $post );
		}

		// ACF fields.
		if ( str_starts_with( $field_key, 'acf.' ) ) {
			$acf_key = substr( $field_key, 4 );
			if ( function_exists( 'get_field' ) ) {
				return get_field( $acf_key, $post->ID ) ?: '';
			}
			return get_post_meta( $post->ID, $acf_key, true );
		}

		// Meta fields.
		if ( str_starts_with( $field_key, 'meta.' ) ) {
			$meta_key = substr( $field_key, 5 );
			return get_post_meta( $post->ID, $meta_key, true );
		}

		return '';
	}
}
