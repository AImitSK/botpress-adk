<?php

namespace Bpwc;

class Frontend {

	public static function render_webchat(): void {
		if ( is_admin() ) {
			return;
		}

		$settings = Settings::get_all();

		if ( empty( $settings['general']['enabled'] ) ) {
			return;
		}

		$webchat_id = $settings['connection']['webchat_id'];
		if ( empty( $webchat_id ) ) {
			return;
		}

		if ( ! self::should_show( $settings ) ) {
			return;
		}

		$config = self::build_config( $settings );
		$config_json = wp_json_encode( $config );
		$custom_css  = esc_html( $settings['styling']['custom_css'] );

		?>
		<script src="https://cdn.botpress.cloud/webchat/v2.3/inject.js"></script>
		<script>
			window.botpress.init(<?php echo $config_json; ?>);
		</script>
		<?php if ( ! empty( $custom_css ) ) : ?>
			<style id="bpwc-custom-css"><?php echo $custom_css; ?></style>
		<?php endif; ?>
		<?php
	}

	private static function should_show( array $settings ): bool {
		$show_on = $settings['general']['show_on'] ?? 'all';

		if ( 'all' === $show_on ) {
			return true;
		}

		$rules = $settings['general']['page_rules'] ?? [];
		if ( empty( $rules ) ) {
			return true;
		}

		$current_id = get_queried_object_id();
		if ( 'include' === $show_on ) {
			return in_array( $current_id, $rules, true );
		}
		if ( 'exclude' === $show_on ) {
			return ! in_array( $current_id, $rules, true );
		}

		return true;
	}

	private static function build_config( array $settings ): array {
		$styling = $settings['styling'];

		$config = [
			'webchatId' => $settings['connection']['webchat_id'],
		];

		if ( ! empty( $settings['connection']['bot_id'] ) ) {
			$config['botId'] = $settings['connection']['bot_id'];
		}

		$theme = [];
		if ( ! empty( $styling['primary_color'] ) && '#0066FF' !== $styling['primary_color'] ) {
			$theme['color'] = $styling['primary_color'];
		}
		if ( ! empty( $styling['background_color'] ) && '#FFFFFF' !== $styling['background_color'] ) {
			$theme['backgroundColor'] = $styling['background_color'];
		}
		if ( ! empty( $styling['font_family'] ) && 'inherit' !== $styling['font_family'] ) {
			$theme['fontFamily'] = $styling['font_family'];
		}
		if ( ! empty( $theme ) ) {
			$config['theme'] = $theme;
		}

		if ( ! empty( $styling['z_index'] ) && 9999 !== (int) $styling['z_index'] ) {
			$config['zIndex'] = (int) $styling['z_index'];
		}

		if ( ! empty( $styling['bot_name'] ) ) {
			$config['botName'] = $styling['bot_name'];
		}
		if ( ! empty( $styling['bot_avatar_url'] ) ) {
			$config['botAvatar'] = $styling['bot_avatar_url'];
		}
		if ( ! empty( $styling['greeting_message'] ) ) {
			$config['composerPlaceholder'] = $styling['greeting_message'];
		}

		return $config;
	}
}
