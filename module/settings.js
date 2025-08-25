// Configuration des paramètres du système voidHorizon
export const voidHorizonSettings = {};

// Paramètres de base du système
voidHorizonSettings.baseSettings = {
    // Paramètres d'affichage
    "showMovementDisplay": {
        name: "voidHorizon.settings.showMovementDisplay.name",
        hint: "voidHorizon.settings.showMovementDisplay.hint",
        scope: "world",
        config: true,
        type: Boolean,
        default: true
    },
    
    "showArmorPenalty": {
        name: "voidHorizon.settings.showArmorPenalty.name",
        hint: "voidHorizon.settings.showArmorPenalty.hint",
        scope: "world",
        config: true,
        type: Boolean,
        default: true
    },
    
    // Paramètres de calcul
    "movementFormula": {
        name: "voidHorizon.settings.movementFormula.name",
        hint: "voidHorizon.settings.movementFormula.hint",
        scope: "world",
        config: true,
        type: String,
        choices: {
            "default": "voidHorizon.settings.movementFormula.choices.default",
            "custom": "voidHorizon.settings.movementFormula.choices.custom"
        },
        default: "default"
    },
    
    "agilityMultiplier": {
        name: "voidHorizon.settings.agilityMultiplier.name",
        hint: "voidHorizon.settings.agilityMultiplier.hint",
        scope: "world",
        config: true,
        type: Number,
        range: {
            min: 0.5,
            max: 3.0,
            step: 0.1
        },
        default: 1.5
    },
    
    "movementBase": {
        name: "voidHorizon.settings.movementBase.name",
        hint: "voidHorizon.settings.movementBase.hint",
        scope: "world",
        config: true,
        type: Number,
        range: {
            min: 0.0,
            max: 5.0,
            step: 0.5
        },
        default: 1.5
    },
    
    // Paramètres d'armure
    "armorPenaltyEnabled": {
        name: "voidHorizon.settings.armorPenaltyEnabled.name",
        hint: "voidHorizon.settings.armorPenaltyEnabled.hint",
        scope: "world",
        config: true,
        type: Boolean,
        default: true
    },
    
    "armorPenaltyMultiplier": {
        name: "voidHorizon.settings.armorPenaltyMultiplier.name",
        hint: "voidHorizon.settings.armorPenaltyMultiplier.hint",
        scope: "world",
        config: true,
        type: Number,
        range: {
            min: 0.5,
            max: 3.0,
            step: 0.5
        },
        default: 1.5
    },
    
    // Paramètres d'interface
    "showTooltips": {
        name: "voidHorizon.settings.showTooltips.name",
        hint: "voidHorizon.settings.showTooltips.hint",
        scope: "world",
        config: true,
        type: Boolean,
        default: true
    },
    
    "showDiceRanges": {
        name: "voidHorizon.settings.showDiceRanges.name",
        hint: "voidHorizon.settings.showDiceRanges.hint",
        scope: "world",
        config: true,
        type: Boolean,
        default: true
    },
    
    "showBonusBreakdown": {
        name: "voidHorizon.settings.showBonusBreakdown.name",
        hint: "voidHorizon.settings.showBonusBreakdown.hint",
        scope: "world",
        config: true,
        type: Boolean,
        default: true
    }
};

// Paramètres avancés
voidHorizonSettings.advancedSettings = {
    "debugMode": {
        name: "voidHorizon.settings.debugMode.name",
        hint: "voidHorizon.settings.debugMode.hint",
        scope: "world",
        config: true,
        type: Boolean,
        default: false
    },
    
    "logLevel": {
        name: "voidHorizon.settings.logLevel.name",
        hint: "voidHorizon.settings.logLevel.hint",
        scope: "world",
        config: true,
        type: String,
        choices: {
            "none": "voidHorizon.settings.logLevel.choices.none",
            "error": "voidHorizon.settings.logLevel.choices.error",
            "warn": "voidHorizon.settings.logLevel.choices.warn",
            "info": "voidHorizon.settings.logLevel.choices.info",
            "debug": "voidHorizon.settings.logLevel.choices.debug"
        },
        default: "warn"
    },
    
    "autoSave": {
        name: "voidHorizon.settings.autoSave.name",
        hint: "voidHorizon.settings.autoSave.hint",
        scope: "world",
        config: true,
        type: Boolean,
        default: true
    },
    
    "autoSaveInterval": {
        name: "voidHorizon.settings.autoSaveInterval.name",
        hint: "voidHorizon.settings.autoSaveInterval.hint",
        scope: "world",
        config: true,
        type: Number,
        range: {
            min: 30,
            max: 300,
            step: 30
        },
        default: 60
    }
};

// Fonction pour enregistrer tous les paramètres
export function registerSettings() {
    console.log("Enregistrement des paramètres voidHorizon...");
    
    // Enregistrer les paramètres de base
    for (const [key, setting] of Object.entries(voidHorizonSettings.baseSettings)) {
        game.settings.register("voidHorizon", key, setting);
    }
    
    // Enregistrer les paramètres avancés
    for (const [key, setting] of Object.entries(voidHorizonSettings.advancedSettings)) {
        game.settings.register("voidHorizon", key, setting);
    }
    
    console.log("Paramètres voidHorizon enregistrés avec succès !");
}

// Fonction pour obtenir un paramètre
export function getSetting(key) {
    return game.settings.get("voidHorizon", key);
}

// Fonction pour définir un paramètre
export function setSetting(key, value) {
    return game.settings.set("voidHorizon", key, value);
}
