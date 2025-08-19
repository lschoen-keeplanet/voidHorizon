// Test final de suppression de traits - Version 2
// Ce fichier est temporaire et sera supprimé après les tests

console.log("=== TEST FINAL DE SUPPRESSION DE TRAITS - V2 ===");

// Simuler un acteur avec des traits
const testActor = {
    system: {
        traits: {
            "trait_1": {
                name: "Vétéran de guerre",
                description: "Expérience au combat",
                bonusTarget: "martialite",
                bonusValue: 2
            },
            "trait_2": {
                name: "Charmeur naturel",
                description: "Personnalité attachante",
                bonusTarget: "pimpance",
                bonusValue: 1
            }
        }
    }
};

console.log("Traits avant suppression:", testActor.system.traits);

// Simuler la suppression d'un trait
const traitIdToDelete = "trait_1";
const traitToDelete = testActor.system.traits[traitIdToDelete];

if (!traitToDelete) {
    console.error("Trait à supprimer non trouvé !");
    process.exit(1);
}

console.log("Trait à supprimer:", traitToDelete);

// Simuler la suppression
const currentTraits = { ...testActor.system.traits };
delete currentTraits[traitIdToDelete];

console.log("Traits après suppression:", currentTraits);
console.log("Nombre de traits restants:", Object.keys(currentTraits).length);

// Vérifier que la suppression a bien fonctionné
if (currentTraits[traitIdToDelete]) {
    console.error("❌ ERREUR : Le trait est toujours présent après suppression !");
    process.exit(1);
} else {
    console.log("✅ SUCCÈS : Le trait a été correctement supprimé");
}

// Vérifier que les autres traits sont toujours présents
if (currentTraits["trait_2"]) {
    console.log("✅ SUCCÈS : Les autres traits sont préservés");
} else {
    console.error("❌ ERREUR : Les autres traits ont été supprimés par erreur");
    process.exit(1);
}

console.log("=== TEST TERMINÉ AVEC SUCCÈS ===");
