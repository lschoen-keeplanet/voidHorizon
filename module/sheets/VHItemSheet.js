export default class VHItemSheet extends ItemSheet{
        
        get template(){
            console.log((this.item.type));
            return 'systems/voidHorizon/templates/sheets/'+this.item.type+'-sheet.html';
        }
        
}