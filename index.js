/**
 * Except where otherwise noted, this file is copied directly from Tailwind
 * Typography itself. In the `require` block below, files from
 * `@tailwindcss/typography` are accessed directly, replacing the relative
 * paths from the original.
 */

// Flag when CSS is being built specifically for the editor in _tw.
const notACF =
  'editor' === process.env._TW_TARGET ? ',[class~="acf-block-body"][class~="is-selected"] *' : ''

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
    return `:where(${selectorPrefix}${rebuiltSelector}):not(:where([class~="${prefixedNot}"],[class~="${prefixedNot}"] *${notACF}))${trailingPseudo}`
  }

  return `:where(${selectorPrefix}${selector}):not(:where([class~="${prefixedNot}"],[class~="${prefixedNot}"] *${notACF}))`
}

function isObject(value) {
  return typeof value === 'object' && value !== null
}

function configToCss(config = {}, { target, className, modifier, prefix }) {
  function updateSelector(k, v) {
    if (target === 'legacy') {
      return [k, v]
    }

    if (Array.isArray(v)) {
      return [k, v]
    }

    if (isObject(v)) {
      let nested = Object.values(v).some(isObject)
      if (nested) {
        return [
          inWhere(k, { className, modifier, prefix }),
          v,
          Object.fromEntries(Object.entries(v).map(([k, v]) => updateSelector(k, v))),
        ]
      }

      return [inWhere(k, { className, modifier, prefix }), v]
    }

    return [k, v]
  }

  return Object.fromEntries(
    Object.entries(
      merge(
        {},
        ...Object.keys(config)
          .filter((key) => computed[key])
          .map((key) => computed[key](config[key])),
        ...castArray(config.css || {})
      )
    ).map(([k, v]) => updateSelector(k, v))
  )
}

/**
 * This function was added by `@_tw/typography`. It allows for the replacement
 * of `[class~="lead"]` with `[class~="lead"], [class~="is-style-lead"]` in the
 * Tailwind Typography `modifiers` object.
 */
function replaceKey(modifiers, targetKey, newKey) {
  if (!isObject(modifiers)) {
    return modifiers
  }

  const newModifiers = Array.isArray(modifiers) ? [] : {}

  Object.keys(modifiers).forEach((key) => {
    const value = modifiers[key]
    const outputKey = key === targetKey ? newKey : key

    newModifiers[outputKey] = replaceKey(value, targetKey, newKey)
  })

  return newModifiers
}

module.exports = plugin.withOptions(
  ({ className = 'prose', target = 'modern' } = {}) => {
    return function ({ addVariant, addComponents, theme, prefix }) {
      let modifiers = theme('typography')

      // Perform our replacement for the WordPress block editor.
      modifiers = replaceKey(
        modifiers,
        '[class~="lead"]',
        '[class~="lead"], [class~="is-style-lead"]'
      )

      /**
       * Assuming everything went as expected above, the code below adds some
       * minor tweaks to improve Tailwind Typography’s block editor support.
       */
      if (
        isObject(modifiers) &&
        isObject(modifiers.DEFAULT) &&
        Array.isArray(modifiers.DEFAULT.css)
      ) {
        modifiers.DEFAULT.css.push({
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

      let options = { className, prefix }

      for (let [name, ...selectors] of [
        ['headings', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'th'],
        ['h1'],
        ['h2'],
        ['h3'],
        ['h4'],
        ['h5'],
        ['h6'],
        ['p'],
        ['a'],
        ['blockquote'],
        ['figure'],
        ['figcaption'],
        ['strong'],
        ['em'],
        ['kbd'],
        ['code'],
        ['pre'],
        ['ol'],
        ['ul'],
        ['li'],
        ['table'],
        ['thead'],
        ['tr'],
        ['th'],
        ['td'],
        ['img'],
        ['video'],
        ['hr'],

        // Update `lead` with the block editor style class.
        ['lead', '[class~="lead"]', '[class~="is-style-lead"]'],
      ]) {
        selectors = selectors.length === 0 ? [name] : selectors

        let selector =
          target === 'legacy' ? selectors.map((selector) => `& ${selector}`) : selectors.join(', ')

        addVariant(
          `${className}-${name}`,
          target === 'legacy' ? selector : `& :is(${inWhere(selector, options)})`
        )
      }

      addComponents(
        Object.keys(modifiers).map((modifier) => ({
          [modifier === 'DEFAULT' ? `.${className}` : `.${className}-${modifier}`]: configToCss(
            modifiers[modifier],
            {
              target,
              className,
              modifier,
              prefix,
            }
          ),
        }))
      )
    }
  },
  () => {
    return {
      theme: { typography: styles },
    }
  }
)
