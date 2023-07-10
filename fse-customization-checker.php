<?php
/**
 * Plugin Name: FSE Customization Checker
 *
 */
function fse_customization_checker_menu() {
	add_menu_page(
		__( 'FSE Customization Checker', 'fsecustomizationchecker' ),
		__( 'FSE Customization Checker', 'fsecustomizationchecker' ),
		'manage_options',
		'fse-customization-checker',
		function () {
			echo '
			<h2>FSE Customizations</h2>
			<div id="fse-customization-checker"></div>
		';
		},
		'dashicons-schedule',
		3
	);
}

add_action( 'admin_menu', 'fse_customization_checker_menu' );

function load_custom_fse_customization_checker_wp_admin_scripts( $hook ) {
	// Load only on ?page=fse-customization-checker.
	if ( 'toplevel_page_fse-customization-checker' !== $hook ) {
		return;
	}

	// Load the required WordPress packages.

	// Automatically load imported dependencies and assets version.
	$asset_file = include plugin_dir_path( __FILE__ ) . 'build/index.asset.php';

	// Enqueue CSS dependencies.
	foreach ( $asset_file['dependencies'] as $style ) {
		wp_enqueue_style( $style );
	}

	// Load our app.js.
	wp_register_script(
		'fse-customization-checker',
		plugins_url( 'build/index.js', __FILE__ ),
		$asset_file['dependencies'],
		$asset_file['version'],
		true
	);
	wp_enqueue_script( 'fse-customization-checker' );

	// Load our style.css.
	wp_register_style(
		'fse-customization-checker',
		plugins_url( 'style.css', __FILE__ ),
		array(),
		$asset_file['version']
	);
	wp_enqueue_style( 'fse-customization-checker' );
}

add_action( 'admin_enqueue_scripts', 'load_custom_fse_customization_checker_wp_admin_scripts' );

function fse_customization_checker_get_global_styles( WP_REST_Request $request ) {
	$post_id = $request->get_param( 'id' );
	$post    = get_post( $post_id );

	$revisions     = wp_get_post_revisions( $post_id );
	$last_revision = array_shift( $revisions );

	return new WP_REST_Response(
		array(
			'content'               => $post->post_content,
			'last_revision_content' => $last_revision->post_content,
		),
		200
	);
}

add_action(
	'rest_api_init',
	function () {
		register_rest_route(
			'fse_customization_checker/v1',
			'/globalstyles/(?P<id>\d+)',
			array(
				'methods'  => 'GET',
				'callback' => 'fse_customization_checker_get_global_styles',
			)
		);
	}
);

function fse_customization_checker_get_custom_css( WP_REST_Request $request ) {
	$args = array(
		'numberposts' => 1,
		'orderby'     => 'date',
		'order'       => 'DESC',
		'post_type'   => 'custom_css',
	);

	$latest_posts = get_posts( $args );

	if ( empty( $latest_posts ) ) {
		return new WP_REST_Response( null, 204 );
	}

	$post    = $latest_posts[0];
	$post_id = $post->ID;

	$revisions     = wp_get_post_revisions( $post_id );
	$last_revision = array_shift( $revisions );

	return new WP_REST_Response(
		array(
			'content'               => $post->post_content,
			'last_revision_content' => $last_revision->post_content,
		),
		200
	);
}

add_action(
	'rest_api_init',
	function () {
		register_rest_route(
			'fse_customization_checker/v1',
			'/customcss',
			array(
				'methods'  => 'GET',
				'callback' => 'fse_customization_checker_get_custom_css',
			)
		);
	}
);

