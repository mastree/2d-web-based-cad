import MapItem from './item'

class ItemManager {
    public items: Array<MapItem>;

    constructor(){
        this.items = new Array<MapItem>();
    }
    push(item: MapItem){
        this.items.push(item);
    }
    deleteItem(id: number){
        this.items.splice(id, 1);
    }
    render(){
        for (const item of this.items){
            item.bind();
            item.draw();
        }
    }
    renderWith(items: MapItem[]){
        for (const item of items){
            item.bind();
            item.draw();
        }
        this.render();
    }
}

export default ItemManager;