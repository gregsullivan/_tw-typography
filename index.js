/**
 * Until otherwise noted, this file is copied directly from Tailwind Typography
 * itself. In the `require` block below, files from `@tailwindcss/typography`
 * are accessed directly, replacing the relative paths from the original.
 */

const plugin = require('tailwindcss/plugin')
const merge = require('lodash.merge')
const castArray = require('lodash.castarray')
const styles = require('@tailwindcss/typography/src/styles')
const { commonTrailingPseudos } = require('@tailwindcss/typography/src/utils')

const computed = {
  // Reserved for future "magic properties", for example:
  // bulletColor: (color) => ({ 'ul > li::before': { backgroundColor: color } }),
}

function inWhere(selector, { className, modifier, prefix }) {
  let prefixedNot = prefix(`.not-${className}`).slice(1)
  let selectorPrefix = selector.startsWith('>')
    ? `${modifier === 'DEFAULT' ? `.${className}` : `.${className}-${modifier}`} `
    : ''

  // Parse the selector, if every component ends in the same pseudo element(s) then move it to the end
  let [trailingPseudo, rebuiltSelector] = commonTrailingPseudos(selector)

  if (trailingPseudo) {
    return `:where(${selectorPrefix}${rebuiltSelector}):not(:where([class~="${prefixedNot}"],[class~="${prefixedNot}"] *))${trailingPseudo}`
  }

  return `:where(${selectorPrefix}${selector}):not(:where([class~="${prefixedNot}"],[class~="${prefixedNot}"] *))`
}

function isObject(value) {
  return typeof value === 'object' && value !== null
}

/**
 * This first block is copied from Tailwind Typography, but with the
 * `addComponents` call removed.
 */
module.exports = plugin.withOptions(
  ({ className = 'prose', target = 'modern' } = {}) => {
    return function ({ addVariant, prefix }) {
      let options = { className, prefix }

      /**
       * This block removes all of the element modifier / selector pairings
       * except for `lead`, adding `[class~="is-style-lead"]` to support the
       * corresponding block style in the WordPress editor.
       */
      for (let [name, ...selectors] of [['lead', '[class~="lead"]', '[class~="is-style-lead"]']]) {
        selectors = selectors.length === 0 ? [name] : selectors

        let selector =
          target === 'legacy' ? selectors.map((selector) => `& ${selector}`) : selectors.join(', ')

        addVariant(
          `${className}-${name}`,
          target === 'legacy' ? selector : `& :is(${inWhere(selector, options)})`
        )
      }
    }
  },

  /**
   * Code copied from Tailwind Typography ends here.
   *
   * The code below filters Tailwind Typography’s styles, removing all but the
   * `[class~="lead"]` keys, and renaming the keys `[class~="is-style-lead"]`.
   */
  function () {
    function filterObject(obj, replacementKeys) {
      if (typeof obj !== 'object' || obj === null) {
        return null
      }

      if (Array.isArray(obj)) {
        return obj
          .map((item) => filterObject(item, replacementKeys))
          .filter((item) => item && Object.keys(item).length > 0)
      } else {
        let result = {}
        for (let key in obj) {
          if (obj.hasOwnProperty(key)) {
            if (replacementKeys.hasOwnProperty(key)) {
              // If the current key matches a target key, keep that object and
              // swap in its replacement key.
              result[replacementKeys[key]] = obj[key]
            } else if (typeof obj[key] === 'object') {
              // Recursively search in nested objects.
              let filtered = filterObject(obj[key], replacementKeys)
              if (filtered && Object.keys(filtered).length > 0) {
                result[key] = filtered
              }
            }
          }
        }
        return result
      }
    }

    blockEditorStyles = filterObject(styles, {
      // In the form `target: replacement` (in case more are needed).
      '[class~="lead"]': '[class~="is-style-lead"]',
    })

    /**
     * Assuming everything went as expected above, the code below adds some
     * minor tweaks to improve Tailwind Typography’s block editor support.
     */
    if (
      isObject(blockEditorStyles) &&
      isObject(blockEditorStyles.DEFAULT) &&
      Array.isArray(blockEditorStyles.DEFAULT.css)
    ) {
      blockEditorStyles.DEFAULT.css.push({
        /**
         * Without Preflight, Tailwind doesn't apply a default border
         * style of `solid` to all elements, so the border doesn't
         * appear in the editor without this addition.
         */
        blockquote: {
          borderLeftStyle: 'solid',
        },

        /**
         * Styles for the `cite` element within `blockquote` elements.
         */
        'blockquote > cite': {
          color: 'var(--tw-prose-body)',
          fontStyle: 'normal',
          fontWeight: '400',
        },
        'blockquote > cite::before': {
          content: '"\\2014"',
        },

        /**
         * Block editor styles use 1px borders for the top and bottom
         * of the `hr` element. The rule below removes the bottom
         * border, as Tailwind Typography only uses the top border.
         */
        hr: {
          borderBottom: 'none',
        },

        /**
         * If the block library stylesheet is disabled, we still want to
         * support the `has-fixed-layout` class on tables.
         */
        'table.has-fixed-layout': {
          tableLayout: 'fixed',
          width: '100%',
        },
      })
    }

    // Update the configuration.
    return {
      theme: {
        extend: {
          typography: blockEditorStyles,
        },
      },
    }
  }
)
