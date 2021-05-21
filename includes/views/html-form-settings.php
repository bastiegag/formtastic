<?php
/**
 * Form view: Settings
 * 
 * @author  Sébastien Gagné
 * @package Formtastic/Views
 * @version 2.7.0
 */
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$formtastic = get_post_meta( $post->ID, 'formtastic', true );

if ( empty( $formtastic ) ) {
	$formtastic = array();
	$formtastic['settings'] = null;
}
?>

<div class="ft-tabs">
	<ul class="ft-tabs-nav">
		<li><a href="#ft-tab-email" class="active"><?php _e( 'Email', 'formtastic' ); ?></a></li>
		<li><a href="#ft-tab-form"><?php _e( 'Form', 'formtastic' ); ?></a></li>
		<li><a href="#ft-tab-confirmation"><?php _e( 'Confirmation', 'formtastic' ); ?></a></li>
		<li><a href="#ft-tab-reply"><?php _e( 'Auto reply', 'formtastic' ); ?></a></li>
		<li><a href="#ft-tab-copy"><?php _e( 'Copy', 'formtastic' ); ?></a></li>
		<li><a href="#ft-tab-mailchimp"><?php _e( 'Mailchimp', 'formtastic' ); ?></a></li>
	</ul>

	<div class="ft-content">
		<div id="ft-tab-email" class="ft-tab-content active">
			<div class="ft-settings">
				<div class="ft-row">
					<div class="ft-col ft-col-12 ft-sep">
						<div class="ft-field">
							<label for="send_email">
								<input type="checkbox" name="formtastic[settings][send_email]" id="send_email" value="yes" <?php if ( isset( $formtastic['settings']['send_email'] ) ) checked( $formtastic['settings']['send_email'], 'yes', true ); ?>>
								<?php _e( 'Send by email', 'formtastic' ); ?>
							</label>

							<label for="save_copy">
								<input type="checkbox" name="formtastic[settings][save_copy]" id="save_copy" value="yes" <?php if ( isset( $formtastic['settings']['save_copy'] ) ) checked( $formtastic['settings']['save_copy'], 'yes', true ); ?>>
								<?php _e( 'Save a copy on Wordpress', 'formtastic' ); ?>
							</label>
						</div>
					</div>
					<div class="ft-col ft-col-6">
						<div class="ft-field">
							<label for="to"><?php _e( 'To', 'formtastic' ); ?> :</label>
							<input type="text" name="formtastic[settings][to]" id="to" value="<?php echo ! empty( $formtastic['settings']['to'] ) ? esc_html( $formtastic['settings']['to'] ) : ''; ?>" placeholder="<?php echo get_bloginfo( 'admin_email' ); ?>" class="ft-input" />
						</div>
					</div>
					<div class="ft-col ft-col-6">
						<div class="ft-field">
							<label for="cc"><?php _e( 'Cc', 'formtastic' ); ?> :</label>
							<input type="text" name="formtastic[settings][cc]" id="cc" value="<?php echo ! empty( $formtastic['settings']['cc'] ) ? esc_html( $formtastic['settings']['cc'] ) : ''; ?>" class="ft-input" />
						</div>
					</div>
				</div>

				<div class="ft-row">
					<div class="ft-col ft-col-12">
						<div class="ft-field">
							<label for="object"><?php _e( 'Object', 'formtastic' ); ?> :</label>
							<input type="text" name="formtastic[settings][object]" id="object" value="<?php echo ! empty( $formtastic['settings']['object'] ) ? esc_html( $formtastic['settings']['object'] ) : ''; ?>" placeholder="<?php echo get_the_title( $post->ID ); ?>" class="ft-input" />
						</div>
					</div>
					<div class="ft-col ft-col-6">
						<div class="ft-field">
							<label for="from_name"><?php _e( 'From name', 'formtastic' ); ?> :</label>
							<input type="text" name="formtastic[settings][from_name]" id="from_name" value="<?php echo ! empty( $formtastic['settings']['from_name'] ) ? esc_html( $formtastic['settings']['from_name'] ) : ''; ?>" placeholder="<?php echo get_bloginfo( 'name' ); ?>" class="ft-input" />
						</div>
					</div>
					<div class="ft-col ft-col-6">
						<div class="ft-field">
							<label for="from_email"><?php _e( 'From email', 'formtastic' ); ?> :</label>
							<input type="text" name="formtastic[settings][from_email]" id="from_email" value="<?php echo ! empty( $formtastic['settings']['from_email'] ) ? esc_html( $formtastic['settings']['from_email'] ) : ''; ?>" placeholder="<?php echo get_bloginfo( 'admin_email' ); ?>" class="ft-input" />
						</div>
					</div>
				</div>
			</div>
		</div>

		<div id="ft-tab-form" class="ft-tab-content">
			<div class="ft-settings">
				<div class="ft-row">
					<div class="ft-col ft-col-6">
						<div class="ft-field">
							<label for="optional_markup"><?php _e( 'Optional fields markup', 'formtastic' ); ?> :</label>
							<input type="text" name="formtastic[settings][optional_markup]" id="optional_markup" class="ft-input" value="<?php echo ! empty( $formtastic['settings']['optional_markup'] ) ? esc_html( $formtastic['settings']['optional_markup'] ) : '' ?>">
						</div>
					</div>
					<div class="ft-col ft-col-6">
						<div class="ft-field">
							<label for="required_markup"><?php _e( 'Required fields markup', 'formtastic' ); ?> :</label>
							<input type="text" name="formtastic[settings][required_markup]" id="required_markup" class="ft-input" value="<?php echo ! empty( $formtastic['settings']['required_markup'] ) ? esc_html( $formtastic['settings']['required_markup'] ) : '' ?>">
						</div>
					</div>
				</div>

				<div class="ft-row">
					<div class="ft-col ft-col-6">
						<div class="ft-field">
							<label for="button_label"><?php _e( 'Button label', 'formtastic' ); ?> :</label>
							<input type="text" name="formtastic[settings][button_label]" id="button_label" class="ft-input" placeholder="<?php _e( 'Submit', 'formtastic' ); ?>" value="<?php echo ! empty( $formtastic['settings']['button_label'] ) ? esc_html( $formtastic['settings']['button_label'] ) : '' ?>">
						</div>
					</div>
					<div class="ft-col ft-col-6">
						<div class="ft-field">
							<label for="button_classes"><?php _e( 'Button class(es)', 'formtastic' ); ?> :</label>
							<input type="text" name="formtastic[settings][button_classes]" id="button_classes" class="ft-input" placeholder="" value="<?php echo ! empty( $formtastic['settings']['button_classes'] ) ? esc_html( $formtastic['settings']['button_classes'] ) : '' ?>">
						</div>
					</div>
				</div>
			</div>
		</div>

		<div id="ft-tab-confirmation" class="ft-tab-content">
			<div class="ft-settings">
				<div class="ft-field">
					<?php $confirmation = ! empty( $formtastic['settings']['confirmation'] ) ? esc_attr( $formtastic['settings']['confirmation'] ) : 'inline'; ?>
					<label for="confirmation"><?php _e( 'Confirmation', 'formtastic' ); ?> :</label>
					<select name="formtastic[settings][confirmation]" id="confirmation" class="ft-input ft-select-tab">
						<option value="inline" <?php selected( $confirmation, 'inline' ); ?>><?php _e( 'Inline', 'formtastic' ); ?></option>
						<option value="page" <?php selected( $confirmation, 'page' ); ?>><?php _e( 'Page', 'formtastic' ); ?></option>
					</select>
				</div>

				<div class="ft-field<?php echo $confirmation !== 'page' ? ' ft-hidden' : ''; ?>" data-tab="page">
					<label for="confirmation_page"><?php _e( 'Confirmation page', 'formtastic' ); ?> :</label>
					<select name="formtastic[settings][page]" id="confirmation_page" class="ft-input">
						<?php
							$value = ! empty( $formtastic['settings']['page'] ) ? esc_attr( $formtastic['settings']['page'] ) : '';

							$args = array(
								'post_status' => 'publish',
								'post_type'   => 'page',
								'sort_column' => 'post_title',
								'sort_order'  => 'asc'
							);

							$pages = get_pages( $args ); 

							foreach ( $pages as $p ) {
								echo '<option value="' . $p->ID . '" ' . selected( $value, $p->ID, false ) . '>' . $p->post_title . '</option>';
							}
						?>
					</select>
				</div>
				
				<div class="ft-field<?php echo $confirmation !== 'inline' ? ' ft-hidden' : ''; ?>" data-tab="inline">
					<label for="success_msg"><?php _e( 'Success message', 'formtastic' ); ?> :</label>
					<textarea name="formtastic[settings][success_msg]" id="success_msg" class="widefat" rows="2"><?php echo ( ! empty( $formtastic['settings']['success_msg'] ) ) ? esc_textarea( $formtastic['settings']['success_msg'] ) : ''; ?></textarea>
				</div>

				<div class="ft-field">
					<label for="error_msg"><?php _e( 'Error message', 'formtastic' ); ?> :</label>
					<textarea name="formtastic[settings][error_msg]" id="error_msg" class="widefat" rows="2"><?php echo ( ! empty( $formtastic['settings']['error_msg'] ) ) ? esc_textarea( $formtastic['settings']['error_msg'] ) : ''; ?></textarea>
				</div>
			</div>
		</div>

		<div id="ft-tab-reply" class="ft-tab-content">
			<div class="ft-settings">
				
				<div class="ft-row">
					<div class="ft-col ft-col-12 ft-sep">
						<div class="ft-field">
							<label for="send_reply">
								<input type="checkbox" name="formtastic[settings][send_reply]" id="send_reply" value="yes" <?php if ( isset( $formtastic['settings']['send_reply'] ) ) checked( $formtastic['settings']['send_reply'], 'yes', true ); ?>>
								<?php _e( 'Send auto reply', 'formtastic' ); ?>
							</label>
						</div>
					</div>
					<div class="ft-col ft-col-6">
						<div class="ft-field">
							<label for="reply_object"><?php _e( 'Object', 'formtastic' ); ?> :</label>
							<input type="text" name="formtastic[settings][reply_object]" id="reply_object" value="<?php echo ! empty( $formtastic['settings']['reply_object'] ) ? esc_html( $formtastic['settings']['reply_object'] ) : ''; ?>" placeholder="<?php echo get_the_title( $post->ID ); ?>" class="ft-input" />
						</div>
					</div>
					<div class="ft-col ft-col-6">
						<div class="ft-field">
							<label for="reply_to"><?php _e( 'To', 'formtastic' ); ?> :</label>
							<input type="text" name="formtastic[settings][reply_to]" id="reply_to" value="<?php echo ! empty( $formtastic['settings']['reply_to'] ) ? esc_html( $formtastic['settings']['reply_to'] ) : ''; ?>" placeholder="<?php echo get_bloginfo( 'admin_email' ); ?>" class="ft-input" />
						</div>
					</div>
				</div>

				<div class="ft-row">
					<div class="ft-col ft-col-6">
						<div class="ft-field">
							<label for="reply_from_name"><?php _e( 'From name', 'formtastic' ); ?> :</label>
							<input type="text" name="formtastic[settings][reply_from_name]" id="reply_from_name" value="<?php echo ! empty( $formtastic['settings']['reply_from_name'] ) ? esc_html( $formtastic['settings']['reply_from_name'] ) : ''; ?>" placeholder="<?php echo get_bloginfo( 'name' ); ?>" class="ft-input" />
						</div>
					</div>
					<div class="ft-col ft-col-6">
						<div class="ft-field">
							<label for="reply_from_email"><?php _e( 'From email', 'formtastic' ); ?> :</label>
							<input type="text" name="formtastic[settings][reply_from_email]" id="reply_from_email" value="<?php echo ! empty( $formtastic['settings']['reply_from_email'] ) ? esc_html( $formtastic['settings']['reply_from_email'] ) : ''; ?>" placeholder="<?php echo get_bloginfo( 'admin_email' ); ?>" class="ft-input" />
						</div>
					</div>
					<div class="ft-col ft-col-12">
						<div class="ft-field">
							<label for="reply_msg"><?php _e( 'Auto reply message', 'formtastic' ); ?> :</label>
							<textarea name="formtastic[settings][reply_msg]" id="reply_msg" class="widefat" rows="3"><?php echo ( ! empty( $formtastic['settings']['reply_msg'] ) ) ? esc_textarea( $formtastic['settings']['reply_msg'] ) : ''; ?></textarea>
						</div>
					</div>
				</div>
				
			</div>
		</div>

		<div id="ft-tab-copy" class="ft-tab-content">
			<div class="ft-settings">

				<div class="ft-row">
					<div class="ft-col ft-col-12 ft-sep">
						<div class="ft-field">
							<label for="send_copy">
								<input type="checkbox" name="formtastic[settings][send_copy]" id="send_copy" value="yes" <?php if ( isset( $formtastic['settings']['send_copy'] ) ) checked( $formtastic['settings']['send_copy'], 'yes', true ); ?>>
								<?php _e( 'Send copy', 'formtastic' ); ?>
							</label>

							<label for="copy_cond">
								<input type="checkbox" name="formtastic[settings][copy_cond]" id="copy_cond" value="yes" <?php if ( isset( $formtastic['settings']['copy_cond'] ) ) checked( $formtastic['settings']['copy_cond'], 'yes', true ); ?>>
								<?php _e( 'Conditional logic', 'formtastic' ); ?>
							</label>
						</div>
					</div>
					<div class="ft-col ft-col-4">
						<div class="ft-field">
							<label for="copy_cond_field"><?php _e( 'Field', 'formtastic' ); ?> :</label>
							<input type="text" name="formtastic[settings][copy_cond_field]" id="copy_cond_field" class="ft-input" value="<?php echo ! empty( $formtastic['settings']['copy_cond_field'] ) ? esc_html( $formtastic['settings']['copy_cond_field'] ) : '' ?>">
						</div>
					</div>
					<div class="ft-col ft-col-4">
						<?php $operator = ! empty( $formtastic['settings']['copy_cond_operator'] ) ? esc_attr( $formtastic['settings']['copy_cond_operator'] ) : ''; ?>
						<div class="ft-field">
							<label for="copy_cond_operator" class="hidden-xs">&nbsp;</label>
							<select name="formtastic[settings][copy_cond_operator]" id="copy_cond_operator" class="ft-input">
								<option value="==" <?php selected( $operator, '==', true ); ?>><?php _e( 'Equal to', 'formtastic' ); ?></option>
								<option value="!==" <?php selected( $operator, '!==', true ); ?>><?php _e( 'Not equal to', 'formtastic' ); ?></option>
							</select>
						</div>
					</div>
					<div class="ft-col ft-col-4">
						<div class="ft-field">
							<label for="copy_cond_value"><?php _e( 'Value', 'formtastic' ); ?> :</label>
							<input type="text" name="formtastic[settings][copy_cond_value]" id="copy_cond_value" class="ft-input" value="<?php echo ! empty( $formtastic['settings']['copy_cond_value'] ) ? esc_html( $formtastic['settings']['copy_cond_value'] ) : '' ?>">
						</div>
					</div>
				</div>
			</div>
		</div>

		<div id="ft-tab-mailchimp" class="ft-tab-content">
			<div class="ft-settings">
				
				<div class="ft-row">
					<div class="ft-col ft-col-12 ft-sep">
						<div class="ft-field">
							<label for="subscribe_mailchimp" class="ft-inline">
								<input type="checkbox" name="formtastic[settings][subscribe_mailchimp]" id="subscribe_mailchimp" value="yes" <?php if ( isset( $formtastic['settings']['subscribe_mailchimp'] ) ) checked( $formtastic['settings']['subscribe_mailchimp'], 'yes', true ); ?>>
								<?php _e( 'Subscribe to mailchimp', 'formtastic' ); ?>
							</label>

							<label for="mc_opt_in" class="ft-inline">
								<input type="checkbox" name="formtastic[settings][mc_opt_in]" id="mc_opt_in" value="yes" <?php if ( isset( $formtastic['settings']['mc_opt_in'] ) ) checked( $formtastic['settings']['mc_opt_in'], 'yes', true ); ?>>
								<?php _e( 'Double Opt-In', 'formtastic' ); ?>
							</label>
						</div>
					</div>
					<div class="ft-col ft-col-6">
						<div class="ft-field">
							<label for="mc_api_key"><?php _e( 'API key', 'formtastic' ); ?> :</label>
							<input type="text" name="formtastic[settings][mc_api_key]" id="mc_api_key" class="ft-input" value="<?php echo ! empty( $formtastic['settings']['mc_api_key'] ) ? esc_html( $formtastic['settings']['mc_api_key'] ) : '' ?>">
						</div>
					</div>
					<div class="ft-col ft-col-6">
						<div class="ft-field">
							<label for="mc_list_id"><?php _e( 'List ID', 'formtastic' ); ?> :</label>
							<input type="text" name="formtastic[settings][mc_list_id]" id="mc_list_id" class="ft-input" value="<?php echo ! empty( $formtastic['settings']['mc_list_id'] ) ? esc_html( $formtastic['settings']['mc_list_id'] ) : '' ?>">
						</div>
					</div>
				</div>

				<div class="ft-row">
					<div class="ft-col ft-col-4">
						<div class="ft-field">
							<label for="mc_email"><?php _e( 'Email', 'formtastic' ); ?> :</label>
							<input type="text" name="formtastic[settings][mc_email]" id="mc_email" class="ft-input" value="<?php echo ! empty( $formtastic['settings']['mc_email'] ) ? esc_html( $formtastic['settings']['mc_email'] ) : '' ?>">
						</div>
					</div>
					<div class="ft-col ft-col-4">
						<div class="ft-field">
							<label for="mc_fname"><?php _e( 'First name', 'formtastic' ); ?> :</label>
							<input type="text" name="formtastic[settings][mc_fname]" id="mc_fname" class="ft-input" value="<?php echo ! empty( $formtastic['settings']['mc_fname'] ) ? esc_html( $formtastic['settings']['mc_fname'] ) : '' ?>">
						</div>
					</div>
					<div class="ft-col ft-col-4">
						<div class="ft-field">
							<label for="mc_lname"><?php _e( 'Last name', 'formtastic' ); ?> :</label>
							<input type="text" name="formtastic[settings][mc_lname]" id="mc_lname" class="ft-input" value="<?php echo ! empty( $formtastic['settings']['mc_lname'] ) ? esc_html( $formtastic['settings']['mc_lname'] ) : '' ?>">
						</div>
					</div>
				</div>

				<div class="ft-row">
					<div class="ft-col ft-col-12">
						<div class="ft-field">
							<label for="mc_cond">
								<input type="checkbox" name="formtastic[settings][mc_cond]" id="mc_cond" value="yes" <?php if ( isset( $formtastic['settings']['mc_cond'] ) ) checked( $formtastic['settings']['mc_cond'], 'yes', true ); ?>>
								<?php _e( 'Conditional logic', 'formtastic' ); ?>
							</label>
						</div>
					</div>
					<div class="ft-col ft-col-4">
						<div class="ft-field">
							<label for="mc_cond_field"><?php _e( 'Field', 'formtastic' ); ?> :</label>
							<input type="text" name="formtastic[settings][mc_cond_field]" id="mc_cond_field" class="ft-input" value="<?php echo ! empty( $formtastic['settings']['mc_cond_field'] ) ? esc_html( $formtastic['settings']['mc_cond_field'] ) : '' ?>">
						</div>
					</div>
					<div class="ft-col ft-col-4">
						<?php $operator = ! empty( $formtastic['settings']['mc_cond_operator'] ) ? esc_attr( $formtastic['settings']['mc_cond_operator'] ) : ''; ?>
						<div class="ft-field">
							<label for="mc_cond_operator" class="hidden-xs">&nbsp;</label>
							<select name="formtastic[settings][mc_cond_operator]" id="mc_cond_operator" class="ft-input">
								<option value="==" <?php selected( $operator, '==', true ); ?>><?php _e( 'Equal to', 'formtastic' ); ?></option>
								<option value="!==" <?php selected( $operator, '!==', true ); ?>><?php _e( 'Not equal to', 'formtastic' ); ?></option>
							</select>
						</div>
					</div>
					<div class="ft-col ft-col-4">
						<div class="ft-field">
							<label for="mc_cond_value"><?php _e( 'Value', 'formtastic' ); ?> :</label>
							<input type="text" name="formtastic[settings][mc_cond_value]" id="mc_cond_value" class="ft-input" value="<?php echo ! empty( $formtastic['settings']['mc_cond_value'] ) ? esc_html( $formtastic['settings']['mc_cond_value'] ) : '' ?>">
						</div>
					</div>
				</div>
			</div>
		</div>
	</div><!-- .ft-content -->
</div>
