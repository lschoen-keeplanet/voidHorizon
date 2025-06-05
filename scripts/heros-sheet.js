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
        if (!data.actor.system.resources.armor) {
            data.actor.system.resources.armor = { value: 0 };
        }
        if (!data.actor.system.resources.armorDamage) {
            data.actor.system.resources.armorDamage = { value: 0 };
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
        html.find('.hearts-container .heart-button').click(this._onHeartClick.bind(this));
        
        // Gestion des boucliers d'armure
        html.find('.armor-container .shield-button').click(this._onShieldClick.bind(this));

        // Gestion des images
        html.find('.add-image').click(this._onAddImage.bind(this));
        html.find('.image-edit').click(this._onEditImage.bind(this));
        html.find('.image-delete').click(this._onDeleteImage.bind(this));

        // Initialiser l'état des cœurs et de la santé
        this._initializeHearts(html);
        this._initializeShields(html);
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

    async _onAddImage(event) {
        event.preventDefault();
        
        // Ouvrir le sélecteur de fichiers de Foundry
        const file = await new Promise(resolve => {
            new FilePicker({
                type: "image",
                callback: path => resolve(path)
            }).render(true);
        });

        if (!file) return;

        // Ajouter l'image aux données de l'acteur
        const images = this.actor.system.images || {};
        const id = foundry.utils.randomID();
        images[id] = {
            path: file,
            name: file.split('/').pop()
        };

        // Mettre à jour l'acteur
        await this.actor.update({
            "system.images": images
        });
    }

    async _onEditImage(event) {
        event.preventDefault();
        const id = event.currentTarget.closest('.image-item').dataset.imageId;
        
        // Ouvrir le sélecteur de fichiers de Foundry
        const file = await new Promise(resolve => {
            new FilePicker({
                type: "image",
                callback: path => resolve(path)
            }).render(true);
        });

        if (!file) return;

        // Mettre à jour l'image
        const images = this.actor.system.images;
        images[id].path = file;
        images[id].name = file.split('/').pop();

        // Mettre à jour l'acteur
        await this.actor.update({
            "system.images": images
        });
    }

    async _onDeleteImage(event) {
        event.preventDefault();
        const id = event.currentTarget.closest('.image-item').dataset.imageId;
        
        // Demander confirmation
        const confirmed = await Dialog.confirm({
            title: "Supprimer l'image",
            content: "Êtes-vous sûr de vouloir supprimer cette image ?"
        });

        if (!confirmed) return;

        // Supprimer l'image
        const images = this.actor.system.images;
        delete images[id];

        // Mettre à jour l'acteur
        await this.actor.update({
            "system.images": images
        });
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