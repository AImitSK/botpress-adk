<?php

namespace Bpwc;

class Inquiry_Db {

	private const DB_VERSION_KEY = 'bpwc_inquiry_db_version';
	private const DB_VERSION     = '1.0';

	public static function table(): string {
		global $wpdb;
		return $wpdb->prefix . 'bpwc_inquiries';
	}

	public static function install(): void {
		if ( get_option( self::DB_VERSION_KEY ) === self::DB_VERSION ) {
			return;
		}

		global $wpdb;
		$table   = self::table();
		$charset = $wpdb->get_charset_collate();

		$sql = "CREATE TABLE {$table} (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			name varchar(255) NOT NULL DEFAULT '',
			email varchar(255) NOT NULL DEFAULT '',
			phone varchar(100) NOT NULL DEFAULT '',
			message text NOT NULL DEFAULT '',
			conversation_id varchar(255) NOT NULL DEFAULT '',
			status varchar(20) NOT NULL DEFAULT 'new',
			notify_sent tinyint(1) NOT NULL DEFAULT 0,
			confirm_sent tinyint(1) NOT NULL DEFAULT 0,
			created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
			PRIMARY KEY (id),
			KEY status (status),
			KEY created_at (created_at)
		) {$charset};";

		require_once ABSPATH . 'wp-admin/includes/upgrade.php';
		dbDelta( $sql );

		update_option( self::DB_VERSION_KEY, self::DB_VERSION );
	}

	public static function create( array $data ): int|false {
		global $wpdb;

		$result = $wpdb->insert( self::table(), [
			'name'            => sanitize_text_field( $data['name'] ?? '' ),
			'email'           => sanitize_email( $data['email'] ?? '' ),
			'phone'           => sanitize_text_field( $data['phone'] ?? '' ),
			'message'         => sanitize_textarea_field( $data['message'] ?? '' ),
			'conversation_id' => sanitize_text_field( $data['conversation_id'] ?? '' ),
			'status'          => 'new',
			'notify_sent'     => ! empty( $data['notify_sent'] ) ? 1 : 0,
			'confirm_sent'    => ! empty( $data['confirm_sent'] ) ? 1 : 0,
		] );

		return $result ? $wpdb->insert_id : false;
	}

	public static function get( int $id ): ?object {
		global $wpdb;
		return $wpdb->get_row( $wpdb->prepare(
			"SELECT * FROM %i WHERE id = %d",
			self::table(),
			$id
		) );
	}

	public static function list( int $limit = 50, int $offset = 0, string $status = '' ): array {
		global $wpdb;
		$table = self::table();

		$where = '';
		$args  = [];
		if ( $status ) {
			$where = 'WHERE status = %s';
			$args[] = $status;
		}

		$args[] = $limit;
		$args[] = $offset;

		$rows = $wpdb->get_results( $wpdb->prepare(
			"SELECT * FROM {$table} {$where} ORDER BY created_at DESC LIMIT %d OFFSET %d",
			...$args
		) );

		$total_query = "SELECT COUNT(*) FROM {$table}";
		if ( $status ) {
			$total_query .= $wpdb->prepare( ' WHERE status = %s', $status );
		}
		$total = (int) $wpdb->get_var( $total_query );

		return [
			'items' => $rows ?: [],
			'total' => $total,
		];
	}

	public static function update_status( int $id, string $status ): bool {
		global $wpdb;
		return (bool) $wpdb->update(
			self::table(),
			[ 'status' => $status ],
			[ 'id' => $id ]
		);
	}

	public static function count_new(): int {
		global $wpdb;
		return (int) $wpdb->get_var( $wpdb->prepare(
			"SELECT COUNT(*) FROM %i WHERE status = 'new'",
			self::table()
		) );
	}
}
