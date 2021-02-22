import MapItem from './item'

class ItemManager {
    items: Array<MapItem>;

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
}

export default ItemManager;