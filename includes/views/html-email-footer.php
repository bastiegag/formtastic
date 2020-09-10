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

$version = Formtastic::version();
$options = get_option( 'ft_customize' );
?>

															</div>
														</td>
													</tr>
												</table>
												<!-- End Content -->
											</td>
										</tr>
									</table>
									<!-- End Body -->
								</td>
							</tr>
							<tr>
								<td align="center" valign="top">

									<?php
										$color = $options['color'];
										$bg    = ! empty( $color ) ? ' background-color: ' . $color . ';' : '';
									?>

									<!-- Footer -->
									<table border="0" cellpadding="0" cellspacing="0" width="600" id="template_footer" style="padding: 1px;<?php echo $bg; ?>">
										<tr>
											<td valign="top">
												<table border="0" cellpadding="0" cellspacing="0" width="100%">
													<tr>
														<td colspan="2" valign="middle" id="credit">
														</td>
													</tr>
												</table>
											</td>
										</tr>
									</table>
									<!-- End Footer -->
								</td>
							</tr>
						</table>
						<div>
							<p style="text-align: center; font-family: Verdana, Geneva, sans-serif; color: #999999; margin: 0; line-height: 30px; font-size: 11px;"><?php echo __( 'This form was sent from', 'formtastic' ) . ' <a href="' . get_bloginfo( 'url' ) . '">' . get_bloginfo( 'name' ) . '</a> - Formtastic ' . $version; ?></p>
						</div>
					</td>
				</tr>
			</table>
		</div>
	</body>
</html>