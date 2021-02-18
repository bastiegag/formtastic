<?php
/**
 * Form view: Fields
 * 
 * @author  Sébastien Gagné
 * @package Formtastic/Views
 * @version 2.6.6
 */
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
?>

<ul class="ft-fields">
	<?php
		$fields = array(
			'text'     => __( 'Text', 'formtastic' ),
			'textarea' => __( 'Textarea', 'formtastic' ),
			'name'     => __( 'Name', 'formtastic' ),
			'email'    => __( 'Email', 'formtastic' ),
			'address'  => __( 'Address', 'formtastic' ),
			'postal'   => __( 'Postal code', 'formtastic' ),
			'date'     => __( 'Date', 'formtastic' ),
			'time'     => __( 'Time', 'formtastic' ),
			'tel'      => __( 'Phone', 'formtastic' ),
			'url'      => __( 'Url', 'formtastic' ),
			'search'   => __( 'Search', 'formtastic' ),
			'password' => __( 'Password', 'formtastic' ),
			'select'   => __( 'Select', 'formtastic' ),
			'number'   => __( 'Number', 'formtastic' ),
			'radio'    => __( 'Radio', 'formtastic' ),
			'checkbox' => __( 'Checkbox', 'formtastic' ),
			'range'    => __( 'Range', 'formtastic' ),
			'color'    => __( 'Color', 'formtastic' ),
			'file'     => __( 'File', 'formtastic' ),
			'hidden'   => __( 'Hidden', 'formtastic' ),
			'row'      => __( 'Row', 'formtastic' ),
			'message'  => __( 'Message', 'formtastic' ),
			'button'   => __( 'Send button', 'formtastic' )
		);

		foreach ( $fields as $key => $value ) {
			echo sprintf( '<li><a href="#" title="%s" class="ft-create-field" data-field="%s">%s<span>%1$s</span></a></li>',
				$value,
				$key,
				$key !== 'button' ? ft_icon( $key, false ) : ''
			);
		} 
	?>
</ul>
