export default class VHItemSheet extends ItemSheet{
        
        get template(){
            return `systems/voidHorizon/templates/sheets/${this.item.type}-sheet.html`;
        }
        
        getData(options){
            console.log("%c getData invoke", "color:orange")
            const data = super.getData();
            data.config = CONFIG.voidHorizon;
            console.log(data);
            return data;
            
//                let baseData = super.getData(options);
//                console.log(baseData)
//                let sheetData = {};
//                sheetData = baseData.data.system;
//                return sheetData;
        }
        
}