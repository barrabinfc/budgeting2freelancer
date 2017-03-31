var state = {
  charging_method: 'by_fixedprice',
  settings_visible: 'hidden',
}

var WORDS_ADJ   = ['secret','precious','tremendous','adorable','pink','capricious','turquoise',
                   'corageous','dazzling','educated','erratic','creative','entertaining',
                   'witty','harmonious','mature','organic','gluten-free','therapeutic']
var WORDS_OBJS  = ['time','attention','expertise','taste','study','talent','effort','art',
                   'history','computer','data','knowledge','idea','development','policy',
                  'professionalism','dance','support','dump','pride','communication']

var randWord = function(wordList){
  var l = wordList.length-1
  var rand = Math.round( Math.random()*l )
  return wordList[rand]
}

// hourly-rate math
var calculateHourlyRate = function(itemEl){
  var rate = parseFloat( itemEl.querySelector('.rate').textContent )
  var hrs  = parseFloat( itemEl.querySelector('.hrs').textContent )

  return (rate * hrs)
}

var calculateFixedPrice = function(itemEl) {
  return parseFloat( itemEl.querySelector('.subtotal').textContent )
}

// one item price
var calculateItemPrice = function(itemEl){
  return ( state.charging_method == 'by_hour' ?
            calculateHourlyRate(itemEl) :
            calculateFixedPrice(itemEl) )
}

// invoice items sum
var calculateTotal = function(itemsEls){
  var total = 0
  itemsEls.forEach( function(it){
    var itemPrice = calculateItemPrice(it)
    total        += itemPrice
  })

  return total
}

/* Display single item hourly rate */
var displayItemPrice = function(itemEl){
  var subtotalEl = itemEl.querySelector('.subtotal')
  subtotalEl.textContent = Number( calculateItemPrice(itemEl) ).toFixed(0)
}

/* Display calculated invoice */
var displayTotal = function(itemsEls){
  var totalEl  = document.querySelector('.total .subtotal > .value')
  totalEl.textContent = Number( calculateTotal( itemsEls ) ).toFixed(0)
}

/* Calculate everything from start */
var recalculate = function(){
  var itemsEls = document.querySelectorAll('.todo .item')

  itemsEls.forEach( function(it){
    displayItemPrice( it )
  })
  displayTotal(itemsEls)
}

/* Add a new cloned invoice item */
var createItem = function( itemSelector ){
  var lastItem = state.items.length - 1
  var newItem = state['items'][lastItem].cloneNode(true)

  newItem.querySelector('.name').textContent = 'My +ADJ +OBJ.'.replace('+ADJ',randWord(WORDS_ADJ)).replace('+OBJ', randWord(WORDS_OBJS))
  newItem.querySelector('.description').textContent = 'And also because of my +ADJ +OBJ.'.replace('+ADJ',randWord(WORDS_ADJ)).replace('+OBJ',randWord(WORDS_OBJS))
  newItem.querySelector('.subtotal').textContent =  1000
  newItem.querySelector('.hrs').textContent = 10
  newItem.querySelector('.rate').textContent = 100

  state['items'][lastItem].parentNode.appendChild(newItem)
  state['items'] = document.querySelectorAll( itemSelector )
}

var removeItem = function( itemIndex ) {

}

/* Change Tooltip visible/hidden */
var changeTooltipVisibility = function( tooltipEl , newVisibility) {
  tooltipEl.classList.remove( state['settings_visible'] )
  state['settings_visible'] = newVisibility
  tooltipEl.classList.add( newVisibility )
}

/* Change charge method to newMethod. Apply css 'newMethod' to defaultTgt */
var changeChargingMethodLayout = function( defaultTgt, newMethod ) {
  defaultTgt.classList.remove( state['charging_method'] )
  state['charging_method'] = newMethod
  defaultTgt.classList.add( newMethod )
}


var handleSettingsClick = function(targetEl, e){
  var tgtEl   = document.querySelector( targetEl ) ||
                document.querySelector( e.target.getAttribute('data-target') )
  changeTooltipVisibility( tgtEl , (state['settings_visible'] == 'visible' ? 'hidden' : 'visible' ))
}

var handleChargingChange = function( defaultTgt, e ){
  var tgtEl              = document.querySelector(defaultTgt)

  var chargingMethodEl   = e.target
  var chargingMethodOpts = Array.from(chargingMethodEl.options).map( function(opt){ return opt.value } )

  changeChargingMethodLayout( tgtEl, chargingMethodOpts[chargingMethodEl.selectedIndex] )
  recalculate(state.items)
}

var handleAddItemClick = function(itemSelector, e){
  createItem(itemSelector)
  recalculate( state['items'] )
}


var start = function(){

  state['settingsBtn']       = document.querySelector('.settings-btn')
  state['addItemBtn']        = document.querySelector('.additem-btn')
  state['chargingMethodEl']  =  document.querySelector('#charging-method')
  state['items']             =  document.querySelectorAll('.todo .item')

  state.chargingMethodEl.addEventListener('change', handleChargingChange.bind({}, '.project-todo') )
  state.settingsBtn.addEventListener('click',       handleSettingsClick.bind({},  '.settings-tooltip')  )
  state.addItemBtn.addEventListener('click',        handleAddItemClick.bind({},   '.todo .item'))

  /* recalculate when people edit item values
  state.items.forEach( function(it) {
    it.addEventListener('focusout', function(e){ recalculate() })
  })*/

  recalculate(state.items)
}

document.addEventListener('DOMContentLoaded', start)
