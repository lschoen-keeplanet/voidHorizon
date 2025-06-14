class VHItemSheet extends foundry.appv1.sheets.ItemSheet {
    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["voidHorizon", "sheet", "item"],
            template: "systems/voidHorizon/templates/sheets/item-sheet.html",
            width: 520,
            height: 480,
            tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description"}]
        });
    }

    /** @override */
    getData() {
        const data = super.getData();
        data.dtypes = ["String", "Number", "Boolean"];
        return data;
    }

    /** @override */
    activateListeners(html) {
        super.activateListeners(html);
    }
}

// Enregistrer la classe de la fiche
Hooks.once("init", function() {
    console.log("Enregistrement de la fiche Item");
    foundry.documents.collections.Items.unregisterSheet("core", foundry.appv1.sheets.ItemSheet);
    foundry.documents.collections.Items.registerSheet("voidHorizon", VHItemSheet, {
        types: ["outil", "A"],
        makeDefault: true
    });
}); 