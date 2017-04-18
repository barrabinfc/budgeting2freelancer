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

class TxtEditable {
    /*
     * Make el editable
     *
     * @params el   Element to be made editable
     */
    constructor(el){
        this.el = el
        this.makeEditable( this.el )
        this._blurHandler = this.el.addEventListener('blur', this.blurHandler.bind(this))
    }

    /* Make El editable 
     * @params el Element
     * @params is_editable Boolean to be made editable or not 
     */
    makeEditable( el , isEditable=true) {
        let _iseditable = (isEditable ? 'true' : 'false')
        this.el.setAttribute('contentEditable', _iseditable)
    }

    blurHandler( ev ){
        collapseEmptyElement( ev.target )
    }
}

export default TxtEditable
