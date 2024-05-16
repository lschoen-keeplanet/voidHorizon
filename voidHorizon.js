import VHItemSheet from "./module/sheets/VHItemSheet.js";

Hooks.once("init", function(){
    console.log("%c JS custom operationnel ", 'color:lime;');
    
    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("voidHorizon", VHItemSheet, {makeDefault :true });
    
    
})