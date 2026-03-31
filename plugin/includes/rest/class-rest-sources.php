<?php

namespace Bpwc\Rest;

use Bpwc\Knowledge_Source;
use Bpwc\Field_Scanner;

class Rest_Sources {

	private const NAMESPACE = 'bpwc/v1';

	public function register_routes(): void {
		register_rest_route( self::NAMESPACE, '/sources', [
			[
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => [ $this, 'list_sources' ],
				'permission_callback' => [ $this, 'check_admin' ],
			],
			[
				'methods'             => \WP_REST_Server::CREATABLE,
				'callback'            => [ $this, 'create_source' ],
				'permission_callback' => [ $this, 'check_admin' ],
			],
		] );

		register_rest_route( self::NAMESPACE, '/sources/(?P<id>\d+)', [
			[
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => [ $this, 'get_source' ],
				'permission_callback' => [ $this, 'check_admin' ],
			],
			[
				'methods'             => \WP_REST_Server::EDITABLE,
				'callback'            => [ $this, 'update_source' ],
				'permission_callback' => [ $this, 'check_admin' ],
			],
			[
				'methods'             => \WP_REST_Server::DELETABLE,
				'callback'            => [ $this, 'delete_source' ],
				'permission_callback' => [ $this, 'check_admin' ],
			],
		] );

		// Post type scanner for WP-data mapping.
		register_rest_route( self::NAMESPACE, '/post-types', [
			'methods'             => \WP_REST_Server::READABLE,
			'callback'            => [ $this, 'get_post_types' ],
			'permission_callback' => [ $this, 'check_admin' ],
		] );

		// Preview mapped data.
		register_rest_route( self::NAMESPACE, '/sources/(?P<id>\d+)/preview', [
			'methods'             => \WP_REST_Server::READABLE,
			'callback'            => [ $this, 'preview_source' ],
			'permission_callback' => [ $this, 'check_admin' ],
		] );

		// Sync endpoint.
		register_rest_route( self::NAMESPACE, '/sources/(?P<id>\d+)/sync', [
			'methods'             => \WP_REST_Server::CREATABLE,
			'callback'            => [ $this, 'sync_source' ],
			'permission_callback' => [ $this, 'check_admin' ],
		] );

		// Bot endpoints.
		register_rest_route( self::NAMESPACE, '/bot/sources', [
			'methods'             => \WP_REST_Server::READABLE,
			'callback'            => [ $this, 'bot_list_sources' ],
			'permission_callback' => [ Rest_Base_Controller::class, 'check_bot_token' ],
		] );

		register_rest_route( self::NAMESPACE, '/bot/query/(?P<id>\d+)', [
			'methods'             => \WP_REST_Server::READABLE,
			'callback'            => [ $this, 'bot_query_source' ],
			'permission_callback' => [ Rest_Base_Controller::class, 'check_bot_token' ],
			'args'                => [
				'search' => [
					'type'              => 'string',
					'sanitize_callback' => 'sanitize_text_field',
					'default'           => '',
				],
			],
		] );
	}

	public function check_admin(): bool {
		return current_user_can( 'manage_options' );
	}

	public function list_sources(): \WP_REST_Response {
		$sources = Knowledge_Source::all();
		return new \WP_REST_Response( [
			'success' => true,
			'data'    => array_map( fn( $s ) => $s->to_array(), $sources ),
		] );
	}

	public function create_source( \WP_REST_Request $request ): \WP_REST_Response {
		$body = $request->get_json_params();

		$source         = new Knowledge_Source();
		$source->name   = sanitize_text_field( $body['name'] ?? '' );
		$source->type   = sanitize_text_field( $body['type'] ?? 'text' );
		$source->status = 'active';
		$source->config = $body['config'] ?? [];
		$source->prompt = sanitize_textarea_field( $body['prompt'] ?? '' );

		if ( empty( $source->name ) ) {
			return new \WP_REST_Response( [
				'success' => false,
				'message' => __( 'Name is required.', 'botpress-webchat' ),
			], 400 );
		}

		if ( $source->save() ) {
			return new \WP_REST_Response( [
				'success' => true,
				'data'    => $source->to_array(),
			], 201 );
		}

		return new \WP_REST_Response( [
			'success' => false,
			'message' => __( 'Failed to create source.', 'botpress-webchat' ),
		], 500 );
	}

	public function get_source( \WP_REST_Request $request ): \WP_REST_Response {
		$source = Knowledge_Source::find( (int) $request->get_param( 'id' ) );

		if ( ! $source ) {
			return new \WP_REST_Response( [
				'success' => false,
				'message' => __( 'Source not found.', 'botpress-webchat' ),
			], 404 );
		}

		return new \WP_REST_Response( [
			'success' => true,
			'data'    => $source->to_array(),
		] );
	}

	public function update_source( \WP_REST_Request $request ): \WP_REST_Response {
		$source = Knowledge_Source::find( (int) $request->get_param( 'id' ) );

		if ( ! $source ) {
			return new \WP_REST_Response( [
				'success' => false,
				'message' => __( 'Source not found.', 'botpress-webchat' ),
			], 404 );
		}

		$body = $request->get_json_params();

		if ( isset( $body['name'] ) ) {
			$source->name = sanitize_text_field( $body['name'] );
		}
		if ( isset( $body['type'] ) ) {
			$source->type = sanitize_text_field( $body['type'] );
		}
		if ( isset( $body['status'] ) ) {
			$source->status = sanitize_text_field( $body['status'] );
		}
		if ( isset( $body['config'] ) ) {
			$source->config = $body['config'];
		}
		if ( isset( $body['prompt'] ) ) {
			$source->prompt = sanitize_textarea_field( $body['prompt'] );
		}
		if ( isset( $body['sort_order'] ) ) {
			$source->sort_order = (int) $body['sort_order'];
		}

		if ( $source->save() ) {
			return new \WP_REST_Response( [
				'success' => true,
				'data'    => $source->to_array(),
			] );
		}

		return new \WP_REST_Response( [
			'success' => false,
			'message' => __( 'Failed to update source.', 'botpress-webchat' ),
		], 500 );
	}

	public function delete_source( \WP_REST_Request $request ): \WP_REST_Response {
		$source = Knowledge_Source::find( (int) $request->get_param( 'id' ) );

		if ( ! $source ) {
			return new \WP_REST_Response( [
				'success' => false,
				'message' => __( 'Source not found.', 'botpress-webchat' ),
			], 404 );
		}

		$source->delete();

		return new \WP_REST_Response( [ 'success' => true ] );
	}

	public function get_post_types(): \WP_REST_Response {
		return new \WP_REST_Response( [
			'success' => true,
			'data'    => Field_Scanner::get_post_types(),
		] );
	}

	public function preview_source( \WP_REST_Request $request ): \WP_REST_Response {
		$source = Knowledge_Source::find( (int) $request->get_param( 'id' ) );

		if ( ! $source ) {
			return new \WP_REST_Response( [
				'success' => false,
				'message' => __( 'Source not found.', 'botpress-webchat' ),
			], 404 );
		}

		$result = $source->query( '' );

		return new \WP_REST_Response( [
			'success' => true,
			'data'    => array_slice( $result['data'], 0, 5 ),
			'columns' => $result['columns'] ?? null,
			'total'   => $result['total'],
		] );
	}

	public function sync_source( \WP_REST_Request $request ): \WP_REST_Response {
		$source = Knowledge_Source::find( (int) $request->get_param( 'id' ) );

		if ( ! $source ) {
			return new \WP_REST_Response( [
				'success' => false,
				'message' => __( 'Source not found.', 'botpress-webchat' ),
			], 404 );
		}

		$result = $source->sync();

		return new \WP_REST_Response( [
			'success'     => $result,
			'message'     => $result ? __( 'Sync completed.', 'botpress-webchat' ) : __( 'Sync failed.', 'botpress-webchat' ),
			'last_synced' => $source->last_synced,
		] );
	}

	// Bot endpoints.

	public function bot_list_sources( \WP_REST_Request $request ): \WP_REST_Response {
		$sources = Knowledge_Source::all( 'active' );
		return new \WP_REST_Response( [
			'success' => true,
			'data'    => array_map( fn( $s ) => $s->to_bot_summary(), $sources ),
		] );
	}

	public function bot_query_source( \WP_REST_Request $request ): \WP_REST_Response {
		$source = Knowledge_Source::find( (int) $request->get_param( 'id' ) );

		if ( ! $source || 'active' !== $source->status ) {
			return new \WP_REST_Response( [
				'success' => false,
				'message' => __( 'Source not found.', 'botpress-webchat' ),
			], 404 );
		}

		$result = $source->query( $request->get_param( 'search' ) );

		return new \WP_REST_Response( [
			'success' => true,
			'source'  => $source->name,
			'prompt'  => $source->prompt,
			'data'    => $result['data'],
			'columns' => $result['columns'] ?? null,
			'total'   => $result['total'],
		] );
	}
}
