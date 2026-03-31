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

		$config      = self::build_config( $settings );
		$config      = apply_filters( 'bpwc_webchat_config', $config, $settings );
		$config_json = wp_json_encode( $config );
		$custom_css  = esc_html( $settings['styling']['custom_css'] );

		// Page context to send as user data.
		$context      = self::get_page_context();
		$context      = apply_filters( 'bpwc_webchat_context', $context, $settings );
		$context_json = wp_json_encode( $context );

		?>
		<script src="https://cdn.botpress.cloud/webchat/v3.6/inject.js"></script>
		<script>
			window.botpress.init(<?php echo $config_json; ?>);
			window.botpress.on("webchat:initialized", function() {
				window.botpress.updateUser({ data: <?php echo $context_json; ?> });
			});
		</script>
		<?php if ( ! empty( $custom_css ) ) : ?>
			<style id="bpwc-custom-css"><?php echo $custom_css; ?></style>
		<?php endif; ?>
		<?php
	}

	public static function render_shortcode( array $atts = [] ): string {
		$settings = Settings::get_all();

		$webchat_id = $settings['connection']['webchat_id'];
		if ( empty( $webchat_id ) ) {
			return '';
		}

		$config      = self::build_config( $settings );
		$config      = apply_filters( 'bpwc_webchat_config', $config, $settings );
		$config_json = wp_json_encode( $config );

		return '<script src="https://cdn.botpress.cloud/webchat/v3.6/inject.js"></script>'
			. '<script>window.botpress.init(' . $config_json . ');</script>';
	}

	private static function should_show( array $settings ): bool {
		$should_show = true;
		$show_on     = $settings['general']['show_on'] ?? 'all';

		if ( 'all' !== $show_on ) {
			$rules      = $settings['general']['page_rules'] ?? [];
			$current_id = get_queried_object_id();

			if ( ! empty( $rules ) ) {
				if ( 'include' === $show_on ) {
					$should_show = in_array( $current_id, $rules, true );
				} elseif ( 'exclude' === $show_on ) {
					$should_show = ! in_array( $current_id, $rules, true );
				}
			}
		}

		return (bool) apply_filters( 'bpwc_should_show_webchat', $should_show, $settings );
	}

	private static function build_config( array $settings ): array {
		$styling = $settings['styling'];

		$config = [
			'clientId' => $settings['connection']['webchat_id'],
		];

		if ( ! empty( $settings['connection']['bot_id'] ) ) {
			$config['botId'] = $settings['connection']['bot_id'];
		}

		// Webchat v3 configuration object.
		$configuration = [];

		if ( ! empty( $styling['primary_color'] ) && '#0066FF' !== $styling['primary_color'] ) {
			$configuration['color'] = $styling['primary_color'];
		}
		if ( ! empty( $styling['font_family'] ) && 'inherit' !== $styling['font_family'] ) {
			$configuration['fontFamily'] = $styling['font_family'];
		}
		if ( ! empty( $styling['bot_name'] ) ) {
			$configuration['botName'] = $styling['bot_name'];
		}
		if ( ! empty( $styling['bot_avatar_url'] ) ) {
			$configuration['botAvatar'] = $styling['bot_avatar_url'];
		}
		if ( ! empty( $styling['greeting_message'] ) ) {
			$configuration['composerPlaceholder'] = $styling['greeting_message'];
		}

		// Theme mode: light/dark based on background color.
		if ( ! empty( $styling['background_color'] ) && '#FFFFFF' !== $styling['background_color'] ) {
			// Dark backgrounds → dark mode.
			$hex = ltrim( $styling['background_color'], '#' );
			$r   = hexdec( substr( $hex, 0, 2 ) );
			$g   = hexdec( substr( $hex, 2, 2 ) );
			$b   = hexdec( substr( $hex, 4, 2 ) );
			if ( ( $r + $g + $b ) / 3 < 128 ) {
				$configuration['themeMode'] = 'dark';
			}
		}

		// Position maps to variant in v3.
		if ( ! empty( $styling['position'] ) && 'left' === $styling['position'] ) {
			// v3 doesn't have left/right — handled via custom CSS.
		}

		if ( ! empty( $styling['custom_css'] ) ) {
			// Custom CSS in v3 requires an external URL or inline style tag.
			// We handle this via the <style> tag in render_webchat().
		}

		if ( ! empty( $configuration ) ) {
			$config['configuration'] = $configuration;
		}

		// Page context as user data.
		$context = self::get_page_context();
		$context = apply_filters( 'bpwc_webchat_context', $context, $settings );

		return $config;
	}

	private static function get_page_context(): array {
		$context = [];

		if ( is_singular() ) {
			$post = get_queried_object();
			if ( $post instanceof \WP_Post ) {
				$context['pageTitle'] = $post->post_title;
				$context['pageUrl']   = get_permalink( $post );
				$context['pageType']  = $post->post_type;
			}
		} elseif ( is_archive() ) {
			$context['pageTitle'] = get_the_archive_title();
			$context['pageUrl']   = home_url( add_query_arg( [] ) );
			$context['pageType']  = 'archive';
		} else {
			$context['pageUrl']  = home_url( add_query_arg( [] ) );
			$context['pageType'] = 'other';
		}

		return $context;
	}
}
