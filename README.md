# \_tw Typography

A fork of [Tailwind Typography](https://github.com/tailwindlabs/tailwindcss-typography) that:

* Removes the `className` argument, replacing it with separate arguments for `postTitleSelector` and `postContentSelector`
* Uses a plain `body` selector when `postContentSelector` is `false`

These changes generate editor styles compatible with the WordPress block editor and also apply Tailwind Typography's `h1` styles to headings with the appropriate post title selector (e.g., `.entry-title`) regardless of heading level.

The version number of this fork will be kept in sync with that of Tailwind Typography itself.

## Usage

For the frontend styles:

```js
// tailwind-frontend.config.js
module.exports = {
  presets: [
    require( './tailwind.config.js' ),
  ],
  plugins: [
    require( '@tailwindcss/typography' )( {
      postTitleSelector: '.entry-title',
      postContentSelector: '.entry-content',
    } ),
  ],
};
```

For the editor styles:

```js
// tailwind-editor.config.js
module.exports = {
  presets: [
    require( './tailwind.config.js' ),
  ],
  plugins: [
    require( '@tailwindcss/typography' )( {
      postTitleSelector: '.editor-post-title__block .editor-post-title__input',
      postContentSelector: false,
    } ),
  ],
};
```

To find Tailwind Typography styles optimized for the WordPress editor, please see the `tailwind/tailwind-typography.config.js` file in the [_tw repository](https://github.com/gregsullivan/_tw)
