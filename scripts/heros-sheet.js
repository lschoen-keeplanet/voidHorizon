class HeroSheet extends foundry.appv1.sheets.ActorSheet {
    /** @override */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ["voidHorizon", "sheet", "actor", "heros"],
            template: "systems/voidHorizon/templates/sheets/heros-sheet.html",
            width: 600,
            height: 600,
            tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "stats"}]
        });
    }

    /** @override */
    async getData() {
        const data = await super.getData();
        console.log('Actor data:', this.actor);
        console.log('System data:', this.actor.system);
        data.dtypes = ["String", "Number", "Boolean"];

        // Préparation des données pour le template
        this._prepareItems(data);
        
        // S'assurer que la structure des ressources existe
        if (!data.actor.system.resources) {
            data.actor.system.resources = {};
        }
        if (!data.actor.system.resources.blessure) {
            data.actor.system.resources.blessure = { value: 0 };
        }
        if (!data.actor.system.resources.armor) {
            data.actor.system.resources.armor = { value: 0 };
        }
        if (!data.actor.system.resources.armorDamage) {
            data.actor.system.resources.armorDamage = { value: 0 };
        }
        
        // Préparation des statistiques principales
        data.system = {
            ...data.system,
            acuite: {
                value: data.actor.system.acuite?.value || "1d4",
                label: "acuité"
            },
            pimpance: {
                value: data.actor.system.pimpance?.value || "1d4",
                label: "Pimpance"
            },
            martialite: {
                value: data.actor.system.martialite?.value || "1d4",
                label: "Martialité"
            },
            arcane: {
                value: data.actor.system.arcane?.value || "1d4",
                label: "Arcane"
            },
            constitution: {
                value: data.actor.system.constitution?.value || 4,
                label: "Constitution"
            },
            class: {
                value: data.actor.system.class?.value || "",
                label: "Classe"
            },
            faction: {
                value: data.actor.system.faction?.value || "caradoc",
                label: "Faction"
            },
            rank: {
                value: data.actor.system.rank?.value || "",
                label: "Rang"
            },
            affinity: {
                value: data.actor.system.affinity?.value || "aucune",
                label: "Affinité"
            }
        };
        
        // S'assurer que les données sont aussi disponibles directement dans data.actor.system
        if (!data.actor.system.acuite) data.actor.system.acuite = { value: "1d4" };
        if (!data.actor.system.pimpance) data.actor.system.pimpance = { value: "1d4" };
        if (!data.actor.system.martialite) data.actor.system.martialite = { value: "1d4" };
        if (!data.actor.system.arcane) data.actor.system.arcane = { value: "1d4" };
        if (!data.actor.system.constitution) data.actor.system.constitution = { value: 4 };
        if (!data.actor.system.class) data.actor.system.class = { value: "" };
        if (!data.actor.system.faction) data.actor.system.faction = { value: "caradoc" };
        if (!data.actor.system.rank) data.actor.system.rank = { value: "" };
        if (!data.actor.system.affinity) data.actor.system.affinity = { value: "aucune" };
        
        // Initialiser les données d'armes si elles n'existent pas
        if (!data.actor.system.weapons) {
            data.actor.system.weapons = {
                primary: { name: "", type: "strength", rank: "0", bonus: 0, description: "" },
                secondary: { name: "", type: "strength", rank: "0", bonus: 0, description: "" }
            };
        }
        if (!data.actor.system.weapons.primary) {
            data.actor.system.weapons.primary = { name: "", type: "strength", rank: "0", bonus: 0, description: "" };
        }
        if (!data.actor.system.weapons.secondary) {
            data.actor.system.weapons.secondary = { name: "", type: "strength", rank: "0", bonus: 0, description: "" };
        }
        
        // Ajouter les helpers pour le template
        data.helpers = {
            getSelectedText: (value, type) => {
                console.log(`Helper getSelectedText appelé avec value: ${value}, type: ${type}`);
                const mappings = {
                    martialite: {
                        "1d4": "Incompétent",
                        "1d6": "Combatif",
                        "1d8": "Soldat",
                        "1d10": "Expérimenté",
                        "1d12": "Vétéran",
                        "1d20": "Légende"
                    },
                    pimpance: {
                        "1d4": "Tâche",
                        "1d6": "Pas top",
                        "1d8": "Honnête",
                        "1d10": "Beau",
                        "1d12": "Splendide",
                        "1d20": "Ramirez"
                    },
                    acuite: {
                        "1d4": "Aveugle",
                        "1d6": "Distrait",
                        "1d8": "Alerte",
                        "1d10": "Vif",
                        "1d12": "Clairvoyant",
                        "1d20": "Fulgurant"
                    },
                    arcane: {
                        "1d4": "Insensible",
                        "1d6": "Eveillé",
                        "1d8": "Novice",
                        "1d10": "Initié",
                        "1d12": "Maître",
                        "1d20": "Archimage"
                    }
                };
                const result = mappings[type]?.[value] || value;
                console.log(`Helper getSelectedText retourne: ${result}`);
                return result;
            }
        };
        
        data.isReadOnly = true; // Ajout d'un flag pour indiquer que nous sommes en mode lecture
        return data;
    }

    /** @override */
    activateListeners(html) {
        super.activateListeners(html);

        // Gestion du mode édition/lecture
        html.find('.toggle-edit-mode').click(this._onToggleEditMode.bind(this));

        // Gestion des événements pour les items
        html.find('.item-edit').click(this._onItemEdit.bind(this));
        html.find('.item-delete').click(this._onItemDelete.bind(this));
        html.find('.create-item').click(this._onCreateItem.bind(this));

        // Gestion des changements de valeurs (sans sauvegarde automatique)
        html.find('select[name^="system."]').change(this._onSelectChange.bind(this));
        html.find('input[type="text"]').change(this._onTextChange.bind(this));
        html.find('input[type="number"]').change(this._onResourceChange.bind(this));

        // Gestion des lancers de dés
        html.find('.rollable').click(this._onRollStat.bind(this));
        
        // Gestion des boutons de lancement de dés
        html.find('.roll-dice-btn').click(this._onRollDice.bind(this));
        
        // Gestion des boutons de lancement d'armes
        html.find('.roll-weapon-btn').click(this._onRollWeapon.bind(this));

        // Gestion des cœurs de vie
        html.find('.heart-button').click(this._onHeartClick.bind(this));

        // Gestion des boucliers d'armure
        html.find('.armor-container .shield-button').click(this._onShieldClick.bind(this));

        // Gestion des changements de rang
        html.find('input[name="system.rank.value"]').change(this._onRankChange.bind(this));
        
        // Gestion des changements d'affinité
        html.find('select[name="system.affinity.value"]').change(this._onSelectChange.bind(this));
        
                 // Gestion des changements de type d'équipement (pour les boucliers)
         html.find('select[name^="system.weapons."][name$=".type"]').change(this._onWeaponTypeChange.bind(this));
         
         // Gestion des changements d'armes (sans sauvegarde automatique)
         html.find('input[name^="system.weapons."], select[name^="system.weapons."], textarea[name^="system.weapons."]').change(this._onWeaponFieldChange.bind(this));
         
         // Gestion du mode édition/lecture des armes
         html.find('.toggle-weapons-edit-mode').click(this._onToggleWeaponsEditMode.bind(this));
        
        // Initialiser l'état des cœurs et de la santé
        this._initializeHealthState();
    }

    /**
     * Initialise l'état des cœurs en fonction de la valeur de blessure
     * @param {jQuery} html - Le contenu HTML de la fiche
     * @private
     */
    _initializeHearts(html) {
        const blessure = this.actor.system.resources.blessure?.value || 0;
        const hearts = html.find('.heart-wrapper');
        
        hearts.each((index, wrapper) => {
            const heartIndex = index;
            const aliveButton = wrapper.querySelector('.alive');
            const deadButton = wrapper.querySelector('.dead');
            
            if (heartIndex < blessure) {
                aliveButton.classList.add('hidden');
                deadButton.classList.remove('hidden');
            } else {
                aliveButton.classList.remove('hidden');
                deadButton.classList.add('hidden');
            }
        });
    }

    /**
     * Initialise l'état des boucliers d'armure
     * @param {jQuery} html - Le contenu HTML de la fiche
     * @private
     */
    _initializeShields(html) {
        const armorDamage = this.actor.system.resources.armorDamage?.value || 0;
        const shields = html.find('.armor-container .shield-wrapper');
        
        shields.each((index, wrapper) => {
            const shieldIndex = index;
            const activeButton = wrapper.querySelector('.active');
            const brokenButton = wrapper.querySelector('.broken');
            
            // Vérification de sécurité
            if (!activeButton || !brokenButton) {
                console.error("Boutons d'armure non trouvés lors de l'initialisation:", { activeButton, brokenButton });
                return;
            }
            
            if (shieldIndex < armorDamage) {
                activeButton.classList.add('hidden');
                brokenButton.classList.remove('hidden');
            } else {
                activeButton.classList.remove('hidden');
                brokenButton.classList.add('hidden');
            }
        });
    }

    /**
     * Prépare les items pour l'affichage
     * @param {Object} data - Les données de l'acteur
     * @private
     */
    _prepareItems(data) {
        // Trier les items par type
        const items = {
            outil: [],
            A: []
        };

        // Trier chaque item dans son type
        for (let i of data.items) {
            if (items.hasOwnProperty(i.type)) {
                items[i.type].push(i);
            }
        }

        // Ajouter les items triés aux données
        data.items = items;
    }

    /**
     * Gère la création d'un nouvel item
     * @param {Event} event - L'événement de clic
     * @private
     */
    async _onCreateItem(event) {
        event.preventDefault();
        
        const itemData = {
            name: "Nouvel Item",
            type: "equipment",
            system: {
                description: ""
            }
        };

        try {
            await Item.create(itemData, { parent: this.actor });
        } catch (error) {
            console.error("Erreur lors de la création de l'item:", error);
        }
    }

    /**
     * Gère l'édition d'un item
     * @param {Event} event - L'événement de clic
     * @private
     */
    async _onItemEdit(event) {
        event.preventDefault();
        const itemId = event.currentTarget.closest(".item").dataset.itemId;
        const item = this.actor.items.get(itemId);
        
        if (item) {
            const template = `
                <form>
                    <div class="form-group">
                        <label>Nom</label>
                        <input type="text" name="name" value="${item.name}"/>
                    </div>
                    <div class="form-group">
                        <label>Description</label>
                        <textarea name="system.description">${item.system.description || ""}</textarea>
                    </div>
                </form>
            `;

            new Dialog({
                title: "Modifier l'item",
                content: template,
                buttons: {
                    save: {
                        icon: '<i class="fas fa-save"></i>',
                        label: "Sauvegarder",
                        callback: async (html) => {
                            const formData = new FormData(html.find('form')[0]);
                            const updateData = {
                                name: formData.get('name'),
                                'system.description': formData.get('system.description')
                            };
                            await item.update(updateData);
                        }
                    },
                    cancel: {
                        icon: '<i class="fas fa-times"></i>',
                        label: "Annuler"
                    }
                },
                default: "save"
            }).render(true);
        }
    }

    /**
     * Gère la suppression d'un item
     * @param {Event} event - L'événement de clic
     * @private
     */
    async _onItemDelete(event) {
        event.preventDefault();
        const itemId = event.currentTarget.closest(".item").dataset.itemId;
        const item = this.actor.items.get(itemId);
        
        if (item) {
            new Dialog({
                title: "Supprimer l'item",
                content: `<p>Êtes-vous sûr de vouloir supprimer "${item.name}" ?</p>`,
                buttons: {
                    delete: {
                        icon: '<i class="fas fa-trash"></i>',
                        label: "Supprimer",
                        callback: async () => {
                            await item.delete();
                        }
                    },
                    cancel: {
                        icon: '<i class="fas fa-times"></i>',
                        label: "Annuler"
                    }
                },
                default: "cancel"
            }).render(true);
        }
    }

    /**
     * Gère les changements de valeurs numériques
     * @param {Event} event - L'événement de changement
     * @private
     */
    async _onResourceChange(event) {
        event.preventDefault();
        const target = event.target;
        const value = parseInt(target.value);
        const name = target.name;

        console.log("=== Debug Resource Change ===");
        console.log("Name:", name);
        console.log("Value:", value);
        console.log("Current actor data:", this.actor.system);

        try {
            let updateData = {};
            
            // Déterminer quel champ mettre à jour en fonction du nom
            if (name === "system.resources.armor.value") {
                updateData = {
                    system: {
                        resources: {
                            armor: {
                                value: value
                            }
                        }
                    }
                };
                await this.actor.update(updateData);
                this._updateShieldsDisplay();
            } else if (name === "system.constitution.value") {
                updateData = {
                    system: {
                        constitution: {
                            value: value
                        }
                    }
                };
                await this.actor.update(updateData);
                this._updateHeartsDisplay();
            }

            // Mettre à jour l'état de santé
            this._updateHealthStatus();
            
            // Mettre à jour uniquement les sections nécessaires
            if (name === "system.resources.armor.value") {
                this._updateShieldsDisplay();
            } else if (name === "system.constitution.value") {
                this._updateHeartsDisplay();
            }
        } catch (error) {
            console.error("Erreur lors de la mise à jour:", error);
            // Restaurer la valeur précédente en cas d'erreur
            if (name === "system.resources.armor.value") {
                target.value = this.actor.system.resources.armor.value;
            } else if (name === "system.constitution.value") {
                target.value = this.actor.system.constitution.value;
            }
        }
        console.log("=== Fin Debug Resource Change ===");
    }

    _updateHeartsDisplay() {
        const constitution = this.actor.system.constitution?.value || 0;
        const blessure = this.actor.system.resources.blessure?.value || 0;
        const hearts = this.element.find('.heart-wrapper');
        
        hearts.each((index, wrapper) => {
            const heartIndex = index;
            const aliveButton = wrapper.querySelector('.alive');
            const deadButton = wrapper.querySelector('.dead');
            
            if (heartIndex < blessure) {
                aliveButton.classList.add('hidden');
                deadButton.classList.remove('hidden');
            } else {
                aliveButton.classList.remove('hidden');
                deadButton.classList.add('hidden');
            }
        });
    }

    /**
     * Met à jour l'affichage des boucliers en fonction de la valeur d'armure
     * @private
     */
    _updateShieldsDisplay() {
        console.log("=== Debug Shields Display ===");
        const armorValue = parseInt(this.actor.system.resources.armor?.value) || 0;
        const armorDamage = parseInt(this.actor.system.resources.armorDamage?.value) || 0;
        
        console.log("Valeur d'armure:", armorValue);
        console.log("Dégâts d'armure:", armorDamage);
        
        const shields = this.element.find('.shield-wrapper');
        console.log("Boucliers existants:", shields.length);
        
        // Supprimer les boucliers existants
        shields.remove();
        
        // Créer les nouveaux boucliers
        const armorContainer = this.element.find('.armor-container');
        console.log("Container d'armure trouvé:", armorContainer.length > 0);
        
        for (let i = 0; i < armorValue; i++) {
            const shieldWrapper = $(`
                <div class="shield-wrapper">
                    <button type="button" class="shield-button active" data-shield-index="${i}" data-active="true">
                        <i class="fas fa-shield-alt"></i>
                    </button>
                    <button type="button" class="shield-button broken" data-shield-index="${i}" data-active="false">
                        <i class="fas fa-shield-alt" style="opacity: 0.3;"></i>
                    </button>
                </div>
            `);
            armorContainer.append(shieldWrapper);
            
            // Mettre à jour l'état du bouclier
            const activeButton = shieldWrapper.find('.active');
            const brokenButton = shieldWrapper.find('.broken');
            
            if (i < armorDamage) {
                activeButton.addClass('hidden');
                brokenButton.removeClass('hidden');
            } else {
                activeButton.removeClass('hidden');
                brokenButton.addClass('hidden');
            }
        }
        console.log("Nouveaux boucliers créés:", armorValue);
        console.log("=== Fin Debug Shields Display ===");
    }

    /**
     * Gère les changements de texte
     * @param {Event} event - L'événement de changement
     * @private
     */
    async _onTextChange(event) {
        event.preventDefault();
        const input = event.target;
        const field = input.name;
        
        // Si c'est un champ d'arme, utiliser le système de sauvegarde différée
        if (field.includes('system.weapons.')) {
            // Stocker le changement en mémoire sans sauvegarder
            if (!this._pendingWeaponChanges) {
                this._pendingWeaponChanges = {};
            }
            this._pendingWeaponChanges[field] = input.value;
            
            console.log(`Changement d'arme en attente pour ${field}: ${input.value}`);
            
            // Mettre à jour l'affichage local sans sauvegarder
            this._updateLocalWeaponDisplay(field, input.value);
            return;
        }
        
        // Pour les autres champs texte, sauvegarder immédiatement
        const updateData = {};
        updateData[field] = input.value;
        
        try {
            await this.actor.update(updateData);
            console.log(`Mise à jour réussie pour ${field}: ${input.value}`);
            // Forcer la mise à jour de l'affichage
            this.render(true);
        } catch (error) {
            console.error("Erreur lors de la mise à jour:", error);
            // Restaurer la valeur précédente en cas d'erreur
            if (field.includes('system.')) {
                const fieldParts = field.split('.');
                if (fieldParts.length >= 3) {
                    input.value = this.actor.system[fieldParts[1]]?.[fieldParts[2]]?.value || '';
                }
            }
        }
    }

    /**
     * Gère les changements de sélection (classe, affinité, caractéristiques)
     * @param {Event} event - L'événement de changement
     * @private
     */
    async _onSelectChange(event) {
        event.preventDefault();
        const select = event.target;
        const field = select.name;
        const value = select.value;
        
        // Si c'est un changement de faction, sauvegarder immédiatement
        if (field === "system.faction.value") {
            try {
                await this.actor.update({ [field]: value });
                console.log(`Faction sauvegardée immédiatement: ${value}`);
                
                // Mettre à jour l'affichage du blason de faction
                this._updateFactionCrest(value);
                
                // Notification de succès
                ui.notifications.info("Faction mise à jour avec succès");
                
            } catch (error) {
                console.error("Erreur lors de la sauvegarde de la faction:", error);
                ui.notifications.error("Erreur lors de la mise à jour de la faction");
                
                // Restaurer la valeur précédente en cas d'erreur
                select.value = this.actor.system.faction?.value || "caradoc";
            }
            return;
        }
        
        // Pour les autres champs, stocker le changement en mémoire sans sauvegarder
        if (!this._pendingChanges) {
            this._pendingChanges = {};
        }
        this._pendingChanges[field] = value;
        
        console.log(`Changement en attente pour ${field}: ${value}`);
        
        // Mettre à jour l'affichage local sans sauvegarder
        this._updateLocalDisplay(field, value);
    }

    /**
     * Met à jour l'affichage local sans sauvegarder
     * @param {string} field - Le nom du champ
     * @param {string} value - La nouvelle valeur
     * @private
     */
    _updateLocalDisplay(field, value) {
        // Mettre à jour l'affichage en mode lecture si c'est une caractéristique
        if (field.includes('system.') && field.endsWith('.value')) {
            const statName = field.split('.')[1];
            const readModeElement = this.element.find(`select[name="${field}"]`).closest('.stat-block').find('.read-mode');
            
            if (readModeElement.length > 0) {
                const label = this._getStatLabel(statName, value);
                readModeElement.text(label);
            }
        }
    }

    /**
     * Met à jour l'affichage du blason de faction
     * @param {string} factionValue - La nouvelle valeur de faction
     * @private
     */
    _updateFactionCrest(factionValue) {
        const crestImg = this.element.find('.faction-crest img');
        if (crestImg.length > 0) {
            const newSrc = `systems/voidHorizon/assets/crests/${factionValue}.png`;
            crestImg.attr('src', newSrc);
            crestImg.attr('alt', `Blason ${factionValue}`);
            console.log(`Blason de faction mis à jour: ${newSrc}`);
        }
    }

    /**
     * Retourne le label d'affichage pour une statistique
     * @param {string} statName - Le nom de la statistique
     * @param {string} value - La valeur de la statistique
     * @returns {string} - Le label d'affichage
     * @private
     */
    _getStatLabel(statName, value) {
        const mappings = {
            'martialite': {
                "1d4": "Incompétent",
                "1d6": "Combatif",
                "1d8": "Soldat",
                "1d10": "Expérimenté",
                "1d12": "Vétéran",
                "1d20": "Légende"
            },
            'pimpance': {
                "1d4": "Tâche",
                "1d6": "Pas top",
                "1d8": "Honnête",
                "1d10": "Beau",
                "1d12": "Splendide",
                "1d20": "Ramirez"
            },
            'acuite': {
                "1d4": "Aveugle",
                "1d6": "Distrait",
                "1d8": "Alerte",
                "1d10": "Vif",
                "1d12": "Clairvoyant",
                "1d20": "Fulgurant"
            },
            'arcane': {
                "1d4": "Insensible",
                "1d6": "Eveillé",
                "1d8": "Novice",
                "1d10": "Initié",
                "1d12": "Maître",
                "1d20": "Archimage"
            }
        };
        
        return mappings[statName]?.[value] || value;
    }

    /**
     * Sauvegarde tous les changements en attente
     * @private
     */
    async _saveAllChanges() {
        if (!this._pendingChanges || Object.keys(this._pendingChanges).length === 0) {
            console.log("Aucun changement à sauvegarder");
            return;
        }

        try {
            console.log("Sauvegarde des changements:", this._pendingChanges);
            
            // Sauvegarder tous les changements en une seule fois
            await this.actor.update(this._pendingChanges);
            
            console.log("Tous les changements ont été sauvegardés avec succès");
            
            // Vider les changements en attente
            this._pendingChanges = {};
            
            // Notification de succès
            ui.notifications.info("Caractéristiques sauvegardées avec succès");
            
        } catch (error) {
            console.error("Erreur lors de la sauvegarde des changements:", error);
            ui.notifications.error("Erreur lors de la sauvegarde des caractéristiques");
            
            // Restaurer les valeurs précédentes en cas d'erreur
            this._restorePreviousValues();
        }
    }

    /**
     * Restaure les valeurs précédentes en cas d'erreur
     * @private
     */
    _restorePreviousValues() {
        if (!this._pendingChanges) return;
        
        Object.keys(this._pendingChanges).forEach(field => {
            const select = this.element.find(`select[name="${field}"]`);
            if (select.length > 0) {
                const statName = field.split('.')[1];
                const originalValue = this.actor.system[statName]?.value;
                select.val(originalValue);
                this._updateLocalDisplay(field, originalValue);
            }
        });
        
        this._pendingChanges = {};
    }

    /**
     * Lance un dé pour une statistique
     * @param {string} stat - Le nom de la statistique
     * @private
     */
    async _onRollStat(event) {
        event.preventDefault();
        const stat = event.currentTarget.dataset.stat;
        const formula = this.actor.system[stat].value;
        
        if (!formula) {
            ui.notifications.warn(`Aucune formule de dé définie pour ${stat}`);
            return;
        }

        const roll = new Roll(formula);
        await roll.evaluate({async: true});
        
        const templateData = {
            title: `${this.actor.name} - ${stat.charAt(0).toUpperCase() + stat.slice(1)}`,
            subtitle: `Lance ${formula}`,
            formula: formula,
            total: roll.total,
            dice: roll.dice
        };

        const html = await renderTemplate("systems/voidHorizon/templates/chat/roll.html", templateData);
        
        await ChatMessage.create({
            user: game.user.id,
            speaker: ChatMessage.getSpeaker({ actor: this.actor }),
            content: html,
            sound: CONFIG.sounds.dice
        });
    }

    /**
     * Gère le clic sur un bouton de lancement de dés
     * @param {Event} event - L'événement de clic
     * @private
     */
    async _onRollDice(event) {
        event.preventDefault();
        const button = event.currentTarget;
        const stat = button.dataset.stat;
        const formula = this.actor.system[stat]?.value;
        
        if (!formula) {
            ui.notifications.warn(`Aucune formule de dé définie pour ${stat}`);
            return;
        }

        try {
            const roll = new Roll(formula);
            await roll.evaluate({async: true});
            
            const statName = this._getStatDisplayName(stat);
            const templateData = {
                title: `${this.actor.name} - ${statName}`,
                subtitle: `Lance ${formula}`,
                formula: formula,
                total: roll.total,
                dice: roll.dice
            };

            const html = await renderTemplate("systems/voidHorizon/templates/chat/roll.html", templateData);
            
            await ChatMessage.create({
                user: game.user.id,
                speaker: ChatMessage.getSpeaker({ actor: this.actor }),
                content: html,
                sound: CONFIG.sounds.dice
            });
            
            console.log(`Lancement de dés ${formula} pour ${statName}: ${roll.total}`);
        } catch (error) {
            console.error(`Erreur lors du lancement de dés pour ${stat}:`, error);
            ui.notifications.error(`Erreur lors du lancement de dés pour ${stat}`);
        }
    }

    /**
     * Retourne le nom d'affichage d'une statistique
     * @param {string} stat - Le nom de la statistique
     * @returns {string} - Le nom d'affichage
     * @private
     */
    _getStatDisplayName(stat) {
        const statNames = {
            'martialite': 'Martialité',
            'pimpance': 'Pimpance',
            'acuite': 'Acuité',
            'arcane': 'Arcane'
        };
        return statNames[stat] || stat.charAt(0).toUpperCase() + stat.slice(1);
    }
    
    /**
     * Gère le clic sur un bouton de lancement d'arme
     * @param {Event} event - L'événement de clic
     * @private
     */
    async _onRollWeapon(event) {
        event.preventDefault();
        const button = event.currentTarget;
        const weaponType = button.dataset.weapon; // 'primary' ou 'secondary'
        
        const weapon = this.actor.system.weapons[weaponType];
        
        if (!weapon || !weapon.name) {
            ui.notifications.warn(`Veuillez configurer l'équipement de la ${weaponType === 'primary' ? 'main principale' : 'main secondaire'} avant de lancer les dés`);
            return;
        }
        
        // Si la qualité est 0, pas de lancement de dés
        if (weapon.rank === "0") {
            ui.notifications.info(`${weapon.name} n'a aucune qualité et ne peut pas être utilisée pour attaquer`);
            return;
        }
        
        // Si c'est un bouclier, pas de lancement de dés
        if (weapon.type === 'shield') {
            ui.notifications.info(`${weapon.name} est un bouclier et ne peut pas être utilisé pour attaquer`);
            return;
        }
        
        try {
            // Déterminer la caractéristique à utiliser
            let characteristic, characteristicName;
            if (weapon.type === 'strength') {
                characteristic = this.actor.system.martialite.value;
                characteristicName = 'Martialité';
            } else if (weapon.type === 'agility') {
                characteristic = this.actor.system.acuite.value;
                characteristicName = 'Acuité';
            } else {
                ui.notifications.error(`Type d'arme invalide: ${weapon.type}`);
                return;
            }
            
            // Créer la formule de dé
            const weaponRank = weapon.rank || "0";
            const weaponBonus = parseInt(weapon.bonus) || 0;
            
            // Construire la formule : caractéristique + bonus (le rang 0 n'ajoute rien)
            let formula = `${characteristic}`;
            if (weaponBonus !== 0) {
                formula += `+${weaponBonus}`;
            }
            
            // Lancer les dés
            const roll = new Roll(formula);
            await roll.evaluate({async: true});
            
            // Préparer les données pour le template
                         const templateData = {
                 title: `${this.actor.name} - ${weapon.name}`,
                 subtitle: `Attaque avec ${weapon.name} (${characteristicName} + ${weaponBonus !== 0 ? weaponBonus : ''})`,
                 formula: formula,
                 total: roll.total,
                 dice: roll.dice,
                 weapon: {
                     name: weapon.name,
                     type: weapon.type === 'strength' ? 'Force' : 'Agilité',
                     rank: weaponRank,
                     bonus: weaponBonus
                 },
                 characteristic: {
                     name: characteristicName,
                     value: characteristic
                 }
             };
            
            const html = await renderTemplate("systems/voidHorizon/templates/chat/weapon-roll.html", templateData);
            
            await ChatMessage.create({
                user: game.user.id,
                speaker: ChatMessage.getSpeaker({ actor: this.actor }),
                content: html,
                sound: CONFIG.sounds.dice
            });
            
                         console.log(`Lancement d'arme ${weapon.name}: ${formula} = ${roll.total}`);
         } catch (error) {
             console.error(`Erreur lors du lancement d'arme ${weaponType}:`, error);
             ui.notifications.error(`Erreur lors du lancement d'arme ${weaponType}`);
         }
     }
     
     /**
      * Applique les bonus des boucliers à l'armure et la constitution
      * @private
      */
     _applyShieldBonuses() {
         let totalArmorBonus = 0;
         let totalConstitutionBonus = 0;
         
         // Vérifier la main principale
         if (this.actor.system.weapons?.primary?.type === 'shield') {
             const shield = this.actor.system.weapons.primary;
             const bonus = parseInt(shield.bonus) || 0;
             totalArmorBonus += bonus;
             totalConstitutionBonus += bonus;
         }
         
         // Vérifier la main secondaire
         if (this.actor.system.weapons?.secondary?.type === 'shield') {
             const shield = this.actor.system.weapons.secondary;
             const bonus = parseInt(shield.bonus) || 0;
             totalArmorBonus += bonus;
             totalConstitutionBonus += bonus;
         }
         
         // Mettre à jour l'affichage des bonus
         this._updateShieldBonusDisplay(totalArmorBonus, totalConstitutionBonus);
         
         return { armorBonus: totalArmorBonus, constitutionBonus: totalConstitutionBonus };
     }
     
     /**
      * Met à jour l'affichage des bonus de bouclier
      * @param {number} armorBonus - Bonus d'armure total
      * @param {number} constitutionBonus - Bonus de constitution total
      * @private
      */
     _updateShieldBonusDisplay(armorBonus, constitutionBonus) {
         // Mettre à jour l'affichage de l'armure
         const armorInput = this.element.find('input[name="system.resources.armor.value"]');
         if (armorInput.length > 0) {
             const baseArmor = parseInt(this.actor.system.resources.armor?.value) || 0;
             const totalArmor = baseArmor + armorBonus;
             
             // Ajouter un indicateur visuel du bonus
             const armorContainer = armorInput.closest('.resource');
             let bonusIndicator = armorContainer.find('.shield-bonus-indicator');
             
             if (armorBonus > 0) {
                 if (bonusIndicator.length === 0) {
                     bonusIndicator = $(`<div class="shield-bonus-indicator">+${armorBonus} (Bouclier)</div>`);
                     armorContainer.append(bonusIndicator);
                 } else {
                     bonusIndicator.text(`+${armorBonus} (Bouclier)`);
                 }
                 bonusIndicator.show();
             } else if (bonusIndicator.length > 0) {
                 bonusIndicator.hide();
             }
         }
         
         // Mettre à jour l'affichage de la constitution
         const constitutionInput = this.element.find('input[name="system.constitution.value"]');
         if (constitutionInput.length > 0) {
             const baseConstitution = parseInt(this.actor.system.constitution?.value) || 0;
             const totalConstitution = baseConstitution + constitutionBonus;
             
             // Ajouter un indicateur visuel du bonus
             const constitutionContainer = constitutionInput.closest('.stat');
             let bonusIndicator = constitutionContainer.find('.shield-bonus-indicator');
             
             if (constitutionBonus > 0) {
                 if (bonusIndicator.length === 0) {
                     bonusIndicator = $(`<div class="shield-bonus-indicator">+${constitutionBonus} (Bouclier)</div>`);
                     constitutionContainer.append(bonusIndicator);
                 } else {
                     bonusIndicator.text(`+${constitutionBonus} (Bouclier)`);
                 }
                 bonusIndicator.show();
             } else if (bonusIndicator.length > 0) {
                 bonusIndicator.hide();
             }
         }
     }

    /**
     * Gère le clic sur un cœur de constitution
     * @param {Event} event - L'événement de clic
     * @private
     */
    async _onHeartClick(event) {
        event.preventDefault();
        const button = event.currentTarget;
        const heartIndex = parseInt(button.dataset.heartIndex);
        const isAlive = button.dataset.alive === "true";
        const heartWrapper = button.closest('.heart-wrapper');
        
        // Mettre à jour la valeur de blessure
        const currentValue = this.actor.system.resources.blessure?.value || 0;
        const newValue = isAlive ? currentValue + 1 : currentValue - 1;
        
        try {
            // Mettre à jour l'acteur avec la nouvelle valeur
            const updateData = {
                'system.resources.blessure.value': newValue
            };
            
            console.log("Mise à jour des points de vie:", updateData);
            await this.actor.update(updateData);
            
            // Mettre à jour l'affichage des boutons
            this._updateHeartDisplay(heartWrapper, isAlive);
            
            // Mettre à jour l'état de santé
            this._updateHealthStatus();
            
            // Forcer la mise à jour de l'affichage
            this.render(true);
        } catch (error) {
            console.error("Erreur lors de la mise à jour des points de vie:", error);
        }
    }

    /**
     * Met à jour l'affichage des boutons d'un cœur
     * @param {HTMLElement} heartWrapper - Le wrapper du cœur
     * @param {boolean} isAlive - Si le cœur est vivant
     * @private
     */
    _updateHeartDisplay(heartWrapper, isAlive) {
        const aliveButton = heartWrapper.querySelector('.alive');
        const deadButton = heartWrapper.querySelector('.dead');
        
        if (isAlive) {
            aliveButton.classList.add('hidden');
            deadButton.classList.remove('hidden');
        } else {
            aliveButton.classList.remove('hidden');
            deadButton.classList.add('hidden');
        }
    }

    /**
     * Met à jour l'affichage de l'état de santé
     * @private
     */
    _updateHealthStatus() {
        console.log("=== Debug Health Status ===");
        
        const constitution = this.actor.system.constitution?.value || 0;
        const blessure = this.actor.system.resources.blessure?.value || 0;
        const armor = this.actor.system.resources.armor?.value || 0;
        const armorDamage = this.actor.system.resources.armorDamage?.value || 0;
        const remainingHearts = constitution - blessure;
        
        console.log("Constitution:", constitution);
        console.log("Blessures:", blessure);
        console.log("Armure:", armor);
        console.log("Dégâts d'armure:", armorDamage);
        console.log("Points de vie restants:", remainingHearts);
        
        let status = "Incapacité";
        let statusClass = "status-critical";
        
        if (remainingHearts >= 3) {
            status = "Bonne santé";
            statusClass = "status-good";
        } else if (remainingHearts === 2) {
            status = "Légèrement blessé";
            statusClass = "status-warning";
        } else if (remainingHearts === 1) {
            status = "Grièvement blessé";
            statusClass = "status-danger";
        }
        
        console.log("État calculé:", status);
        console.log("=== Fin Debug Health Status ===");
        
        // Mettre à jour le contenu HTML directement
        const statusHtml = `
            <span class="status-label">État :</span>
            <span class="status-value ${statusClass}" data-health-status>${status}</span>
        `;
        
        const healthStatusContainer = this.element.find('.health-status');
        if (healthStatusContainer.length) {
            healthStatusContainer.html(statusHtml);
        }
    }

    /**
     * Gère le clic sur un bouclier d'armure
     * @param {Event} event - L'événement de clic
     * @private
     */
    async _onShieldClick(event) {
        event.preventDefault();
        const button = event.currentTarget;
        const shieldIndex = parseInt(button.dataset.shieldIndex);
        const isActive = button.dataset.active === "true";
        const shieldWrapper = button.closest('.shield-wrapper');
        
        // Vérification de sécurité
        if (!shieldWrapper) {
            console.error("Wrapper d'armure non trouvé");
            return;
        }
        
        // Mettre à jour la valeur de dégâts d'armure
        const currentDamage = this.actor.system.resources.armorDamage?.value || 0;
        const newDamage = isActive ? currentDamage + 1 : currentDamage - 1;
        
        try {
            // Mettre à jour l'acteur avec la nouvelle valeur de dégâts d'armure
            const updateData = {
                'system.resources.armorDamage.value': newDamage
            };
            
            console.log("Mise à jour des boucliers:", updateData);
            await this.actor.update(updateData);
            
            // Mettre à jour l'affichage des boutons
            this._updateShieldDisplay(shieldWrapper, isActive);
            
            // Forcer la mise à jour de l'affichage
            this.render(true);
        } catch (error) {
            console.error("Erreur lors de la mise à jour des boucliers:", error);
        }
    }

    /**
     * Met à jour l'affichage des boutons d'un bouclier
     * @param {HTMLElement} shieldWrapper - Le wrapper du bouclier
     * @param {boolean} isActive - Si le bouclier est actif
     * @private
     */
    _updateShieldDisplay(shieldWrapper, isActive) {
        const activeButton = shieldWrapper.querySelector('.active');
        const brokenButton = shieldWrapper.querySelector('.broken');
        
        // Vérification de sécurité
        if (!activeButton || !brokenButton) {
            console.error("Boutons d'armure non trouvés:", { activeButton, brokenButton });
            return;
        }
        
        if (isActive) {
            activeButton.classList.add('hidden');
            brokenButton.classList.remove('hidden');
        } else {
            activeButton.classList.remove('hidden');
            brokenButton.classList.add('hidden');
        }
    }

         /**
      * Gère les changements de rang
      * @param {Event} event - L'événement de changement
      * @private
      */
     async _onRankChange(event) {
         event.preventDefault();
         const input = event.target;
         const value = input.value;
         
         try {
             await this.actor.update({
                 "system.rank.value": value
             });
             console.log(`Mise à jour réussie du rang: ${value}`);
         } catch (error) {
             console.error("Erreur lors de la mise à jour du rang:", error);
             // Restaurer la valeur précédente en cas d'erreur
             input.value = this.actor.system.rank.value;
         }
     }
     
     /**
      * Gère les changements des champs d'armes
      * @param {Event} event - L'événement de changement
      * @private
      */
     _onWeaponFieldChange(event) {
         event.preventDefault();
         const input = event.target;
         const field = input.name;
         const value = input.value;
         
         // Stocker le changement en mémoire sans sauvegarder
         if (!this._pendingWeaponChanges) {
             this._pendingWeaponChanges = {};
         }
         this._pendingWeaponChanges[field] = value;
         
         console.log(`Changement d'arme en attente pour ${field}: ${value}`);
         
         // Mettre à jour l'affichage local sans sauvegarder
         this._updateLocalWeaponDisplay(field, value);
         
         // Si c'est un changement de type, appliquer immédiatement les bonus des boucliers
         if (field.endsWith('.type')) {
             this._applyShieldBonuses();
         }
     }

     /**
      * Gère les changements de type d'équipement (pour les boucliers)
      * @param {Event} event - L'événement de changement
      * @private
      */
     async _onWeaponTypeChange(event) {
         event.preventDefault();
         const select = event.target;
         const value = select.value;
         const field = select.name;
         
         // Stocker le changement en mémoire sans sauvegarder
         if (!this._pendingWeaponChanges) {
             this._pendingWeaponChanges = {};
         }
         this._pendingWeaponChanges[field] = value;
         
         // Mettre à jour l'affichage local sans sauvegarder
         this._updateLocalWeaponDisplay(field, value);
         
         // Appliquer les bonus des boucliers immédiatement pour l'affichage
         this._applyShieldBonuses();
         
         console.log(`Type d'équipement en attente: ${field} = ${value}`);
     }

    /**
     * Initialise l'état de santé
     * @private
     */
         _initializeHealthState() {
         this._initializeHearts(this.element);
         this._initializeShields(this.element);
         this._updateHealthStatus();
         
         // Appliquer les bonus des boucliers
         this._applyShieldBonuses();
     }

         /**
      * Gère le basculement entre les modes édition et lecture
      * @param {Event} event - L'événement de clic
      * @private
      */
     _onToggleEditMode(event) {
         event.preventDefault();
         const form = event.currentTarget.closest('form');
         const isEditing = form.classList.contains('editing');
         
         if (isEditing) {
             // Mode sauvegarde - sauvegarder tous les changements
             if (this._pendingChanges && Object.keys(this._pendingChanges).length > 0) {
                 this._saveAllChanges();
             }
             
             form.classList.remove('editing');
             form.classList.add('read-only');
             event.currentTarget.querySelector('i').classList.remove('fa-save');
             event.currentTarget.querySelector('i').classList.add('fa-edit');
             event.currentTarget.querySelector('.button-text').textContent = 'Éditer';
         } else {
             // Mode édition - initialiser les changements en attente
             this._pendingChanges = {};
             form.classList.remove('read-only');
             form.classList.add('editing');
             event.currentTarget.querySelector('i').classList.remove('fa-edit');
             event.currentTarget.querySelector('i').classList.add('fa-save');
             event.currentTarget.querySelector('.button-text').textContent = 'Sauvegarder';
         }
     }
     
     /**
      * Gère le basculement entre les modes édition et lecture des armes
      * @param {Event} event - L'événement de clic
      * @private
      */
     _onToggleWeaponsEditMode(event) {
         event.preventDefault();
         const weaponsSection = event.currentTarget.closest('.weapons-section');
         const isEditing = weaponsSection.classList.contains('editing');
         
         if (isEditing) {
             // Mode sauvegarde - sauvegarder tous les changements d'armes
             if (this._pendingWeaponChanges && Object.keys(this._pendingWeaponChanges).length > 0) {
                 this._saveAllWeaponChanges();
             }
             
             weaponsSection.classList.remove('editing');
             weaponsSection.classList.add('read-only');
             event.currentTarget.querySelector('i').classList.remove('fa-save');
             event.currentTarget.querySelector('i').classList.add('fa-edit');
             event.currentTarget.querySelector('.button-text').textContent = 'Éditer';
         } else {
             // Mode édition - initialiser les changements en attente
             this._pendingWeaponChanges = {};
             weaponsSection.classList.remove('read-only');
             weaponsSection.classList.add('editing');
             event.currentTarget.querySelector('i').classList.remove('fa-edit');
             event.currentTarget.querySelector('i').classList.add('fa-save');
             event.currentTarget.querySelector('.button-text').textContent = 'Sauvegarder';
         }
     }

     /**
      * Sauvegarde tous les changements d'armes en attente
      * @private
      */
     async _saveAllWeaponChanges() {
         if (!this._pendingWeaponChanges || Object.keys(this._pendingWeaponChanges).length === 0) {
             console.log("Aucun changement d'arme à sauvegarder");
             return;
         }

         try {
             console.log("Sauvegarde des changements d'armes:", this._pendingWeaponChanges);
             
             // Sauvegarder tous les changements en une seule fois
             await this.actor.update(this._pendingWeaponChanges);
             
             console.log("Tous les changements d'armes ont été sauvegardés avec succès");
             
             // Vider les changements en attente
             this._pendingWeaponChanges = {};
             
             // Notification de succès
             ui.notifications.info("Équipement sauvegardé avec succès");
             
         } catch (error) {
             console.error("Erreur lors de la sauvegarde des changements d'armes:", error);
             ui.notifications.error("Erreur lors de la sauvegarde de l'équipement");
             
             // Restaurer les valeurs précédentes en cas d'erreur
             this._restorePreviousWeaponValues();
         }
     }

     /**
      * Restaure les valeurs précédentes des armes en cas d'erreur
      * @private
      */
     _restorePreviousWeaponValues() {
         if (!this._pendingWeaponChanges) return;
         
         Object.keys(this._pendingWeaponChanges).forEach(field => {
             const input = this.element.find(`[name="${field}"]`);
             if (input.length > 0) {
                 // Extraire le nom du champ et la main (primary/secondary)
                 const fieldParts = field.split('.');
                 const weaponType = fieldParts[2]; // primary ou secondary
                 const fieldName = fieldParts[3]; // name, type, rank, bonus, description
                 
                 // Restaurer la valeur depuis l'acteur
                 const originalValue = this.actor.system.weapons[weaponType]?.[fieldName];
                 if (originalValue !== undefined) {
                     input.val(originalValue);
                 }
             }
         });
         
         this._pendingWeaponChanges = {};
     }

     /**
      * Met à jour l'affichage local des armes sans sauvegarder
      * @param {string} field - Le nom du champ
      * @param {string} value - La nouvelle valeur
      * @private
      */
     _updateLocalWeaponDisplay(field, value) {
         // Mettre à jour l'affichage en mode lecture si c'est un champ d'arme
         if (field.includes('system.weapons.')) {
             const fieldParts = field.split('.');
             const weaponType = fieldParts[2]; // primary ou secondary
             const fieldName = fieldParts[3]; // name, type, rank, bonus, description
             
             const readModeElement = this.element.find(`[name="${field}"]`).closest('.weapon-field').find('.read-mode');
             
             if (readModeElement.length > 0) {
                 if (fieldName === 'type') {
                     // Gérer l'affichage du type
                     let displayValue = 'Non défini';
                     if (value === 'strength') displayValue = 'Force (Martialité)';
                     else if (value === 'agility') displayValue = 'Agilité (Acuité)';
                     else if (value === 'shield') displayValue = 'Bouclier';
                     readModeElement.text(displayValue);
                 } else if (fieldName === 'rank') {
                     // Gérer l'affichage de la qualité
                     if (value === '0') {
                         readModeElement.text('Équipement brisé');
                     } else {
                         readModeElement.text(value);
                     }
                 } else if (fieldName === 'bonus') {
                     // Gérer l'affichage du bonus
                     const bonusValue = parseInt(value) || 0;
                     if (bonusValue > 0) {
                         readModeElement.text(`+${bonusValue}`);
                     } else {
                         readModeElement.text(bonusValue.toString());
                     }
                 } else {
                     // Pour les autres champs (name, description)
                     readModeElement.text(value || '');
                 }
             }
         }
     }

    async _updateObject(event, formData) {
        // Mise à jour des données du formulaire
        const updateData = {};
        
        // Parcourir les données du formulaire
        for (let [key, value] of formData.entries()) {
            console.log(`Form data - Key: ${key}, Value: ${value}`);
            // Vérifier si c'est une statistique
            if (key.startsWith('system.') && key.endsWith('.value')) {
                const stat = key.split('.')[1];
                console.log(`Stat found: ${stat}`);
                if (['martialite', 'pimpance', 'acuite', 'arcane'].includes(stat)) {
                    // S'assurer que la valeur est une chaîne de caractères
                    updateData[key] = String(value);
                    console.log(`Adding to updateData: ${key} = ${updateData[key]}`);
                }
            }
        }

        console.log('Final updateData:', updateData);
        // Mettre à jour l'acteur
        try {
            await this.actor.update(updateData);
            console.log('Update successful');
        } catch (error) {
            console.error('Error updating actor:', error);
            ui.notifications.error('Erreur lors de la mise à jour des données');
        }
    }
}

// Enregistrer la classe de la fiche
Hooks.once("init", function() {
    console.log("Enregistrement de la fiche Héros");
    
    // Enregistrer les helpers Handlebars
    Handlebars.registerHelper('times', function(n) {
        return Array.from({length: n}, (_, i) => i);
    });
    
    Handlebars.registerHelper('add', function(a, b) {
        return parseInt(a) + parseInt(b);
    });
    
    Handlebars.registerHelper('sub', function(a, b) {
        return parseInt(a) - parseInt(b);
    });
    
    Handlebars.registerHelper('selected', function(value, current) {
        return value === current ? "selected" : "";
    });
    
    Handlebars.registerHelper('eq', function(a, b) {
        return a === b;
    });

    Handlebars.registerHelper('gte', function(a, b) {
        return parseInt(a) >= parseInt(b);
    });

    Handlebars.registerHelper('gt', function(a, b) {
        return parseInt(a) > parseInt(b);
    });

    Handlebars.registerHelper('contains', function(array, value) {
        return array && array.includes(parseInt(value));
    });

    foundry.documents.collections.Actors.unregisterSheet("core", foundry.appv1.sheets.ActorSheet);
    foundry.documents.collections.Actors.registerSheet("voidHorizon", HeroSheet, {
        types: ["heros"],
        makeDefault: true
    });
}); 