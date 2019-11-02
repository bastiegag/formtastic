<?php
/**
 * Response view: Information
 * 
 * @author  Sébastien Gagné
 * @package Formtastic/Views
 * @version 2.1.2
 */
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$read    = get_post_meta( $post->ID, 'ft_read', true );
$from    = get_post_meta( $post->ID, 'ft_name', true );
$email   = get_post_meta( $post->ID, 'ft_email', true );
$form_id = get_post_meta( $post->ID, 'ft_form_id', true );
?>

<div class="ft-response">
	<div class="bar bar-top"></div>
	<?php 
		$post_id  = get_the_ID();
		$response = get_page( $post_id );
		
		echo '<h1>' . $response->post_title . '</h1><br />';

		echo nl2br( $response->post_content );
	?>
	<div class="bar bar-bottom"></div>
</div>
