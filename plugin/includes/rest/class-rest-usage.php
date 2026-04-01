<?php

namespace Bpwc\Rest;

use Bpwc\Botpress_Api;
use Bpwc\Settings;

class Rest_Usage {

	private const NAMESPACE   = 'bpwc/v1';
	private const TABLE_NAME  = 'usageLogsTable';
	private const CACHE_TTL   = 60;

	public function register_routes(): void {
		register_rest_route( self::NAMESPACE, '/usage', [
			'methods'             => \WP_REST_Server::READABLE,
			'callback'            => [ $this, 'get_monthly_summary' ],
			'permission_callback' => [ $this, 'check_admin' ],
			'args'                => [
				'year' => [
					'type'    => 'integer',
					'default' => 0,
				],
				'month' => [
					'type'    => 'integer',
					'default' => 0,
				],
			],
		] );

		register_rest_route( self::NAMESPACE, '/usage/daily', [
			'methods'             => \WP_REST_Server::READABLE,
			'callback'            => [ $this, 'get_daily_breakdown' ],
			'permission_callback' => [ $this, 'check_admin' ],
			'args'                => [
				'year' => [
					'type'    => 'integer',
					'default' => 0,
				],
				'month' => [
					'type'    => 'integer',
					'default' => 0,
				],
			],
		] );

		register_rest_route( self::NAMESPACE, '/usage/limit', [
			[
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => [ $this, 'get_limit' ],
				'permission_callback' => [ $this, 'check_admin' ],
			],
			[
				'methods'             => \WP_REST_Server::CREATABLE,
				'callback'            => [ $this, 'set_limit' ],
				'permission_callback' => [ $this, 'check_admin' ],
				'args'                => [
					'monthly_budget_usd' => [
						'type'     => 'number',
						'required' => true,
					],
					'notify_at_80' => [
						'type'    => 'boolean',
						'default' => false,
					],
					'notify_at_100' => [
						'type'    => 'boolean',
						'default' => false,
					],
					'stop_at_limit' => [
						'type'    => 'boolean',
						'default' => false,
					],
				],
			],
		] );
	}

	public function check_admin(): bool {
		return current_user_can( 'manage_options' );
	}

	/**
	 * GET /usage — Monthly summary (spend, messages, conversations).
	 */
	public function get_monthly_summary( \WP_REST_Request $request ): \WP_REST_Response {
		$rows = $this->fetch_month_rows( $request );

		if ( false === $rows ) {
			$rows = [];
		}

		$total_spend         = 0;
		$total_messages      = 0;
		$total_conversations = 0;
		$total_input_tokens  = 0;
		$total_output_tokens = 0;

		foreach ( $rows as $row ) {
			$total_spend         += (float) ( $row['ai_spend_usd'] ?? 0 );
			$total_messages      += (int) ( $row['messages'] ?? 0 );
			$total_conversations += (int) ( $row['conversations'] ?? 0 );
			$total_input_tokens  += (int) ( $row['input_tokens'] ?? 0 );
			$total_output_tokens += (int) ( $row['output_tokens'] ?? 0 );
		}

		$budget = Settings::get( 'usage.monthly_budget_usd', 0 );

		return new \WP_REST_Response( [
			'success' => true,
			'data'    => [
				'ai_spend_usd'    => round( $total_spend, 4 ),
				'messages'        => $total_messages,
				'conversations'   => $total_conversations,
				'input_tokens'    => $total_input_tokens,
				'output_tokens'   => $total_output_tokens,
				'budget_usd'      => (float) $budget,
				'budget_percent'  => $budget > 0 ? round( ( $total_spend / $budget ) * 100, 1 ) : 0,
			],
		] );
	}

	/**
	 * GET /usage/daily — Daily breakdown for charts.
	 */
	public function get_daily_breakdown( \WP_REST_Request $request ): \WP_REST_Response {
		$rows = $this->fetch_month_rows( $request );

		if ( false === $rows ) {
			$rows = [];
		}

		$daily = [];
		foreach ( $rows as $row ) {
			$daily[] = [
				'date'           => $row['date'] ?? '',
				'ai_spend_usd'   => round( (float) ( $row['ai_spend_usd'] ?? 0 ), 4 ),
				'messages'       => (int) ( $row['messages'] ?? 0 ),
				'conversations'  => (int) ( $row['conversations'] ?? 0 ),
				'input_tokens'   => (int) ( $row['input_tokens'] ?? 0 ),
				'output_tokens'  => (int) ( $row['output_tokens'] ?? 0 ),
			];
		}

		// Sort by date ascending.
		usort( $daily, fn( $a, $b ) => strcmp( $a['date'], $b['date'] ) );

		return new \WP_REST_Response( [
			'success' => true,
			'data'    => $daily,
		] );
	}

	/**
	 * GET /usage/limit — Read budget settings.
	 */
	public function get_limit(): \WP_REST_Response {
		return new \WP_REST_Response( [
			'success' => true,
			'data'    => [
				'monthly_budget_usd' => (float) Settings::get( 'usage.monthly_budget_usd', 0 ),
				'notify_at_80'       => (bool) Settings::get( 'usage.notify_at_80', false ),
				'notify_at_100'      => (bool) Settings::get( 'usage.notify_at_100', false ),
				'stop_at_limit'      => (bool) Settings::get( 'usage.stop_at_limit', false ),
			],
		] );
	}

	/**
	 * POST /usage/limit — Save budget settings.
	 */
	public function set_limit( \WP_REST_Request $request ): \WP_REST_Response {
		$values = [
			'usage' => [
				'monthly_budget_usd' => (float) $request->get_param( 'monthly_budget_usd' ),
				'notify_at_80'       => (bool) $request->get_param( 'notify_at_80' ),
				'notify_at_100'      => (bool) $request->get_param( 'notify_at_100' ),
				'stop_at_limit'      => (bool) $request->get_param( 'stop_at_limit' ),
			],
		];

		Settings::update( $values );

		return new \WP_REST_Response( [
			'success' => true,
			'data'    => $values['usage'],
		] );
	}

	/**
	 * Fetch rows for the requested month from the Botpress usage_logs table.
	 */
	private function fetch_month_rows( \WP_REST_Request $request ): array|false {
		$api = new Botpress_Api();

		if ( ! $api->is_configured() ) {
			return false;
		}

		$year  = $request->get_param( 'year' ) ?: (int) gmdate( 'Y' );
		$month = $request->get_param( 'month' ) ?: (int) gmdate( 'n' );

		$month_start = sprintf( '%04d-%02d-01', $year, $month );
		$month_end   = sprintf( '%04d-%02d-31', $year, $month );

		$cache_key = 'bpwc_usage_' . $month_start;
		$cached    = get_transient( $cache_key );

		if ( false !== $cached ) {
			return $cached;
		}

		$result = $api->list_table_rows( self::TABLE_NAME, [
			'date' => [
				'$gte' => $month_start,
				'$lte' => $month_end,
			],
		], 31 );

		if ( false === $result || ! isset( $result['rows'] ) ) {
			return [];
		}

		$rows = $result['rows'];

		// Only cache non-empty results to avoid stale zeros.
		if ( ! empty( $rows ) ) {
			set_transient( $cache_key, $rows, self::CACHE_TTL );
		}

		return $rows;
	}

	private function api_error(): \WP_REST_Response {
		return new \WP_REST_Response( [
			'success' => false,
			'message' => 'Botpress API not configured or usage data unavailable.',
		], 400 );
	}
}
