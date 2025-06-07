/* global wp, tailwindTypographyClasses */

/**
 * This file adds front-end post title and Tailwind Typography classes to the
 * block editor. It also adds some helper classes so you can access the post
 * type when modifying the block editor’s appearance.
 *
 * To see how this is integrated in _tw, please review:
 * https://github.com/gregsullivan/_tw
 */

/**
 * Set our target classes and the new classes we’ll add alongside them.
 */
var targetClasses = {
  'edit-post-visual-editor__post-title-wrapper': ['entry-header'],
  'wp-block-post-title': ['entry-title'],
  'wp-block-post-content': ['entry-content', ...tailwindTypographyClasses],
}

/**
 * We need to ensure the class names we add are added again if the React
 * component is updated, removing them in the process. The mutation observer
 * below will check for the needed classes and add them if they’ve been
 * removed.
 */
const mutationObserver = new MutationObserver(function (mutations) {
  mutations.forEach(function (mutation) {
    const classList = mutation.target.classList

    Object.entries(targetClasses).forEach(([targetClass, classes]) => {
      if (classList.contains(targetClass)) {
        // Check whether all added classes are present.
        if (!classes.every((className) => classList.contains(className))) {
          // Add them again if they’re not.
          classList.add(...classes)
        }
      }
    })
  })
})

/**
 * This file could be loaded in any of three contexts:
 *
 * - Legacy, no `<iframe>`: In this case, we need to set up a subscription so
 *   that we can monitor `wp.data.select('core/editor')` for changes to
 *   `visual` mode.
 * - Modern, parent: We don’t need to set up any classes, but we add a
 *   subscription; the subscription will be passed to an interval and
 *   eventually cleared when the child `<iframe>` is detected.
 * - Modern, child: Ideally we have everything we need immediately and we start
 *   adding the classes right away. If something goes wrong, this will fall
 *   back to the subscription.
 */
const editor = wp.data.select('core/editor')
const isEmbeddedEditor = window !== window.parent
let unsubscribe

if (isEmbeddedEditor && editor && editor.getEditorMode && editor.getEditorMode() === 'visual') {
  // Here, we’re running inside an `<iframe>`, and we have the editor mode.
  findTargetClasses()
} else {
  // In cases where we’re not or don’t, we use `wp.data.subscribe()` to
  // monitor the editor mode.
  let lastEditorMode = null

  unsubscribe = wp.data.subscribe(() => {
    const editor = wp.data.select('core/editor')
    const currentEditorMode = editor && editor.getEditorMode ? editor.getEditorMode() : null

    if (currentEditorMode === 'visual' && currentEditorMode !== lastEditorMode) {
      findTargetClasses()
    }

    lastEditorMode = currentEditorMode
  })
}

/**
 * Get the class for the current post type from the `body` element. (We would
 * use `wp.data`, but it doesn't work reliably both inside and outside of the
 * post editor `<iframe>`.)
 */
function getCurrentPostTypeClass() {
  let currentClass = null

  for (const classToCheck of document.body.classList) {
    if (classToCheck.startsWith('post-type-')) {
      currentClass = classToCheck
      break
    }
  }

  return currentClass
}

/**
 * Because Gutenberg’s `isEditorReady` function remains unstable,
 * we’ll use an interval to watch for the arrival of the elements we need.
 */
function findTargetClasses() {
  if (
    Object.keys(targetClasses).every(
      (className) => document.getElementsByClassName(className).length
    )
  ) {
    // If elements are already present, set up typography classes immediately
    addTypographyClasses()
  } else {
    const editorLoadedInterval = setInterval(function () {
      // Wait until elements with all target classes are present.
      if (
        Object.keys(targetClasses).every(
          (className) => document.getElementsByClassName(className).length
        )
      ) {
        addTypographyClasses()

        // Stop the interval.
        clearInterval(editorLoadedInterval)
      } else if (document.getElementsByName('editor-canvas').length) {
        // If the block editor has been loaded in an `<iframe>`, and
        // this code is running outside of that `<iframe>`, stop the
        // interval. (This code will run again inside the `<iframe>`.)
        clearInterval(editorLoadedInterval)

        // Unsubscribe from `wp.data.subscribe()`.
        unsubscribe()
      }
    }, 40)
  }
}

/**
 * Add the classes to each element and then create a mutation observer to make
 * sure they’re added again upon removal.
 */
function addTypographyClasses() {
  const postTypeClass = getCurrentPostTypeClass()
  if (postTypeClass) {
    Object.values(targetClasses).forEach((classArray) => {
      if (!classArray.includes(postTypeClass)) {
        classArray.push(postTypeClass)
      }
    })
  }

  // Add the classes before creating the mutation observer.
  Object.entries(targetClasses).forEach(([targetClass, classes]) => {
    const element = document.getElementsByClassName(targetClass)[0]

    if (element) {
      element.classList.add(...classes)
    }
  })

  // Add mutation observers to each element.
  Object.keys(targetClasses).forEach((className) => {
    const element = document.querySelector('.' + className)
    if (element) {
      mutationObserver.observe(element, {
        attributes: true,
        attributeFilter: ['class'],
      })
    }
  })
}
