# Formtastic

A WordPress plugin to create forms easily - it's formtastic!

## Description

Formtastic is a powerful and flexible WordPress form builder plugin that allows you to create custom forms with ease. Whether you need a simple contact form or a complex multi-step form with conditional logic, Formtastic has you covered.

## Features

- **Easy Form Builder**: Create forms quickly with an intuitive interface
- **Multiple Field Types**: Support for various field types including:
  - Text, email, phone, and URL inputs
  - Textarea and message fields
  - Select dropdowns, radio buttons, and checkboxes
  - File upload fields
  - Date, time, and color pickers
  - Address fields
  - Repeater fields
  - Fieldset grouping
  - Button fields
  - Honeypot fields for spam prevention
- **Conditional Logic**: Show/hide fields based on user input
- **Response Management**: View, export, and manage form submissions from the WordPress admin
- **Email Notifications**: Automatic email notifications with customizable recipients and templates
- **Anti-Spam Protection**: Built-in reCAPTCHA v3 integration and IP blacklist
- **Form Import/Export**: Easily migrate forms between sites
- **Bootstrap Classes**: Optional Bootstrap class support for styling
- **Multilingual Ready**: Translation-ready with text domain support
- **Dashboard Widget**: Quick overview of form submissions
- **Custom Widgets**: Display forms in widget areas
- **Duplicate Forms**: Quickly duplicate existing forms
- **File Uploads**: Secure file upload handling with dedicated upload directory
- **Mailchimp Integration**: Subscribe users to Mailchimp lists

## Requirements

- WordPress 4.0 or higher
- PHP 5.3 or higher

## Installation

### From WordPress Admin

1. Download the plugin ZIP file
2. Navigate to **Plugins > Add New** in your WordPress admin
3. Click **Upload Plugin** and select the ZIP file
4. Click **Install Now** and then **Activate**

### Manual Installation

1. Download the plugin and extract the files
2. Upload the `formtastic` folder to the `/wp-content/plugins/` directory
3. Activate the plugin through the **Plugins** menu in WordPress

## Usage

### Creating Your First Form

1. Go to **Formtastic** in your WordPress admin menu
2. Click **Add New** to create a new form
3. Add fields by clicking the **+ Add Field** button
4. Configure each field's settings (label, placeholder, validation, etc.)
5. Set up form settings including:
   - Email recipients
   - Confirmation messages
   - Redirect URLs
   - Email templates
6. Publish your form

### Displaying Forms

Display your form using a shortcode:

```
[formtastic id="YOUR_FORM_ID"]
```

Or use the Formtastic widget to add forms to widget areas.

### Managing Responses

1. Go to **Formtastic > Responses** to view all form submissions
2. Click on a response to view details
3. Export responses to CSV for further analysis
4. Mark responses as read or spam
5. Resend notification emails if needed

### Settings

Configure global plugin settings under **Formtastic > Settings**:

- Set default email sender information
- Configure reCAPTCHA keys
- Manage IP blacklist
- Set scroll behavior after form submission
- Configure file upload settings

## Development

### Prerequisites

- Node.js and npm
- Gulp CLI

### Setup

1. Clone the repository:
```bash
git clone https://github.com/bastiegag/formtastic.git
cd formtastic
```

2. Install dependencies:
```bash
npm install
```

3. Build assets:
```bash
gulp
```

### Project Structure

```
formtastic/
├── assets/          # Compiled CSS and JS assets
├── includes/        # PHP class files
│   ├── views/      # Admin view templates
│   └── *.php       # Core plugin classes
├── languages/       # Translation files
├── src/            # Source files
│   ├── js/         # JavaScript source files
│   └── scss/       # SASS/SCSS source files
├── formtastic.php  # Main plugin file
├── gulpfile.js     # Gulp build configuration
└── package.json    # Node.js dependencies
```

### Available Gulp Tasks

The project uses Gulp for asset compilation:

- `gulp` - Default task (compile all assets)
- SCSS compilation with autoprefixer
- JavaScript concatenation and minification
- Image optimization
- SVG sprite generation

## Filters and Hooks

Formtastic provides several filters and hooks for developers:

- `ft_submit` - Filter form submission data
- `ft_submit_form` - Filter before form processing
- `ft_values` - Modify field values
- `ft_label` - Customize field labels
- Email-related filters: `ft_to`, `ft_ccs`, `ft_object`, `ft_from_name`, `ft_from_email`
- And many more...

## Changelog

See [changelog.txt](changelog.txt) for a complete list of changes and version history.

## Support

For bug reports and feature requests, please use the [GitHub issue tracker](https://github.com/bastiegag/formtastic/issues).

## Author

**Sébastien Gagné**
- Website: [sebastiengagne.ca](http://sebastiengagne.ca/)
- Plugin URI: [formtastic.sebastiengagne.ca](http://formtastic.sebastiengagne.ca/)

## License

This project is licensed under the ISC License.

## Credits

Built with ❤️ by Sébastien Gagné
