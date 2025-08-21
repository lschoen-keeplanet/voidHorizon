class NpcSheet extends ActorSheet {
    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
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
        html.find('.bonus-input').change(this._onBonusChange.bind(this));
        html.find('.roll-characteristic-btn').click(this._onRollCharacteristic.bind(this));
        
        // Gestion des attaques
        html.find('.add-attack-btn').click(this._onAddAttack.bind(this));
        html.find('.remove-attack-btn').click(this._onRemoveAttack.bind(this));
        html.find('.attack-name-input, .dice-input, .attack-description textarea').change(this._onAttackChange.bind(this));
        html.find('.roll-attack-btn').click(this._onRollAttack.bind(this));
        
        // Gestion des compétences
        html.find('.add-skill-btn').click(this._onAddSkill.bind(this));
        html.find('.remove-skill-btn').click(this._onRemoveSkill.bind(this));
        html.find('.skill-name-input, .skill-description textarea').change(this._onSkillChange.bind(this));
        html.find('.roll-skill-btn').click(this._onRollSkill.bind(this));
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
     * Gère les changements de bonus
     * @param {Event} event - L'événement de changement
     * @private
     */
    async _onBonusChange(event) {
        const element = event.currentTarget;
        const characteristic = element.dataset.characteristic;
        const value = parseInt(element.value) || 0;
        
        try {
            await this.actor.update({
                [`system.${characteristic}.bonus`]: value
            });
            console.log(`Bonus ${characteristic} mis à jour: ${value}`);
        } catch (error) {
            console.error(`Erreur lors de la mise à jour du bonus ${characteristic}:`, error);
        }
    }

    /**
     * Lance un jet de caractéristique
     * @param {Event} event - L'événement de clic
     * @private
     */
    async _onRollCharacteristic(event) {
        event.preventDefault();
        
        const characteristic = event.currentTarget.dataset.characteristic;
        const characteristicData = this.actor.system[characteristic];
        
        if (!characteristicData) {
            console.error('Caractéristique non trouvée:', characteristic);
            return;
        }

        try {
            // Récupérer la formule de dés et le bonus
            const diceFormula = characteristicData.value || "3d4";
            const bonus = characteristicData.bonus || 0;
            
            // Créer le jet de dés avec bonus
            let rollFormula = diceFormula;
            if (bonus !== 0) {
                rollFormula = `${diceFormula}${bonus >= 0 ? '+' : ''}${bonus}`;
            }
            
            const roll = new Roll(rollFormula);
            await roll.evaluate({async: true});
            
            // Déterminer le résultat (critique, échec, normal)
            const total = roll.total;
            const dice = roll.dice[0];
            let result = "normal";
            let resultText = "";
            
            if (dice && dice.faces) {
                if (total === dice.faces + bonus) {
                    result = "critique";
                    resultText = "🎯 COUP CRITIQUE !";
                } else if (total === 1 + bonus) {
                    result = "echec";
                    resultText = "💥 ÉCHEC CRITIQUE !";
                }
            }
            
            // Créer le message de chat
            const chatData = {
                user: game.user.id,
                speaker: ChatMessage.getSpeaker({ actor: this.actor }),
                content: await this._renderCharacteristicRoll(characteristic, roll, result, resultText, bonus),
                type: CONST.CHAT_MESSAGE_TYPES.ROLL,
                roll: roll,
                sound: CONFIG.sounds.dice
            };
            
            await ChatMessage.create(chatData);
            console.log(`Jet de caractéristique lancé: ${characteristic} - Résultat: ${total} (${result})`);
            
        } catch (error) {
            console.error('Erreur lors du jet de caractéristique:', error);
            ui.notifications.error(`Erreur lors du jet de caractéristique: ${error.message}`);
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
     * Lance un jet d'attaque
     * @param {Event} event - L'événement de clic
     * @private
     */
    async _onRollAttack(event) {
        event.preventDefault();
        
        const index = parseInt(event.currentTarget.dataset.index);
        const attack = this.actor.system.attacks[index];
        
        if (!attack) {
            console.error('Attaque non trouvée à l\'index:', index);
            return;
        }

        try {
            // Créer le jet de dés
            const roll = new Roll(attack.dice || "1d20");
            await roll.evaluate({async: true});
            
            // Déterminer le résultat (critique, échec, normal)
            const total = roll.total;
            const dice = roll.dice[0];
            let result = "normal";
            let resultText = "";
            
            if (dice && dice.faces) {
                if (total === dice.faces) {
                    result = "critique";
                    resultText = "🎯 COUP CRITIQUE !";
                } else if (total === 1) {
                    result = "echec";
                    resultText = "💥 ÉCHEC CRITIQUE !";
                }
            }
            
            // Créer le message de chat
            const chatData = {
                user: game.user.id,
                speaker: ChatMessage.getSpeaker({ actor: this.actor }),
                content: await this._renderAttackRoll(attack, roll, result, resultText),
                type: CONST.CHAT_MESSAGE_TYPES.ROLL,
                roll: roll,
                sound: CONFIG.sounds.dice
            };
            
            await ChatMessage.create(chatData);
            console.log(`Jet d'attaque lancé: ${attack.name} - Résultat: ${total} (${result})`);
            
        } catch (error) {
            console.error('Erreur lors du jet d\'attaque:', error);
            ui.notifications.error(`Erreur lors du jet d'attaque: ${error.message}`);
        }
    }

    /**
     * Lance un jet de compétence
     * @param {Event} event - L'événement de clic
     * @private
     */
    async _onRollSkill(event) {
        event.preventDefault();
        
        const index = parseInt(event.currentTarget.dataset.index);
        const skill = this.actor.system.skills[index];
        
        if (!skill) {
            console.error('Compétence non trouvée à l\'index:', index);
            return;
        }

        try {
            // Créer le message de chat pour la compétence
            const chatData = {
                user: game.user.id,
                speaker: ChatMessage.getSpeaker({ actor: this.actor }),
                content: await this._renderSkillUse(skill),
                type: CONST.CHAT_MESSAGE_TYPES.OTHER,
                sound: CONFIG.sounds.notification
            };
            
            await ChatMessage.create(chatData);
            console.log(`Compétence utilisée: ${skill.name}`);
            
        } catch (error) {
            console.error('Erreur lors de l\'utilisation de la compétence:', error);
            ui.notifications.error(`Erreur lors de l'utilisation de la compétence: ${error.message}`);
        }
    }

    /**
     * Rend le template HTML pour un jet d'attaque
     * @param {Object} attack - L'attaque
     * @param {Roll} roll - Le jet de dés
     * @param {string} result - Le résultat (critique, echec, normal)
     * @param {string} resultText - Le texte du résultat
     * @returns {string} Le HTML rendu
     * @private
     */
    async _renderAttackRoll(attack, roll, result, resultText) {
        const template = `
            <div class="voidhorizon-attack-roll">
                <div class="roll-header">
                    <h3>⚔️ ${attack.name}</h3>
                    <div class="actor-info">${this.actor.name}</div>
                </div>
                
                <div class="roll-result ${result}">
                    <div class="dice-result">${roll.total}</div>
                    <div class="result-text">${resultText}</div>
                </div>
                
                <div class="roll-details">
                    <div class="dice-formula">${roll.formula}</div>
                    <div class="dice-breakdown">${roll.dice.map(d => d.results.map(r => r.result).join(', ')).join(' | ')}</div>
                </div>
                
                ${attack.description ? `<div class="attack-description">${attack.description}</div>` : ''}
            </div>
        `;
        
        return template;
    }

    /**
     * Rend le template HTML pour l'utilisation d'une compétence
     * @param {Object} skill - La compétence
     * @returns {string} Le HTML rendu
     * @private
     */
    async _renderSkillUse(skill) {
        const template = `
            <div class="voidhorizon-skill-use">
                <div class="skill-header">
                    <h3>⭐ ${skill.name}</h3>
                    <div class="actor-info">${this.actor.name}</div>
                </div>
                
                <div class="skill-description">
                    ${skill.description || 'Aucune description disponible.'}
                </div>
            </div>
        `;
        
        return template;
    }

    /**
     * Rend le template HTML pour un jet de caractéristique
     * @param {string} characteristic - Le nom de la caractéristique
     * @param {Roll} roll - Le jet de dés
     * @param {string} result - Le résultat (critique, echec, normal)
     * @param {string} resultText - Le texte du résultat
     * @param {number} bonus - Le bonus appliqué
     * @returns {string} Le HTML rendu
     * @private
     */
    async _renderCharacteristicRoll(characteristic, roll, result, resultText, bonus) {
        const characteristicLabels = {
            'acuite': 'Acuité',
            'pimpance': 'Pimpance',
            'martialite': 'Martialité',
            'arcane': 'Arcane'
        };
        
        const label = characteristicLabels[characteristic] || characteristic;
        const bonusText = bonus !== 0 ? ` (${bonus >= 0 ? '+' : ''}${bonus})` : '';
        
        const template = `
            <div class="voidhorizon-characteristic-roll">
                <div class="roll-header">
                    <h3>🎯 ${label}</h3>
                    <div class="actor-info">${this.actor.name}</div>
                </div>
                
                <div class="roll-result ${result}">
                    <div class="dice-result">${roll.total}</div>
                    <div class="result-text">${resultText}</div>
                </div>
                
                <div class="roll-details">
                    <div class="dice-formula">${roll.formula}${bonusText}</div>
                    <div class="dice-breakdown">${roll.dice.map(d => d.results.map(r => r.result).join(', ')).join(' | ')}</div>
                    ${bonus !== 0 ? `<div class="bonus-info">Bonus appliqué: ${bonus >= 0 ? '+' : ''}${bonus}</div>` : ''}
                </div>
            </div>
        `;
        
        return template;
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
    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("voidHorizon", NpcSheet, {
        types: ["npc"],
        makeDefault: true
    });
});


