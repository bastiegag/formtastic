<?php
/**
 * Form view: Fields
 * 
 * @author  Sébastien Gagné
 * @package Formtastic/Views
 * @version 2.4.2
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
			'button'   => __( 'Button', 'formtastic' ),
			'hidden'   => __( 'Hidden', 'formtastic' ),
			'row'      => __( 'Row', 'formtastic' ),
			'message'  => __( 'Message', 'formtastic' ),
			'repeater' => __( 'Repeater', 'formtastic' ),
		);

		foreach ( $fields as $key => $value ) {
			echo sprintf( '<li><a href="#" title="%1$s" class="ft-create-field" data-field="%s">' . ft_icon( '%1$s', false ) . '<span>%2$s</span></a></li>',
				$key,
				$value
			);
		} 
	?>
</ul>
