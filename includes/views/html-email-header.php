<?php
/**
 * Email view: Header
 * 
 * @author  Sébastien Gagné
 * @package Formtastic/Views
 * @version 2.6.0
 */
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$options = get_option( 'ft_customize' );
?>

<!DOCTYPE html>
<html <?php language_attributes(); ?> style="background-color: #f7f5f7;">
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=<?php bloginfo( 'charset' ); ?>" />
		<title><?php echo get_bloginfo( 'name', 'display' ); ?></title>
	</head>
	<body marginwidth="0" topmargin="0" marginheight="0" offset="0" style="padding-top: 50px;">
		<div id="wrapper" dir="ltr">
			<table border="0" cellpadding="0" cellspacing="0" height="100%" width="100%">
				<tr>
					<td align="center" valign="top">
						<div id="template_header_image">
							<?php
								if ( ! empty( $options['logo'] ) ) {
									$img = wp_get_attachment_image_src( $options['logo'], 'medium' );
									$src = $img[0];

									echo sprintf( '<p style="margin-top: 0; margin-bottom: 20px; max-width: %s;"><img src="%s" style="width: %s;" /></p>',
										'200px',
										esc_url( $src ),
										'100%'
									);
								}

								$color = $options['color'];
								$bg = ! empty( $color ) ? ' background-color: ' . $color . ';' : '';
								$border = ! empty( $color ) ? ' style="border-right: 2px solid ' . $color . '; border-left: 2px solid ' . $color . ';"' : '';
							?>
						</div>
						<table border="0" cellpadding="0" cellspacing="0" width="600" id="template_container" style="background-color: #ffffff; border: 1px solid rgba(0,0,0,0.15); box-shadow: 0 0 3px rgba(0,0,0,0.075); padding: 0px;">
							<tr>
								<td align="center" valign="top">
									<!-- Header -->
									<table border="0" cellpadding="0" cellspacing="0" width="600" id="template_header" style="padding: 20px;<?php echo $bg; ?>">
										<tr>
											<td>
												
											</td>
										</tr>
									</table>
									<!-- End Header -->
								</td>
							</tr>
							<tr>
								<td align="center" valign="top">
									<!-- Body -->
									<table border="0" cellpadding="0" cellspacing="0" width="600" id="template_body"<?php echo $border; ?>>
										<tr>
											<td valign="top" id="body_content">
												<!-- Content -->
												<table border="0" cellpadding="20" cellspacing="0" width="100%">
													<tr>
														<td valign="top">
															<div id="body_content_inner" style="color: #666666; font-family: Verdana, Geneva, sans-serif; font-size: 13px;">
																<h1 style="margin: 20px 0 30px 0; border-bottom: 1px solid #e6e6e6; padding-bottom: 6px; color: <?php echo $color; ?>; font-size: 18px; font-family: Verdana, Geneva, sans-serif; font-weight: normal;"><?php echo $mail['object']; ?></h1>
