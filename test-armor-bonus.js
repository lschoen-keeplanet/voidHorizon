// Script de test pour le bonus d'armure de l'équipement
console.log("=== TEST BONUS ARMURE ÉQUIPEMENT ===");

// Récupérer l'acteur actuel
const actor = game.actors.get(game.user.character?.id);
if (!actor) {
    console.error("Aucun personnage actif trouvé");
    return;
}

console.log("Acteur trouvé:", actor.name);
console.log("Données système actuelles:", actor.system);

// Vérifier la structure de l'armure
console.log("Structure armure actuelle:", actor.system.armor);

// Tester la sauvegarde du bonus d'armure
console.log("Test de sauvegarde du bonus d'armure...");

const testBonus = 3;
const updateData = {
    'system.armor.bonus': testBonus
};

actor.update(updateData).then(() => {
    console.log("✅ Bonus d'armure sauvegardé avec succès!");
    console.log("Nouvelle valeur:", actor.system.armor.bonus);
    
    // Vérifier que la valeur est bien persistante
    if (actor.system.armor.bonus === testBonus) {
        console.log("✅ Valeur persistante confirmée");
    } else {
        console.error("❌ Valeur non persistante:", actor.system.armor.bonus);
    }
    
    // Tester le calcul de l'armure totale
    const baseArmor = parseInt(actor.system.resources?.armor?.value) || 0;
    const traitBonus = parseInt(actor.system.traitBonuses?.armor) || 0;
    const equipmentBonus = parseInt(actor.system.armor?.bonus) || 0;
    
    console.log("Calcul armure totale:");
    console.log("- Base:", baseArmor);
    console.log("- Bonus traits:", traitBonus);
    console.log("- Bonus équipement:", equipmentBonus);
    console.log("- Total:", baseArmor + traitBonus + equipmentBonus);
    
}).catch(error => {
    console.error("❌ Erreur lors de la sauvegarde:", error);
});

console.log("=== FIN DU TEST ===");
