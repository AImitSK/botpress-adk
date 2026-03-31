<?php

namespace Bpwc\Cpt;

use Bpwc\Settings;

class Cpt_Manager {

	private static array $registry = [
		'enable_contacts'     => Cpt_Contact::class,
		'enable_products'     => Cpt_Product::class,
		'enable_downloads'    => Cpt_Download::class,
		'enable_country_reps' => Cpt_Country_Rep::class,
	];

	public static function init(): void {
		add_action( 'init', [ self::class, 'register_cpts' ] );
	}

	public static function register_cpts(): void {
		foreach ( self::$registry as $setting_key => $class ) {
			if ( Settings::get( 'data_sources.' . $setting_key ) ) {
				( new $class() )->register();
			}
		}
	}

	public static function get_instance( string $post_type ): ?Cpt_Base {
		$map = [
			'bpwc_contact'     => Cpt_Contact::class,
			'bpwc_product'     => Cpt_Product::class,
			'bpwc_download'    => Cpt_Download::class,
			'bpwc_country_rep' => Cpt_Country_Rep::class,
		];

		if ( isset( $map[ $post_type ] ) ) {
			return new $map[ $post_type ]();
		}

		return null;
	}
}
