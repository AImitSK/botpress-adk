<?php

namespace Bpwc;

class Plugin {

	private static ?Plugin $instance = null;

	public static function instance(): Plugin {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	private function __construct() {
		$this->init_hooks();
	}

	private function init_hooks(): void {
		add_action( 'init', [ $this, 'load_textdomain' ] );
		add_action( 'admin_menu', [ Admin_Page::class, 'register' ] );
		add_action( 'admin_menu', [ Knowledge_Page::class, 'register' ] );
		add_action( 'admin_menu', [ Conversation_Viewer::class, 'register' ] );
		add_action( 'admin_enqueue_scripts', [ Admin_Page::class, 'enqueue_assets' ] );
		add_action( 'admin_enqueue_scripts', [ Knowledge_Page::class, 'enqueue_assets' ] );
		add_action( 'admin_enqueue_scripts', [ Conversation_Viewer::class, 'enqueue_assets' ] );
		add_action( 'wp_footer', [ Frontend::class, 'render_webchat' ] );
		add_action( 'rest_api_init', [ $this, 'register_rest_routes' ] );

		Cpt\Cpt_Manager::init();
		Hooks::init();
		Shortcode::init();
		Knowledge_Sync::init();

		do_action( 'bpwc_plugin_loaded' );
	}

	public function load_textdomain(): void {
		load_plugin_textdomain( 'botpress-webchat', false, dirname( plugin_basename( BPWC_PLUGIN_DIR ) ) . '/languages' );
	}

	public function register_rest_routes(): void {
		( new Rest\Rest_Settings() )->register_routes();
		( new Rest\Rest_Contacts() )->register_routes();
		( new Rest\Rest_Products() )->register_routes();
		( new Rest\Rest_Downloads() )->register_routes();
		( new Rest\Rest_Country_Reps() )->register_routes();
		( new Rest\Rest_Pages() )->register_routes();
		( new Rest\Rest_Site_Info() )->register_routes();
		( new Rest\Rest_Forms() )->register_routes();
		( new Rest\Rest_Conversations() )->register_routes();
		( new Rest\Rest_Sources() )->register_routes();
	}
}
