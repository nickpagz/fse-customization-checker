# FSE Customization Checker
The FSE Customization Checker is a basic tool to help determine the extent of FSE template and style changes made to the active theme on a WordPress site. On a single settings page in wp-admin it will list all templates and template parts for the active theme, indicate whether the template is custom, or is an original theme file that's been customized, and will also show all style changes (i.e. global styles) made to the theme.

## How to Use
Go to the **FSE Customization Checker** page in wp-admin to view the changes.

### Templates and Template Parts
The first two tables show the changes made (if any) to the Templates and Template Parts. The "Customized" columns is blank if the template is an original theme file that has not been customized in the site editor.
If the column shows "User generated", this means the template was created in the site editor and does not exist in the "templates" or "parts" folder in the theme files.
For columns showing "Customized theme template", this means the template exists in the theme "templates" or "parts" folders, but has been edited in the Site Editor.

### Global Styles Overrides
This section shows any overriding changes made in the styles section of the Site Editor. It should be noted that the very first save of any template or part in the site editor will trigger the creation of the `wp_global_styles` post type and will show the content:

```
}
"isGlobalStylesUserThemeJSON": true,
  "version": 2
}
```

The above alone is not a customization to the global styles. Additional content above these two entries, if any, would be the global styles customizations.

Additionally, if a theme included Style is applied, for example Twenty Twenty Three ships with ten additional styles, these get applied in the "Global Styles Overrides", with no indication of which variation was applied.

### Other Notes
Keep in mind the plugin compares differences to what is found in the theme files vs what is found the database. If you "save" your changes to your theme files using the "Create Block Theme" plugin for example, this usually clears out the saved changes in the database - meaning this plugin would show no customizations are present. Again, the intent of this plugin is to be used as tool to mainly help theme developers and site builders.

## Known Issues
* The plugin does **not** work with classic themes, like Twenty Twenty One for example. Visiting the **FSE Customization Checker** page in wp-admin will show a loading icon, but don't try waiting - you'll be there for a very very long time!
* The plugin does not currently show css customizations added to the customizer (at `/wp-admin/customize.php`).

## Changelog

### 1.0.0
* Initial release
