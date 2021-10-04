<?php
/**
 * Settings
 *
 * @author  Sébastien Gagné
 * @package Formtastic/Classes
 * @version 2.7.2 
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

/**
 * FT_Settings class
 */
class FT_Settings {

	private $dev, $smtp, $customize, $scrolling;

	public function __construct() {
		add_action( 'admin_menu', array( $this, 'settings' ), 5 );
		add_action( 'custom_menu_order', array( $this, 'menu_order' ), 5 );
		add_action( 'admin_init', array( $this, 'settings_init' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'settings_scripts' ) );
	}

	/**
	 * Settings page
	 */
	public function settings() {
		add_submenu_page(
			'edit.php?post_type=formtastic',
			__( 'Formtastic settings', 'formtastic' ),
			__( 'Settings', 'formtastic' ),
			'manage_options',
			'ft-settings',
			array( $this, 'output_settings' )
		);
	}

	/**
	 * Settings scripts
	 */
	public function settings_scripts() {
		wp_enqueue_media();
	}

	/**
	 * Settings menu order
	 */
	public function menu_order( $order ) {
		global $submenu;

		$options = get_option( 'ft_general' );

		$menu = 'edit.php?post_type=formtastic';

		if ( ! isset( $submenu[ $menu ] ) ) {
			return;
		}

		if ( current_user_can( 'manage_options' ) ) {
			$submenu[ $menu ] = array(
				$submenu[ $menu ][5],
				$submenu[ $menu ][10],
				// $submenu[ $menu ][13],
				$submenu[ $menu ][12],
				$submenu[ $menu ][11]
			);

		} else if ( current_user_can( 'publish_pages' ) ) {
			$submenu[ $menu ] = array(
				$submenu[ $menu ][5],
				$submenu[ $menu ][10],
				$submenu[ $menu ][11]
			);

		} else {
			remove_menu_page( 'edit.php?post_type=formtastic' );
		}

		return $order;
	}

	/**
	 * Output settings page
	 */
	public function output_settings() {
		$this->general   = get_option( 'ft_general' );
		$this->smtp      = get_option( 'ft_smtp' );
		$this->customize = get_option( 'ft_customize' );
		?>

		<div class="wrap">
			<?php $active_tab = isset( $_GET[ 'tab' ] ) ? $_GET[ 'tab' ] : 'general'; ?>  
			
			<nav class="nav-tab-wrapper ft-nav-tab-wrapper">  
				<a href="?post_type=formtastic&page=ft-settings&tab=general" class="nav-tab <?php echo $active_tab == 'general' ? 'nav-tab-active' : ''; ?>"><?php _e( 'General', 'formtastic' ); ?></a>  
				<?php /* <a href="?post_type=formtastic&page=ft-settings&tab=smtp" class="nav-tab <?php echo $active_tab == 'smtp' ? 'nav-tab-active' : ''; ?>"><?php _e( 'SMTP', 'formtastic' ); ?></a> */ ?>
				<a href="?post_type=formtastic&page=ft-settings&tab=customize" class="nav-tab <?php echo $active_tab == 'customize' ? 'nav-tab-active' : ''; ?>"><?php _e( 'Customize', 'formtastic' ); ?></a>  
			</nav>

			<h1 class="screen-reader-text"><?php _e( 'Formtastic settings', 'formtastic' ); ?></h1>
			<?php settings_errors(); ?> 

		    <form method="post" action="options.php">
				<?php 
					if ( $active_tab == 'general' ) {  
						settings_fields( 'ft_general' );
						do_settings_sections( 'ft_general_settings' );

					} else if ( $active_tab == 'smtp' ) {
						settings_fields( 'ft_smtp' );
						do_settings_sections( 'ft_smtp_settings' );

					} else if ( $active_tab == 'customize' ) {
						settings_fields( 'ft_customize' );
						do_settings_sections( 'ft_customize_settings' );
					}

					submit_button();
				?>  
		    </form>
		</div>
		
		<?php
	}

	/**
	 * Register and add settings
	 */
	public function settings_init() {
		/**
		 * General
		 */
		register_setting(
		    'ft_general',
		    'ft_general',
		    array( $this, 'sanitize' )
		);

		add_settings_section(
		    'ft_general_dev',
		    __( 'Dev', 'formtastic' ),
		    function() {
				print __( 'Activate dev mode to overwrite all email.', 'formtastic' );
		    },
		    'ft_general_settings'
		);

		add_settings_field(
		    'ft_general_dev_use',
		    __( 'Super dev mode', 'formtastic' ),
		    array( $this, 'general_dev_use' ),
		    'ft_general_settings',
		    'ft_general_dev'          
		);

		add_settings_field(
		    'ft_general_dev_email',
		    __( 'Email', 'formtastic' ),
		    array( $this, 'general_dev_email' ),
		    'ft_general_settings',
		    'ft_general_dev'          
		);

		add_settings_section(
	        'ft_general_scroll',
	        '<hr><br />' . __( 'Scrolling', 'formtastic' ),
	        function() {
	            print __( 'Activate smooth scrolling to smoothly scroll to the form when sended.', 'formtastic' );
	        },
	        'ft_general_settings'
	    );

	    add_settings_field(
	        'ft_general_scroll_use',
	        __( 'Smooth scrolling', 'formtastic' ),
		    array( $this, 'general_scroll_use' ),
	        'ft_general_settings',
	        'ft_general_scroll'          
	    );

	    add_settings_field(
	        'ft_general_scroll_speed',
	        __( 'Speed', 'formtastic' ),
		    array( $this, 'general_scroll_speed' ),
	        'ft_general_settings',
	        'ft_general_scroll'          
	    );

        add_settings_field(
            'ft_general_scroll_offset',
            __( 'Offset', 'formtastic' ),
    	    array( $this, 'general_scroll_offset' ),
            'ft_general_settings',
            'ft_general_scroll'          
        );

        add_settings_field(
            'ft_general_scroll_tag',
            __( 'HTML tag', 'formtastic' ),
    	    array( $this, 'general_scroll_tag' ),
            'ft_general_settings',
            'ft_general_scroll'          
        );

		add_settings_section(
		    'ft_general_captcha',
		    '<hr><br />' . __( 'Captcha', 'formtastic' ),
		    function() {
		        print __( '<a href="https://www.google.com/recaptcha/" target="_blank">reCAPTCHA v3</a>', 'formtastic' );
		    },
		    'ft_general_settings'
		);

	    add_settings_field(
	        'ft_general_use_captcha',
	        __( 'Use captcha', 'formtastic' ),
		    array( $this, 'general_use_captcha' ),
	        'ft_general_settings',
	        'ft_general_captcha'          
	    );

		add_settings_field(
		    'ft_general_site_key',
		    __( 'Site key', 'formtastic' ),
		    array( $this, 'general_site_key' ),
		    'ft_general_settings',
		    'ft_general_captcha'          
		);

		add_settings_field(
		    'ft_general_secret_key',
		    __( 'Secret key', 'formtastic' ),
		    array( $this, 'general_secret_key' ),
		    'ft_general_settings',
		    'ft_general_captcha'          
		);

		// add_settings_section(
		//     'ft_general_role',
		//     '<hr><br />' . __( 'Role', 'formtastic' ),
		//     function() {
		//         print __( 'Minimum role to access plugin options.', 'formtastic' );
		//     },
		//     'ft_general_settings'
		// );

		// add_settings_field(
		//     'ft_general_role_form',
		//     __( 'Create forms', 'formtastic' ),
		//     array( $this, 'general_role_form' ),
		//     'ft_general_settings',
		//     'ft_general_role'          
		// );

		// add_settings_field(
		//     'ft_general_role_response',
		//     __( 'Read responses', 'formtastic' ),
		//     array( $this, 'general_role_response' ),
		//     'ft_general_settings',
		//     'ft_general_role'          
		// );

		/**
		 * SMTP
		 */
		// register_setting(
		//     'ft_smtp',
		//     'ft_smtp',
		//     array( $this, 'sanitize' )
		// );

		// add_settings_section(
		//     'ft_smtp',
		//     __( 'SMTP', 'formtastic' ),
		//     function() {
		//         print __( 'Enter your SMTP information below.', 'formtastic' );
		//     },
		//     'ft_smtp_settings'
		// );  

		// add_settings_field(
		//     'ft_use_smtp',
		//     __( 'SMTP', 'formtastic' ),
		//     array( $this, 'smtp_use' ),
		//     'ft_smtp_settings',
		//     'ft_smtp'          
		// );

		// add_settings_field(
		//     'ft_host',
		//     __( 'Host', 'formtastic' ),
		//     array( $this, 'smtp_host' ),
		//     'ft_smtp_settings',
		//     'ft_smtp'          
		// );

		// add_settings_field(
		//     'ft_port',
		//     __( 'Port', 'formtastic' ),
		//     array( $this, 'smtp_port' ),
		//     'ft_smtp_settings',
		//     'ft_smtp'          
		// );

		// add_settings_field(
		//     'ft_encryption',
		//     __( 'Encryption', 'formtastic' ),
		//     array( $this, 'smtp_encryption' ),
		//     'ft_smtp_settings',
		//     'ft_smtp'          
		// ); 

		// add_settings_field(
		//     'ft_username',
		//     __( 'Username', 'formtastic' ),
		//     array( $this, 'smtp_username' ),
		//     'ft_smtp_settings',
		//     'ft_smtp'          
		// );  

		// add_settings_field(
		//     'ft_password',
		//     __( 'Password', 'formtastic' ),
		//     array( $this, 'smtp_password' ),
		//     'ft_smtp_settings',
		//     'ft_smtp'          
		// );

	    /**
	     * Customize
	     */
	    register_setting(
	        'ft_customize',
	        'ft_customize',
	        array( $this, 'sanitize' )
	    );

	    add_settings_section(
	        'ft_customize',
	        __( 'Customize', 'formtastic' ),
	        function() {
	            print __( 'Set the logo and color on email template.', 'formtastic' );
	        },
	        'ft_customize_settings'
	    );

	    add_settings_field(
	        'ft_custom_logo',
	        __( 'Logo', 'formtastic' ),
		    array( $this, 'custom_logo' ),
	        'ft_customize_settings',
	        'ft_customize'
	    );

	    add_settings_field(
	        'ft_custom_color',
	        __( 'Color', 'formtastic' ),
		    array( $this, 'custom_color' ),
	        'ft_customize_settings',
	        'ft_customize'
	    );
	}

	/**
	 * Sanitize each setting field as needed
	 */
	public function sanitize( $input ) {
	    $new_input = array();

	    if ( $input ) :
		    foreach ( $input as $key => $value ) {
		    	if ( $key == 'email' ) {
		    		$new_input[ $key ] = sanitize_email( $value );

		    	} else {
		    		$new_input[ $key ] = sanitize_text_field( $value );
		    	}
		    }
		endif;

	    return $new_input;
	}

	/**
	 * Callback
	 */
    public function general_dev_use() {
	    echo sprintf( '<label for="general_dev_use"><input type="checkbox" id="general_dev_use" name="ft_general[dev_use]" value="yes" %s/>%s</label>',
	    	isset( $this->general['dev_use'] ) ? checked( $this->general['dev_use'], 'yes', false ) : '',
	    	__( 'Use the super dev mode', 'formtastic' )
	    );
	}

    public function general_dev_email() {
	    echo sprintf( '<input type="text" id="general_dev_email" name="ft_general[dev_email]" value="%s" />',
	        ! empty( $this->general['dev_email'] ) ? $this->general['dev_email'] : get_bloginfo( 'admin_email' )
	    );
	}

	public function general_scroll_use() {
	    echo sprintf( '<label for="general_scroll_use"><input type="checkbox" id="general_scroll_use" name="ft_general[scroll_use]" value="yes" %s/>%s</label>',
	    	isset( $this->general['scroll_use'] ) ? checked( $this->general['scroll_use'], 'yes', false ) : '',
	    	__( 'Use the smooth scrolling', 'formtastic' )
	    );
	}

	public function general_scroll_speed() {
	    echo sprintf( '<input type="number" id="general_scroll_speed" name="ft_general[scroll_speed]" value="%s" />',
	    	! empty( $this->general['scroll_speed'] ) ? $this->general['scroll_speed'] : '800'
	    );
	}

	public function general_scroll_offset() {
	    echo sprintf( '<input type="number" id="general_scroll_offset" name="ft_general[scroll_offset]" value="%s" />',
	    	! empty( $this->general['scroll_offset'] ) ? $this->general['scroll_offset'] : '0'
	    );
	}

	public function general_scroll_tag() {
	    echo sprintf( '<input type="text" id="general_scroll_tag" name="ft_general[scroll_tag]" value="%s" />',
	    	! empty( $this->general['scroll_tag'] ) ? $this->general['scroll_tag'] : ''
	    );
	}

	public function general_use_captcha() {
	    echo sprintf( '<label for="general_use_captcha"><input type="checkbox" id="general_use_captcha" name="ft_general[use_captcha]" value="yes" %s/>%s</label>',
	    	isset( $this->general['use_captcha'] ) ? checked( $this->general['use_captcha'], 'yes', false ) : '',
	    	__( 'Use reCAPTCHA', 'formtastic' )
	    );
	}

	public function general_site_key() {
	    echo sprintf( '<input type="text" id="general_site_key" placeholder="" name="ft_general[site_key]" value="%s" />',
	    	! empty( $this->general['site_key'] ) ? $this->general['site_key'] : ''
	    );
	}

	public function general_secret_key() {
	    echo sprintf( '<input type="text" id="general_secret_key" placeholder="" name="ft_general[secret_key]" value="%s" />',
	    	! empty( $this->general['secret_key'] ) ? $this->general['secret_key'] : ''
	    );
	}

	// public function general_role_form() {
	// 	$selected = ! empty( $this->general['role_form'] ) ? $this->general['role_form'] : 'manage_options';

	//     echo '<select id="general_role_form" name="ft_general[role_form]">';
	//     echo self::role_dropdown( $selected );
	// 	echo '</select>';
	// }

	// public function general_role_response() {
	// 	$selected = ! empty( $this->general['role_response'] ) ? $this->general['role_response'] : 'manage_options';

	//     echo '<select id="general_role_response" name="ft_general[role_response]">';
	//     echo self::role_dropdown( $selected );
	// 	echo '</select>';
	// }

	public function smtp_use() {
	    echo sprintf( '<label for="smtp_use"><input type="checkbox" id="smtp_use" name="ft_smtp[use]" value="yes" %s/>%s</label>',
	    	isset( $this->smtp['use'] ) ? checked( $this->smtp['use'], 'yes', false ) : '',
	    	__( 'Use SMTP', 'formtastic' )
	    );
	}

	public function smtp_host() {
	    echo sprintf( '<input type="text" id="smtp_host" name="ft_smtp[host]" value="%s" />',
	        ! empty( $this->smtp['host'] ) ? $this->smtp['host'] : Formtastic::smtp( 'host' )
	    );
	}

	public function smtp_port() {
	    echo sprintf( '<input type="text" id="smtp_port" name="ft_smtp[port]" value="%s" />',
	        ! empty( $this->smtp['port'] ) ? $this->smtp['port'] : Formtastic::smtp( 'port' )
	    );
	}

	public function smtp_encryption() {
	    echo '<select id="smtp_encryption" name="ft_smtp[encryption]">';
	    echo sprintf( '<option value="%s" %s>%s</option>', 
	    	'none', 
	    	selected( $this->smtp['encryption'], 'none' ), 
	    	__( 'None', 'formtastic' ) 
	    );
	    echo sprintf( '<option value="%s" %s>%s</option>', 
	    	'tls', 
	    	selected( $this->smtp['encryption'], 'tls' ), 
	    	__( 'TLS', 'formtastic' ) 
	    );
	    echo sprintf( '<option value="%s" %s>%s</option>', 
	    	'ssl', 
	    	selected( $this->smtp['encryption'], 'ssl' ), 
	    	__( 'SSL', 'formtastic' ) 
	    );
		echo '</select>';
	}

	public function smtp_username() {
	    echo sprintf( '<input type="text" id="smtp_username" name="ft_smtp[username]" value="%s" />',
	        ! empty( $this->smtp['username'] ) ? $this->smtp['username'] : Formtastic::smtp( 'username' )
	    );
	}

	public function smtp_password() {
	    echo sprintf( '<input type="password" id="smtp_password" name="ft_smtp[password]" value="%s" />',
	        ! empty( $this->smtp['password'] ) ? $this->smtp['password'] : Formtastic::smtp( 'password' )
	    );
	}

	public function custom_logo() {
	    $default_image = plugins_url( '../assets/img/placeholder.png', __FILE__ );

	    if ( ! empty( $this->customize['logo'] ) ) {
			$img_attr = wp_get_attachment_image_src( $this->customize['logo'], 'medium' );
			$src      = $img_attr[0];
			$value    = $this->customize['logo'];
	        
	    } else {
			$src   = $default_image;
			$value = '';
	    }
	    
	    $text = __( 'Upload', 'formtastic' );

	    echo '<div class="ft-upload">';
	    echo sprintf( '<img data-src="%s" src="%s" />',
	    	$default_image,
	    	$src
		);
	    echo '<div>
				<input type="hidden" name="ft_customize[logo]" id="custom_logo" value="' . $value . '" />
				<button type="submit" class="button ft-upload-media">' . $text . '</button>
				<button type="submit" class="button ft-remove-media">&times;</button>
			</div>';
	    echo '</div>';
	}

	public function custom_color() {
	    echo sprintf( '<input type="text" id="custom_color" name="ft_customize[color]" value="%s" />',
	        isset( $this->customize['color'] ) ? $this->customize['color'] : ''
	    );
	}

	public static function role_dropdown( $selected ) {
		$output = '';
		$roles  = array(
			'read'           => __( 'Subscriber', 'formtastic' ),
			'edit_posts'     => __( 'Contributor', 'formtastic' ),
			'publish_posts'  => __( 'Author', 'formtastic' ),
			'publish_pages'  => __( 'Editor', 'formtastic' ),
			'manage_options' => __( 'Administrator', 'formtastic' )
		);

		foreach ( $roles as $key => $value ) {
			$output .= sprintf( '<option value="%s" %s>%s</option>', $key, selected( $selected, $key ), $value );
		}

		return $output;
	}

}

if ( is_admin() ) {
	$ft_settings = new FT_Settings();
}
