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
				'bot_id'       => $dev['bot_id'] ?? '',
				'webchat_id'   => $dev['webchat_id'] ?? '',
				'api_token'    => '',
				'wp_api_url'   => '',
				'botpress_pat' => $dev['botpress_pat'] ?? '',
			],
			'identity' => [
				'bot_name'              => 'Bot',
				'bot_description'       => '',
				'bot_avatar_url'        => '',
				'system_prompt'         => "Du bist ein freundlicher und kompetenter Support-Assistent für unsere Website.\nDeine Aufgabe ist es, Besuchern bei Fragen zu helfen — zu Produkten, Ansprechpartnern, Downloads und allgemeinen Informationen.\nNutze ausschließlich die verfügbaren Datenquellen, um Antworten zu geben.",
				'fallback_behavior'     => "Wenn du die Antwort nicht in den Datenquellen findest, sage ehrlich:\n\"Das kann ich leider nicht beantworten. Soll ich Ihre Anfrage an unser Team weiterleiten? Dafür benötige ich Ihren Namen und eine E-Mail-Adresse oder Telefonnummer.\"",
				'restrictions'          => "- Erfinde keine Informationen — antworte nur mit Daten aus den Datenquellen.\n- Nenne keine Preise, Verfügbarkeiten oder rechtliche Auskünfte, die nicht in den Daten stehen.\n- Gib keine medizinischen, rechtlichen oder finanziellen Ratschläge.\n- Leite bei Beschwerden oder dringenden Anliegen immer an einen echten Mitarbeiter weiter.",
				'composer_placeholder'   => 'Type your message...',
				'footer'                => '',
				'fab_avatar_url'        => '',
				'contact_email'         => '',
				'contact_phone'         => '',
				'contact_website'       => '',
				'terms_of_service_url'  => '',
				'privacy_policy_url'    => '',
			],
			'appearance' => [
				'primary_color'   => '#3276EA',
				'font_family'     => 'inter',
				'theme_mode'      => 'light',
				'header_variant'  => 'glass',
				'message_variant' => 'solid',
				'corner_radius'   => 1,
				'custom_css'      => '',
			],
			'features' => [
				'message_feedback'      => false,
				'allow_file_upload'     => false,
				'notification_sound'    => false,
				'conversation_history'  => false,
				'chat_history_reset'    => 'localStorage',
			],
			'general' => [
				'language'   => $dev['default_language'] ?? 'de',
				'enabled'    => true,
				'show_on'    => 'all',
				'page_rules' => [],
			],
			'language' => [
				'multilingual'       => false,
				'detection_method'   => 'url_prefix',
				'available_languages' => 'de',
				'wpml_active'        => false,
			],
			'notifications' => [
				'sendgrid_api_key'      => $dev['sendgrid_api_key'] ?? '',
				'sendgrid_from_email'   => $dev['sendgrid_from_email'] ?? '',
				'sendgrid_from_name'    => '',
				'notify_emails'         => '',
				'customer_confirmation' => true,
				'confirm_subject'       => 'Wir haben Ihre Anfrage erhalten',
				'confirm_message'       => "Vielen Dank für Ihre Nachricht, {name}.\n\nWir haben Ihre Anfrage erhalten und werden uns so schnell wie möglich bei Ihnen melden.\n\nMit freundlichen Grüßen\n{site_name}",
			],
			'usage' => [
				'monthly_budget_usd' => 0,
				'notify_at_80'       => false,
				'notify_at_100'      => false,
				'stop_at_limit'      => false,
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
