<?php

namespace Bpwc;

class Settings {

	private const OPTION_KEY = 'bpwc_settings';
	private const TOKEN_HASH_KEY = 'bpwc_api_token_hash';

	private static ?array $dev_config = null;

	private static function dev_config(): array {
		if ( null === self::$dev_config ) {
			$path = BPWC_PLUGIN_DIR . 'developer-config.php';
			self::$dev_config = file_exists( $path ) ? (array) require $path : [];
		}
		return self::$dev_config;
	}

	private static function defaults(): array {
		$dev = self::dev_config();

		return [
			'connection' => [
				'bot_id'       => '',
				'webchat_id'   => '',
				'api_token'    => '',
				'wp_api_url'   => '',
				'botpress_pat' => $dev['botpress_pat'] ?? '',
			],
			'styling' => [
				'primary_color'    => '#0066FF',
				'background_color' => '#FFFFFF',
				'font_family'      => 'inherit',
				'position'         => 'right',
				'z_index'          => 9999,
				'custom_css'       => '',
				'bot_name'         => 'Support Bot',
				'bot_avatar_url'   => '',
				'greeting_message' => 'Hallo! Wie kann ich Ihnen helfen?',
			],
			'data_sources' => [
				'enable_contacts'     => false,
				'enable_products'     => false,
				'enable_downloads'    => false,
				'enable_country_reps' => false,
			],
			'general' => [
				'language'   => $dev['default_language'] ?? 'de',
				'enabled'    => true,
				'show_on'    => 'all',
				'page_rules' => [],
			],
		];
	}

	public static function get_all(): array {
		$saved = get_option( self::OPTION_KEY, [] );
		return self::merge_defaults( $saved );
	}

	public static function get( string $dotpath, mixed $default = null ): mixed {
		$keys     = explode( '.', $dotpath );
		$settings = self::get_all();

		foreach ( $keys as $key ) {
			if ( ! is_array( $settings ) || ! array_key_exists( $key, $settings ) ) {
				return $default;
			}
			$settings = $settings[ $key ];
		}

		return $settings;
	}

	public static function update( array $values ): bool {
		$current = self::get_all();
		$merged  = self::merge_defaults( array_replace_recursive( $current, $values ) );
		return update_option( self::OPTION_KEY, $merged );
	}

	public static function generate_api_token(): string {
		$token = wp_generate_password( 40, false );
		update_option( self::TOKEN_HASH_KEY, wp_hash_password( $token ) );
		return $token;
	}

	public static function verify_api_token( string $token ): bool {
		$hash = get_option( self::TOKEN_HASH_KEY, '' );
		if ( empty( $hash ) || empty( $token ) ) {
			return false;
		}
		return wp_check_password( $token, $hash );
	}

	private static function merge_defaults( array $saved ): array {
		$defaults = self::defaults();
		$merged   = [];
		foreach ( $defaults as $group => $fields ) {
			$merged[ $group ] = array_merge( $fields, $saved[ $group ] ?? [] );
		}
		return $merged;
	}
}
