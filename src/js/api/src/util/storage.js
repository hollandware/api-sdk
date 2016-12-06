class ClientStorage {

  constructor() {
    this.store = window.localStorage;

    // Test availability of local storage
    const testItem = 'test';
    try {
      this.store.setItem(testItem, testItem);
      this.store.removeItem(testItem);
      this.storeAvailable = true;
    } catch (e) {
      this.storeAvailable = false;
    }
  }

  /**
   * Store a product in the local storage
   * @param  {String} productId Id of the product
   * @param  {object} product   Product information
   * @param  {String} user      User UUID
   * @return {void}
   */
  saveProduct(productId, product, user) {
    // Add new record
    const productData = {
      ...product,
      user,
      started: Date.now(),
    };

    this.set(`its123Api-${productId}`, JSON.stringify(productData));
  }

  /**
   * Load a product from the storage
   *
   * @param  {String} productId             Product id
   * @param  {String} [user='']             User UUID
   * @param  {Number} [expirationTime=3600] Max lifetime of storage entry in seconds
   * @return {null|Object}
   */
  loadProduct(productId, user = '', expirationTime = 3600) {
    const item = this.store.get(`its123Api-${productId}`);

    // Check presence of object
    if (!item) {
      return null;
    }

    const product = JSON.parse(item);

    if (product && (product.started + (expirationTime * 1000)) > Date.now()
      && product.user === user) {
      return product;
    }

    return null;
  }

  /**
   * Set the current state of an instrument in storage
   * @param  {String} accessCode Access code for instrument
   * @param  {String} status     Status indicator
   * @return {void}
   */
  saveInstrumentStatus(accessCode, status) {
    this.set(`its123Api-${accessCode}`, status);
  }

  /**
   * Get status of an instrument from storage
   * @param  {String} accessCode Access code for instrument
   * @return {String|null} Status
   */
  loadInstrumentStatus(accessCode) {
    return this.get(`its123Api-${accessCode}`);
  }

  /**
   * Save an item to storage
   * @param  {String} id   identifier
   * @param  {mixed} item Value to store
   * @return {null}
   */
  set(id, item) {
    if (!this.storeAvailable) {
      return;
    }

    this.store.setItem(id, item);
  }

  /**
   * Retrieve an item from storage
   * @param  {String} id Storage identifier
   * @return {mixed}    The value
   */
  get(id) {
    if (!this.storeAvailable) {
      return null;
    }

    return this.store.getItem(id);
  }

  /**
   * Remove item from storage
   * @param  {String} id Storage identifier
   * @return {null}
   */
  remove(id) {
    if (!this.storeAvailable) {
      return;
    }

    this.store.removeItem(id);
  }

  /**
   * Remove all local storage elements that start with a given prefix
   * @param  {String} prefix Prefix to search for
   * @return {null}
   */
  removeByPrefix(prefix) {
    if (!this.storeAvailable) {
      return;
    }

    for (let i = this.store.length - 1; i >= 0; i -= 1) {
      if (this.store.key(i).startsWith(prefix)) {
        this.store.removeItem(this.store.key(i));
      }
    }
  }

  /**
   * Clear the local storage of all items associatd with a product id
   * @return {void}
   */
  clearProduct(productId) {
    const productJson = this.get(`its123Api-${productId}`);

    if (!productJson) {
      return;
    }

    const product = JSON.parse(productJson);
    product.slots.instruments.forEach((i) => {
      this.remove(`its123Api-${i.access_code}`);
      this.removeByPrefix(i.access_code);
    });
    this.remove(`its123Api-${productId}`);
  }
}

export default ClientStorage;
