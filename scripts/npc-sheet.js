class NpcSheet extends foundry.appv1.sheets.ActorSheet {
    /** @override */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ["voidHorizon", "sheet", "actor", "npc"],
            template: "systems/voidHorizon/templates/sheets/npc-sheet.html",
            width: 500,
            height: 600,
            tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "stats"}]
        });
    }

    /** @override */
    async getData() {
        const data = await super.getData();
        data.dtypes = ["String", "Number", "Boolean"];

        // S'assurer que la structure des ressources existe
        if (!data.actor.system.resources) {
            data.actor.system.resources = {};
        }
        if (!data.actor.system.resources.health) {
            data.actor.system.resources.health = { value: 0, max: 0 };
        }
        if (!data.actor.system.resources.shield) {
            data.actor.system.resources.shield = { value: 0, max: 0 };
        }
        if (!data.actor.system.resources.mana) {
            data.actor.system.resources.mana = { value: 0, max: 0 };
        }

        // S'assurer que les attaques et compétences existent
        if (!data.actor.system.attacks) {
            data.actor.system.attacks = [];
        }
        if (!data.actor.system.skills) {
            data.actor.system.skills = [];
        }

        // Initialiser les valeurs par défaut pour un nouvel acteur
        if (!data.actor.system.type) {
            data.actor.system.type = "enemy";
        }
        if (!data.actor.system.level) {
            data.actor.system.level = 1;
        }
        if (!data.actor.system.acuite?.value) {
            data.actor.system.acuite = { value: "3d4" };
        }
        if (!data.actor.system.pimpance?.value) {
            data.actor.system.pimpance = { value: "3d4" };
        }
        if (!data.actor.system.martialite?.value) {
            data.actor.system.martialite = { value: "3d4" };
        }
        if (!data.actor.system.arcane?.value) {
            data.actor.system.arcane = { value: "2d4" };
        }

        // Préparation des données pour le template
        this._prepareItems(data);
        
        return data;
    }

    /** @override */
    activateListeners(html) {
        super.activateListeners(html);
        
        // Gestion des changements de ressources
        html.find('.resource-input').change(this._onResourceChange.bind(this));
        
        // Gestion des changements de caractéristiques
        html.find('.characteristic-input').change(this._onCharacteristicChange.bind(this));
        
        // Gestion des attaques
        html.find('.add-attack-btn').click(this._onAddAttack.bind(this));
        html.find('.remove-attack-btn').click(this._onRemoveAttack.bind(this));
        html.find('.attack-name-input, .dice-input, .attack-description textarea').change(this._onAttackChange.bind(this));
        
        // Gestion des compétences
        html.find('.add-skill-btn').click(this._onAddSkill.bind(this));
        html.find('.remove-skill-btn').click(this._onRemoveSkill.bind(this));
        html.find('.skill-name-input, .skill-description textarea').change(this._onSkillChange.bind(this));
    }

    /**
     * Gère les changements de ressources (PV, bouclier, mana)
     * @param {Event} event - L'événement de changement
     * @private
     */
    async _onResourceChange(event) {
        const element = event.currentTarget;
        const resourceType = element.dataset.resource;
        const value = parseInt(element.value) || 0;
        
        try {
            await this.actor.update({
                [`system.resources.${resourceType}.value`]: value
            });
            console.log(`Ressource ${resourceType} mise à jour: ${value}`);
        } catch (error) {
            console.error(`Erreur lors de la mise à jour de la ressource ${resourceType}:`, error);
        }
    }

    /**
     * Gère les changements de caractéristiques
     * @param {Event} event - L'événement de changement
     * @private
     */
    async _onCharacteristicChange(event) {
        const element = event.currentTarget;
        const characteristic = element.dataset.characteristic;
        const value = element.value;
        
        try {
            await this.actor.update({
                [`system.${characteristic}.value`]: value
            });
            console.log(`Caractéristique ${characteristic} mise à jour: ${value}`);
        } catch (error) {
            console.error(`Erreur lors de la mise à jour de la caractéristique ${characteristic}:`, error);
        }
    }

    /**
     * Ajoute une nouvelle attaque
     * @param {Event} event - L'événement de clic
     * @private
     */
    async _onAddAttack(event) {
        event.preventDefault();
        
        try {
            const newAttack = {
                name: "Nouvelle attaque",
                dice: "1d20",
                description: "Description de l'attaque"
            };
            
            const currentAttacks = this.actor.system.attacks || [];
            const updatedAttacks = [...currentAttacks, newAttack];
            
            await this.actor.update({
                'system.attacks': updatedAttacks
            });
            
            console.log('Nouvelle attaque ajoutée');
            this.render(true); // Re-rendre la fiche pour afficher la nouvelle attaque
            
        } catch (error) {
            console.error('Erreur lors de l\'ajout de l\'attaque:', error);
        }
    }

    /**
     * Supprime une attaque
     * @param {Event} event - L'événement de clic
     * @private
     */
    async _onRemoveAttack(event) {
        event.preventDefault();
        
        const index = parseInt(event.currentTarget.dataset.index);
        
        try {
            const currentAttacks = this.actor.system.attacks || [];
            const updatedAttacks = currentAttacks.filter((_, i) => i !== index);
            
            await this.actor.update({
                'system.attacks': updatedAttacks
            });
            
            console.log(`Attaque à l'index ${index} supprimée`);
            this.render(true); // Re-rendre la fiche pour mettre à jour l'affichage
            
        } catch (error) {
            console.error('Erreur lors de la suppression de l\'attaque:', error);
        }
    }

    /**
     * Gère les changements dans les attaques
     * @param {Event} event - L'événement de changement
     * @private
     */
    async _onAttackChange(event) {
        const element = event.currentTarget;
        const attackItem = element.closest('.attack-item');
        const index = parseInt(attackItem.dataset.index);
        const field = this._getFieldName(element);
        const value = element.value;
        
        try {
            await this.actor.update({
                [`system.attacks.${index}.${field}`]: value
            });
            console.log(`Attaque ${index}, champ ${field} mis à jour: ${value}`);
        } catch (error) {
            console.error(`Erreur lors de la mise à jour de l'attaque ${index}:`, error);
        }
    }

    /**
     * Ajoute une nouvelle compétence
     * @param {Event} event - L'événement de clic
     * @private
     */
    async _onAddSkill(event) {
        event.preventDefault();
        
        try {
            const newSkill = {
                name: "Nouvelle compétence",
                description: "Description de la compétence"
            };
            
            const currentSkills = this.actor.system.skills || [];
            const updatedSkills = [...currentSkills, newSkill];
            
            await this.actor.update({
                'system.skills': updatedSkills
            });
            
            console.log('Nouvelle compétence ajoutée');
            this.render(true); // Re-rendre la fiche pour afficher la nouvelle compétence
            
        } catch (error) {
            console.error('Erreur lors de l\'ajout de la compétence:', error);
        }
    }

    /**
     * Supprime une compétence
     * @param {Event} event - L'événement de clic
     * @private
     */
    async _onRemoveSkill(event) {
        event.preventDefault();
        
        const index = parseInt(event.currentTarget.dataset.index);
        
        try {
            const currentSkills = this.actor.system.skills || [];
            const updatedSkills = currentSkills.filter((_, i) => i !== index);
            
            await this.actor.update({
                'system.skills': updatedSkills
            });
            
            console.log(`Compétence à l'index ${index} supprimée`);
            this.render(true); // Re-rendre la fiche pour mettre à jour l'affichage
            
        } catch (error) {
            console.error('Erreur lors de la suppression de la compétence:', error);
        }
    }

    /**
     * Gère les changements dans les compétences
     * @param {Event} event - L'événement de changement
     * @private
     */
    async _onSkillChange(event) {
        const element = event.currentTarget;
        const skillItem = element.closest('.skill-item');
        const index = parseInt(skillItem.dataset.index);
        const field = this._getFieldName(element);
        const value = element.value;
        
        try {
            await this.actor.update({
                [`system.skills.${index}.${field}`]: value
            });
            console.log(`Compétence ${index}, champ ${field} mis à jour: ${value}`);
        } catch (error) {
            console.error(`Erreur lors de la mise à jour de la compétence ${index}:`, error);
        }
    }

    /**
     * Détermine le nom du champ à partir de l'élément HTML
     * @param {HTMLElement} element - L'élément HTML
     * @returns {string} Le nom du champ
     * @private
     */
    _getFieldName(element) {
        if (element.classList.contains('attack-name-input') || element.classList.contains('skill-name-input')) {
            return 'name';
        } else if (element.classList.contains('dice-input')) {
            return 'dice';
        } else if (element.classList.contains('attack-description') || element.classList.contains('skill-description')) {
            return 'description';
        }
        return 'unknown';
    }

    /**
     * Prépare les éléments de l'acteur pour le template
     * @param {Object} data - Les données de l'acteur
     * @private
     */
    _prepareItems(data) {
        // Préparation des éléments si nécessaire
        // À implémenter dans une version future
    }
}

// Enregistrer la classe de la fiche
Hooks.once("init", function() {
    console.log("Enregistrement de la fiche NPC");
    
    // Enregistrer la classe de la fiche
    foundry.appv1.sheets.ActorSheet.registerSheet("voidHorizon", NpcSheet, {
        types: ["npc"],
        makeDefault: true
    });
});

// Hook pour initialiser les données par défaut lors de la création d'un nouvel acteur NPC
Hooks.once("ready", function() {
    // Écouter la création d'un nouvel acteur
    Hooks.on("createActor", async function(actor, options, userId) {
        // Vérifier si c'est un acteur NPC et s'il vient d'être créé
        if (actor.type === "npc" && options.initialize) {
            console.log("Initialisation d'un nouvel acteur NPC:", actor.name);
            
            try {
                // Initialiser les données par défaut
                const defaultData = {
                    "system.type": "enemy",
                    "system.level": 1,
                    "system.resources.health": { value: 10, max: 10 },
                    "system.resources.shield": { value: 0, max: 0 },
                    "system.resources.mana": { value: 0, max: 0 },
                    "system.acuite": { value: "3d4" },
                    "system.pimpance": { value: "3d4" },
                    "system.martialite": { value: "3d4" },
                    "system.arcane": { value: "2d4" },
                    "system.attacks": [],
                    "system.skills": [],
                    "system.description": "Un nouveau NPC",
                    "system.notes": ""
                };
                
                // Mettre à jour l'acteur avec les données par défaut
                await actor.update(defaultData);
                console.log("Données par défaut appliquées au NPC:", actor.name);
                
            } catch (error) {
                console.error("Erreur lors de l'initialisation du NPC:", error);
            }
        }
    });
});
