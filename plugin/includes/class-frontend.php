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
		$custom_css  = esc_html( $settings['appearance']['custom_css'] ?? '' );

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
		$identity   = $settings['identity'];
		$appearance = $settings['appearance'];
		$features   = $settings['features'];

		$config = [
			'clientId' => $settings['connection']['webchat_id'],
		];

		if ( ! empty( $settings['connection']['bot_id'] ) ) {
			$config['botId'] = $settings['connection']['bot_id'];
		}

		// Webchat v3 configuration object.
		$configuration = [];

		// Identity.
		if ( ! empty( $identity['bot_name'] ) ) {
			$configuration['botName'] = $identity['bot_name'];
		}
		if ( ! empty( $identity['bot_description'] ) ) {
			$configuration['botDescription'] = $identity['bot_description'];
		}
		if ( ! empty( $identity['bot_avatar_url'] ) ) {
			$configuration['botAvatar'] = $identity['bot_avatar_url'];
		}
		if ( ! empty( $identity['composer_placeholder'] ) ) {
			$configuration['composerPlaceholder'] = $identity['composer_placeholder'];
		}
		if ( ! empty( $identity['footer'] ) ) {
			$configuration['footer'] = $identity['footer'];
		}
		if ( ! empty( $identity['fab_avatar_url'] ) ) {
			$configuration['fabImage'] = $identity['fab_avatar_url'];
		}

		// Contact info.
		if ( ! empty( $identity['contact_email'] ) ) {
			$configuration['email'] = [ 'title' => 'Email', 'link' => 'mailto:' . $identity['contact_email'] ];
		}
		if ( ! empty( $identity['contact_phone'] ) ) {
			$configuration['phone'] = [ 'title' => 'Phone', 'link' => 'tel:' . $identity['contact_phone'] ];
		}
		if ( ! empty( $identity['contact_website'] ) ) {
			$configuration['website'] = [ 'title' => 'Website', 'link' => $identity['contact_website'] ];
		}
		if ( ! empty( $identity['terms_of_service_url'] ) ) {
			$configuration['termsOfService'] = [ 'title' => 'Terms', 'link' => $identity['terms_of_service_url'] ];
		}
		if ( ! empty( $identity['privacy_policy_url'] ) ) {
			$configuration['privacyPolicy'] = [ 'title' => 'Privacy', 'link' => $identity['privacy_policy_url'] ];
		}

		// Appearance.
		if ( ! empty( $appearance['primary_color'] ) ) {
			$configuration['color'] = $appearance['primary_color'];
		}
		if ( ! empty( $appearance['font_family'] ) ) {
			$configuration['fontFamily'] = $appearance['font_family'];
		}
		$configuration['themeMode']     = $appearance['theme_mode'] ?? 'light';
		$configuration['headerVariant'] = $appearance['header_variant'] ?? 'glass';
		$configuration['variant']       = $appearance['message_variant'] ?? 'solid';
		$configuration['radius']        = (float) ( $appearance['corner_radius'] ?? 1 );

		// Features.
		$configuration['feedbackEnabled']  = ! empty( $features['message_feedback'] );
		$configuration['allowFileUpload']  = ! empty( $features['allow_file_upload'] );
		$configuration['storageLocation']  = $features['chat_history_reset'] ?? 'localStorage';

		$config['configuration'] = $configuration;

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
