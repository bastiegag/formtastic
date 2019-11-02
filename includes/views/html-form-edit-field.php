<?php
/**
 * Form view: Edit field
 * 
 * @author  Sébastien Gagné
 * @package Formtastic/Views
 * @version 2.3.2
 */
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
?>

<div id="ft-edit-field" style="display: none;">
	<div id="ft-edit-field-form" class="ft-edit-field">

		<div class="ft-active">
			<input type="hidden" value="" id="ft-type" name="type" class="ft-input" readonly>
		</div>

		<div id="ft-id-field" class="ft-field">
			<label for="ft-id"><?php _e( 'ID', 'formtastic' ); ?></label>	
			<input type="text" value="" id="ft-id" name="id" class="ft-input ft-autoselect" readonly>
		</div>

		<div id="ft-label-field" class="ft-field">
			<label for="ft-label"><?php _e( 'Label', 'formtastic' ); ?></label>	
			<input type="text" value="" id="ft-label" name="label" class="ft-input">
		</div>

		<div id="ft-placeholder-field" class="ft-field">
			<label for="ft-placeholder"><?php _e( 'Placeholder', 'formtastic' ); ?></label>	
			<input type="text" value="" id="ft-placeholder" name="placeholder" class="ft-input">
		</div>

		<div id="ft-invalid-field" class="ft-field">
			<label for="ft-invalid"><?php _e( 'Error message', 'formtastic' ); ?></label>	
			<input type="text" value="" id="ft-invalid" name="invalid" class="ft-input">
		</div>

		<div id="ft-help-field" class="ft-field">
			<label for="ft-help"><?php _e( 'Help message', 'formtastic' ); ?></label>	
			<input type="text" value="" id="ft-help" name="help" class="ft-input">
		</div>

		<div id="ft-format-field" class="ft-field">
			<label for="ft-format"><?php _e( 'Format', 'formtastic' ); ?></label>	
			<input type="text" value="" id="ft-format" name="format" class="ft-input">
		</div>

		<div id="ft-extension-field" class="ft-field">
			<label for="ft-extension"><?php _e( 'Extension', 'formtastic' ); ?><small><?php _e( 'Separated by', 'formtastic' ); ?> |</small></label>	
			<input type="text" value="" id="ft-extension" name="extension" class="ft-input">
		</div>

		<div id="ft-size-field" class="ft-field">
			<label for="ft-size"><?php _e( 'Size (kb)', 'formtastic' ); ?></label>	
			<input type="number" value="" id="ft-size" name="size" class="ft-input">
		</div>

		<div id="ft-rows-field" class="ft-field">
			<label for="ft-rows"><?php _e( 'Rows', 'formtastic' ); ?></label>	
			<input type="number" min="1" value="" id="ft-rows" name="rows" class="ft-input">
		</div>

		<div id="ft-min-field" class="ft-field">
			<label for="ft-min"><?php _e( 'Minimum', 'formtastic' ); ?></label>	
			<input type="text" value="" id="ft-min" name="min" class="ft-input">
		</div>

		<div id="ft-max-field" class="ft-field">
			<label for="ft-max"><?php _e( 'Maximum', 'formtastic' ); ?></label>	
			<input type="text" value="" id="ft-max" name="max" class="ft-input">
		</div>

		<div id="ft-step-field" class="ft-field">
			<label for="ft-step"><?php _e( 'Step', 'formtastic' ); ?></label>
			<input type="number" min="1" value="" id="ft-step" name="step" class="ft-input">
		</div>

		<div id="ft-valuenum-field" class="ft-field">
			<label for="ft-valuenum"><?php _e( 'Value', 'formtastic' ); ?></label>	
			<input type="number" value="" id="ft-valuenum" name="valuenum" class="ft-input">
		</div>

		<div id="ft-value-field" class="ft-field">
			<label for="ft-value"><?php _e( 'Value', 'formtastic' ); ?></label>	
			<input type="text" value="" id="ft-value" name="value" class="ft-input">
		</div>

		<div id="ft-message-field" class="ft-field">
			<label for="ft-message"><?php _e( 'Message', 'formtastic' ); ?></label>	
			<textarea id="ft-message" name="message" rows="8" class="ft-textarea"></textarea>
		</div>

		<div id="ft-values-field" class="ft-field" data-number="1">
			<label><?php _e( 'Value(s)', 'formtastic' ); ?></label>
			<select name="values-type" class="ft-values-type ft-input">
				<option value="ft-manual"><?php _e( 'Manual', 'formtastic' ); ?></option>
				<option value="ft-taxonomy"><?php _e( 'Taxonomy', 'formtastic' ); ?></option>
				<option value="ft-post-type"><?php _e( 'Post type', 'formtastic' ); ?></option>
			</select>
			<div class="ft-add-value"><?php echo ft_icon( 'plus' ); ?></div>

			<div id="ft-manual" class="ft-values-tab ft-values-manual ft-sortable-values"></div>

			<div id="ft-taxonomy" class="ft-values-tab">
				<select name="ft-taxonomy" class="ft-input">
					<?php 
						$args = array(
							'public' => true,
						); 

					    $taxonomies = get_taxonomies( $args, 'objects' );

					    foreach ( $taxonomies as $tax ) {
					    	if ( $tax->name !== 'ft_response_form' ) {
					    		echo sprintf( '<option value="%s">%s %s</option>',
					    			$tax->name,
					    			$tax->label,
					    			'(' . implode( $tax->object_type, ', ' ) . ')'
					    		);
					    	}
					    }
					?>
				</select>
			</div>
			
			<div id="ft-post-type" class="ft-values-tab">
				<select name="ft-post-type" class="ft-input">
					<?php 
						$args = array(
							'public' => true,
						); 

					    $post_types = get_post_types( $args, 'objects' );

					    foreach ( $post_types as $post_type ) {
				    		echo sprintf( '<option value="%s">%s</option>',
				    			$post_type->name,
				    			$post_type->label
				    		);
					    }
					?>
				</select>
			</div>
		</div>

		<div id="ft-multiple-field" class="ft-field">
			<label for="ft-multiple">
				<input type="checkbox" id="ft-multiple" name="multiple" class="ft-input">
				<?php _e( 'Multiple choice', 'formtastic' ); ?>
			</label>
		</div>

		<div id="ft-btn-label-field" class="ft-field">
			<label for="ft-btn-label"><?php _e( 'Button label', 'formtastic' ); ?></label>	
			<input type="text" value="" id="ft-btn-label" name="btn-label" class="ft-input">
		</div>

		<div id="ft-btn-class-field" class="ft-field">
			<label for="ft-btn-class"><?php _e( 'Button class(es)', 'formtastic' ); ?></label>	
			<input type="text" value="" id="ft-btn-class" name="btn-class" class="ft-input">
		</div>

		<div id="ft-class-field" class="ft-field">
			<label for="ft-class"><?php _e( 'Class(es)', 'formtastic' ); ?></label>	
			<input type="text" value="" id="ft-class" name="class" class="ft-input">
		</div>

		<div id="ft-colsize-field" class="ft-field">
			<label for="ft-colsize"><?php _e( 'Column size', 'formtastic' ); ?></label>	
			<select id="ft-colsize" name="colsize" class="ft-input">
				<option value="3">1/4</option>
				<option value="4">1/3</option>
				<option value="6">1/2</option>
				<option value="8">2/3</option>
				<option value="9">3/4</option>
				<option value="12">1</option>
			</select>
		</div>

		<div id="ft-repeat-field" class="ft-field">
			<label for="ft-repeat">
				<input type="checkbox" id="ft-repeat" name="repeat" class="ft-input">
				<?php _e( 'Repeat', 'formtastic' ); ?>
			</label>
		</div>

		<div id="ft-fields-field" class="ft-field">
			<label for="ft-fields"><?php _e( 'Fields', 'formtastic' ); ?></label>	
			<input type="text" value="" id="ft-fields" name="fields" class="ft-input" readonly>
		</div>

		<div id="ft-required-field" class="ft-field">
			<label for="ft-required">
				<input type="checkbox" id="ft-required" name="required" class="ft-input">
				<?php _e( 'Required', 'formtastic' ); ?>
			</label>
		</div>

	</div><!-- .ft-edit-field -->

	<div id="plugin-information-footer">
		<button id="ft-save" class="button button-primary right"><?php _e( 'Save', 'formtastic' ); ?></button>
		<button id="ft-cancel" class="button right"><?php _e( 'Cancel', 'formtastic' ); ?></button>
	</div>
</div>
