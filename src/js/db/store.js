/*
 * Global store/database
 */
class Store {
  constructor( storage=window.localStorage ){
    this.storage = storage;
  }
  
  save( name, model ){
    this.storage.setItem(name, JSON.stringify( Object.assign({docType: name}, model) ))
  }
  
  get( name ){
    return JSON.parse( this.storage.getItem(name) )
  }
}

export default Store
