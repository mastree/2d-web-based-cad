class ItemManager {
  constructor() {
    this.items = new Array();
  }
  push(item) {
    this.items.push(item);
  }
  deleteItem(id) {
    this.items.splice(id, 1);
  }
  render() {
    for (const item of this.items) {
      item.bind();
      item.draw();
    }
  }
  renderWith(items) {
    for (const item of items) {
      item.bind();
      item.draw();
    }
    this.render();
  }
}
export default ItemManager;
