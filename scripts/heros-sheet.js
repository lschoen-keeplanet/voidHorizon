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
    getData() {
        const data = super.getData();
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
        
        // Préparation des statistiques principales
        data.system = {
            ...data.system,
            agilite: {
                value: data.actor.system.agilite?.value || "1d4",
                label: "Agilité"
            },
            pimpance: {
                value: data.actor.system.pimpance?.value || "1d4",
                label: "Pimpance"
            },
            moral: {
                value: data.actor.system.moral?.value || "1d4",
                label: "Moral"
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
            }
        };
        
        return data;
    }

    /** @override */
    activateListeners(html) {
        super.activateListeners(html);

        // Gestion des événements pour les items
        html.find('.item-edit').click(this._onItemEdit.bind(this));
        html.find('.item-delete').click(this._onItemDelete.bind(this));
        html.find('.create-item').click(this._onCreateItem.bind(this));

        // Gestion des changements de valeurs
        html.find('select').change(this._onSelectChange.bind(this));
        html.find('input[type="text"]').change(this._onTextChange.bind(this));
        html.find('input[type="number"]').change(this._onResourceChange.bind(this));

        // Gestion des lancers de dés
        html.find('.roll-stat').click(this._onRollStat.bind(this));

        // Gestion des cœurs de constitution
        html.find('.heart-button').click(this._onHeartClick.bind(this));

        // Initialiser l'état des cœurs et de la santé
        this._initializeHearts(html);
        this._updateHealthStatus();
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
        const input = event.target;
        const value = parseInt(input.value);
        const max = parseInt(input.max);
        const min = parseInt(input.min);

        // Vérifier les limites
        if (value > max) input.value = max;
        if (value < min) input.value = min;

        // Mettre à jour l'acteur
        const field = input.name;
        const updateData = {};
        updateData[field] = input.value;
        
        try {
            await this.actor.update(updateData);
            console.log(`Mise à jour réussie pour ${field}: ${input.value}`);
            
            // Si c'est une mise à jour de blessure, mettre à jour l'état de santé
            if (field === 'system.resources.blessure.value') {
                this._updateHealthStatus();
            }
            
            // Forcer la mise à jour de l'affichage
            this.render(true);
        } catch (error) {
            console.error("Erreur lors de la mise à jour:", error);
            // Restaurer la valeur précédente en cas d'erreur
            input.value = this.actor.system[field.split('.')[2]].value;
        }
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
            input.value = this.actor.system[field.split('.')[2]].value;
        }
    }

    /**
     * Gère les changements de sélection (classe)
     * @param {Event} event - L'événement de changement
     * @private
     */
    async _onSelectChange(event) {
        event.preventDefault();
        const select = event.target;
        const field = select.name;
        const updateData = {};
        updateData[field] = select.value;
        
        try {
            await this.actor.update(updateData);
            console.log(`Mise à jour réussie pour ${field}: ${select.value}`);
            // Forcer la mise à jour de l'affichage
            this.render(true);
        } catch (error) {
            console.error("Erreur lors de la mise à jour:", error);
            // Restaurer la valeur précédente en cas d'erreur
            select.value = this.actor.system[field.split('.')[2]].value;
        }
    }

    /**
     * Lance un dé pour une statistique
     * @param {string} stat - Le nom de la statistique
     * @private
     */
    async _rollStat(stat) {
        const value = this.actor.system[stat].value;
        if (!value) return;
        
        const roll = new Roll(value);
        await roll.evaluate({async: true});
        roll.toMessage({
            speaker: ChatMessage.getSpeaker({ actor: this.actor }),
            flavor: `${stat.charAt(0).toUpperCase() + stat.slice(1)} Check`
        });
    }

    /**
     * Gère le clic sur un bouton de lancer de dé
     * @param {Event} event - L'événement de clic
     * @private
     */
    async _onRollStat(event) {
        event.preventDefault();
        const stat = event.currentTarget.dataset.stat;
        await this._rollStat(stat);
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
        const currentBlessure = this.actor.system.resources.blessure?.value || 0;
        const newBlessure = isAlive ? currentBlessure + 1 : currentBlessure - 1;
        
        try {
            // Mettre à jour l'acteur avec la nouvelle valeur de blessure
            const updateData = {
                'system.resources.blessure.value': newBlessure
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

        // Mettre à jour l'état de santé
        this._updateHealthStatus();
    }

    /**
     * Met à jour l'affichage de l'état de santé
     * @private
     */
    _updateHealthStatus() {
        const constitution = this.actor.system.constitution?.value || 0;
        const blessure = this.actor.system.resources.blessure?.value || 0;
        const remainingHearts = constitution - blessure;
        
        console.log("=== Debug Health Status ===");
        console.log("Constitution:", constitution);
        console.log("Blessure:", blessure);
        console.log("Cœurs restants:", remainingHearts);
        
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
        
        // Mettre à jour le contenu HTML directement
        const statusHtml = `
            <span class="status-label">État :</span>
            <span class="status-value ${statusClass}" data-health-status>${status}</span>
        `;
        
        const healthStatusContainer = this.element.find('.health-status');
        if (healthStatusContainer.length) {
            healthStatusContainer.html(statusHtml);
            console.log("HTML mis à jour:", healthStatusContainer.html());
        } else {
            console.error("Container .health-status non trouvé");
        }
        
        console.log("=== Fin Debug Health Status ===");
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

    Handlebars.registerHelper('contains', function(array, value) {
        return array && array.includes(parseInt(value));
    });

    foundry.documents.collections.Actors.unregisterSheet("core", foundry.appv1.sheets.ActorSheet);
    foundry.documents.collections.Actors.registerSheet("voidHorizon", HeroSheet, {
        types: ["heros"],
        makeDefault: true
    });
}); 