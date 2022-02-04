# \_tw Typography

**Changes to Tailwind, Tailwind Typography and \_tw have made this fork of Tailwind Typography unnecessary, and it is no longer included in themes generated on [underscoretw.com](https://underscoretw.com). All code changes related to migrating to Tailwind 3 and deprecating this fork were committed on January 11, 2022; looking at [the repository as of that date](https://github.com/gregsullivan/_tw/tree/d03efc347fe8ecea2d5d8a22c484e0985734163d) will give you the best sense of what was changed if you would like to update a Tailwind 2 theme to Tailwind 3 in the same way.**

A fork of [Tailwind Typography](https://github.com/tailwindlabs/tailwindcss-typography) that:

* Removes the `className` argument, replacing it with separate arguments for `postTitleSelector` and `postContentSelector`
* Uses a plain `body` selector when `postContentSelector` is `false`

These changes generate editor styles compatible with the WordPress block editor and also apply Tailwind Typography’s `h1` styles to headings with the appropriate post title selector (e.g., `.entry-title`) regardless of heading level.

The version number of this fork will be kept in sync with that of Tailwind Typography itself.

## Usage

For frontend styles:

```js
// tailwind-frontend.config.js
module.exports = {
  presets: [
    require( './tailwind.config.js' ),
  ],
  plugins: [
    require( '@tailwindcss/typography' )(),
  ],
};
```

For editor styles:

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

To find Tailwind Typography styles optimized for the WordPress editor, please see the `tailwind/tailwind-typography.config.js` file in the [_tw repository](https://github.com/gregsullivan/_tw).
