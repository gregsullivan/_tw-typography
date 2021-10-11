const plugin = require('tailwindcss/plugin')
const merge = require('lodash.merge')
const castArray = require('lodash.castarray')
const uniq = require('lodash.uniq')
const styles = require('./styles')
const { isUsableColor } = require('./utils')

const computed = {
  // Reserved for future "magic properties", for example:
  // bulletColor: (color) => ({ 'ul > li::before': { backgroundColor: color } }),
}

function configToCss(config = {}) {
  return merge(
    {},
    ...Object.keys(config)
      .filter((key) => computed[key])
      .map((key) => computed[key](config[key])),
    ...castArray(config.css || {})
  )
}

module.exports = plugin.withOptions(
  ({ modifiers, postTitleSelector = '.entry-title', postContentSelector = '.prose' } = {}) => {
    return function ({ addComponents, theme, variants }) {
      const DEFAULT_MODIFIERS = [
        'DEFAULT',
        'sm',
        'lg',
        'xl',
        '2xl',
        ...Object.entries(theme('colors'))
          .filter(([color, values]) => {
            return isUsableColor(color, values)
          })
          .map(([color]) => color),
      ]
      modifiers = modifiers === undefined ? DEFAULT_MODIFIERS : modifiers
      const config = theme('typography')

      const all = uniq([
        'DEFAULT',
        ...modifiers,
        ...Object.keys(config).filter((modifier) => !DEFAULT_MODIFIERS.includes(modifier)),
      ])

      if (false !== postContentSelector) {
        addComponents(
          all.map((modifier) => ({
            [modifier === 'DEFAULT' ? `${postContentSelector}` : `${postContentSelector}-${modifier}`]: configToCss(
              config[modifier]
            ),
          })),
          variants('typography')
        )
      } else {
        /*
         * If postContentSelector is false, prepend selectors with `body`
         * instead of a class. This allows the WordPress editor to use the
         * generated styles as-is.
         *
         * The map function intentionally matches the code above to ease
         * staying in sync with future changes to Tailwind Typography.
         */
        addComponents(
          ['DEFAULT'].map((modifier) => ({
            [`body`]: configToCss(
              config[modifier]
            ),
          })),
          variants('typography')
        )
      }

      /*
       * Use postTitleSelector to create an appropriate CSS ruleset for either
       * the frontend or the editor.
       */
      const DEFAULT = merge(
        {},
        ...castArray( config.DEFAULT.css || {} ),
      );

      addComponents(
        {
          [postTitleSelector]: DEFAULT.h1,
        },
      );
    }
  },
  () => ({
    theme: { typography: styles },
    variants: { typography: ['responsive'] },
  })
)
