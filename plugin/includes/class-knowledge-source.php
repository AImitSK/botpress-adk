<?php

namespace Bpwc;

use Bpwc\Field_Scanner;

class Knowledge_Source {

	public int $id = 0;
	public string $name = '';
	public string $type = 'text';
	public string $status = 'active';
	public array $config = [];
	public string $prompt = '';
	public string $cached_content = '';
	public ?string $last_synced = null;
	public int $sort_order = 0;
	public string $created_at = '';
	public string $updated_at = '';

	private static function table(): string {
		return Knowledge_Db::get_table_name();
	}

	public static function find( int $id ): ?self {
		global $wpdb;
		$row = $wpdb->get_row(
			$wpdb->prepare( "SELECT * FROM " . self::table() . " WHERE id = %d", $id ),
			ARRAY_A
		);

		return $row ? self::from_row( $row ) : null;
	}

	public static function all( string $status = '' ): array {
		global $wpdb;
		$table = self::table();

		$sql = "SELECT * FROM {$table}";
		if ( ! empty( $status ) ) {
			$sql .= $wpdb->prepare( " WHERE status = %s", $status );
		}
		$sql .= " ORDER BY sort_order ASC, created_at DESC";

		$rows = $wpdb->get_results( $sql, ARRAY_A );
		return array_map( [ self::class, 'from_row' ], $rows ?: [] );
	}

	public function save(): bool {
		global $wpdb;
		$table = self::table();

		$data = [
			'name'           => $this->name,
			'type'           => $this->type,
			'status'         => $this->status,
			'config'         => wp_json_encode( $this->config ),
			'prompt'         => $this->prompt,
			'cached_content' => $this->cached_content,
			'last_synced'    => $this->last_synced,
			'sort_order'     => $this->sort_order,
		];

		$formats = [ '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%d' ];

		if ( $this->id > 0 ) {
			$result = $wpdb->update( $table, $data, [ 'id' => $this->id ], $formats, [ '%d' ] );
			return false !== $result;
		}

		$result = $wpdb->insert( $table, $data, $formats );
		if ( false !== $result ) {
			$this->id = (int) $wpdb->insert_id;
			return true;
		}

		return false;
	}

	public function delete(): bool {
		global $wpdb;
		if ( $this->id <= 0 ) {
			return false;
		}
		return false !== $wpdb->delete( self::table(), [ 'id' => $this->id ], [ '%d' ] );
	}

	public function to_array(): array {
		return [
			'id'             => $this->id,
			'name'           => $this->name,
			'type'           => $this->type,
			'status'         => $this->status,
			'config'         => $this->config,
			'prompt'         => $this->prompt,
			'cached_content' => $this->cached_content,
			'last_synced'    => $this->last_synced,
			'sort_order'     => $this->sort_order,
			'created_at'     => $this->created_at,
			'updated_at'     => $this->updated_at,
		];
	}

	private static function from_row( array $row ): self {
		$source                 = new self();
		$source->id             = (int) $row['id'];
		$source->name           = $row['name'];
		$source->type           = $row['type'];
		$source->status         = $row['status'];
		$source->config         = json_decode( $row['config'] ?: '{}', true ) ?: [];
		$source->prompt         = $row['prompt'];
		$source->cached_content = $row['cached_content'];
		$source->last_synced    = $row['last_synced'];
		$source->sort_order     = (int) $row['sort_order'];
		$source->created_at     = $row['created_at'];
		$source->updated_at     = $row['updated_at'];

		return $source;
	}

	/**
	 * Get a summary for the bot (no cached_content to save tokens).
	 */
	public function to_bot_summary(): array {
		return [
			'id'     => $this->id,
			'name'   => $this->name,
			'type'   => $this->type,
			'prompt' => $this->prompt,
			'fields' => $this->config['field_map'] ?? [],
		];
	}

	/**
	 * Query this source's data based on type.
	 */
	public function query( string $search = '' ): array {
		switch ( $this->type ) {
			case 'text':
				return $this->query_text( $search );
			case 'table':
				return $this->query_table( $search );
			case 'wp_data':
				return $this->query_wp_data( $search );
			case 'internal_pages':
				return $this->query_internal_pages( $search );
			case 'file':
				return $this->query_file( $search );
			case 'external_pages':
			case 'sitemap':
			case 'rss':
				return $this->query_cached( $search );
			default:
				return [ 'data' => [], 'total' => 0 ];
		}
	}

	private function query_text( string $search ): array {
		$content = $this->config['content'] ?? '';
		if ( ! empty( $search ) && false === stripos( $content, $search ) ) {
			return [ 'data' => [], 'total' => 0 ];
		}
		return [
			'data'  => [ [ 'content' => $content ] ],
			'total' => 1,
		];
	}

	private function query_wp_data( string $search ): array {
		$post_type = $this->config['post_type'] ?? '';
		$field_map = $this->config['field_map'] ?? [];

		if ( empty( $post_type ) || empty( $field_map ) ) {
			return [ 'data' => [], 'total' => 0 ];
		}

		return Field_Scanner::query_mapped_data( $post_type, $field_map, $search );
	}

	private function query_table( string $search ): array {
		$columns = $this->config['columns'] ?? [];
		$rows    = $this->config['rows'] ?? [];

		if ( ! empty( $search ) ) {
			$rows = array_filter( $rows, function ( $row ) use ( $search ) {
				foreach ( $row as $cell ) {
					if ( false !== stripos( (string) $cell, $search ) ) {
						return true;
					}
				}
				return false;
			} );
			$rows = array_values( $rows );
		}

		return [
			'data'    => $rows,
			'columns' => $columns,
			'total'   => count( $rows ),
		];
	}

	private function query_file( string $search ): array {
		$attachment_id = $this->config['attachment_id'] ?? 0;
		if ( empty( $attachment_id ) ) {
			return [ 'data' => [], 'total' => 0 ];
		}

		// Use cached content if available.
		$content = $this->cached_content;
		if ( empty( $content ) ) {
			$content = File_Extractor::extract( $attachment_id );
			if ( ! empty( $content ) ) {
				$this->cached_content = $content;
				$this->last_synced    = current_time( 'mysql' );
				$this->save();
			}
		}

		if ( ! empty( $search ) && false === stripos( $content, $search ) ) {
			return [ 'data' => [], 'total' => 0 ];
		}

		return [
			'data'  => [ [ 'content' => $content ] ],
			'total' => 1,
		];
	}

	private function query_internal_pages( string $search ): array {
		$post_ids = $this->config['post_ids'] ?? [];

		if ( empty( $post_ids ) ) {
			return [ 'data' => [], 'total' => 0 ];
		}

		$args = [
			'post__in'       => $post_ids,
			'post_type'      => 'any',
			'posts_per_page' => 100,
			'post_status'    => 'publish',
		];

		if ( ! empty( $search ) ) {
			$args['s'] = $search;
		}

		$query = new \WP_Query( $args );
		$pages = [];

		foreach ( $query->posts as $post ) {
			$pages[] = [
				'title'   => $post->post_title,
				'url'     => get_permalink( $post ),
				'content' => wp_strip_all_tags( $post->post_content ),
			];
		}

		return [
			'data'  => $pages,
			'total' => count( $pages ),
		];
	}

	/**
	 * Query from cached content (external pages, sitemap, RSS).
	 */
	private function query_cached( string $search ): array {
		$content = $this->cached_content;
		if ( empty( $content ) ) {
			return [ 'data' => [], 'total' => 0 ];
		}

		$entries = json_decode( $content, true );
		if ( ! is_array( $entries ) ) {
			// Plain text cache.
			if ( ! empty( $search ) && false === stripos( $content, $search ) ) {
				return [ 'data' => [], 'total' => 0 ];
			}
			return [
				'data'  => [ [ 'content' => $content ] ],
				'total' => 1,
			];
		}

		if ( ! empty( $search ) ) {
			$entries = array_filter( $entries, function ( $entry ) use ( $search ) {
				return false !== stripos( wp_json_encode( $entry ), $search );
			} );
			$entries = array_values( $entries );
		}

		return [
			'data'  => $entries,
			'total' => count( $entries ),
		];
	}

	/**
	 * Sync external content and cache it.
	 */
	public function sync(): bool {
		switch ( $this->type ) {
			case 'external_pages':
				return $this->sync_external_pages();
			case 'sitemap':
				return $this->sync_sitemap();
			case 'rss':
				return $this->sync_rss();
			default:
				return false;
		}
	}

	private function sync_external_pages(): bool {
		$urls    = $this->config['urls'] ?? [];
		$entries = [];

		foreach ( $urls as $url ) {
			$response = wp_remote_get( $url, [ 'timeout' => 15 ] );
			if ( is_wp_error( $response ) ) {
				continue;
			}

			$html = wp_remote_retrieve_body( $response );
			$text = self::html_to_text( $html );

			$entries[] = [
				'url'     => $url,
				'content' => $text,
			];
		}

		$this->cached_content = wp_json_encode( $entries );
		$this->last_synced    = current_time( 'mysql' );
		return $this->save();
	}

	private function sync_sitemap(): bool {
		$sitemap_url = $this->config['sitemap_url'] ?? '';
		if ( empty( $sitemap_url ) ) {
			return false;
		}

		$response = wp_remote_get( $sitemap_url, [ 'timeout' => 15 ] );
		if ( is_wp_error( $response ) ) {
			return false;
		}

		$body = wp_remote_retrieve_body( $response );
		$urls  = [];

		// Parse XML sitemap.
		$xml = @simplexml_load_string( $body );
		if ( $xml ) {
			foreach ( $xml->url as $url_node ) {
				$urls[] = (string) $url_node->loc;
			}
			// Sitemap index.
			foreach ( $xml->sitemap as $sitemap_node ) {
				$child_url  = (string) $sitemap_node->loc;
				$child_resp = wp_remote_get( $child_url, [ 'timeout' => 15 ] );
				if ( ! is_wp_error( $child_resp ) ) {
					$child_xml = @simplexml_load_string( wp_remote_retrieve_body( $child_resp ) );
					if ( $child_xml ) {
						foreach ( $child_xml->url as $url_node ) {
							$urls[] = (string) $url_node->loc;
						}
					}
				}
			}
		}

		// Fetch each URL (limit to 50).
		$entries = [];
		foreach ( array_slice( $urls, 0, 50 ) as $url ) {
			$page_resp = wp_remote_get( $url, [ 'timeout' => 10 ] );
			if ( is_wp_error( $page_resp ) ) {
				continue;
			}

			$html  = wp_remote_retrieve_body( $page_resp );
			$title = '';
			if ( preg_match( '/<title>(.*?)<\/title>/is', $html, $m ) ) {
				$title = html_entity_decode( trim( $m[1] ) );
			}

			$entries[] = [
				'url'     => $url,
				'title'   => $title,
				'content' => self::html_to_text( $html ),
			];
		}

		$this->cached_content = wp_json_encode( $entries );
		$this->last_synced    = current_time( 'mysql' );
		return $this->save();
	}

	private function sync_rss(): bool {
		$feed_url = $this->config['feed_url'] ?? '';
		if ( empty( $feed_url ) ) {
			return false;
		}

		$feed = fetch_feed( $feed_url );
		if ( is_wp_error( $feed ) ) {
			return false;
		}

		$entries = [];
		foreach ( $feed->get_items( 0, 50 ) as $item ) {
			$entries[] = [
				'title'       => $item->get_title(),
				'url'         => $item->get_link(),
				'date'        => $item->get_date( 'Y-m-d H:i:s' ),
				'description' => wp_strip_all_tags( $item->get_description() ),
			];
		}

		$this->cached_content = wp_json_encode( $entries );
		$this->last_synced    = current_time( 'mysql' );
		return $this->save();
	}

	private static function html_to_text( string $html ): string {
		// Remove scripts and styles.
		$html = preg_replace( '/<script[^>]*>.*?<\/script>/is', '', $html );
		$html = preg_replace( '/<style[^>]*>.*?<\/style>/is', '', $html );
		// Remove nav, header, footer.
		$html = preg_replace( '/<(nav|header|footer)[^>]*>.*?<\/\1>/is', '', $html );
		// Strip tags and clean up.
		$text = wp_strip_all_tags( $html );
		$text = preg_replace( '/\s+/', ' ', $text );
		return trim( $text );
	}
}
