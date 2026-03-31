<?php

namespace Bpwc;

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
}
