# \_tw Typography

A Tailwind CSS plugin that improves support for [Tailwind Typography](https://github.com/tailwindlabs/tailwindcss-typography) with the WordPress block editor by:

* Adding support for the `is-style-lead` class alongside `lead` so that it can be used as a block style
* Tweaking a handful of CSS rules to add styles not otherwise handled by Tailwind Typography (like citations) and to improve Tailwind Typography support in the absence of Tailwind’s base styles from Preflight.

The version number of this plugin will be kept in sync with that of Tailwind Typography itself, as it will need to be tested for compatibility with each new Tailwind Typography release due to tight coupling with Tailwind Typography’s own code.

## Usage

`@_tw/typography` should always be included after `@tailwindcss/typography`:

```js
// tailwind.config.js
plugins: [
	// Add Tailwind Typography.
    require('@tailwindcss/typography'),

    // Add additional Tailwind Typography styles.
    require('@_tw/typography'),
]
```

`@_tw/typography` supports the same options as `@tailwindcss/typography`, but you need to set them for both plugins:

```js
// tailwind.config.js
plugins: [
	// Add Tailwind Typography with a custom class name.
    require('@tailwindcss/typography')({
      className: 'wysiwyg',
    }),

    // Add additional Tailwind Typography styles with a custom class name.
    require('@_tw/typography')({
      className: 'wysiwyg',
    }),
]
```
