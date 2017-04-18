/*
 * Fix native contenteditable bugs
 *
 * 1. translate empty <p><br/><p> to empty <p> tag.
 */

// Remove empty <p><br/><p> to empty <p> tag.
function collapseEmptyElement( element ){
    let _cleanHtml = ""
    let _dirtyHtml = element.innerHTML.trim()

    element.innerHTML = _dirtyHtml.replace(/^<p><br><\/p>$/,"")
}

/**
 * make El editable
 * @param  {[type]}  el                [description]
 * @param  {Boolean} [isEditable=true] [description]
 * @return {[type]}                    [description]
 */
export function makeEditable( el , isEditable=true) {
  let _iseditable = (isEditable ? 'true' : 'false')
  el.setAttribute('contentEditable', _iseditable)
  
  let _blurHandler = el.addEventListener('blur', (ev) => {
    collapseEmptyElement(el)
  })
}
