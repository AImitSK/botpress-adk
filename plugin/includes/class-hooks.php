<?php
/**
 * Extensibility hooks for Botpress Webchat.
 *
 * Filters:
 *   bpwc_webchat_config    (array $config, array $settings)          — Modify the JS config passed to botpress.init().
 *   bpwc_webchat_context   (array $context, array $settings)         — Add custom data sent to the bot as userData.
 *   bpwc_should_show_webchat (bool $show, array $settings)           — Control visibility per page.
 *   bpwc_settings          (array $settings)                         — Override settings at runtime.
 *   bpwc_cpt_args_{$type}  (array $args)                             — Modify CPT registration args.
 *
 * Actions:
 *   bpwc_message_forwarded (string $to_email, string $subject, array $sender_data) — Fires after email is sent via SendGrid.
 *   bpwc_plugin_loaded     ()                                        — Fires when the plugin is fully initialized.
 */

namespace Bpwc;

class Hooks {

	public static function init(): void {
		add_filter( 'bpwc_settings', [ self::class, 'apply_settings_filter' ] );
	}

	public static function apply_settings_filter( array $settings ): array {
		return $settings;
	}
}
