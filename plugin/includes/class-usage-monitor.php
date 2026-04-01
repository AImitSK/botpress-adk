<?php

namespace Bpwc;

class Usage_Monitor {

	private const CRON_HOOK     = 'bpwc_check_usage_budget';
	private const TABLE_NAME    = 'usageLogsTable';
	private const NOTIFIED_KEY  = 'bpwc_budget_notified';

	public static function init(): void {
		add_action( self::CRON_HOOK, [ self::class, 'check_budget' ] );
		add_action( 'admin_notices', [ self::class, 'admin_notice' ] );

		if ( ! wp_next_scheduled( self::CRON_HOOK ) ) {
			wp_schedule_event( time(), 'twicedaily', self::CRON_HOOK );
		}
	}

	/**
	 * Unschedule the cron hook on plugin deactivation.
	 */
	public static function deactivate(): void {
		$timestamp = wp_next_scheduled( self::CRON_HOOK );
		if ( $timestamp ) {
			wp_unschedule_event( $timestamp, self::CRON_HOOK );
		}
	}

	/**
	 * Cron callback: Check monthly spend against budget and send notifications.
	 */
	public static function check_budget(): void {
		$budget = (float) Settings::get( 'usage.monthly_budget_usd', 0 );

		if ( $budget <= 0 ) {
			return;
		}

		$spend = self::get_current_month_spend();

		if ( false === $spend ) {
			return;
		}

		$percent  = ( $spend / $budget ) * 100;
		$notified = get_option( self::NOTIFIED_KEY, [] );
		$month    = gmdate( 'Y-m' );

		// Reset notifications on new month.
		if ( ( $notified['month'] ?? '' ) !== $month ) {
			$notified = [ 'month' => $month, '80' => false, '100' => false ];
		}

		// 80% notification.
		if ( $percent >= 80 && $percent < 100 && ! $notified['80'] && Settings::get( 'usage.notify_at_80', false ) ) {
			self::send_notification(
				sprintf(
					/* translators: 1: percent, 2: spend, 3: budget */
					__( 'Your chatbot has used %1$s%% of the monthly budget ($%2$s / $%3$s).', 'botpress-webchat' ),
					number_format( $percent, 1 ),
					number_format( $spend, 2 ),
					number_format( $budget, 2 )
				),
				__( 'Chatbot Budget Warning: 80% reached', 'botpress-webchat' )
			);
			$notified['80'] = true;
		}

		// 100% notification.
		if ( $percent >= 100 && ! $notified['100'] && Settings::get( 'usage.notify_at_100', false ) ) {
			self::send_notification(
				sprintf(
					/* translators: 1: spend, 2: budget */
					__( 'Your chatbot has reached the monthly budget limit ($%1$s / $%2$s). The bot will not respond until the limit is increased or the next month begins.', 'botpress-webchat' ),
					number_format( $spend, 2 ),
					number_format( $budget, 2 )
				),
				__( 'Chatbot Budget Limit Reached', 'botpress-webchat' )
			);
			$notified['100'] = true;
		}

		update_option( self::NOTIFIED_KEY, $notified );
	}

	/**
	 * Show admin notice when budget is exceeded.
	 */
	public static function admin_notice(): void {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}

		$budget = (float) Settings::get( 'usage.monthly_budget_usd', 0 );

		if ( $budget <= 0 ) {
			return;
		}

		$notified = get_option( self::NOTIFIED_KEY, [] );
		$month    = gmdate( 'Y-m' );

		if ( ( $notified['month'] ?? '' ) !== $month ) {
			return;
		}

		if ( ! empty( $notified['100'] ) ) {
			$url = admin_url( 'admin.php?page=bpwc-usage' );
			printf(
				'<div class="notice notice-error"><p><strong>%s</strong> %s <a href="%s">%s</a></p></div>',
				esc_html__( 'Botpress Webchat:', 'botpress-webchat' ),
				esc_html__( 'Monthly AI budget limit reached. The chatbot is currently paused.', 'botpress-webchat' ),
				esc_url( $url ),
				esc_html__( 'Manage Budget', 'botpress-webchat' )
			);
		} elseif ( ! empty( $notified['80'] ) ) {
			$url = admin_url( 'admin.php?page=bpwc-usage' );
			printf(
				'<div class="notice notice-warning"><p><strong>%s</strong> %s <a href="%s">%s</a></p></div>',
				esc_html__( 'Botpress Webchat:', 'botpress-webchat' ),
				esc_html__( 'Monthly AI budget is above 80%.', 'botpress-webchat' ),
				esc_url( $url ),
				esc_html__( 'View Usage', 'botpress-webchat' )
			);
		}
	}

	/**
	 * Fetch current month's total AI spend from Botpress Tables API.
	 */
	private static function get_current_month_spend(): float|false {
		$api = new Botpress_Api();

		if ( ! $api->is_configured() ) {
			return false;
		}

		$month_start = gmdate( 'Y-m-01' );
		$month_end   = gmdate( 'Y-m-31' );

		$result = $api->list_table_rows( self::TABLE_NAME, [
			'date' => [
				'$gte' => $month_start,
				'$lte' => $month_end,
			],
		], 31 );

		if ( false === $result || ! isset( $result['rows'] ) ) {
			return false;
		}

		$total = 0;
		foreach ( $result['rows'] as $row ) {
			$total += (float) ( $row['ai_spend_usd'] ?? 0 );
		}

		return $total;
	}

	/**
	 * Send email notification to the admin.
	 */
	private static function send_notification( string $message, string $subject ): void {
		$admin_email = get_option( 'admin_email' );
		$site_name   = get_bloginfo( 'name' );

		wp_mail(
			$admin_email,
			"[$site_name] $subject",
			$message,
			[ 'Content-Type: text/plain; charset=UTF-8' ]
		);
	}
}
