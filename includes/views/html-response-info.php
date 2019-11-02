<?php
/**
 * Response view: Information
 * 
 * @author  Sébastien Gagné
 * @package Formtastic/Views
 * @version 2.0.1
 */
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$post_id = get_the_ID();
$read    = get_post_meta( $post_id, 'ft_read', true );
$from    = get_post_meta( $post_id, 'ft_name', true );
$email   = get_post_meta( $post_id, 'ft_email', true );
$form_id = get_post_meta( $post_id, 'ft_form_id', true );
$files   = get_post_meta( $post_id, 'ft_file', true );
?>

<div class="ft-response-info">
	<header>
		<?php
			if ( ! empty( $from ) ) {
				echo sprintf( '<p><label>%s :</label><span>%s</span></p>',
					__( 'Name', 'formtastic' ),
					$from
				);
			}

			if ( ! empty( $email ) ) {
				echo sprintf( '<p><label>%s :</label><a href="mailto:%s">%2$s</a></p>',
					__( 'Email', 'formtastic' ),
					$email
				);
			}

			echo sprintf( '<p><label>%s :</label><span>%s</span></p>',
				__( 'Form', 'formtastic' ),
				get_the_title( $form_id )
			);

			echo sprintf( '<p><label>%s :</label><span>%s</span></p>',
				__( 'Date and time', 'formtastic' ),
				ft_language_code() == 'fr' ? get_the_time( 'j F Y - G\hi' ) : get_the_time( 'F j, Y - g:i a' )
			);

			echo '<hr>';

			if ( isset( $files ) && ! empty( $files ) && $files !== 'null' ) {
				$files = json_decode( $files );
				$sep = false;

				foreach ( $files as $file ) {
					if ( ! empty( $file->filename ) ) {
						echo sprintf( '<p>%s<a href="%s" target="_blank">%s</a></p>',
							ft_icon( 'download', false ),
							$file->url,
							$file->filename
						);

						$sep = true;
					}
				}

				if ( $sep ) {
					echo '<hr>';
				}
			}

			echo sprintf( '<a href="#" class="ft-resend button button-primary" title="%s" data-form="%s" data-id="%s">%1$s</a>', 
				__( 'Resend', 'formtastic' ),
				$form_id,
				$post_id
			);

			echo sprintf( '<a href="%s" title="%s" class="button">%2$s</a>',
				get_delete_post_link( $post->ID ),
				__( 'Delete response', 'formtastic' )
			);
		?>
	</header>
</div>
