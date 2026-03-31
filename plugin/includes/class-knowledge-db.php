<?php

namespace Bpwc;

class Knowledge_Db {

	private const DB_VERSION_KEY = 'bpwc_kb_db_version';
	private const DB_VERSION     = '1.0';

	public static function get_table_name(): string {
		global $wpdb;
		return $wpdb->prefix . 'bpwc_sources';
	}

	public static function install(): void {
		if ( get_option( self::DB_VERSION_KEY ) === self::DB_VERSION ) {
			return;
		}

		global $wpdb;
		$table   = self::get_table_name();
		$charset = $wpdb->get_charset_collate();

		$sql = "CREATE TABLE {$table} (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			name varchar(255) NOT NULL DEFAULT '',
			type varchar(50) NOT NULL DEFAULT 'text',
			status varchar(20) NOT NULL DEFAULT 'active',
			config longtext NOT NULL DEFAULT '',
			prompt text NOT NULL DEFAULT '',
			cached_content longtext NOT NULL DEFAULT '',
			last_synced datetime DEFAULT NULL,
			sort_order int(11) NOT NULL DEFAULT 0,
			created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			PRIMARY KEY (id),
			KEY type (type),
			KEY status (status)
		) {$charset};";

		require_once ABSPATH . 'wp-admin/includes/upgrade.php';
		dbDelta( $sql );

		update_option( self::DB_VERSION_KEY, self::DB_VERSION );
	}

	public static function uninstall(): void {
		global $wpdb;
		$table = self::get_table_name();
		$wpdb->query( "DROP TABLE IF EXISTS {$table}" );
		delete_option( self::DB_VERSION_KEY );
	}
}
