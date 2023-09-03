/**
 * @typedef {Object} CanvasHistory
 * @property {string} type    The type of operation stored as history (create, update, delete)
 * @property {Object[]} data  The data corresponding to the action which may later be un-done
 */

/**
 * A subclass of Canvas Layer which is specifically designed to contain multiple PlaceableObject instances,
 * each corresponding to an embedded Document.
 * @category - Canvas
 */
class PlaceablesLayer extends InteractionLayer {

  /**
   * Placeable Layer Objects
   * @type {PIXI.Container|null}
   */
  objects = null;

  /**
   * Preview Object Placement
   */
  preview = null;

  /**
   * Keep track of history so that CTRL+Z can undo changes
   * @type {CanvasHistory[]}
   */
  history = [];

  /**
   * Keep track of an object copied with CTRL+C which can be pasted later
   * @type {PlaceableObject[]}
   */
  _copy = [];

  /**
   * A Quadtree which partitions and organizes Walls into quadrants for efficient target identification.
   * @type {Quadtree|null}
   */
  quadtree = this.options.quadtree ? new CanvasQuadtree() : null;

  /* -------------------------------------------- */
  /*  Attributes                                  */
  /* -------------------------------------------- */

  /**
   * @inheritdoc
   * @property {boolean} canDragCreate        Does this layer support a mouse-drag workflow to create new objects?
   * @property {boolean} canDelete            Can objects be deleted from this layer?
   * @property {boolean} controllableObjects  Can placeable objects in this layer be controlled?
   * @property {boolean} rotatableObjects     Can placeable objects in this layer be rotated?
   * @property {boolean} snapToGrid           Do objects in this layer snap to the grid
   * @property {PlaceableObject} objectClass  The class used to represent an object on this layer.
   * @property {boolean} quadtree             Does this layer use a quadtree to track object positions?
   * @property {boolean} elevationSorting     Are contained objects sorted based on elevation instead of zIndex
   */
  static get layerOptions() {
    return foundry.utils.mergeObject(super.layerOptions, {
      baseClass: PlaceablesLayer,
      canDragCreate: game.user.isGM,
      controllableObjects: false,
      rotatableObjects: false,
      snapToGrid: true,
      objectClass: CONFIG[this.documentName]?.objectClass,
      quadtree: true,
      elevationSorting: false
    });
  }

  /* -------------------------------------------- */

  /**
   * A reference to the named Document type which is contained within this Canvas Layer.
   * @type {string}
   */
  static documentName;

  /**
   * Creation states affected to placeables during their construction.
   * @enum {number}
   */
  static CREATION_STATES = {
    NONE: 0,
    POTENTIAL: 1,
    CONFIRMED: 2,
    COMPLETED: 3
  };

  /* -------------------------------------------- */

  /**
   * Obtain a reference to the Collection of embedded Document instances within the currently viewed Scene
   * @type {Collection|null}
   */
  get documentCollection() {
    return canvas.scene?.getEmbeddedCollection(this.constructor.documentName) || null;
  }

  /* -------------------------------------------- */

  /**
   * Obtain a reference to the PlaceableObject class definition which represents the Document type in this layer.
   * @type {Function}
   */
  static get placeableClass() {
    return CONFIG[this.documentName].objectClass;
  }

  /* -------------------------------------------- */

  /**
   * Return the precision relative to the Scene grid with which Placeable objects should be snapped
   * @type {number}
   */
  get gridPrecision() {
    if ( canvas.grid.type === CONST.GRID_TYPES.GRIDLESS ) return 0;           // No snapping for gridless
    if ( canvas.grid.isHex ) return this.options.controllableObjects ? 2 : 5; // Snap to corners or vertices
    return 2;                                                                 // Default handling, corners and centers
  }

  /* -------------------------------------------- */

  /**
   * If objects on this PlaceableLayer have a HUD UI, provide a reference to its instance
   * @type {BasePlaceableHUD|null}
   */
  get hud() {
    return null;
  }

  /* -------------------------------------------- */

  /**
   * A convenience method for accessing the placeable object instances contained in this layer
   * @type {PlaceableObject[]}
   */
  get placeables() {
    if ( !this.objects ) return [];
    return this.objects.children;
  }

  /* -------------------------------------------- */

  /**
   * An Array of placeable objects in this layer which have the _controlled attribute
   * @returns {PlaceableObject[]}
   */
  get controlled() {
    return Array.from(this.#controlledObjects.values());
  }

  /* -------------------------------------------- */

  /**
   * Iterates over placeable objects that are eligible for control/select.
   * @yields A placeable object
   * @returns {Generator<PlaceableObject>}
   */
  *controllableObjects() {
    for ( const placeable of this.placeables ) {
      if ( placeable.visible && placeable.renderable && (placeable.control instanceof Function) ) yield placeable;
    }
  }

  /* -------------------------------------------- */

  /**
   * Track the set of PlaceableObjects on this layer which are currently controlled.
   * @type {Map<string,PlaceableObject>}
   */
  get controlledObjects() {
    return this.#controlledObjects;
  }

  /** @private */
  #controlledObjects = new Map();

  /* -------------------------------------------- */

  /**
   * Track the PlaceableObject on this layer which is currently hovered upon.
   * @type {PlaceableObject|null}
   */
  get hover() {
    return this.#hover;
  }

  set hover(object) {
    if ( object instanceof this.constructor.placeableClass ) this.#hover = object;
    else this.#hover = null;
  }

  #hover = null;

  /* -------------------------------------------- */

  /**
   * Track whether "highlight all objects" is currently active
   * @type {boolean}
   */
  highlightObjects = false;

  /* -------------------------------------------- */
  /*  Rendering
  /* -------------------------------------------- */

  /**
   * Obtain an iterable of objects which should be added to this PlaceableLayer
   * @returns {Document[]}
   */
  getDocuments() {
    return this.documentCollection || [];
  }

  /* -------------------------------------------- */

  /** @override */
  async _draw(options) {

    // Clear quadtree
    if ( this.quadtree ) this.quadtree.clear();

    // Create objects container which can be sorted
    this.objects = this.addChild(new PIXI.Container());
    this.objects.sortableChildren = true;
    this.objects.visible = false;
    if ( this.constructor.layerOptions.elevationSorting ) {
      this.objects.sortChildren = this._sortObjectsByElevation.bind(this.objects);
    }
    this.objects.on("childAdded", obj => {
      if ( !(obj instanceof this.constructor.placeableClass) ) {
        console.error(`An object of type ${obj.constructor.name} was added to ${this.constructor.name}#objects. `
          + `The object must be an instance of ${this.constructor.placeableClass.name}.`);
      }
      if ( obj instanceof PlaceableObject ) obj._updateQuadtree();
    });
    this.objects.on("childRemoved", obj => {
      if ( obj instanceof PlaceableObject ) obj._updateQuadtree();
    });

    // Create preview container which is always above objects
    this.preview = this.addChild(new PIXI.Container());

    // Create and draw objects
    const documents = this.getDocuments();
    const promises = documents.map(doc => {
      const obj = doc._object = this.createObject(doc);
      this.objects.addChild(obj);
      return obj.draw();
    });

    // Wait for all objects to draw
    this.visible = true;
    await Promise.all(promises);
    this.objects.visible = true;
  }

  /* -------------------------------------------- */

  /**
   * Draw a single placeable object
   * @param {ClientDocument} document     The Document instance used to create the placeable object
   * @returns {PlaceableObject}
   */
  createObject(document) {
    return new this.constructor.placeableClass(document, canvas.scene);
  }

  /* -------------------------------------------- */

  /** @override */
  async _tearDown(options) {
    this.history = [];
    if ( this.options.controllableObjects ) {
      this.controlledObjects.clear();
    }
    if ( this.hud ) this.hud.clear();
    this.objects = null;
    return super._tearDown();
  }

  /* -------------------------------------------- */

  /**
   * Override the default PIXI.Container behavior for how objects in this container are sorted.
   * @internal
   */
  _sortObjectsByElevation() {
    this.children.sort((a, b) => {
      return ( a.document.elevation - b.document.elevation ) || ( a.document.sort - b.document.sort );
    });
    this.sortDirty = false;
  }

  /* -------------------------------------------- */
  /*  Methods                                     */
  /* -------------------------------------------- */

  /** @override */
  _activate() {
    this.objects.visible = true;
    this.placeables.forEach(l => l.renderFlags.set({refreshState: true}));
  }

  /* -------------------------------------------- */

  /** @override */
  _deactivate() {
    this.objects.visible = false;
    this.releaseAll();
    this.placeables.forEach(l => l.renderFlags.set({refreshState: true}));
    this.clearPreviewContainer();
  }

  /* -------------------------------------------- */

  /**
   * Clear the contents of the preview container, restoring visibility of original (non-preview) objects.
   */
  clearPreviewContainer() {
    if ( !this.preview ) return;
    this.preview.removeChildren().forEach(c => {
      c._onDragEnd();
      c.destroy({children: true});
    });
  }

  /* -------------------------------------------- */

  /**
   * Get a PlaceableObject contained in this layer by its ID.
   * Returns undefined if the object doesn't exist or if the canvas is not rendering a Scene.
   * @param {string} objectId   The ID of the contained object to retrieve
   * @returns {PlaceableObject}  The object instance, or undefined
   */
  get(objectId) {
    return this.documentCollection?.get(objectId)?.object || undefined;
  }

  /* -------------------------------------------- */

  /**
   * Acquire control over all PlaceableObject instances which are visible and controllable within the layer.
   * @param {object} options      Options passed to the control method of each object
   * @returns {PlaceableObject[]}  An array of objects that were controlled
   */
  controlAll(options={}) {
    if ( !this.options.controllableObjects ) return [];
    options.releaseOthers = false;
    for ( const placeable of this.controllableObjects() ) {
      placeable.control(options);
    }
    return this.controlled;
  }

  /* -------------------------------------------- */

  /**
   * Release all controlled PlaceableObject instance from this layer.
   * @param {object} options   Options passed to the release method of each object
   * @returns {number}         The number of PlaceableObject instances which were released
   */
  releaseAll(options={}) {
    let released = 0;
    for ( let o of this.placeables ) {
      if ( !o.controlled ) continue;
      o.release(options);
      released++;
    }
    return released;
  }

  /* -------------------------------------------- */

  /**
   * Simultaneously rotate multiple PlaceableObjects using a provided angle or incremental.
   * This executes a single database operation using Scene.update.
   * If rotating only a single object, it is better to use the PlaceableObject.rotate instance method.
   *
   * @param {object} options    Options which configure how multiple objects are rotated
   * @param {number} [options.angle]      A target angle of rotation (in degrees) where zero faces "south"
   * @param {number} [options.delta]      An incremental angle of rotation (in degrees)
   * @param {number} [options.snap]       Snap the resulting angle to a multiple of some increment (in degrees)
   * @param {Array} [options.ids]         An Array of object IDs to target for rotation
   * @returns {Promise<PlaceableObject[]>} An array of objects which were rotated
   */
  async rotateMany({angle, delta, snap, ids}={}) {
    if ((!this.constructor.layerOptions.rotatableObjects ) || (game.paused && !game.user.isGM)) return [];
    if ( (angle ?? delta ?? null) === null ) {
      throw new Error("Either a target angle or incremental delta must be provided.");
    }

    // Determine the set of rotatable objects
    const rotatable = this.controlled.filter(o => {
      if ( ids && !ids.includes(o.id) ) return false;
      return !o.document.locked;
    });
    if ( !rotatable.length ) return [];

    // Conceal any active HUD
    const hud = this.hud;
    if ( hud ) hud.clear();

    // Update the objects with a single operation
    const updateData = rotatable.map(o => {
      return {_id: o.id, rotation: o._updateRotation({angle, delta, snap})}
    });
    await canvas.scene.updateEmbeddedDocuments(this.constructor.documentName, updateData);
    return rotatable;
  }

  /* -------------------------------------------- */

  /**
   * Simultaneously move multiple PlaceableObjects via keyboard movement offsets.
   * This executes a single database operation using Scene.update.
   * If moving only a single object, this will delegate to PlaceableObject.update for performance reasons.
   *
   * @param {object} options    Options which configure how multiple objects are moved
   * @param {number} [options.dx=0]       The number of incremental grid units in the horizontal direction
   * @param {number} [options.dy=0]       The number of incremental grid units in the vertical direction
   * @param {boolean} [options.rotate=false] Rotate the token to the keyboard direction instead of moving
   * @param {Array} [options.ids]         An Array of object IDs to target for movement
   *
   * @returns {Promise<PlaceableObject[]>} An array of objects which were moved during the operation
   */
  async moveMany({dx=0, dy=0, rotate=false, ids}={}) {
    if ( !dx && !dy ) return [];
    if ( game.paused && !game.user.isGM ) {
      return ui.notifications.warn("GAME.PausedWarning", {localize: true});
    }

    // Determine the set of movable object IDs unless some were explicitly provided
    ids = ids instanceof Array ? ids : this.controlled.filter(o => !o.document.locked).map(o => o.id);
    if ( !ids.length ) return [];

    // Define rotation angles
    const rotationAngles = {
      square: [45, 135, 225, 315],
      hexR: [30, 150, 210, 330],
      hexQ: [60, 120, 240, 300]
    };

    // Determine the rotation angle
    let offsets = [dx, dy];
    let angle = 0;
    if ( rotate ) {
      let angles = rotationAngles.square;
      if ( canvas.grid.type >= CONST.GRID_TYPES.HEXODDQ ) angles = rotationAngles.hexQ;
      else if ( canvas.grid.type >= CONST.GRID_TYPES.HEXODDR ) angles = rotationAngles.hexR;
      if (offsets.equals([0, 1])) angle = 0;
      else if (offsets.equals([-1, 1])) angle = angles[0];
      else if (offsets.equals([-1, 0])) angle = 90;
      else if (offsets.equals([-1, -1])) angle = angles[1];
      else if (offsets.equals([0, -1])) angle = 180;
      else if (offsets.equals([1, -1])) angle = angles[2];
      else if (offsets.equals([1, 0])) angle = 270;
      else if (offsets.equals([1, 1])) angle = angles[3];
    }

    // Conceal any active HUD
    const hud = this.hud;
    if ( hud ) hud.clear();

    // Construct the update Array
    const moved = [];
    const updateData = ids.map(id => {
      let obj = this.get(id);
      let update = {_id: id};
      if ( rotate ) update.rotation = angle;
      else foundry.utils.mergeObject(update, obj._getShiftedPosition(...offsets));
      moved.push(obj);
      return update;
    });
    await canvas.scene.updateEmbeddedDocuments(this.constructor.documentName, updateData);
    return moved;
  }

  /* -------------------------------------------- */

  /**
   * Undo a change to the objects in this layer
   * This method is typically activated using CTRL+Z while the layer is active
   * @returns {Promise<Document[]>}     An array of documents which were modified by the undo operation
   */
  async undoHistory() {
    if ( !this.history.length ) return Promise.reject("No more tracked history to undo!");
    let event = this.history.pop();
    const type = this.constructor.documentName;

    // Undo creation with deletion
    if ( event.type === "create" ) {
      const ids = event.data.map(d => d._id);
      return canvas.scene.deleteEmbeddedDocuments(type, ids, {isUndo: true});
    }

    // Undo updates with update
    else if ( event.type === "update" ) {
      return canvas.scene.updateEmbeddedDocuments(type, event.data, {isUndo: true});
    }

    // Undo deletion with creation
    else if ( event.type === "delete" ) {
      return canvas.scene.createEmbeddedDocuments(type, event.data, {isUndo: true, keepId: true});
    }
  }

  /* -------------------------------------------- */

  /**
   * A helper method to prompt for deletion of all PlaceableObject instances within the Scene
   * Renders a confirmation dialogue to confirm with the requester that all objects will be deleted
   * @returns {Promise<Document[]>}    An array of Document objects which were deleted by the operation
   */
  async deleteAll() {
    const type = this.constructor.documentName;
    if ( !game.user.isGM ) {
      throw new Error(`You do not have permission to delete ${type} objects from the Scene.`);
    }
    return Dialog.confirm({
      title: game.i18n.localize("CONTROLS.ClearAll"),
      content: `<p>${game.i18n.format("CONTROLS.ClearAllHint", {type})}</p>`,
      yes: () => canvas.scene.deleteEmbeddedDocuments(type, [], {deleteAll: true})
    });
  }

  /* -------------------------------------------- */

  /**
   * Record a new CRUD event in the history log so that it can be undone later
   * @param {string} type   The event type (create, update, delete)
   * @param {Object[]} data   The object data
   */
  storeHistory(type, data) {
    if ( this.history.length >= 10 ) this.history.shift();
    this.history.push({type, data});
  }

  /* -------------------------------------------- */

  /**
   * Copy currently controlled PlaceableObjects to a temporary Array, ready to paste back into the scene later
   * @returns {PlaceableObject[]}             The Array of copied PlaceableObject instances
   */
  copyObjects() {
    if ( this.options.controllableObjects ) this._copy = [...this.controlled];
    else if ( this.hover) this._copy = [this.hover];
    else this._copy = [];
    ui.notifications.info(`Copied data for ${this._copy.length} ${this.constructor.documentName} objects`);
    return this._copy;
  }

  /* -------------------------------------------- */

  /**
   * Paste currently copied PlaceableObjects back to the layer by creating new copies
   * @param {Point} position      The destination position for the copied data.
   * @param {object} [options]    Options which modify the paste operation
   * @param {boolean} [options.hidden]    Paste data in a hidden state, if applicable. Default is false.
   * @param {boolean} [options.snap]      Snap the resulting objects to the grid. Default is true.
   * @returns {Promise<Document[]>} An Array of created Document instances
   */
  async pasteObjects(position, {hidden=false, snap=true}={}) {
    if ( !this._copy.length ) return [];
    const d = canvas.dimensions;

    // Adjust the pasted position for half a grid space
    if ( snap ) {
      position.x -= canvas.dimensions.size / 2;
      position.y -= canvas.dimensions.size / 2;
    }

    // Get the left-most object in the set
    this._copy.sort((a, b) => a.document.x - b.document.x);
    const {x, y} = this._copy[0].document;

    // Iterate over objects
    const toCreate = [];
    for ( let c of this._copy ) {
      const data = c.document.toObject();
      delete data._id;

      // Constrain the destination position
      let dest = {x: position.x + (data.x - x), y: position.y + (data.y - y)};
      dest.x = Math.clamped(dest.x, 0, d.width-1);
      dest.y = Math.clamped(dest.y, 0, d.height-1);
      if ( snap ) dest = canvas.grid.getSnappedPosition(dest.x, dest.y);

      // Stage the creation
      toCreate.push(foundry.utils.mergeObject(data, {
        x: dest.x,
        y: dest.y,
        hidden: data.hidden || hidden
      }));
    }

    /**
     * A hook event that fires when any PlaceableObject is pasted onto the
     * Scene. Substitute the PlaceableObject name in the hook event to target a
     * specific PlaceableObject type, for example "pasteToken".
     * @function pastePlaceableObject
     * @memberof hookEvents
     * @param {PlaceableObject[]} copied The PlaceableObjects that were copied
     * @param {object[]} createData      The new objects that will be added to the Scene
     */
    Hooks.call(`paste${this.constructor.documentName}`, this._copy, toCreate);

    // Create all objects
    let created = await canvas.scene.createEmbeddedDocuments(this.constructor.documentName, toCreate);
    ui.notifications.info(`Pasted data for ${toCreate.length} ${this.constructor.documentName} objects.`);
    return created;
  }

  /* -------------------------------------------- */

  /**
   * Select all PlaceableObject instances which fall within a coordinate rectangle.
   * @param {object} [options={}]
   * @param {number} [options.x]                     The top-left x-coordinate of the selection rectangle.
   * @param {number} [options.y]                     The top-left y-coordinate of the selection rectangle.
   * @param {number} [options.width]                 The width of the selection rectangle.
   * @param {number} [options.height]                The height of the selection rectangle.
   * @param {object} [options.releaseOptions={}]     Optional arguments provided to any called release() method.
   * @param {object} [options.controlOptions={}]     Optional arguments provided to any called control() method.
   * @param {object} [aoptions]                      Additional options to configure selection behaviour.
   * @param {boolean} [aoptions.releaseOthers=true]  Whether to release other selected objects.
   * @returns {boolean}       A boolean for whether the controlled set was changed in the operation.
   */
  selectObjects({x, y, width, height, releaseOptions={}, controlOptions={}}={}, {releaseOthers=true}={}) {
    if ( !this.options.controllableObjects ) return false;
    const oldSet = this.controlled;

    // Identify controllable objects
    const selectionRect = new PIXI.Rectangle(x, y, width, height);
    const newSet = [];
    for ( const placeable of this.controllableObjects() ) {
      const c = placeable.center;
      if ( selectionRect.contains(c.x, c.y) ) newSet.push(placeable);
    }

    // Maybe release objects no longer controlled
    const toRelease = oldSet.filter(placeable => !newSet.includes(placeable));
    if ( releaseOthers ) toRelease.forEach(placeable => placeable.release(releaseOptions));

    // Control new objects
    if ( foundry.utils.isEmpty(controlOptions) ) controlOptions.releaseOthers = false;
    const toControl = newSet.filter(placeable => !oldSet.includes(placeable));
    toControl.forEach(placeable => placeable.control(controlOptions));

    // Return a boolean for whether the control set was changed
    return (releaseOthers && toRelease.length) || (toControl.length > 0);
  }

  /* -------------------------------------------- */

  /**
   * Update all objects in this layer with a provided transformation.
   * Conditionally filter to only apply to objects which match a certain condition.
   * @param {Function|object} transformation     An object of data or function to apply to all matched objects
   * @param {Function|null}  condition           A function which tests whether to target each object
   * @param {object} [options]                   Additional options passed to Document.update
   * @returns {Promise<Document[]>}              An array of updated data once the operation is complete
   */
  async updateAll(transformation, condition=null, options={}) {
    const hasTransformer = transformation instanceof Function;
    if ( !hasTransformer && (foundry.utils.getType(transformation) !== "Object") ) {
      throw new Error("You must provide a data object or transformation function");
    }
    const hasCondition = condition instanceof Function;
    const updates = this.placeables.reduce((arr, obj) => {
      if ( hasCondition && !condition(obj) ) return arr;
      const update = hasTransformer ? transformation(obj) : foundry.utils.deepClone(transformation);
      update._id = obj.id;
      arr.push(update);
      return arr;
    },[]);
    return canvas.scene.updateEmbeddedDocuments(this.constructor.documentName, updates, options);
  }

  /* -------------------------------------------- */

  /**
   * Get the world-transformed drop position.
   * @param {DragEvent} event
   * @param {object} [options]
   * @param {boolean} [options.center=true]  Return the co-ordinates of the center of the nearest grid element.
   * @returns {number[]|boolean}     Returns the transformed x, y co-ordinates, or false if the drag event was outside
   *                                 the canvas.
   * @protected
   */
  _canvasCoordinatesFromDrop(event, {center=true}={}) {
    let coords = canvas.canvasCoordinatesFromClient({x: event.clientX, y: event.clientY});
    coords = [coords.x, coords.y];
    if ( center ) coords = canvas.grid.getCenter(coords[0], coords[1]);
    if ( canvas.dimensions.rect.contains(coords[0], coords[1]) ) return coords;
    return false;
  }

  /* -------------------------------------------- */

  /**
   * Create a preview of this layer's object type from a world document and show its sheet to be finalized.
   * @param {object} createData                     The data to create the object with.
   * @param {object} [options]                      Options which configure preview creation
   * @param {boolean} [options.renderSheet]           Render the preview object config sheet?
   * @param {number} [options.top]                    The offset-top position where the sheet should be rendered
   * @param {number} [options.left]                   The offset-left position where the sheet should be rendered
   * @returns {PlaceableObject}                     The created preview object
   * @internal
   */
  async _createPreview(createData, {renderSheet=true, top=0, left=0}={}) {
    const documentName = this.constructor.documentName;
    const cls = getDocumentClass(documentName);
    const document = new cls(createData, {parent: canvas.scene});
    if ( !document.canUserModify(game.user, "create") ) {
      return ui.notifications.warn(game.i18n.format("PERMISSION.WarningNoCreate", {document: documentName}));
    }

    const object = new CONFIG[documentName].objectClass(document);
    this.activate();
    this.preview.addChild(object);
    await object.draw();

    if ( renderSheet ) object.sheet.render(true, {top, left});
    return object;
  }

  /* -------------------------------------------- */
  /*  Event Listeners and Handlers                */
  /* -------------------------------------------- */

  /** @override */
  _onClickLeft(event) {
    if ( this.hud ) this.hud.clear();
    if ( this.options.controllableObjects && game.settings.get("core", "leftClickRelease") && !this.hover ) {
      this.releaseAll();
    }
  }

  /* -------------------------------------------- */

  /** @override */
  async _onDragLeftStart(event) {
    const interaction = event.interactionData;
    if ( !this.options.canDragCreate ) {
      interaction.layerDragState = 0;
      return;
    }

    // Clear any existing preview
    this.clearPreviewContainer();

    // Snap the origin to the grid
    if ( this.options.snapToGrid && !event.isShift ) {
      interaction.origin =
        canvas.grid.getSnappedPosition(interaction.origin.x, interaction.origin.y, this.gridPrecision);
    }

    // Register the ongoing creation
    interaction.layerDragState = 1;
  }

  /* -------------------------------------------- */

  /** @override */
  _onDragLeftMove(event) {
    const preview = event.interactionData.preview;
    if ( !preview || preview._destroyed ) return;
    if ( preview.parent === null ) { // In theory this should never happen, but rarely does
      this.preview.addChild(preview);
    }
  }

  /* -------------------------------------------- */

  /** @override */
  async _onDragLeftDrop(event) {
    const preview = event.interactionData.preview;
    if ( !preview || preview._destroyed ) return;
    event.interactionData.clearPreviewContainer = false;
    const cls = getDocumentClass(this.constructor.documentName);
    try {
      return await cls.create(preview.document.toObject(false), {parent: canvas.scene});
    } finally {
      this.clearPreviewContainer();
    }
  }

  /* -------------------------------------------- */

  /** @override */
  _onDragLeftCancel(event) {
    if ( event.interactionData?.clearPreviewContainer !== false ) {
      this.clearPreviewContainer();
    }
  }

  /* -------------------------------------------- */

  /** @override */
  _onClickRight(event) {
    if ( this.hud ) this.hud.clear();
  }

  /* -------------------------------------------- */

  /** @override */
  _onMouseWheel(event) {

    // Prevent wheel rotation for non-GM users if the game is paused
    if ( game.paused && !game.user.isGM ) return;

    // Determine the incremental angle of rotation from event data
    const dBig = canvas.grid.isHex ? 60 : 45;
    let snap = event.shiftKey ? dBig : 15;
    let delta = snap * Math.sign(event.delta);

    // Case 1 - rotate preview objects
    if ( this.preview.children.length ) {
      for ( let p of this.preview.children ) {
        p.document.rotation = p._updateRotation({delta, snap});
        p.renderFlags.set({refresh: true}); // Refresh everything, can we do better?
      }
    }

    // Case 2 - Update multiple objects
    else return this.rotateMany({delta, snap});
  }

  /* -------------------------------------------- */

  /** @override */
  async _onDeleteKey(event) {

    // Identify objects which are candidates for deletion
    const objects = this.options.controllableObjects ? this.controlled : (this.hover ? [this.hover] : []);
    if ( !objects.length ) return;

    // Restrict to objects which can be deleted
    const ids = objects.reduce((ids, o) => {
      const isDragged = (o.interactionState === MouseInteractionManager.INTERACTION_STATES.DRAG);
      if ( isDragged || o.document.locked || !o.document.canUserModify(game.user, "delete") ) return ids;
      if ( this.hover === o ) this.hover = null;
      ids.push(o.id);
      return ids;
    }, []);
    if ( ids.length ) return canvas.scene.deleteEmbeddedDocuments(this.constructor.documentName, ids);
  }

  /* -------------------------------------------- */
  /*  Deprecations and Compatibility              */
  /* -------------------------------------------- */

  /**
   * @deprecated since v11
   * @ignore
   */
  get _highlight() {
    const msg = "PlaceableLayer#_highlight is deprecated. Use PlaceableLayer#highlightObjects instead.";
    foundry.utils.logCompatibilityWarning(msg, {since: 11, until: 13});
    return this.highlightObjects;
  }

  /**
   * @deprecated since v11
   * @ignore
   */
  set _highlight(state) {
    const msg = "PlaceableLayer#_highlight is deprecated. Use PlaceableLayer#highlightObjects instead.";
    foundry.utils.logCompatibilityWarning(msg, {since: 11, until: 13});
    this.highlightObjects = !!state;
  }
}
