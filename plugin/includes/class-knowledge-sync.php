<?php

namespace Bpwc;

class Knowledge_Sync {

	private const CRON_HOOK = 'bpwc_sync_sources';

	public static function init(): void {
		add_action( self::CRON_HOOK, [ self::class, 'sync_all' ] );

		if ( ! wp_next_scheduled( self::CRON_HOOK ) ) {
			wp_schedule_event( time(), 'twicedaily', self::CRON_HOOK );
		}
	}

	public static function sync_all(): void {
		$sources = Knowledge_Source::all( 'active' );

		foreach ( $sources as $source ) {
			if ( in_array( $source->type, [ 'external_pages', 'sitemap', 'rss' ], true ) ) {
				$source->sync();
			}
		}
	}

	public static function deactivate(): void {
		wp_clear_scheduled_hook( self::CRON_HOOK );
	}
}
