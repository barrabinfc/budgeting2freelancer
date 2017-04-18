import { map, addIndex, mapObjIndexed, fromPairs , omit } from 'ramda'

import {makeEditable} from './editable'
import {WORDS_ADJ, WORDS_NOUNS, pickRandWord} from './words'

import {InvoiceModel} from './db/models/invoice'
import Store from './db/store'

let settings = {
    itemSelector:        '.todo .item',
    editableSelector:    '*[role="editable"]',
}

let state = {
  charging_method: 'by_fixedprice',
  settings_visible: 'hidden',
  items:            [],
  editables:        [],
  store:            new Store()
}

/**
 * Form serialize/deserialize
 */

// side-effect to set INNERHTML of Element(name="alo")
function setElementHTML( selContext, name, value ) {
  let el = selContext.querySelector(`[name="${name}"]`)
  if(el) el.innerHTML = value
}

function getElementHTML( selContext, name ) {
  let el = selContext.querySelector(`[name="${name}"]`)
  return (el && el.innerHTML || "") 
}

/*
 * Serialize single item to {title: "X", "qtd": 1, "price": 10, etc...}
 */
const ITEM_FIELDS = ["title","qtd","price","subtotal","description"]
function serializeItem( item ) {
  return fromPairs( map( 
    (name) => [name, getElementHTML( item, name ) ] 
  , ITEM_FIELDS ))
}

function deserializeItem( item , data ){
  map( (name) => {
    setElementHTML(item, name, data[name]) 
  }, ITEM_FIELDS )
}


/**
 * Invoice Math
 */
function calculateCompoundPrice(itemEl) {
  let price = parseFloat( itemEl.querySelector('.price').textContent )
  let qtd  = parseFloat( itemEl.querySelector('.qtd').textContent )

  return (price * qtd)
}

function calculateFixedPrice(itemEl) {
  return parseFloat( itemEl.querySelector('.subtotal').textContent )
}

// one item price
function calculateItemPrice(itemEl) {
  return ( state.charging_method == 'by_hour' ?
            calculateCompoundPrice(itemEl) :
            calculateFixedPrice(itemEl) )
}

// invoice items sum
function calculateTotal(itemsEls) {
  let total = 0
  itemsEls.forEach( function(it){
    let itemPrice = calculateItemPrice(it)
    total        += itemPrice
  })

  return total
}

/* Display single item hourly rate */
function displayItemPrice(itemEl) {
  let subtotalEl = itemEl.querySelector('.subtotal')
  subtotalEl.textContent = Number( calculateItemPrice(itemEl) ).toFixed(0)
}

/* Display calculated invoice */
function displayTotal(itemsEls) {
  let totalEl  = document.querySelector('.total .subtotal > .value')
  totalEl.textContent = Number( calculateTotal( itemsEls ) ).toFixed(0)
}

/* Calculate everything from start */
function recalculate(){
  state['items'].forEach( function(it){
    displayItemPrice( it )
  })
  displayTotal(state['items'])
}


// update state
function updateState(){
  state['items'] = document.querySelectorAll( settings['itemSelector'] )
  state['editables'] = document.querySelectorAll( settings['editableSelector'])
}

// Add item appropriate listeners
function mkItemInteractive(item) {
  let rmItemBtn = item.querySelector('.rmItem-btn')

  item.addEventListener('focusout',recalculate)
  rmItemBtn.addEventListener('click', handleRmItemClick )
}

/* Add a new cloned invoice item */
function createItem() {
  let lastItem = state.items.length - 1
  let newItem = state['items'][lastItem].cloneNode(true)

  newItem.querySelector('.name').textContent = 'My +ADJ +NOUN.'
         .replace('+ADJ',pickRandWord(WORDS_ADJ)).replace('+NOUN', pickRandWord(WORDS_NOUNS))
  newItem.querySelector('.description').textContent = 'And also because of my +ADJ +NOUN.'
          .replace('+ADJ',pickRandWord(WORDS_ADJ)).replace('+NOUN',pickRandWord(WORDS_NOUNS))
  newItem.querySelector('.subtotal').textContent =  1000
  newItem.querySelector('.qtd').textContent = 10
  newItem.querySelector('.price').textContent = 100

  mkItemInteractive( newItem )

  // add to DOM, and update state
  state['items'][lastItem].parentNode.appendChild(newItem)
  updateState()
}

function removeItem( item ) {
  item.remove()
  updateState()
}

/* Change Tooltip visible/hidden */
function changeTooltipVisibility( tooltipEl , newVisibility) {
  tooltipEl.classList.remove( state['settings_visible'] )
  state['settings_visible'] = newVisibility
  tooltipEl.classList.add( newVisibility )
}

/* Change charge method to newMethod. Apply css 'newMethod' to defaultTgt */
function changeChargingMethodLayout( defaultTgt, newMethod ) {
  defaultTgt.classList.remove( state['charging_method'] )
  state['charging_method'] = newMethod
  defaultTgt.classList.add( newMethod )
}


/**
 * Events handlers
 */
function handleSettingsClick(targetEl, e) {
  let tgtEl   = document.querySelector( targetEl ) ||
                document.querySelector( e.target.getAttribute('data-target') )
  changeTooltipVisibility( tgtEl , (state['settings_visible'] == 'visible' ? 'hidden' : 'visible' ))
}

function handleChargingChange( defaultTgt, e ) {
  let tgtEl              = document.querySelector(defaultTgt)

  let chargingMethodEl   = e.target
  let chargingMethodOpts = Array.from(chargingMethodEl.options).map( function(opt){ return opt.value } )

  changeChargingMethodLayout( tgtEl, chargingMethodOpts[chargingMethodEl.selectedIndex] )
  recalculate(state.items)
}

function handleAddItemClick(e) {
  createItem( )
  recalculate( )
}

function handleRmItemClick(e) {
  let itemRmBtn = e.target
  let itemEl    = itemRmBtn.parentNode.parentNode

  removeItem( itemEl )
  recalculate()
}

/* Save data to store */
function handleSave(ev) {

  let invoiceParams = mapObjIndexed( (value, name) => getElementHTML(document, name) , InvoiceModel )
  let invoiceItems  = map( serializeItem, state['items'] )
  
  let invoice       = Object.assign( invoiceParams, {items: invoiceItems} )
  state['store'].save('invoice', invoice )
}

/* Restore data from store */
function handleRestore(ev) {
  let invoice = state['store'].get('invoice')
  if(!invoice) return
  
  let params = omit('items', invoice )
  let mapIndexed = addIndex(map)
  
  mapObjIndexed( (value, name) => setElementHTML(document, name, value) , params )
  mapIndexed( (el,i) => deserializeItem(el, invoice["items"][i]) , state['items'] )
}

function start(){

  state['settingsBtn']       = document.querySelector('.settings-btn')
  state['addItemBtn']        = document.querySelector('.additem-btn')
  state['chargingMethodEl']  =  document.querySelector('#charging-method')

  state.chargingMethodEl.addEventListener('change', handleChargingChange.bind({}, '.project-todo') )
  state.settingsBtn.addEventListener('click',       handleSettingsClick.bind({},  '.settings-tooltip')  )
  state.addItemBtn.addEventListener('click',        handleAddItemClick )

  updateState()
  handleRestore()

  state['items'].forEach( mkItemInteractive )
  state['editables'].forEach( (editable) => { 
    makeEditable(editable)
    editable.addEventListener('blur',  handleSave )
  })

  recalculate()
}

document.addEventListener('DOMContentLoaded', start)
