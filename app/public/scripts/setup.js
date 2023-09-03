(function () {
  'use strict';

  /**
   * Display the End User License Agreement and prompt the user to agree before moving forwards.
   */
  class EULA extends Application {

    /** @inheritdoc */
    static get defaultOptions() {
      return foundry.utils.mergeObject(super.defaultOptions, {
        id: "eula",
        template: "templates/setup/eula.hbs",
        title: "End User License Agreement",
        width: 720,
        popOut: true
      });
    }

    /* -------------------------------------------- */

    /**
     * A reference to the setup URL used under the current route prefix, if any
     * @type {string}
     */
    get licenseURL() {
      return foundry.utils.getRoute("license");
    }

    /* -------------------------------------------- */

    /** @override */
    async getData(options) {
      const html = await foundry.utils.fetchWithTimeout("license.html").then(r => r.text());
      return { html };
    }

    /* -------------------------------------------- */

    /** @override */
    async _renderOuter() {
      const id = this.id;
      const classes = Array.from(this.options.classes).join(" ");

      // Override the normal window app header, so it cannot be closed or minimized
      const html = $(`<div id="${id}" class="app window-app ${classes}" data-appid="${this.appId}">
      <header class="window-header flexrow">
          <h4 class="window-title">${this.title}</h4>
      </header>
      <section class="window-content"></section>
    </div>`);

      // Make the outer window draggable
      const header = html.find("header")[0];
      new Draggable(this, html, header, this.options.resizable);

      // Set the outer frame z-index
      if ( Object.keys(ui.windows).length === 0 ) _maxZ = 100;
      html.css({zIndex: Math.min(++_maxZ, 9999)});
      return html;
    }

    /* -------------------------------------------- */
    /*  Event Listeners and Handlers                */
    /* -------------------------------------------- */

    /** @override */
    activateListeners(html) {
      super.activateListeners(html);
      const form = html.toArray().find(el => el.id === "eula-sign");
      form.querySelector("#decline").addEventListener("click", EULA.#onDecline);
      form.onsubmit = EULA.#onSubmit;
    }

    /* -------------------------------------------- */

    /**
     * Handle refusal of the EULA by checking the decline button
     * @param {MouseEvent} event    The originating click event
     */
    static #onDecline(event) {
      const button = event.currentTarget;
      ui.notifications.error("You have declined the End User License Agreement and cannot use the software.");
      button.form.dataset.clicked = "decline";
    }

    /* -------------------------------------------- */

    /**
     * Validate form submission before sending it onwards to the server
     * @param {Event} event       The originating form submission event
     */
    static #onSubmit(event) {
      /** @type {HTMLFormElement} */
      const form = event.target;
      if ( form.dataset.clicked === "decline" ) {
        return setTimeout(() => window.location.href = CONST.WEBSITE_URL, 1000);
      }
      if ( !form.agree.checked ) {
        event.preventDefault();
        ui.notifications.error("You must indicate your agreement before proceeding.");
      }
    }
  }

  /**
   * The Join Game setup application.
   */
  class JoinGameForm extends FormApplication {
    constructor(object, options) {
      super(object, options);
      game.users.apps.push(this);
    }

    /* -------------------------------------------- */

    /** @override */
    static get defaultOptions() {
      return foundry.utils.mergeObject(super.defaultOptions, {
        id: "join-game",
        template: "templates/setup/join-game.hbs",
        popOut: false,
        closeOnSubmit: false,
        scrollY: ["#world-description"]
      });
    }

    /* -------------------------------------------- */

    /** @inheritDoc */
    getData(options={}) {
      const context = {
        isAdmin: game.data.isAdmin,
        users: game.users,
        world: game.world,
        passwordString: game.data.passwordString,
        usersCurrent: game.users.filter(u => u.active).length,
        usersMax: game.users.contents.length
      };

      // Next session time
      const nextDate = new Date(game.world.nextSession || undefined);
      if ( nextDate.isValid() ) {
        context.nextTime = nextDate.toLocaleTimeString(game.i18n.lang, {
          weekday: "long",
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
          timeZoneName: "short"
        });
      }
      return context;
    }

    /* -------------------------------------------- */

    /** @inheritDoc */
    activateListeners(html) {
      super.activateListeners(html);
      this.form.userid.addEventListener("focus", this.#setMode.bind(this, "join"));
      this.form.password.addEventListener("focus", this.#setMode.bind(this, "join"));
      this.form.adminPassword?.addEventListener("focus", this.#setMode.bind(this, "shutdown"));
      this.form.shutdown.addEventListener("click", this.#onShutdown.bind(this));
    }

    /* -------------------------------------------- */

    /** @inheritDoc */
    async _render(force, options) {
      if ( !this.form ) return super._render(force, options);
      // Preserve form state across re-renders.
      const data = this._getSubmitData();
      const focus = this.form.querySelector(":focus");
      await super._render(force, options);
      Object.entries(data).forEach(([k, v]) => this.form.elements[k].value = v);
      if ( focus?.name ) this.form.elements[focus.name].focus();
      if ( this.form.userid.selectedOptions[0]?.disabled ) this.form.userid.value = "";
    }

    /* -------------------------------------------- */

    /**
     * Toggle the submission mode of the form to alter what pressing the "ENTER" key will do
     * @param {string} mode
     */
    #setMode(mode) {
      switch (mode) {
        case "join":
          this.form.shutdown.type = "button";
          this.form.join.type = "submit";
          break;
        case "shutdown":
          this.form.join.type = "button";
          this.form.shutdown.type = "submit";
          break;
      }
    }

    /* -------------------------------------------- */

    /** @inheritDoc */
    async _onSubmit(event, options) {
      event.preventDefault();
      const form = event.target;
      form.submit.disabled = true;
      const data = this._getSubmitData();
      data.action = "join";
      return this.#post(data, form.submit);
    }

    /* -------------------------------------------- */

    /**
     * Handle requests to shut down the currently active world
     * @param {MouseEvent} event    The originating click event
     * @returns {Promise<void>}
     */
    async #onShutdown(event) {
      event.preventDefault();
      const button = this.form.shutdown;
      button.disabled = true;

      // Display a warning if other players are connected
      const othersActive = game.users.filter(u => u.active).length;
      if ( othersActive ) {
        const warning = othersActive > 1 ? "GAME.ReturnSetupActiveUsers" : "GAME.ReturnSetupActiveUser";
        const confirm = await Dialog.confirm({
          title: game.i18n.localize("GAME.ReturnSetup"),
          content: `<p>${game.i18n.format(warning, {number: othersActive})}</p>`
        });
        if ( !confirm ) {
          button.disabled = false;
          return;
        }
      }

      // Submit the request
      const data = this._getSubmitData();
      data.action = "shutdown";
      return this.#post(data, button);
    }

    /* -------------------------------------------- */

    /**
     * Submit join view POST requests to the server for handling.
     * @param {object} formData                         The processed form data
     * @param {EventTarget|HTMLButtonElement} button    The triggering button element
     * @returns {Promise<void>}
     */
    async #post(formData, button) {
      const joinURL = foundry.utils.getRoute("join");
      button.disabled = true;

      // Look up some data
      const user = game.users.get(formData.userid)?.name || formData.userid;

      let response;
      try {
        response = await fetchJsonWithTimeout(joinURL, {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify(formData)
        });
      }
      catch(e) {
        if (e instanceof HttpError) {
          const error = game.i18n.format(e.displayMessage, {user});
          ui.notifications.error(error);
        }
        else {
          ui.notifications.error(e);
        }
        button.disabled = false;
        return;
      }

      // Redirect on success
      ui.notifications.info(game.i18n.format(response.message, {user}));
      setTimeout(() => window.location.href = response.redirect, 500 );
    }

    /* -------------------------------------------- */

    /** @override */
    async _updateObject(event, formData) {
      throw new Error("Not implemented for this class");
    }
  }

  /**
   * A form application for managing core server configuration options.
   * @see config.ApplicationConfiguration
   */
  class SetupApplicationConfiguration extends FormApplication {

    /**
     * An ApplicationConfiguration instance which is used for validation and processing of form changes.
     * @type {config.ApplicationConfiguration}
     */
    config = new foundry.config.ApplicationConfiguration(this.object);

    /** @inheritdoc */
    static get defaultOptions() {
      return foundry.utils.mergeObject(super.defaultOptions, {
        id: "setup-configuration",
        template: "templates/setup/app-configuration.hbs",
        title: "SETUP.ConfigTitle",
        popOut: true,
        width: 720
      });
    }

    /**
     * Which CSS theme is currently being previewed
     * @type {string}
     */
    #previewTheme = this.config.cssTheme;

    /* -------------------------------------------- */

    /** @override */
    getData(options={}) {
      const worlds = Array.from(game.worlds.values());
      worlds.sort((a, b) => a.title.localeCompare(b.title));
      return {
        noAdminPW: !game.data.options.adminPassword,
        config: this.config.toObject(),
        cssThemes: CONST.CSS_THEMES,
        languages: game.data.languages,
        fields: this.config.schema.fields,
        worlds: worlds
      };
    }

    /* -------------------------------------------- */

    /** @inheritDoc */
    async close(options) {
      this.#applyThemeChange(this.config.cssTheme);
      return super.close(options);
    }

    /* -------------------------------------------- */

    /** @override */
    async _onChangeInput(event) {
      this.#applyThemeChange(this.form.cssTheme.value);
    }

    /* -------------------------------------------- */

    /** @override */
    async _onSubmit(event, options={}) {
      event.preventDefault();
      const original = this.config.toObject();

      // Validate the proposed changes
      const formData = this._getSubmitData();
      let changes;
      try {
        changes = this.config.updateSource(formData);
      } catch(err) {
        return ui.notifications.error(err.message);
      }
      if ( foundry.utils.isEmpty(changes) ) return;

      // Confirm that a server restart is okay
      const confirm = await Dialog.confirm({
        title: game.i18n.localize("SETUP.ConfigSave"),
        content: `<p>${game.i18n.localize("SETUP.ConfigSaveWarning")}</p>`,
        defaultYes: false,
        options: {width: 480}
      });

      // Submit the form
      if ( confirm ) {
        const response = await Setup.post({action: "adminConfigure", config: changes});
        if ( response.restart ) ui.notifications.info("SETUP.ConfigSaveRestart", {localize: true, permanent: true});
        return this.close();
      }

      // Reset the form
      this.config.updateSource(original);
      return this.render();
    }

    /* -------------------------------------------- */

    /** @override */
    async _updateObject(event, formData) {}

    /* -------------------------------------------- */

    /**
     * Update the body class with the previewed CSS theme.
     * @param {string} themeId     The theme ID to preview
     */
    #applyThemeChange(themeId) {
      document.body.classList.replace(`theme-${this.#previewTheme}`, `theme-${themeId}`);
      this.#previewTheme = themeId;
    }

    /* -------------------------------------------- */

    /**
     * Prompt the user with a request to share telemetry data if they have not yet chosen an option.
     * @returns {Promise<void>}
     */
    static async telemetryRequestDialog() {
      if ( game.data.options.telemetry !== undefined ) return;
      const response = await Dialog.wait({
        title: game.i18n.localize("SETUP.TelemetryRequestTitle"),
        content: `<p>${game.i18n.localize("SETUP.TelemetryRequest1")}</p>`
          + `<blockquote>${game.i18n.localize("SETUP.TelemetryHint")}</blockquote>`
          + `<p>${game.i18n.localize("SETUP.TelemetryRequest2")}</p>`,
        focus: true,
        close: () => null,
        buttons: {
          yes: {
            icon: '<i class="fas fa-check"></i>',
            label: game.i18n.localize("SETUP.TelemetryAllow"),
            callback: () => true
          },
          no: {
            icon: '<i class="fas fa-times"></i>',
            label: game.i18n.localize("SETUP.TelemetryDecline"),
            callback: () => false
          }
        }
      }, {width: 480});
      if ( response !== null ) {
        const { changes } = await Setup.post({action: "adminConfigure", config: {telemetry: response}});
        foundry.utils.mergeObject(game.data.options, changes);
      }
    }
  }

  /**
   * The Setup Authentication Form.
   */
  class SetupAuthenticationForm extends Application {

    /** @inheritdoc */
    static get defaultOptions() {
      return foundry.utils.mergeObject(super.defaultOptions, {
        id: "setup-authentication",
        template: "templates/setup/setup-authentication.hbs",
        popOut: false
      });
    }
  }

  /**
   * An application that renders the floating setup menu buttons.
   */
  class SetupWarnings extends Application {

    /** @inheritdoc */
    static get defaultOptions() {
      return foundry.utils.mergeObject(super.defaultOptions, {
        id: "setup-warnings",
        template: "templates/setup/setup-warnings.hbs",
        title: "SETUP.WarningsTitle",
        popOut: true,
        width: 680
      });
    }

    /* -------------------------------------------- */

    /** @override */
    get title() {
      return `${game.i18n.localize(this.options.title)} (${game.issueCount.total})`;
    }

    /* -------------------------------------------- */

    /** @override */
    async getData(options={}) {
      const categories = {
        world: {label: "SETUP.Worlds", packages: {}},
        system: {label: "SETUP.Systems", packages: {}},
        module: {label: "SETUP.Modules", packages: {}}
      };

      // Organize warnings
      for ( const pkg of Object.values(game.data.packageWarnings) ) {
        const cls = PACKAGE_TYPES[pkg.type];
        const p = game[cls.collection].get(pkg.id);
        categories[pkg.type].packages[pkg.id] = {
          id: pkg.id,
          type: pkg.type,
          name: p ? p.title : "",
          errors: pkg.error.map(e => e.trim()).join("\n"),
          warnings: pkg.warning.map(e => e.trim()).join("\n"),
          reinstallable: pkg.reinstallable,
          installed: p !== undefined
        };
      }

      // Filter categories to ones which have issues
      for ( const [k, v] of Object.entries(categories) ) {
        if ( foundry.utils.isEmpty(v.packages) ) delete categories[k];
      }
      return {categories};
    }

    /* -------------------------------------------- */

    /** @inheritDoc */
    activateListeners(html) {
      super.activateListeners(html);
      html.find("a.manage").click(this.#onManagePackage.bind(this));
      html.find("[data-action]").on("click", this.#onAction.bind(this));
    }

    /* -------------------------------------------- */

    /**
     * Handle button press actions.
     * @param {PointerEvent} event  The triggering event.
     */
    async #onAction(event) {
      const target = event.currentTarget;
      const action = target.dataset.action;
      const pkg = target.closest("[data-package-id]");
      const id = pkg.dataset.packageId;
      const type = pkg.dataset.packageType;

      switch ( action ) {
        case "reinstallPackage":
          target.querySelector("i").classList.add("fa-spin");
          await this.#reinstallPackage({ id, type });
          break;

        case "uninstallPackage":
          await this.#uninstallPackage({ id, type });
          break;
      }

      this.render();
    }

    /* -------------------------------------------- */

    /**
     * Handle button clicks in the warnings view to manage the package.
     * @param {PointerEvent} event      The initiating click event
     */
    #onManagePackage(event) {
      event.preventDefault();
      const li = event.currentTarget.closest(".package");

      // Activate the correct tab:
      const packageType = li.closest("section[data-package-type]").dataset.packageType;
      ui.setupPackages.activateTab(`${packageType}s`);

      // Filter to the target package
      const packageId = li.dataset.packageId;
      const filter = ui.setupPackages._searchFilters.find(f => f._inputSelector === `#${packageType}-filter`)._input;
      filter.value = packageId;
      filter.dispatchEvent(new Event("input", {bubbles: true}));
    }

    /* -------------------------------------------- */

    /**
     * Handle reinstalling a package.
     * @param {object} pkg       The package information.
     * @param {string} pkg.id    The package ID.
     * @param {string} pkg.type  The package type.
     */
    async #reinstallPackage({ id, type }) {
      await this.#uninstallPackage({ id, type });
      await Setup.warmPackages({ type });
      const pkg = Setup.cache[type].packages.get(id);
      const warnInfo = game.data.packageWarnings[id];
      if ( !pkg && !warnInfo?.manifest )  {
        return ui.notifications.error("SETUP.ReinstallPackageNotFound", { localize: true, permanent: true });
      }
      return Setup.installPackage({ type, id, manifest: warnInfo?.manifest ?? pkg.manifest });
    }

    /* -------------------------------------------- */

    /**
     * Handle uninstalling a package.
     * @param {object} pkg       The package information.
     * @param {string} pkg.id    The package ID.
     * @param {string} pkg.type  The package type.
     */
    async #uninstallPackage({ id, type }) {
      await Setup.uninstallPackage({ id, type });
      delete game.data.packageWarnings[id];
    }
  }

  /**
   * An application that renders the floating setup menu buttons.
   */
  class SetupMenu extends Application {

    /** @inheritdoc */
    static get defaultOptions() {
      return foundry.utils.mergeObject(super.defaultOptions, {
        id: "setup-menu",
        template: "templates/setup/setup-menu.hbs",
        popOut: false
      });
    }

    /* -------------------------------------------- */

    /** @override */
    async getData(options) {
      const pips = {};

      // Package Warnings Pip
      if ( game.issueCount.total ) {
        pips.warnings = {
          type: game.issueCount.error > 0 ? "error" : "warning",
          label: game.issueCount.total
        };
      }

      // Config Menu Pip
      if ( !game.data.options.adminPassword ) {
        pips.config = {
          type: "warning",
          label: "!"
        };
      }

      // Available Update Pip
      if ( game.data.coreUpdate.hasUpdate ) {
        pips.update = {
          type: "warning",
          label: "!"
        };
      }
      return {
        canLogOut: !!game.data.options.adminPassword,
        pips
      };
    }

    /* -------------------------------------------- */

    /** @inheritDoc */
    activateListeners(html) {
      super.activateListeners(html);
      html.find("button[data-action]").click(this.#onClickButton.bind(this));
    }

    /* -------------------------------------------- */

    /**
     * Handle setup menu button clicks
     * @param {PointerEvent} event      The initiating click event
     */
    #onClickButton(event) {
      event.preventDefault();
      const button = event.currentTarget;
      switch ( button.dataset.action ) {
        case "adminLogout":
          Setup.post({action: button.dataset.action}); // redirects
          break;
        case "configure":
          new SetupApplicationConfiguration(game.data.options).render(true);
          break;
        case "update":
          window.location.href = foundry.utils.getRoute("update");
          break;
        case "viewWarnings":
          const warnings = new SetupWarnings();
          const {bottom, right} = button.parentElement.getBoundingClientRect();
          warnings.render(true, {left: right - warnings.options.width, top: bottom + 20});
          break;
      }
    }
  }

  /**
   * A FormApplication which facilitates the creation of a new Module.
   */
  class ModuleConfigurationForm extends FormApplication {
    constructor(moduleData, options) {
      super(undefined, options);
      this.#module = new Module(moduleData || {
        id: "my-new-module",
        title: "My New Module",
        version: "1.0.0",
        compatibility: {
          minimum: game.release.generation,
          verified: game.release.generation
        }
      });
      this.#source = moduleData ? game.modules.get(this.#module.id) : undefined;
    }

    /** @override */
    static get defaultOptions() {
      return foundry.utils.mergeObject(super.defaultOptions, {
        id: "module-create",
        template: "templates/setup/module-configuration.hbs",
        width: 760,
        height: "auto",
        tabs: [{navSelector: ".tabs", contentSelector: "form", initial: "basics"}]
      });
    }

    /** @override */
    get title() {
      if ( !this.#source ) return game.i18n.localize("PACKAGE.ModuleCreate");
      return `${game.i18n.localize("PACKAGE.ModuleEdit")}: ${this.#module.title}`;
    }

    /**
     * A Module instance used as the source data for the form and to validate changes.
     * @type {Module}
     */
    #module;

    /**
     * If editing an existing package, track a reference to its persisted data
     * @type {Module}
     */
    #source;

    /**
     * Display a pending relationship which has not yet been confirmed to appear at the bottom of the list?
     * @type {boolean}
     */
    #pendingRelationship = false;

    /* -------------------------------------------- */

    /** @inheritDoc */
    async getData(options={}) {
      const compendiumTypes = CONST.COMPENDIUM_DOCUMENT_TYPES.map(documentName => {
        return { value: documentName, label: game.i18n.localize(getDocumentClass(documentName).metadata.label) };
      });
      game.i18n.sortObjects(compendiumTypes, "label");

      return {
        compendiumTypes,
        isCreation: !this.#source,
        module: this.#module,
        moduleId: this.#source?.id || "",
        packs: this.#getPacks(),
        relatedPackages: {
          systems: Object.fromEntries(Array.from(game.systems.values()).map(s => [s.id, s.title])),
          modules: Object.fromEntries(Array.from(game.modules.values()).map(m => [m.id, m.title]))
        },
        relationships: this.#getFlattenedRelationships(),
        relationshipCategories: {
          requires: "PACKAGE.Relationships.Requires",
          recommends: "PACKAGE.Relationships.Recommends",
          conflicts: "PACKAGE.Relationships.Conflicts"
        },
        submitLabel: this.#source ? "PACKAGE.ModuleEdit" : "PACKAGE.ModuleCreate"
      }
    }

    /* -------------------------------------------- */

    #getPacks() {
      return this.#module.packs.map(pack => {
        return {
          name: pack.name,
          label: pack.label,
          type: pack.type,
          system: pack.system,
          creating: pack.flags?._placeholder,
          existing: this.#source?.packs.find(p => p.name === pack.name)
        }
      });
    }

    /* -------------------------------------------- */

    /**
     * Flatten the relationships object into an array which is more convenient for rendering.
     * @returns {Array<{id: string, type: string, category: string}>}
     */
    #getFlattenedRelationships() {
      const relationships = [];
      for ( const [category, rs] of Object.entries(this.#module.relationships) ) {
        if ( !["systems", "requires", "recommends", "conflicts"].includes(category) ) continue;
        for ( let [i, r] of Object.entries(Array.from(rs)) ) {
          r = foundry.utils.deepClone(r);
          r.category = category;
          r.index = i;
          relationships.push(r);
        }
      }
      if ( this.#pendingRelationship ) relationships.push({id: "", category: "", index: -1});
      return relationships;
    }

    /* -------------------------------------------- */

    /** @inheritDoc */
    activateListeners(html) {
      super.activateListeners(html);
      html.on("click", "[data-action]", this.#onAction.bind(this));
      html.on("input", "input[data-slugify]", this.#onSlugify.bind(this));
    }

    /* -------------------------------------------- */

    /**
     * Handle click events on action buttons within the form.
     * @param {Event} event    The originating click event
     */
    #onAction(event) {
      event.preventDefault();
      const button = event.currentTarget;
      switch ( button.dataset.action ) {
        case "authorAdd":
          return this.#authorAdd();
        case "authorDelete":
          return this.#authorDelete(Number(button.dataset.index));
        case "packAdd":
          return this.#packAdd();
        case "packDelete":
          return this.#packDelete(Number(button.dataset.index));
        case "relationshipAdd":
          return this.#relationshipAdd();
        case "relationshipDelete":
          return this.#relationshipDelete(button.dataset.category, Number(button.dataset.index));
      }
    }

    /* -------------------------------------------- */

    /**
     * Add a new entry to the authors array.
     */
    #authorAdd() {
      const data = this._getSubmitData();
      data.authors.push({name: `Author ${data.authors.length + 1}`});
      this.#tryUpdate(data);
    }

    /* -------------------------------------------- */

    /**
     * Delete an entry from the authors array.
     * @param {number} index      The array index to delete
     */
    #authorDelete(index) {
      const data = this._getSubmitData();
      data.authors.splice(index, 1);
      this.#tryUpdate(data);
    }

    /* -------------------------------------------- */

    /**
     * Add a new entry to the packs array.
     */
    #packAdd() {
      const data = this._getSubmitData();
      let i = data.packs.length;
      let nextName;
      while ( true ) {
        i++;
        nextName = `pack-${i}`;
        if ( !data.packs.find(p => p.name === nextName ) && !this.#source?.packs.find(p => p.name === nextName) ) break;
      }
      data.packs.push({
        name: nextName,
        label: `Pack ${i}`,
        path: `packs/${nextName}`,
        type: "JournalEntry",
        ownership: {PLAYER: "OBSERVER", ASSISTANT: "OWNER"},
        flags: {
          _placeholder: true
        }
      });
      this.#tryUpdate(data);
    }

    /* -------------------------------------------- */

    /**
     * Delete an entry from the packs array.
     * @param {number} index      The array index to delete
     */
    #packDelete(index) {
      const data = this._getSubmitData();
      data.packs.splice(index, 1);
      this.#tryUpdate(data);
    }

    /* -------------------------------------------- */

    /**
     * Add a pending relationship entry to the relationships object.
     */
    #relationshipAdd() {
      this.#pendingRelationship = true;
      const data = this._getSubmitData();
      this.#tryUpdate(data);
    }

    /* -------------------------------------------- */

    /**
     * Remove a relationship, or remove the pending relationship from the relationships object.
     * @param {string} category   The relationship category being removed
     * @param {number} index      The array index to delete
     */
    #relationshipDelete(category, index) {
      const data = this._getSubmitData();
      for ( const c of ["systems", "requires", "recommends", "conflicts"] ) {
        if ( !data.relationships[c] ) continue;
        for ( const [i, r] of Object.entries(data.relationships[c]) ) {
          if ( (r._category === category) && (r._index === index) ) {
            data.relationships[c].splice(i, 1);
            break;
          }
        }
      }
      this.#pendingRelationship = false;
      this.#tryUpdate(data);
    }

    /* -------------------------------------------- */

    /** @override */
    async _onChangeInput(event) {
      await super._onChangeInput(event);

      // If the .relationship select changes, update the category select
      if ( event.target.classList.contains("relationship") ) {
        this.#updateRelationshipOptions(event.currentTarget);
      }
    }

    /* -------------------------------------------- */

    /** @override */
    async _render(force, options) {
      await super._render(force, options);
      this.element[0].querySelectorAll("select.relationship")
        .forEach(select => this.#updateRelationshipOptions(select));
    }

    /* -------------------------------------------- */

    /**
     * Swaps what options are available based on Package type
     * @param {HTMLSelectElement} select     The select element
     */
    #updateRelationshipOptions(select) {
      // If this is a system relationship, the only valid category is "system"
      const selectedOption = select.options[select.selectedIndex];
      const isSystem = selectedOption.parentNode.dataset.category === "system";
      const categorySelect = select.closest("fieldset").querySelector("select[name$='.category']");

      // Remove the system option, if it exists
      categorySelect.querySelector("option[value='systems']")?.remove();

      categorySelect.disabled = isSystem;
      if ( isSystem ) {
        // Create a selected option
        const option = document.createElement("option");
        option.value = "systems";
        option.text = game.i18n.localize("PACKAGE.Relationships.Systems");
        option.selected = true;

        // Prepend the selected option
        categorySelect.prepend(option);
      }
    }

    /* -------------------------------------------- */

    /**
     * Automatically slugify a related input field as text is typed.
     * @param {Event} event       The field input event
     */
    #onSlugify(event) {
      const input = event.currentTarget;
      const target = this.form[input.dataset.slugify];
      if ( target.disabled ) return;
      target.placeholder = input.value.slugify({strict: true});
    }

    /* -------------------------------------------- */

    /** @override */
    _getSubmitData(updateData = {}) {
      const fd = new FormDataExtended(this.form, {disabled: true});
      const formData = foundry.utils.expandObject(fd.object);
      const moduleData = this.#module.toObject();

      // Module ID
      if ( this.#source ) formData.id = this.#source.id;
      else if ( !formData.id ) formData.id = formData.title.slugify({strict: true});

      // Authors
      formData.authors = Object.values(formData.authors || {}).map((author, i) => {
        const moduleAuthor = moduleData.authors[i];
        author = foundry.utils.mergeObject(moduleAuthor, author, {inplace: false});
        if ( foundry.utils.isEmpty(author.flags) ) delete author.flags;
        return author;
      });

      // Packs
      formData.packs = Object.values(formData.packs || {}).map((pack, i) => {
        const modulePack = moduleData.packs[i];
        if ( !pack.name ) pack.name = pack.label.slugify({strict: true});
        const sourcePath = this.#source?.packs.find(p => p.name === pack.name)?.path;
        pack.path = sourcePath?.replace(`modules/${this.#source.id}/`, "") ?? `packs/${pack.name}`;
        pack = foundry.utils.mergeObject(modulePack, pack, {inplace: false});
        if ( pack.flags?._placeholder ) delete pack.flags._placeholder;
        if ( foundry.utils.isEmpty(pack.flags) ) delete pack.flags;
        return pack;
      });

      // Relationships
      const relationships = {};
      for ( let r of Object.values(formData.relationships || {}) ) {
        if ( !(r.category && r.id) ) continue;
        const c = r.category;
        delete r.category;
        if ( r._category ) {
          const moduleRelationship = moduleData.relationships[r._category][r._index];
          r = foundry.utils.mergeObject(moduleRelationship, r, {inplace: false});
        }
        if ( foundry.utils.isEmpty(r.compatibility) ) delete r.compatibility;
        relationships[c] ||= [];
        r.type = game.systems.has(r.id) ? "system" : "module";
        relationships[c].push(r);
      }
      formData.relationships = relationships;
      return formData;
    }

    /* -------------------------------------------- */

    /** @override */
    async _updateObject(event, formData) {

      // Assert that the final data is valid
      this.form.disabled = true;
      this.#tryUpdate(formData, {render: false});

      // Prepare request data
      let requestData;
      if ( this.#source ) {
        requestData = this.#source.updateSource(formData, {dryRun: true});
        requestData.id = this.#source.id;
      }
      else {
        requestData = this.#module.toObject();
        if ( game.modules.has(requestData.id) ) {
          const msg = game.i18n.format("PACKAGE.ModuleCreateErrorAlreadyExists", {id: this.#module.id});
          ui.notifications.error(msg, {console: false});
          throw new Error(msg);
        }
      }
      requestData.action = "manageModule";

      // Submit the module management request
      await Setup.post(requestData);
      const msg = this.#source ? "PACKAGE.ModuleEditSuccess" : "PACKAGE.ModuleCreateSuccess";
      ui.notifications.info(game.i18n.format(msg, {id: this.#module.id}));
      return Setup.reload();
    }

    /* -------------------------------------------- */

    /**
     * Attempt to update the working Module instance, displaying error messages for any validation failures.
     * @param {object} changes    Proposed changes to the Module source
     * @param {object} [options]  Additional options
     * @param {boolean} [options.render]  Re-render the app?
     */
    #tryUpdate(changes, {render=true}={}) {
      try {
        this.#module.updateSource(changes);
      } catch(err) {
        ui.notifications.error(err.message);
        this.form.disabled = false;
        throw err;
      }
      if ( render ) this.render();
    }
  }

  /**
   * The primary application which renders packages on the Setup view.
   */
  class SetupPackages extends Application {
    constructor(...args) {
      super(...args);
      this.#viewModes = this.#initializeViewModes();
    }

    /**
     * Initialize user-designated favorite packages.
     */
    #initializePackageFavorites() {
      const packageFavorites = game.settings.get("core", Setup.FAVORITE_PACKAGES_SETTING);
      for ( const [collectionName, ids] of Object.entries(packageFavorites) ) {
        const c = game[collectionName];
        for ( const id of ids ) {
          const pkg = c.get(id);
          if ( pkg ) pkg.favorite = true;
        }
      }
    }

    /**
     * Retrieve selected view modes from client storage.
     * @returns {{worlds: string, systems: string, modules: string}}
     */
    #initializeViewModes() {
      const vm = game.settings.get("core", "setupViewModes");
      if ( !(vm.worlds in SetupPackages.VIEW_MODES) ) vm.worlds = "GALLERY";
      if ( !(vm.systems in SetupPackages.VIEW_MODES) ) vm.systems = "GALLERY";
      if ( !(vm.modules in SetupPackages.VIEW_MODES) ) vm.modules = "TILES";
      return vm;
    }

    /* -------------------------------------------- */

    /** @override */
    static get defaultOptions() {
      return foundry.utils.mergeObject(super.defaultOptions, {
        id: "setup-packages",
        template: "templates/setup/setup-packages.hbs",
        popOut: false,
        scrollY: ["#worlds-list", "#systems-list", "#modules-list"],
        tabs: [{navSelector: ".tabs", contentSelector: "#setup-packages", initial: "worlds"}],
        filters: [
          {inputSelector: "#world-filter", contentSelector: "#worlds-list"},
          {inputSelector: "#system-filter", contentSelector: "#systems-list"},
          {inputSelector: "#module-filter", contentSelector: "#modules-list"}
        ]
      });
    }

    /**
     * A mapping of package IDs to progress bar elements
     * @type {Map<string, HTMLElement>}
     */
    progress = new Map();

    /**
     * The view modes applied to each package tab.
     * @type {{worlds: string, systems: string, modules: string}}
     */
    #viewModes;

    /**
     * Track whether an "Update All" workflow is currently in progress.
     * @type {"world"|"system"|"module"|null}
     */
    #updatingAll = null;

    /**
     * The allowed view modes which can be used for each package-type tab.
     * @enum {Readonly<{id: string, label: string, template: string}>}
     */
    static VIEW_MODES = Object.freeze({
      GALLERY: {
        id: "GALLERY",
        icon: "fa-solid fa-image-landscape",
        label: "PACKAGE.VIEW_MODES.GALLERY",
        template: "templates/setup/parts/package-gallery.hbs"
      },
      TILES: {
        id: "TILES",
        icon: "fa-solid fa-grid-horizontal",
        label: "PACKAGE.VIEW_MODES.TILES",
        template: "templates/setup/parts/package-tiles.hbs"
      },
      DETAILS: {
        id: "DETAILS",
        icon: "fa-solid fa-list",
        label: "PACKAGE.VIEW_MODES.DETAILS",
        template: "templates/setup/parts/package-details.hbs"
      }
    });

    /**
     * The maximum number of progress bars that will be displayed simultaneously.
     * @type {number}
     */
    static MAX_PROGRESS_BARS = 5;

    /* -------------------------------------------- */
    /*  Tabs and Filters                            */
    /* -------------------------------------------- */

    /**
     * The name of the currently active packages tab.
     * @type {string}
     */
    get activeTab() {
      return this._tabs[0].active;
    }

    /* -------------------------------------------- */

    /** @inheritdoc */
    _onChangeTab(event, tabs, active) {
      super._onChangeTab(event, tabs, active);
      this._searchFilters.forEach(f => {
        if ( f._input ) f._input.value = "";
        f.filter(null, "");
      });
      this.element.find(".tab.active .filter > input").trigger("focus");
      document.querySelector(".tab.active > header").insertAdjacentElement("afterend", document.getElementById("progress"));
    }

    /* -------------------------------------------- */

    /** @override */
    _onSearchFilter(event, query, rgx, html) {
      if ( !html ) return;
      let anyMatch = !query;
      const noResults = html.closest("section").querySelector(".no-results");
      for ( const li of html.children ) {
        if ( !query ) {
          li.classList.remove("hidden");
          continue;
        }
        const id = li.dataset.packageId;
        const title = li.querySelector(".package-title")?.textContent;
        let match = rgx.test(id) || rgx.test(SearchFilter.cleanQuery(title));
        li.classList.toggle("hidden", !match);
        if ( match ) anyMatch = true;
      }
      const empty = !anyMatch || !html.children.length;
      html.classList.toggle("empty", empty);
      if ( !anyMatch ) {
        const label = game.i18n.localize(`SETUP.${html.closest(".tab").id.titleCase()}`);
        const search = game.i18n.localize("SETUP.PackagesNoResultsSearch", { name: query});
        noResults.innerHTML = `<p>${game.i18n.format("SETUP.PackagesNoResults", {type: label, name: query})}
      <a class="button search-packages" data-action="installPackage" data-query="${query}">${search}</a></p>`;
      }
      noResults.classList.toggle("hidden", anyMatch);
    }

    /* -------------------------------------------- */
    /*  Rendering                                   */
    /* -------------------------------------------- */

    /** @inheritdoc */
    async _render(force, options) {
      await loadTemplates([
        "templates/setup/parts/package-tags.hbs",
        ...Object.values(SetupPackages.VIEW_MODES).map(m => m.template)
      ]);
      await super._render(force, options);
      const progressBars = document.getElementById("progress");
      progressBars.append(...this.progress.values());
      document.querySelector(".tab.active > header").insertAdjacentElement("afterend", progressBars);
    }

    /* -------------------------------------------- */

    /** @override */
    async getData(options={}) {
      this.#initializePackageFavorites();
      return {
        worlds: {
          packages: this.#prepareWorlds(),
          count: game.worlds.size,
          viewMode: this.#viewModes.worlds,
          template: SetupPackages.VIEW_MODES[this.#viewModes.worlds].template,
          icon: World.icon,
          updatingAll: this.#updatingAll === "world"
        },
        systems: {
          packages: this.#prepareSystems(),
          count: game.systems.size,
          viewMode: this.#viewModes.systems,
          template: SetupPackages.VIEW_MODES[this.#viewModes.systems].template,
          icon: System.icon,
          updatingAll: this.#updatingAll === "system"
        },
        modules: {
          packages: this.#prepareModules(),
          count: game.modules.size,
          viewMode: this.#viewModes.modules,
          template: SetupPackages.VIEW_MODES[this.#viewModes.modules].template,
          icon: Module.icon,
          updatingAll: this.#updatingAll === "module"
        },
        viewModes: Object.values(SetupPackages.VIEW_MODES)
      };
    }

    /* -------------------------------------------- */

    /**
     * Prepare data for rendering the Worlds tab.
     * @returns {object[]}
     */
    #prepareWorlds() {
      const codes = CONST.PACKAGE_AVAILABILITY_CODES;
      const worlds = game.worlds.map(world => {
        const w = world.toObject();
        w.authors = this.#formatAuthors(w.authors);
        w.system = game.systems.get(w.system);
        w.thumb = this.#getCover(world) || this.#getCover(w.system) || "ui/anvil-bg.png";
        w.badge = world.getVersionBadge();
        w.systemBadge = world.getSystemBadge();
        w.available = (world.availability <= codes.REQUIRES_UPDATE) || (world.availability === codes.VERIFIED);
        w.lastPlayedDate = new Date(w.lastPlayed);
        w.lastPlayedLabel = this.#formatDate(w.lastPlayedDate);
        w.canPlay = !(world.locked || world.unavailable);
        w.favorite = world.favorite;
        w.locked = world.locked;
        w.shortDesc = TextEditor.previewHTML(w.description);
        return w;
      });
      worlds.sort(this.#sortWorlds);
      return worlds;
    }

    /* -------------------------------------------- */

    #prepareSystems() {
      const systems = game.systems.map(system => {
        const s = system.toObject();
        s.authors = this.#formatAuthors(s.authors);
        s.shortDesc = TextEditor.previewHTML(s.description);
        s.badge = system.getVersionBadge();
        s.favorite = system.favorite;
        s.locked = system.locked;
        s.thumb = this.#getCover(system) || "ui/anvil-bg.png";
        return s;
      });
      systems.sort(this.#sortPackages);
      return systems;
    }

    /* -------------------------------------------- */

    #prepareModules() {
      const modules = game.modules.map(module => {
        const m = module.toObject();
        m.authors = this.#formatAuthors(m.authors);
        m.shortDesc = TextEditor.previewHTML(m.description);
        m.badge = module.getVersionBadge();
        m.favorite = module.favorite;
        m.locked = module.locked;
        m.thumb = this.#getCover(module) || "ui/anvil-bg.png";
        return m;
      });
      modules.sort(this.#sortPackages);
      return modules;
    }

    /* -------------------------------------------- */

    /**
     * Obtain a cover image used to represent the package.
     * Prefer the "setup" media type, and prefer a thumbnail to the full image.
     * Otherwise, use a background image if the package has one.
     * @param {BasePackage} pkg     The package which requires a cover image
     * @returns {string}            A cover image URL or undefined
     */
    #getCover(pkg) {
      if ( !pkg ) return undefined;
      if ( pkg.media.size ) {
        const setup = pkg.media.find(m => m.type === "setup");
        if ( setup?.thumbnail ) return setup.thumbnail;
        else if ( setup?.url ) return setup.url;
      }
      if ( pkg.background ) return pkg.background;
    }

    /* -------------------------------------------- */

    #formatAuthors(authors=[]) {
      return authors.map(a => {
        if ( a.url ) return `<a href="${a.url}" target="_blank">${a.name}</a>`;
        return a.name;
      }).join(", ");
    }

    /* -------------------------------------------- */

    /**
     * Format dates displayed in the app.
     * @param {Date} date     The Date instance to format
     * @returns {string}      The formatted date string
     */
    #formatDate(date) {
      return date.isValid() ? date.toLocaleDateString(game.i18n.lang, {
        weekday: "long",
        month: "short",
        day: "numeric"
      }) : "";
    }

    /* -------------------------------------------- */

    /**
     * A sorting function used to order worlds.
     * @returns {number}
     */
    #sortWorlds(a, b) {

      // Favorites
      const fd = b.favorite - a.favorite;
      if ( fd !== 0 ) return fd;

      // Sort date
      const ad = a.lastPlayedDate.isValid() ? a.lastPlayedDate : 0;
      const bd = b.lastPlayedDate.isValid() ? b.lastPlayedDate : 0;
      if ( ad && !bd ) return -1;
      if ( bd && !ad ) return 1;
      if ( ad && bd ) return bd - ad;

      // Sort title
      return a.title.localeCompare(b.title);
    }

    /* -------------------------------------------- */

    /**
     * A sorting function used to order systems and modules.
     * @param {ClientPackage} a   A system or module
     * @param {ClientPackage} b   Another system or module
     * @returns {number}          The relative sort order between the two
     */
    #sortPackages(a, b) {
      return (b.favorite - a.favorite) || a.title.localeCompare(b.title);
    }

    /* -------------------------------------------- */
    /*  Interactivity                               */
    /* -------------------------------------------- */

    /** @inheritDoc */
    activateListeners(html) {
      super.activateListeners(html);
      html.on("click", "[data-action]", this.#onClickAction.bind(this));
      html.on("click", "[data-tour]", this.#onClickTour.bind(this));

      // Context Menu for package management
      new ContextMenu(html, ".package", [], {onOpen: this.#setContextMenuItems.bind(this)});

      // Intersection observer for world background images
      const observer = new IntersectionObserver(this.#onLazyLoadImages.bind(this), { root: html[0] });
      const systems = html.find("#systems-list")[0].children;
      for ( const li of html.find("#worlds-list")[0].children ) observer.observe(li);
      for ( const li of systems ) observer.observe(li);
      for ( const li of html.find("#modules-list")[0].children ) observer.observe(li);

      // If there are no systems, disable the world tab and swap to the systems tab
      if ( systems.length === 0 ) {
        const worldsTab = html.find("[data-tab=worlds]");
        worldsTab.addClass("disabled");
        worldsTab.removeClass("active");
        // Only activate systems if modules is not the active tab
        if ( this.activeTab !== "modules" ) {
          html.find("[data-tab=systems").addClass("active");
        }
      }
    }

    /* -------------------------------------------- */

    /**
     * Dynamically assign context menu options depending on the package that is interacted with.
     * @param {HTMLLIElement} li      The HTML <li> element to which the context menu is attached
     */
    #setContextMenuItems(li) {
      const packageType = li.closest("[data-package-type]").dataset.packageType;
      const typeLabel = game.i18n.localize(`PACKAGE.Type.${packageType}`);
      const collection = PACKAGE_TYPES[packageType].collection;
      const pkg = game[collection].get(li.dataset.packageId);
      const menuItems = [];

      // Launch World
      if ( (packageType === "world") && !pkg.locked && !pkg.unavailable ) menuItems.push({
        name: "SETUP.WorldLaunch",
        icon: '<i class="fas fa-circle-play"></i>',
        callback: () => this.#launchWorld(pkg)
      });

      // Edit World
      if ( (packageType === "world") && !pkg.locked ) menuItems.push({
        name: "SETUP.WorldEdit",
        icon: '<i class="fas fa-edit"></i>',
        callback: () => new WorldConfig(pkg).render(true)
      });

      // Edit Module
      if ( (packageType === "module") && !pkg.locked ) menuItems.push({
        name: "PACKAGE.ModuleEdit",
        icon: '<i class="fas fa-edit"></i>',
        callback: () => new ModuleConfigurationForm(pkg.toObject()).render(true)
      });

      // Mark or Unmark Favorite
      menuItems.push({
        name: game.i18n.format(pkg.favorite ? "PACKAGE.Unfavorite" : "PACKAGE.Favorite"),
        icon: `<i class="${pkg.favorite ? "fa-regular fa-star" : "fa-solid fa-star"}"></i>`,
        callback: () => this.#toggleFavorite(pkg)
      });

      // Lock or Unlock Package
      menuItems.push({
        name: game.i18n.format(pkg.locked ? "PACKAGE.Unlock" : "PACKAGE.Lock", {type: typeLabel}),
        icon: `<i class="fas fa-${pkg.locked ? "lock": "unlock"}"></i>`,
        callback: () => this.#toggleLock(pkg)
      });

      // Delete Package
      menuItems.push({
        name: packageType === "world" ? "SETUP.WorldDelete" : "SETUP.Uninstall",
        icon: '<i class="fas fa-trash"></i>',
        callback: () => Setup.uninstallPackage(pkg)
      });
      ui.context.menuItems = menuItems;
    }

    /* -------------------------------------------- */

    /**
     * Handle click events on an action button.
     * @param {PointerEvent} event      The initiating click event
     */
    async #onClickTour(event) {
      event.preventDefault();

      // Gather data
      const link = event.currentTarget;

      // Delegate tour
      switch ( link.dataset.tour ) {
        case "creatingAWorld":
          return game.tours.get("core.creatingAWorld").start();
        case "installingASystem":
          return game.tours.get("core.installingASystem").start();
      }
    }

    /* -------------------------------------------- */

    /**
     * Handle click events on an action button.
     * @param {PointerEvent} event      The initiating click event
     */
    async #onClickAction(event) {
      event.preventDefault();

      // Gather data
      const button = event.currentTarget;
      const packageType = button.closest("[data-package-type]").dataset.packageType;
      const packageId = button.closest(".package")?.dataset.packageId;
      const pkg = packageId ? game[PACKAGE_TYPES[packageType].collection].get(packageId) : undefined;

      // Delegate action
      switch ( button.dataset.action ) {
        case "installPackage":
          await Setup.browsePackages(packageType, {search: button.dataset.query});
          break;
        case "moduleCreate":
          new ModuleConfigurationForm().render(true);
          break;
        case "updateAll":
          await this.#updateAll(packageType);
          break;
        case "updatePackage":
          await this.#updatePackage(pkg);
          break;
        case "viewMode":
          this.#onChangeViewMode(button);
          break;
        case "worldCreate":
          this.#createWorld();
          break;
        case "worldInstall":
          await Setup.browsePackages(packageType);
          break;
        case "worldLaunch":
          await this.#launchWorld(pkg);
          break;
      }
    }

    /* -------------------------------------------- */

    /**
     * Handle toggling the view mode for a certain package type.
     * @param {HTMLElement} button    The clicked button element
     */
    #onChangeViewMode(button) {
      const tab = button.closest(".tab").dataset.tab;
      this.#viewModes[tab] = button.dataset.viewMode;
      game.settings.set("core", "setupViewModes", this.#viewModes);
      this.render();
    }

    /* -------------------------------------------- */

    /**
     * Handle lazy loading for world background images to only load them once they become observed.
     * @param {IntersectionObserverEntry[]} entries   The entries which are now observed
     * @param {IntersectionObserver} observer         The intersection observer instance
     */
    #onLazyLoadImages(entries, observer) {
      for ( const e of entries ) {
        if ( !e.isIntersecting ) continue;
        const li = e.target;
        const img = li.querySelector(".thumbnail");
        if ( img?.dataset.src ) {
          img.src = img.dataset.src;
          delete img.dataset.src;
        }
        observer.unobserve(li);
      }
    }

    /* -------------------------------------------- */


    /**
     * Display a confirmation dialog which warns the user that launching the world will trigger irreversible migration.
     * @param {World} world           The World being launched
     * @returns {Promise<boolean>}    Did the user agree to proceed?
     */
    async #displayWorldMigrationInfo(world) {
      if ( !world ) return false;
      if ( !foundry.utils.isNewerVersion(game.release.version, world.coreVersion) ) return true;

      // Prompt that world migration will be required
      const system = game.systems.get(world.system);
      const title = game.i18n.localize("SETUP.WorldMigrationRequiredTitle");
      const disableModules = game.release.isGenerationalChange(world.compatibility.verified);
      const content = [
        game.i18n.format("SETUP.WorldMigrationRequired", {
          world: world.title,
          oldVersion: world.coreVersion,
          newVersion: game.release
        }),
        system.availability !== CONST.PACKAGE_AVAILABILITY_CODES.VERIFIED
          ? game.i18n.format("SETUP.WorldMigrationSystemUnavailable", {
            system: system.title,
            systemVersion: system.version
          })
          : "",
        disableModules ? game.i18n.localize("SETUP.WorldMigrationDisableModules") : "",
        game.i18n.localize("SETUP.WorldMigrationBackupPrompt")
      ].filterJoin("");

      // Present the confirmation dialog
      const confirm = await Dialog.wait({
        title, content, default: "no",
        buttons: {
          yes: {
            icon: '<i class="fa-solid fa-laptop-arrow-down"></i>',
            label: game.i18n.localize("SETUP.WorldMigrationBegin"),
            callback: () => true
          },
          no: {
            icon: '<i class="fas fa-times"></i>',
            label: game.i18n.localize("Cancel"),
            callback: () => false
          }
        },
        close: () => false
      });

      // Notify migration in progress
      if ( confirm ) {
        const msg = game.i18n.format("SETUP.WorldMigrationInProcess", {version: game.release});
        ui.notifications.info(msg, {permanent: true});
      }
      return confirm;
    }
    /* -------------------------------------------- */
    /*  Package Management Operations               */
    /* -------------------------------------------- */

    /**
     * Create a new World.
     */
    #createWorld() {
      if ( !game.systems.size ) return ui.notifications.warn(game.i18n.localize("SETUP.YouMustInstallASystem"));
      const world = new World({name: "1", title: "1", system: "1", coreVersion: game.release.version});
      world.id = world.title = world.system = "";
      new WorldConfig(world, {create: true}).render(true);
    }

    /* -------------------------------------------- */

    /**
     * Request to launch a World.
     * @param {World} world           The requested World to launch
     * @returns {Promise<object>}     Returned response from the server which automatically redirects
     */
    async #launchWorld(world) {
      if ( world.locked ) return ui.notifications.error(game.i18n.format("PACKAGE.LaunchLocked", {id: world.id}));
      const confirm = await this.#displayWorldMigrationInfo(world);
      if ( !confirm ) return;

      // Show progress spinner and disable interaction with worlds.
      const worlds = document.getElementById("worlds-list");
      worlds.classList.add("disabled");
      const tile = worlds.querySelector(`.world[data-package-id="${world.id}"]`);
      tile.classList.add("loading");
      const icon = tile.querySelector(`.control.play > i`);
      icon.setAttribute("class", "fas fa-spinner fa-spin-pulse");

      // Fire world launch request.
      const error = ({ message, stack }) => {
        const err = new Error(message);
        err.stack = stack;
        console.error(err);
        ui.notifications.error(game.i18n.format("SETUP.WorldLaunchFailure", { message }), {
          console: false,
          permanent: true
        });
        Setup._removeProgressListener(progress);
        this.render();
      };

      const progress = data => {
        this.onProgress(data);
        if ( data.step === CONST.SETUP_PACKAGE_PROGRESS.STEPS.ERROR ) error(data);
        if ( data.step === CONST.SETUP_PACKAGE_PROGRESS.STEPS.COMPLETE ) location.href = foundry.utils.getRoute("/game");
      };

      Setup._addProgressListener(progress);
      return Setup.post({action: "launchWorld", world: world.id}, {timeoutMs: null});
    }

    /* -------------------------------------------- */

    /**
     * Toggle marking a package as a favorite.
     * @param {BasePackage} pkg       The requested Package to mark or unmark as a favorite
     */
    async #toggleFavorite(pkg) {
      const favorites = game.settings.get("core", Setup.FAVORITE_PACKAGES_SETTING);
      const collectionName = PACKAGE_TYPES[pkg.type].collection;
      if ( pkg.favorite ) favorites[collectionName].findSplice(f => f === pkg.id);
      else favorites[collectionName].push(pkg.id);
      game.settings.set("core", Setup.FAVORITE_PACKAGES_SETTING, favorites);
      pkg.favorite = !pkg.favorite;
      this.render();
    }

    /* -------------------------------------------- */

    /**
     * Toggle locking or unlocking a package.
     * @param {BasePackage} pkg       The requested Package to lock or unlock
     * @returns {Promise<object>}     Returned response from the server
     */
    async #toggleLock(pkg) {
      const shouldLock = !pkg.locked;
      await Setup.post({action: "lockPackage", type: pkg.type, id: pkg.id, shouldLock});
      pkg.locked = shouldLock;
      this.render();
    }

    /* -------------------------------------------- */

    /**
     * Handle update button press for a single Package.
     * @param {BasePackage} pkg       The requested Package to update
     * @param {object} [options]      Options which configure installation
     * @param {boolean} [options.notify=true]   Display a notification toast. Suppressed for "updateAll"
     * @returns {Promise<void>}
     */
    async #installPackageUpdate(pkg, {notify=true}={}) {
      return Setup.installPackage({type: pkg.type, id: pkg.id, manifest: pkg.manifest, notify});
    }

    /* -------------------------------------------- */

    /**
     * Update all package for a certain package type.
     * @param {string} packageType    The package type to update
     * @returns {Promise<void>}
     */
    async #updateAll(packageType) {
      if ( this.#updatingAll ) return ui.notifications.warn("PACKAGE.UpdateAllInProgress", {localize: true});
      this.#updatingAll = packageType;

      // Disable the "Update All" button
      let button = this.element[0].querySelector(`[data-package-type="${packageType}"] [data-action="updateAll"]`);
      button.disabled = true;
      button.firstElementChild.className = "fas fa-spinner fa-spin";

      // Create two queues
      const max = SetupPackages.MAX_PROGRESS_BARS;
      const pending = game[PACKAGE_TYPES[packageType].collection].filter(p => p.manifest && !p.locked);
      const active = new Set();
      const results = [];
      let requireReload = false;

      // Populate the package cache
      console.group(`${vtt} | Updating ${packageType.titleCase()}s`);
      await Setup.warmPackages({type: packageType});
      console.debug(`Warmed ${packageType} package cache`);

      // A semaphore which updates a certain number of packages concurrently
      let complete;
      const next = () => {
        while ( (active.size < max) && pending.length ) {
          const pkg = pending.shift();
          active.add(pkg);
          update(pkg);
        }
        if ( !pending.length && !active.size ) complete();
      };

      // Update function
      const update = async pkg => {
        console.debug(`Checking ${packageType} ${pkg.id} for updates`);
        const check = await this.#updateCheck(pkg);
        switch ( check.state ) {

          // Error
          case "error":
            results.push({
              package: pkg,
              action: game.i18n.localize("Error"),
              actionClass: "error",
              description: check.error
            });
            console.debug(`Checked ${packageType} ${pkg.id}: error`);
            break;

          // Warning
          case "warning":
            results.push({
              package: pkg,
              action: game.i18n.localize("Warning"),
              actionClass: "warning",
              description: check.warning
            });
            console.debug(`Checked ${packageType} ${pkg.id}: warning`);
            break;

          // Sidegrade
          case "sidegrade":
            requireReload = true;
            console.debug(`Checked ${packageType} ${pkg.id}: sidegrade`);
            break;

          // Track Change
          case "trackChange":
            const confirm = await this.#promptTrackChange(pkg, check.trackChange);
            if ( confirm ) {
              pkg.updateSource({manifest: check.trackChange.manifest});
              try {
                const trackChangeUpdate = await this.#installPackageUpdate(pkg, {notify: false});
                results.push({
                  package: trackChangeUpdate,
                  action: game.i18n.localize("Update"),
                  actionClass: "success",
                  description: `${pkg.version} ➞ ${trackChangeUpdate.version}`
                });
                console.debug(`${vtt} | Checked ${packageType} ${pkg.id}: track change success`);
              } catch(err) {
                results.push({
                  package: pkg,
                  action: game.i18n.localize("Error"),
                  actionClass: "error",
                  description: err.message
                });
                console.debug(`Checked ${packageType} ${pkg.id}: track change failed`);
              }
            }
            else console.debug(`Checked ${packageType} ${pkg.id}: track change declined`);
            break;

          // Standard Update
          case "update":
            try {
              const updated = await this.#installPackageUpdate(pkg, {notify: false});
              results.push({
                package: updated,
                action: game.i18n.localize("Update"),
                actionClass: "success",
                description: `${pkg.version} ➞ ${updated.version}`
              });
              console.debug(`Checked ${packageType} ${pkg.id}: update success`);
            } catch(err) {
              results.push({
                package: pkg,
                action: game.i18n.localize("Error"),
                actionClass: "error",
                description: err.message
              });
              console.debug(`Checked ${packageType} ${pkg.id}: update failed`);
            }
            break;

          case "current":
            console.debug(`Checked ${packageType} ${pkg.id}: current`);
            break;

          // Unknown
          default:
            console.warn(`Checked ${packageType} ${pkg.id}: unknown state`);
            break;
        }
        active.delete(pkg);
        next();
      };

      // Wait for completion
      await new Promise(resolve => {
        complete = resolve;
        next();
      });
      console.debug("Update check complete");

      // Display Update Log
      if ( results.length ) {
        let content = await renderTemplate("templates/setup/updated-packages.html", {changed: results});
        await Dialog.prompt({
          title: game.i18n.localize("SETUP.UpdatedPackages"),
          content: content,
          options: {width: 700},
          rejectClose: false
        });
      }

      // No results
      else ui.notifications.info(game.i18n.format("PACKAGE.AllUpdated", {
        type: game.i18n.localize(`PACKAGE.Type.${packageType}Pl`)
      }));
      console.groupEnd();

      // Reload package data
      if ( requireReload ) await Setup.reload();

      // Re-enable the "Update All" button
      button = this.element[0].querySelector(`[data-package-type="${packageType}"] [data-action="updateAll"]`);
      button.disabled = false;
      button.firstElementChild.className = "fas fa-cloud-download";

      this.#updatingAll = null;
    }

    /* -------------------------------------------- */

    /**
     * Check for an available update for a specific package
     * @param {Package} pkg     The package to check
     */
    async #updatePackage(pkg) {
      // Disable the "Update" button
      let button = this.element[0].querySelector(`[data-package-id="${pkg.id}"] [data-action="updatePackage"]`);
      button.disabled = true;
      button.firstElementChild.className = "fas fa-spinner fa-spin";

      const check = await this.#updateCheck(pkg);
      switch ( check.state ) {
        case "error":
          ui.notifications.error(check.error, {permanent: true});
          break;
        case "warning":
          ui.notifications.warn(check.warning);
          break;
        case "sidegrade":
          await Setup.reload();
          break;
        case "trackChange":
          const accepted = await this.#promptTrackChange(pkg, check.trackChange);
          if ( accepted ) {
            pkg.updateSource({manifest: check.trackChange.manifest});
            await this.#installPackageUpdate(pkg);
          }
          break;
        case "current":
          await ui.notifications.info(game.i18n.format("PACKAGE.AlreadyUpdated", {name: pkg.title}));
          break;
        case "update":
          await this.#installPackageUpdate(pkg);
          break;
      }

      // Re-enable the "Update" button
      button = this.element[0].querySelector(`[data-package-id="${pkg.id}"] [data-action="updatePackage"]`);
      button.disabled = false;
      button.firstElementChild.className = "fas fa-sync-alt";
    }

    /* -------------------------------------------- */

    /**
     * @typedef {object} PackageCheckResult
     * @property {BasePackage} package                                The checked package
     * @property {string} state                                       The State of the check, from [ "error", "sidegrade", "trackChange", "warning", "update", "current", "unknown" ]
     * @property {string} [error]                                     An error to display, if any
     * @property {string} [warning]                                   A warning to display, if any
     * @property {manifest: string, version: string} [trackChange]    The suggested track change, if any
     * @property {string} [manifest]                                  The manifest of the Update, if any
     */

    /**
     * Execute upon an update check for a single Package
     * @param {BasePackage} pkg                  The Package to check
     * @returns {Promise<PackageCheckResult>}    The status of the update check
     */
    async #updateCheck(pkg) {
      const checkData = {package: pkg, state: "unknown"};
      let responseData;
      let manifestData;

      // Check whether an update is available
      try {
        responseData = await Setup.checkPackage({type: pkg.type, id: pkg.id});
        manifestData = responseData.remote;
      } catch(err) {
        checkData.state = "error";
        checkData.error = err.toString();
        return checkData;
      }

      // Metadata sidegrade performed
      if ( responseData.hasSidegraded ) {
        checkData.state = "sidegrade";
        return checkData;
      }

      // Track change suggested
      if ( responseData.trackChange ) {
        checkData.state = "trackChange";
        checkData.trackChange = responseData.trackChange;
        checkData.manifest = responseData.trackChange.manifest;
        return checkData;
      }

      // Verify remote manifest compatibility with current software
      const availability = responseData.availability;
      const codes = CONST.PACKAGE_AVAILABILITY_CODES;

      // Unsupported updates
      const wrongCore = [
        codes.REQUIRES_CORE_UPGRADE_STABLE, codes.REQUIRES_CORE_UPGRADE_UNSTABLE, codes.REQUIRES_CORE_DOWNGRADE
      ];
      if ( responseData.isUpgrade && wrongCore.includes(availability) ) {
        checkData.state = "warning";
        const message = { 6: "Insufficient", 7: "UpdateNeeded", 8: "Unstable" }[availability];
        const rcur = availability === codes.REQUIRES_CORE_UPGRADE_UNSTABLE;
        checkData.warning = game.i18n.format(`SETUP.PackageUpdateCore${message}`, {
          id: manifestData.id,
          vmin: manifestData.compatibility.minimum,
          vmax: manifestData.compatibility.maximum,
          vcur: rcur ? game.version : undefined
        });
        return checkData;
      }

      // Available updates
      if ( responseData.isUpgrade && (availability <= codes.UNVERIFIED_GENERATION) ) {
        checkData.state = "update";
        checkData.manifest = manifestData.manifest;
        return checkData;
      }

      // Packages which are already current
      checkData.state = "current";
      return checkData;
    }

    /* -------------------------------------------- */

    /**
     * Prompt the user to use a new Package track it if they haven't previously declined.
     * @param {BasePackage} pkg                                     The Package being updated
     * @param {{manifest: string, version: string}} trackChange     A recommended track change provided by the server
     * @returns {Promise<boolean>}                                  Whether the recommended track change was accepted
     */
    async #promptTrackChange(pkg, trackChange) {

      // Verify that the user has not already declined a suggested track change
      const declinedManifestUpgrades = game.settings.get("core", "declinedManifestUpgrades");
      if ( declinedManifestUpgrades[pkg.id] === pkg.version ) return false;

      // Generate dialog HTML
      const content = await renderTemplate("templates/setup/manifest-update.html", {
        localManifest: pkg.manifest,
        localTitle: game.i18n.format("SETUP.PriorManifestUrl", {version: pkg.version}),
        remoteManifest: trackChange.manifest,
        remoteTitle: game.i18n.format("SETUP.UpdatedManifestUrl", {version: trackChange.version}),
        package: pkg.title
      });

      // Prompt for confirmation
      const accepted = await Dialog.confirm({
        title: `${pkg.title} ${game.i18n.localize("SETUP.ManifestUpdate")}`,
        content,
        yes: () => {
          delete declinedManifestUpgrades[pkg.id];
          return true;
        },
        no: () => {
          declinedManifestUpgrades[pkg.id] = pkg.version;
          return false;
        },
        defaultYes: true
      });
      await game.settings.set("core", "declinedManifestUpgrades", declinedManifestUpgrades);
      return accepted;
    }

    /* -------------------------------------------- */
    /*  Installation Progress Bar                   */
    /* -------------------------------------------- */

    /**
     * Update the UI progress bar in response to server progress ticks.
     * @param {object} [progress]
     * @param {string} progress.action   The progress action.
     * @param {string} progress.id       The package ID.
     * @param {number} progress.pct      The progress percentage.
     * @param {string} progress.step     The individual step in the action.
     * @param {string} progress.message  The text status message.
     */
    onProgress({action, id, pct, step, message}={}) {
      const protocol = CONST.SETUP_PACKAGE_PROGRESS;
      if ( ![protocol.ACTIONS.INSTALL_PKG, protocol.ACTIONS.LAUNCH_WORLD].includes(action) ) return;
      if ( step === protocol.STEPS.VEND ) return this.#removeProgressBar(id);
      const bar = this.#getProgressBar(id);
      if ( bar && Number.isNumeric(pct) ) {
        const status = [message ? game.i18n.localize(message) : null, id, `${pct}%`].filterJoin(" ");
        bar.firstElementChild.style.maxWidth = `${pct}%`;
        bar.firstElementChild.firstElementChild.innerText = status;
      }
    }

    /* -------------------------------------------- */

    /**
     * Get the progress bar element used to track installation for a certain package ID.
     * @param {string} packageId        The package being installed
     * @returns {HTMLDivElement|null}   The progress bar element to use
     */
    #getProgressBar(packageId) {

      // Existing bar
      let bar = this.progress.get(packageId);
      if ( bar ) return bar;

      // Too many bars
      if ( this.progress.size >= SetupPackages.MAX_PROGRESS_BARS ) return null;

      // New Bar
      const d = document.createElement("div");
      d.innerHTML = `
    <div class="progress-bar">
        <div class="bar">
            <span class="pct"></span>
        </div>
    </div>`;
      bar = d.firstElementChild;
      this.progress.set(packageId, bar);

      // Add to DOM
      document.getElementById("progress").appendChild(bar);
      return bar;
    }

    /* -------------------------------------------- */

    /**
     * Remove a Progress Bar from the DOM and from the progress mapping.
     * @param {string} packageId        The package ID that is no longer being tracked
     */
    #removeProgressBar(packageId) {
      const bar = this.progress.get(packageId);
      if ( bar ) {
        bar.remove();
        this.progress.delete(packageId);
      }
    }
  }

  /**
   * @typedef {Object} NewsItem
   * @property {string} title           The title of the featured item
   * @property {string} image           The background image URL
   * @property {string} url             The website URL where clicking on the link should lead
   * @property {string} [caption]       A caption used for featured content
   */

  /**
   * An application that renders the Setup sidebar containing News and Featured Content widgets
   */
  class SetupSidebar extends Application {

    /** @inheritdoc */
    static get defaultOptions() {
      return foundry.utils.mergeObject(super.defaultOptions, {
        id: "setup-sidebar",
        template: "templates/setup/setup-sidebar.hbs",
        popOut: false
      });
    }

    /* -------------------------------------------- */

    /** @override */
    async getData(options) {
      return {
        featured: game.data.featuredContent,
        news: game.data.news
      };
    }
  }

  /**
   * An application which displays Foundry Virtual Tabletop release notes to the user during the update progress.
   */
  class UpdateNotes extends Application {
    constructor(target, options) {
      super(options);
      this.target = target;
      this.candidateReleaseData = new foundry.config.ReleaseData(this.target);
      ui.updateNotes = this;
    }

    /* ----------------------------------------- */

    /** @override */
    static get defaultOptions() {
      return foundry.utils.mergeObject(super.defaultOptions, {
        id: "update-notes",
        template: "templates/setup/update-notes.hbs",
        width: 720
      });
    }

    /* ----------------------------------------- */

    /** @override */
    get title() {
      return `Update Notes - ${this.candidateReleaseData.display}`;
    }

    /* ----------------------------------------- */

    /** @override */
    async getData(options={}) {
      return {
        notes: this.target.notes
      }
    }

    /* ----------------------------------------- */

    /** @override */
    activateListeners(html) {
      super.activateListeners(html);
      html.find("button").click(ev => {
        ev.preventDefault();
        ev.currentTarget.disabled = true;
        document.getElementById("update-core").click();
      });
    }

    /* ----------------------------------------- */

    /**
     * Update the button at the footer of the Update Notes application to reflect the current status of the workflow.
     * @param {object} progressData       Data supplied by SetupConfig#_onCoreUpdate
     */
    static updateButton(progressData) {
      const notes = ui.updateNotes;
      if ( !notes?.rendered ) return;
      const button = notes.element.find("button")[0];
      if ( !button ) return;
      const icon = button.querySelector("i");
      icon.className = progressData.pct < 100 ? "fas fa-spinner fa-pulse" : "fas fa-check";
      const label = button.querySelector("label");
      label.textContent = game.i18n.localize(progressData.step);
    }
  }

  /**
   * The software update application.
   */
  class SetupUpdate extends Application {

    /** @override */
    static get defaultOptions() {
      return foundry.utils.mergeObject(super.defaultOptions, {
        id: "setup-update",
        template: "templates/setup/setup-update.hbs",
        popOut: false,
      });
    }

    /**
     * The current update step. Either "updateCheck" or "updateDownload"
     * @type {string}
     */
    #action = "updateCheck";

    /**
     * The currently bound update progress listener
     * @type {function}
     */
    #onProgress;

    /* -------------------------------------------- */

    /** @override */
    getData(options={}) {
      const canReachInternet = game.data.addresses.remote;
      const couldReachWebsite = game.data.coreUpdate.couldReachWebsite;
      return {
        coreVersion: game.version,
        release: game.release,
        coreVersionHint: game.i18n.format("SETUP.CoreVersionHint", {versionDisplay: game.release.display}),
        updateChannel: game.data.options.updateChannel,
        updateChannels: Object.entries(CONST.SOFTWARE_UPDATE_CHANNELS).reduce((obj, c) => {
          obj[c[0]] = game.i18n.localize(c[1]);
          return obj;
        }, {}),
        updateChannelHints: Object.entries(CONST.SOFTWARE_UPDATE_CHANNELS).reduce((obj, c) => {
          obj[c[0]] = game.i18n.localize(`${c[1]}Hint`);
          return obj;
        }, {}),
        coreUpdate: game.data.coreUpdate.hasUpdate ? game.i18n.format("SETUP.UpdateAvailable", game.data.coreUpdate) : false,
        canReachInternet: canReachInternet,
        couldReachWebsite: couldReachWebsite,
        slowResponse: game.data.coreUpdate.slowResponse,
        updateButtonEnabled: canReachInternet && couldReachWebsite
      };
    }

    /* -------------------------------------------- */
    /*  Event Listeners and Handlers                */
    /* -------------------------------------------- */

    /** @override */
    activateListeners(html) {
      super.activateListeners(html);
      html.find("select[name='updateChannel']").on("change", this.#onChangeChannel.bind(this));
      html.find("button[data-action]").on("click", this.#onClickButton.bind(this));
      html.submit(this.#onSubmit.bind(this));
    }

    /* -------------------------------------------- */

    /**
     * Handle update application button clicks.
     * @param {PointerEvent} event  The triggering click event.
     */
    #onClickButton(event) {
      event.preventDefault();
      const button = event.currentTarget;
      switch ( button.dataset.action ) {
        case "setup":
          window.location.href = foundry.utils.getRoute("setup");
          break;
      }
    }

    /* -------------------------------------------- */

    /**
     * When changing the software update channel, reset the state of the update button and "Force Update" checkbox.
     * Clear results from a prior check to ensure that users don't accidentally perform an update for some other channel.
     * @param {Event} event     The select change event
     */
    async #onChangeChannel(event) {
      this.#action = "updateCheck"; // reset the action
      const button = document.getElementById("update-core");
      button.children[1].textContent = game.i18n.localize("SETUP.UpdateCheckFor");
      const check = document.querySelector("input[name='forceUpdate']");
      check.checked = false;
    }

    /* -------------------------------------------- */

    /**
     * Handle button clicks to update the core VTT software
     * @param {Event} event
     */
    async #onSubmit(event) {
      event.preventDefault();
      const form = event.currentTarget;
      const button = form.querySelector("#update-core");
      const label = button.querySelector("label");

      // Disable the form
      button.disabled = true;
      form.disabled = true;

      // Bind the progress listener
      if ( this.#action === "updateDownload" ) {
        this.#onProgress = this.#onUpdateProgress.bind(this);
        Setup._addProgressListener(this.#onProgress);
      }

      // Prepare request data
      const requestData = {
        action: this.#action,
        updateChannel: form.updateChannel.value,
        forceUpdate: form.forceUpdate.checked
      };

      // Submit request
      let response;
      try {
        response = await Setup.post(requestData);
      } catch(err) {
        button.disabled = false;
        form.disabled = false;
        throw err;
      }

      // Display response info
      if ( response.info || response.warn ) {
        button.disabled = false;
        form.disabled = false;
        return response.info
          ? ui.notifications.info(response.info, {localize: true})
          : ui.notifications.warn(response.warn, {localize: true});
      }

      // Proceed to download step
      if ( this.#action === "updateCheck" ) {

        // Construct the release data
        const releaseData = new foundry.config.ReleaseData(response);
        ui.notifications.info(game.i18n.format("SETUP.UpdateInfoAvailable", {display: releaseData.display}));

        // Update the button
        this.#action = "updateDownload";
        label.textContent = game.i18n.format("SETUP.UpdateButtonDownload", {display: releaseData.display});
        button.disabled = false;

        // Render release notes
        if ( response.notes ) new UpdateNotes(response).render(true);

        // Warn about module disabling
        if ( response.willDisableModules ) {
          ui.notifications.warn(game.i18n.format("SETUP.UpdateWarningWillDisable", {
            nIncompatible: game.modules.filter(m => m.incompatible).length,
            nModules: game.modules.size
          }), {permanent: true});
        }
      }
    }

    /* -------------------------------------------- */
    /*  Socket Listeners and Handlers               */
    /* -------------------------------------------- */

    /**
     * The progress function registered with Setup._progressListeners
     * @param {{type: string, step: string, pct: number, message: string}} data    Progress data emitted by the server
     */
    #onUpdateProgress(data) {
      const steps = CONST.SETUP_PACKAGE_PROGRESS.STEPS;

      // Complete update
      if ( [steps.COMPLETE, steps.ERROR].includes(data.step) ) {
        Setup._removeProgressListener(this.#onProgress);
        this.#onProgress = undefined;

        // Re-enable the form
        const form = this.element[0];
        form.disabled = false;

        // Display a notification message
        const level = data.step === steps.COMPLETE ? "info" : "error";
        ui.notifications[level](data.message, {localize: true, permanent: true});
        ui.updateNotes.close();
      }

      // Update the release notes
      else {
        UpdateNotes.updateButton(data);
        ui.updateNotes.setPosition({height: "auto"});
      }

      // Update progress bar
      this.#updateProgressBar(data);
      this.#updateProgressButton(data);
    }

    /* -------------------------------------------- */

    /**
     * Update the display of an installation progress bar for a particular progress packet
     * @param {object} data   The progress update data
     */
    #updateProgressBar(data) {
      const progress = document.getElementById("update-progress");

      // Update Bar
      const bar = progress.firstElementChild;
      bar.style.maxWidth = `${data.pct}%`;

      // Update Label
      const label = bar.firstElementChild;
      label.innerText = `${game.i18n.localize(data.message)} ${data.pct}%`;
      const steps = CONST.SETUP_PACKAGE_PROGRESS.STEPS;
      progress.style.display = [steps.COMPLETE, steps.ERROR].includes(data.step) ? "" : "initial";
    }

    /* -------------------------------------------- */

    /**
     * Update installation progress for a particular button which triggered the action
     * @param {object} data   The progress update data
     */
    #updateProgressButton(data) {
      const button = document.getElementById("update-core");
      button.disabled = data.pct < 100;

      // Update Icon
      const steps = CONST.SETUP_PACKAGE_PROGRESS.STEPS;
      const icon = button.firstElementChild;
      if ( data.step === steps.ERROR ) icon.className = "fas fa-times";
      else if ( data.step === steps.COMPLETE ) icon.className = "fas fa-check";
      else icon.className = "fas fa-spinner fa-pulse";

      // Update label
      const label = icon.nextElementSibling;
      label.textContent = game.i18n.localize(data.message);
    }
  }

  /**
   * The User Management setup application.
   * @param {Users} object                      The {@link Users} object being configured.
   * @param {FormApplicationOptions} [options]  Application configuration options.
   */
  class UserManagement extends FormApplication {

    /** @inheritdoc */
    static get defaultOptions() {
      return foundry.utils.mergeObject(super.defaultOptions, {
        id: "manage-players",
        template: "templates/setup/user-management.hbs",
        popOut: false,
        closeOnSubmit: false,
        scrollY: ["#player-list"]
      });
    }

    /* -------------------------------------------- */

    /**
     * The template path used to render a single user entry in the configuration view
     * @type {string}
     */
    static USER_TEMPLATE = "templates/setup/manage-user.hbs";

    /* -------------------------------------------- */

    /** @inheritdoc */
    async _render(...args) {
      await getTemplate(this.constructor.USER_TEMPLATE);
      return super._render(...args);
    }

    /* -------------------------------------------- */

    /** @inheritdoc */
    getData(options={}) {
      return {
        user: game.user,
        users: this.object,
        roles: UserManagement.#getRoleLabels(),
        options: this.options,
        userTemplate: this.constructor.USER_TEMPLATE,
        passwordString: game.data.passwordString
      };
    }

    /* -------------------------------------------- */

    /**
     * Get a mapping of role IDs to labels that should be displayed
     */
    static #getRoleLabels() {
      return Object.entries(CONST.USER_ROLES).reduce((obj, e) => {
        obj[e[1]] = game.i18n.localize(`USER.Role${e[0].titleCase()}`);
        return obj;
      }, {});
    }

    /* -------------------------------------------- */
    /*  Event Listeners and Handlers                */
    /* -------------------------------------------- */

    /** @inheritdoc */
    activateListeners(html) {
      super.activateListeners(html);
      const password = html.find("input[type='password']");
      password.focus(UserManagement.#onPasswordFocus).keydown(UserManagement.#onPasswordKeydown);
      html.on("click", "[data-action]", UserManagement.#onAction);
      html.find("label.show").click(UserManagement.#onShowPassword);
    }

    /* -------------------------------------------- */

    /** @inheritdoc */
    async _updateObject(event, formData) {

      // Construct updates array
      const userData = foundry.utils.expandObject(formData).users;
      const updates = Object.entries(userData).reduce((arr, e) => {
        const [id, data] = e;

        // Identify changes
        const user = game.users.get(id);
        const diff = foundry.utils.diffObject(user.toObject(), data);
        if ( data.password === game.data.passwordString ) delete diff.password;
        else diff.password = data.password;

        // Register changes for update
        if ( !foundry.utils.isEmpty(diff) ) {
          diff._id = id;
          arr.push(diff);
        }
        return arr;
      }, []);

      // The World must have at least one Gamemaster
      if ( !Object.values(userData).some(u => u.role === CONST.USER_ROLES.GAMEMASTER) ) {
        return ui.notifications.error("USERS.NoGMError", {localize: true});
      }

      // Update all users and redirect
      try {
        await User.updateDocuments(updates, {diff: false});
        ui.notifications.info("USERS.UpdateSuccess", {localize: true});
        return setTimeout(() => window.location.href = foundry.utils.getRoute("game"), 1000);
      } catch(err) {
        this.render();
      }
    }

    /* -------------------------------------------- */

    /**
     * Handle focus in and out of the password field.
     * @param {PointerEvent} event     The initiating pointer event
     */
    static #onPasswordFocus(event) {
      event.currentTarget.select();
    }

    /* -------------------------------------------- */

    /**
     * Toggle visibility of the "Show Password" control.
     * @param {KeyboardEvent} event     The initiating keydown event
     */
    static #onPasswordKeydown(event) {
      if ( ["Shift", "Ctrl", "Alt", "Tab"].includes(event.key) ) return;
      const input = event.currentTarget;
      const show = input.parentElement.nextElementSibling;
      show.hidden = false;
    }

    /* -------------------------------------------- */

    /**
     * Handle new user creation event.
     * @param {PointerEvent} event      The originating click event
     */
    static async #onAction(event) {
      event.preventDefault();
      const button = event.currentTarget;
      button.disabled = true;
      switch ( button.dataset.action ) {
        case "create-user":
          await UserManagement.#onUserCreate();
          break;
        case "deleteUser":
          await UserManagement.#onUserDelete(button);
          break;
        case "configure-permissions":
          new PermissionConfig().render(true);
          break;
        case "showPassword":
          UserManagement.#onShowPassword(button);
          break;
      }
      button.disabled = false;
    }

    /* -------------------------------------------- */

    /**
     * Reveal the password that is being configured so the user can verify they have typed it correctly.
     * @param {HTMLAnchorElement} button      The clicked control button
     */
    static #onShowPassword(button) {
      const li = button.closest(".player");
      const label = li.querySelector(".password");
      const input = label.firstElementChild;
      input.type = input.type === "password" ? "text" : "password";
    }

    /* -------------------------------------------- */

    /**
     * Handle creating a new User record in the form.
     */
    static async #onUserCreate() {

      // Create the new User
      let newPlayerIndex = game.users.size + 1;
      while ( game.users.getName(`Player${newPlayerIndex}` )) { newPlayerIndex++; }
      const user = await User.create({
        name: `Player${newPlayerIndex}`,
        role: CONST.USER_ROLES.PLAYER
      });

      // Render the User's HTML
      const html = await renderTemplate(UserManagement.USER_TEMPLATE, {
        user,
        roles: UserManagement.#getRoleLabels()
      });

      // Append the player to the list and restore the button
      $("#player-list").append(html);
    }

    /* -------------------------------------------- */

    /**
     * Handle user deletion event.
     * @param {HTMLAnchorElement} button      The clicked control button
     */
    static #onUserDelete(button) {
      const li = button.closest(".player");
      const user = game.users.get(li.dataset.userId);

      // Craft a message
      let message = `<h4>${game.i18n.localize("AreYouSure")}</h4><p>${game.i18n.localize("USERS.DeleteWarning")}</p>`;
      if (user.isGM) message += `<p class="warning"><strong>${game.i18n.localize("USERS.DeleteGMWarning")}</strong></p>`;

      // Render a confirmation dialog
      new Dialog({
        title: `${game.i18n.localize("USERS.Delete")} ${user.name}?`,
        content: message,
        buttons: {
          yes: {
            icon: '<i class="fas fa-trash"></i>',
            label: game.i18n.localize("Delete"),
            callback: async () => {
              await user.delete();
              li.remove();
            }
          },
          no: {
            icon: '<i class="fas fa-times"></i>',
            label: game.i18n.localize("Cancel")
          }
        },
        default: "yes"
      }).render(true);
    }
  }

  /**
   * An Application that manages the browsing and installation of Packages.
   */
  class InstallPackage extends Application {
    constructor({packageType, category, search}={}, options) {
      super(options);
      this.#packageType = packageType;
      this.#category = category || "all";
      this.#initialSearch = search;
      ui.installPackages = this;
    }

    /**
     * The list of installable packages
     * @type {ClientPackage[]}
     */
    packages;

    /**
     * The list of Tags available
     * @type {Array<object>}
     */
    tags;

    /**
     * The type of package being installed, a value in PACKAGE_TYPES
     * @type {string}
     */
    #packageType;

    /**
     * The package category being browsed
     * @type {string}
     */
    #category;

    /**
     * The current package visibility filter that is applied
     * @type {string}
     */
    #visibility = "all";

    /**
     * An initial provided search filter value.
     * @type {string}
     */
    #initialSearch;

    /**
     * Record the state of user inputs.
     * @type {{filter: string, manifestURL: string}}
     */
    #inputs = {filter: "", manifestURL: ""};

    /* -------------------------------------------- */

    /** @override */
    static get defaultOptions() {
      return foundry.utils.mergeObject(super.defaultOptions, {
        id: "install-package",
        template: "templates/setup/install-package.hbs",
        width: 920,
        height: 780,
        scrollY: [".categories", ".package-list"],
        filters: [{inputSelector: 'input[name="filter"]', contentSelector: ".package-list"}]
      });
    }

    /* -------------------------------------------- */

    /** @override */
    get title() {
      return game.i18n.localize(`SETUP.Install${this.#packageType.titleCase()}`);
    }

    /* -------------------------------------------- */

    /** @inheritDoc */
    async _render(force, options) {
      this.#saveInputs();
      await super._render(force, options);
      this.#restoreInputs();

      const type = this.#packageType;
      if ( Setup.cache[type].state === Setup.CACHE_STATES.COLD ) {
        Setup.warmPackages({type}).then(() => this.render(false));
      }
    }

    /* -------------------------------------------- */

    /** @inheritDoc */
    async getData(options={}) {
      const data = super.getData(options);
      const type = data.packageType = this.#packageType;
      if ( !this.packages?.length || !this.tags?.length ) {
        const {packages, tags} = await InstallPackage.getTaggedPackages(type);
        this.packages = packages;
        this.tags = tags;
      }

      // Loading Progress
      if ( Setup.cache[type].state < Setup.CACHE_STATES.WARMED ) {
        data.progress = {label: "SETUP.PackagesLoading", icon: "fas fa-spinner fa-spin"};
      }
      else if ( !this.packages.length && Setup.cache[type].state === Setup.CACHE_STATES.WARMED ) {
        data.progress = {label: "SETUP.CouldntLoadPackages", icon: "fas fa-exclamation-triangle"};
      }

      // Category filters
      data.tags = Object.entries(this.tags).reduce((tags, t) => {
        let [k, v] = t;
        v.active = this.#category === t[0];
        v.css = t[1].active ? " active" : "";
        tags[k] = v;
        return tags;
      }, {});

      // Visibility filters
      data.visibility = [
        { id: "inst", css: this.#visibility === "inst" ? " active" : "", label: "SETUP.PackageVisInst" },
        { id: "unin", css: this.#visibility === "unin" ? " active" : "", label: "SETUP.PackageVisUnin" },
        { id: "all", css: this.#visibility === "all" ? " active" : "", label: "SETUP.PackageVisAll" }
      ];

      // Filter packages
      const installed = new Set(game.data[`${type}s`].map(s => s.id));
      data.packages = this.packages.filter(p => {
        p.installed = installed.has(p.id);
        if ( (this.#visibility === "unin") && p.installed ) return false;
        if ( (this.#visibility === "inst") && !p.installed ) return false;
        p.cssClass = [p.installed ? "installed" : null, p.installable ? null: "locked"].filterJoin(" ");
        if ( this.#category === "all" ) return true;
        if ( this.#category === "premium" ) return p.protected;
        if ( this.#category === "exclusive" ) return p.exclusive;
        return p.tags.includes(this.#category);
      });
      return data;
    }

    /* -------------------------------------------- */

    /** @override */
    activateListeners(html) {
      super.activateListeners(html);
      html[0].children[0].onsubmit = ev => ev.preventDefault();
      html.find(".package-title a.website-link").click(this.#onClickPackageLink.bind(this));
      html.find(".package-title h3").click(this.#onClickPackageTitle.bind(this));
      html.find("button.install").click(this.#onClickPackageInstall.bind(this));
      html.find("button[type='submit']").click(this.#onClickManifestInstall.bind(this));
      html.find(".categories .category").click(this.#onClickCategoryFilter.bind(this));
      html.find(".visibilities .visibility").click(this.#onClickVisibilityFilter.bind(this));

      // Assign an initial search value
      this._searchFilters[0]._input;
      const loading = Setup.cache[this.#packageType].state < Setup.CACHE_STATES.WARMED;
      if ( this.#initialSearch && !loading ) {
        this.#inputs.filter = this.#initialSearch;
        this._searchFilters[0].filter(null, this.#initialSearch);
        this.#initialSearch = undefined;
      }
    }

    /* -------------------------------------------- */

    /**
     * Handle a left-click event on the package website link.
     * @param {PointerEvent} event    The originating click event
     */
    #onClickPackageLink(event) {
      event.preventDefault();
      const li = event.currentTarget.closest(".package");
      const href = `https://foundryvtt.com/packages/${li.dataset.packageId}/`;
      return window.open(href, "_blank");
    }

    /* -------------------------------------------- */

    /**
     * Handle a left-click event on the package title
     * @param {PointerEvent} event    The originating click event
     */
    #onClickPackageTitle(event) {
      event.preventDefault();
      const li = event.currentTarget.closest(".package");
      if ( li.classList.contains("installed") || li.classList.contains("locked") ) return;
      const manifestURL = li.querySelector("button.install").dataset.manifest;
      const input = this.element.find("input[name='manifestURL']")[0];
      input.value = manifestURL;
    }

    /* -------------------------------------------- */

    /**
     * Handle left-click events to filter to a certain module category.
     * @param {PointerEvent} event    The originating click event
     */
    #onClickCategoryFilter(event) {
      event.preventDefault();
      this.#category = event.target.dataset.category || "all";
      this.render();
    }

    /* -------------------------------------------- */

    /**
     * Handle left-click events to filter to a certain visibility state.
     * @param {PointerEvent} event    The originating click event
     */
    #onClickVisibilityFilter(event) {
      event.preventDefault();
      this.#visibility = event.target.dataset.visibility || "all";
      this.render();
    }

    /* -------------------------------------------- */

    /**
     * Handle a left-click event on the package "Install" button.
     * @param {PointerEvent} event    The originating click event
     */
    async #onClickPackageInstall(event) {
      event.preventDefault();
      const button = event.currentTarget;
      button.disabled = true;
      let manifest = button.dataset.manifest;
      if ( !manifest ) return;
      await Setup.installPackage({type: this.#packageType, manifest});
      button.disabled = false;
    }

    /* -------------------------------------------- */

    /**
     * Handle a left-click event on the button to install by manifest URL.
     * @param {PointerEvent} event    The originating click event
     */
    async #onClickManifestInstall(event) {
      event.preventDefault();
      const button = event.currentTarget;
      button.disabled = true;
      const input = button.previousElementSibling;
      if ( !input.value ) {
        button.disabled = false;
        return;
      }
      // noinspection ES6MissingAwait
      Setup.installPackage({type: this.#packageType, manifest: input.value.trim()});
      input.value = "";
      button.disabled = false;
    }

    /* -------------------------------------------- */

    /** @override */
    _onSearchFilter(event, query, rgx, html) {
      if ( html.classList.contains("loading") ) return;
      for ( let li of html.children ) {
        if ( !query ) {
          li.classList.remove("hidden");
          continue;
        }
        const id = li.dataset.packageId;
        const title = li.querySelector(".package-title h3")?.textContent;
        const author = li.querySelector(".tag.author").textContent;
        const match = rgx.test(SearchFilter.cleanQuery(id))
          || rgx.test(SearchFilter.cleanQuery(title))
          || rgx.test(SearchFilter.cleanQuery(author));
        li.classList.toggle("hidden", !match);
      }
    }

    /* -------------------------------------------- */

    /**
     * Organize package data and cache it to the application
     * @param {string} type           The type of packages being retrieved
     * @returns {Promise<object[]>}   The retrieved or cached packages
     */
    static async getTaggedPackages(type) {

      // Identify package tags and counts
      const packages = [];
      const counts = {premium: 0, exclusive: 0};
      const unordered_tags = {};
      const codes = CONST.PACKAGE_AVAILABILITY_CODES;

      // Prepare package data
      for ( let pack of Setup.cache[type].packages.values() ) {
        const p = pack.toObject();
        const availability = pack.availability;

        // Skip packages which require downgrading or upgrading to an unstable version
        if ( [codes.REQUIRES_CORE_DOWNGRADE, codes.REQUIRES_CORE_UPGRADE_UNSTABLE].includes(availability) ) continue;

        // Create the array of package tags
        const tags = pack.tags.map(t => {
          const [k, v] = t;
          if ( !unordered_tags[k] ) unordered_tags[k] = {label: v, count: 0, [type]: true};
          unordered_tags[k].count++;
          return k;
        });

        // Structure package data
        foundry.utils.mergeObject(p, {
          cssClass: "",
          author: Array.from(pack.authors).map(a => a.name).join(", "),
          tags: tags,
          installable: availability !== codes.REQUIRES_CORE_UPGRADE_STABLE
        });
        if ( pack.protected ) {
          if ( !pack.owned ) p.installable = false;
          counts.premium++;
        }
        if ( pack.exclusive ) counts.exclusive++;
        packages.push(p);
      }

      // Organize category tags
      const sorted_tags = Array.from(Object.keys(unordered_tags));
      sorted_tags.sort();
      const tags = sorted_tags.reduce((obj, k) => {
        obj[k] = unordered_tags[k];
        return obj;
      }, {
        all: { label: "All Packages", count: packages.length, [type]: true},
        premium: { label: "Premium Content", count: counts.premium, [type]: true},
        exclusive: { label: "Exclusive Content", count: counts.exclusive, [type]: true }
      });
      return { packages: packages, tags: tags };
    }

    /* -------------------------------------------- */

    /**
     * Record the state of user inputs.
     */
    #saveInputs() {
      if ( !this.element.length ) return;
      this.#inputs.filter = this.element.find('[name="filter"]').val();
      this.#inputs.manifestURL = this.element.find('[name="manifestURL"]').val();
    }

    /* -------------------------------------------- */

    /**
     * Restore the state of user inputs.
     */
    #restoreInputs() {
      const filter = this.element.find('[name="filter"]');
      filter.val(this.#inputs.filter);
      filter.focus();
      this.element.find('[name="manifestURL"]').val(this.#inputs.manifestURL);
    }
  }

  /**
   * A library of package management commands which are used by various interfaces around the software.
   */
  let Setup$1 = class Setup extends Game {

    /**
     * An enum that indicates a state the Cache is in
     * @enum {number}
     */
    static CACHE_STATES = {
      COLD: 0,
      WARMING: 1,
      WARMED: 2
    };

    /**
     * The name of the setting used to persist package favorites.
     * @type {string}
     */
    static FAVORITE_PACKAGES_SETTING = "setupPackageFavorites";

    /**
     * A cached object of retrieved packages from the web server
     * @type {{
     *   world: {packages: Map<string,World>, state: Setup.CACHE_STATES},
     *   system: {packages: Map<string,System>, state: Setup.CACHE_STATES},
     *   module: {packages: Map<string,Module>, state: Setup.CACHE_STATES}
     * }}
     */
    static cache = {
      world: { packages: new Map(), state: Setup.CACHE_STATES.COLD },
      module: { packages: new Map(), state: Setup.CACHE_STATES.COLD },
      system: { packages: new Map(), state: Setup.CACHE_STATES.COLD }
    };

    /**
     * A reference to the setup URL used under the current route prefix, if any
     * @type {string}
     */
    static get setupURL() {
      return foundry.utils.getRoute("setup");
    }

    /* -------------------------------------------- */

    /**
     * Register core game settings
     * @override
     */
    registerSettings() {
      super.registerSettings();
      game.settings.register("core", "declinedManifestUpgrades", {
        scope: "client",
        config: false,
        type: Object,
        default: {}
      });
      game.settings.register("core", Setup.FAVORITE_PACKAGES_SETTING, {
        scope: "client",
        config: false,
        type: Object,
        default: {worlds: [], systems: [], modules: []}
      });
      game.settings.register("core", "setupViewModes", {
        scope: "client",
        config: false,
        type: Object,
        default: {worlds: "GALLERY", systems: "GALLERY", modules: "TILES"}
      });
    }

    /* -------------------------------------------- */

    /** @override */
    setupPackages(data) {
      super.setupPackages(data);
      const Collection = foundry.utils.Collection;
      if ( data.worlds ) {
        this.worlds = new Collection(data.worlds.map(m => [m.id, new World(m)]));
      }
      if ( data.systems ) {
        this.systems = new Collection(data.systems.map(m => [m.id, new System(m)]));
      }
    }

    /* -------------------------------------------- */

    /** @override */
    static async getData(socket, view) {
      let req;
      switch (view) {
        case "auth": case "license": req = "getAuthData"; break;
        case "join": req = "getJoinData"; break;
        case "players": req = "getPlayersData"; break;
        case "setup": req = "getSetupData"; break;
        case "update": req = "getUpdateData"; break;
      }
      return new Promise(resolve => {
        socket.emit(req, resolve);
      });
    }

    /* -------------------------------------------- */
    /*  View Handlers                               */
    /* -------------------------------------------- */

    /** @override */
    async _initializeView() {
      switch (this.view) {
        case "auth":
          return this.#authView();
        case "license":
          return this.#licenseView();
        case "setup":
          return this.#setupView();
        case "players":
          return this.#playersView();
        case "join":
          return this.#joinView();
        case "update":
          return this.#updateView();
        default:
          throw new Error(`Unknown view URL ${this.view} provided`);
      }
    }

    /* -------------------------------------------- */

    /**
     * The application view which displays the End User License Agreement (EULA).
     */
    #licenseView() {
      ui.notifications = new Notifications().render(true);

      // Render EULA
      const form = document.getElementById("license-key");
      if ( !form ) {
        new EULA().render(true);
        return;
      }

      // Allow right-clicks specifically in the key field
      const input = document.getElementById("key");
      input?.addEventListener("contextmenu", ev => ev.stopPropagation());
    }

    /* -------------------------------------------- */

    /**
     * The application view which displays the admin authentication application.
     */
    #authView() {
      if ( !globalThis.SIGNED_EULA ) window.location.href = foundry.utils.getRoute("license");
      ui.notifications = new Notifications().render(true);
      new SetupAuthenticationForm().render(true);
    }

    /* -------------------------------------------- */

    /**
     * The application view which displays the application Setup and Configuration.
     */
    #setupView() {
      if ( !globalThis.SIGNED_EULA ) window.location.href = foundry.utils.getRoute("license");
      this.issueCount = Setup.#logPackageWarnings(this.data.packageWarnings, {notify: false});
      ui.notifications = (new Notifications()).render(true);
      ui.setupMenu = (new SetupMenu()).render(true);
      ui.setupPackages = (new SetupPackages()).render(true);
      ui.setupSidebar = (new SetupSidebar()).render(true);
      Setup._activateSocketListeners();
      SetupApplicationConfiguration.telemetryRequestDialog();
      ContextMenu.eventListeners();
      FontConfig._loadFonts();
    }

    /* -------------------------------------------- */

    /**
     * Log server-provided package warnings so that they are discoverable on the client-side.
     * @param {object} packageWarnings         An object of package warnings and errors by package ID.
     * @param {object} [options]               Additional options to configure logging behaviour.
     * @param {boolean} [options.notify=true]  Whether to create UI notifications in addition to logging.
     * @returns {{error: number, warning: number, total: number}}  A count of the number of warnings and errors
     */
    static #logPackageWarnings(packageWarnings, {notify=true}={}) {
      const counts = {
        error: 0,
        warning: 0
      };
      for ( const pkg of Object.values(packageWarnings) ) {
        for ( const error of pkg.error ) {
          counts.error++;
          console.error(`[${pkg.id}] ${error}`);
        }
        for ( const warning of pkg.warning ) {
          counts.warning++;
          console.warn(`[${pkg.id}] ${warning}`);
        }
      }

      // Notify
      if ( notify && counts.errors ) {
        const err = game.i18n.format("PACKAGE.SetupErrors", {number: counts.errors});
        ui.notifications.error(err, {permanent: true, console: false});
      }
      if ( notify && counts.warnings ) {
        const warn = game.i18n.format("PACKAGE.SetupWarnings", {number: counts.warnings});
        ui.notifications.warn(warn, {permanent: true, console: false});
      }

      // Return total count
      counts.total = counts.error + counts.warning;
      return counts;
    }

    /* -------------------------------------------- */

    /**
     * The application view which displays the User Configuration.
     */
    #playersView() {
      if ( !globalThis.SIGNED_EULA ) window.location.href = foundry.utils.getRoute("license");
      this.users = new Users(this.data.users);
      this.collections.set("User", this.users);
      this.collections.set("Setting", this.settings.storage.get("world"));

      // Render applications
      ui.notifications = new Notifications().render(true);
      ui.players = new UserManagement(this.users);
      ui.players.render(true);

      // Game is ready for use
      this.ready = true;
    }

    /* -------------------------------------------- */

    /**
     * The application view which displays the Game join and authentication screen.
     */
    #joinView() {
      if ( !globalThis.SIGNED_EULA ) window.location.href = foundry.utils.getRoute("license");

      // Configure Join view data
      this.users = new Users(this.data.users);
      this.collections.set("User", this.users);

      // Activate Join view socket listeners
      Users._activateSocketListeners(this.socket);

      // Render Join view applications
      ui.notifications = new Notifications().render(true);
      ui.join = new JoinGameForm().render(true);
    }

    /* -------------------------------------------- */

    /**
     * The application update view which allows for updating the Foundry Virtual Tabletop software.
     */
    #updateView() {
      ui.notifications = new Notifications().render(true);
      ui.setupUpdate = new SetupUpdate().render(true);
      Setup._activateSocketListeners();
    }

    /* -------------------------------------------- */
    /*  Package Management                          */
    /* -------------------------------------------- */

    /**
     * Check with the server whether a package of a certain type may be installed or updated.
     * @param {object} options    Options which affect how the check is performed
     * @param {string} options.type       The package type to check
     * @param {string} options.id         The package id to check
     * @param {string} [options.manifest] The manifest URL to check
     * @param {number} [options.timeout]  A timeout in milliseconds after which the check will fail
     * @returns {Promise<PackageManifestData>} The resulting manifest if an update is available
     */
    static async checkPackage({type="module", id, manifest, timeout=20000}={}) {
      return this.post({action: "checkPackage", type, id, manifest}, timeout);
    }

    /* -------------------------------------------- */

    /**
     * Prepares the cache of available and owned packages
     * @param {object} options          Options which configure how the cache is warmed
     * @param {string} options.type     The type of package being cached
     * @returns {Promise<void>}
     */
    static async warmPackages({type="system"}={}) {
      if ( Setup.cache[type].state > Setup.CACHE_STATES.COLD ) return;
      Setup.cache[type].state = Setup.CACHE_STATES.WARMING;
      await this.getPackages({type});
      Setup.cache[type].state = Setup.CACHE_STATES.WARMED;
    }

    /* -------------------------------------------- */

    /**
     * Get a Map of available packages of a given type which may be installed
     * @param {string} type
     * @returns {Promise<Map<string, ClientPackage>>}
     */
    static async getPackages({type="system"}={}) {

      // Return from cache
      if ( this.cache[type].packages?.size > 0 ) return this.cache[type].packages;

      // Request from server
      const packages = new Map();
      let response;
      try {
        response = await this.post({action: "getPackages", type: type});
      }
      catch(err) {
        ui.notifications.error(err.message, {localize: true});
        return packages;
      }

      // Populate the cache
      response.packages.forEach(p => {
        const pkg = new PACKAGE_TYPES[type](p);
        packages.set(p.id, pkg);
      });
      this.cache[type].packages = packages;
      this.cache[type].owned = response.owned;
      return packages;
    }

    /* -------------------------------------------- */

    /**
     * Open the Package Browser application
     * @param {string} packageType        The type of package being installed, in ["module", "system", "world"]
     * @param {string} [search]           An optional search string to filter packages
     * @returns {Promise<void>}
     */
    static async browsePackages(packageType, options={}) {
      return new InstallPackage({packageType, ...options})._render(true);
    }

    /* -------------------------------------------- */

    /**
     * Install a Package
     * @param {object} options              Options which affect how the package is installed
     * @param {string} options.type           The type of package being installed, in ["module", "system", "world"]
     * @param {string} options.id             The package id
     * @param {string} options.manifest       The package manifest URL
     * @param {boolean} [options.notify=true] Display a notification toast?
     * @returns {Promise<foundry.packages.BasePackage>} A Promise which resolves to the installed package
     */
    static async installPackage({type="module", id, manifest, notify=true}={}) {
      return new Promise(async (resolve, reject) => {

        /**
         * Handles an Install error
         * @param {InstallPackageError} response
         */
        const error = response => {
          if ( response.packageWarnings ) {
            ui.notifications.error(game.i18n.localize(response.error));
            Setup.#logPackageWarnings(response.packageWarnings, {notify: false});
          } else {
            const err = new Error(response.error);
            err.stack = response.stack;
            if ( notify ) {       // Display a user-friendly UI notification
              const message = response.error.split("\n")[0];
              ui.notifications.error(game.i18n.format("SETUP.InstallFailure", {message}), {console: false});
            }
            console.error(err);   // Log the full error details to console
          }
          Setup._removeProgressListener(progress);
          resolve(response);
          ui.setupPackages?.render();
        };

        /**
         * Handles successful Package installation
         * @param {InstallPackageSuccess} data
         * @returns {Promise<void>}
         */
        const done = async data => {
          const pkg = new PACKAGE_TYPES[type](data.pkg);
          if ( notify ) {
            ui.notifications.info(game.i18n.format("SETUP.InstallSuccess", {type: type.titleCase(), id: pkg.id}));
          }

          // Trigger dependency installation (asynchronously)
          if ( pkg.relationships ) {
            // noinspection ES6MissingAwait
            this.installDependencies(pkg, {notify});
          }

          // Add the created package to game data
          pkg.install();

          // Update application views
          Setup._removeProgressListener(progress);
          await this.reload();
          resolve(pkg);
        };

        const progress = data => {
          if ( !((data.action === CONST.SETUP_PACKAGE_PROGRESS.ACTIONS.INSTALL_PKG) && (data.manifest === manifest)) ) return;
          ui.setupPackages.onProgress(data);
          if ( data.step === CONST.SETUP_PACKAGE_PROGRESS.STEPS.ERROR ) return error(data);
          if ( data.step === CONST.SETUP_PACKAGE_PROGRESS.STEPS.VEND ) return done(data);
        };
        Setup._addProgressListener(progress);

        // Submit the POST request
        let response;
        try {
          response = await this.post({action: CONST.SETUP_PACKAGE_PROGRESS.ACTIONS.INSTALL_PKG, type, id, manifest});
        } catch(err) {
          return reject(err);
        }

        // Handle errors and warnings
        if ( response.error ) error(response);
        if ( response.warning && notify ) ui.notifications.warn(response.warning);
      });
    }

    /* -------------------------------------------- */

    /**
     * Install a set of dependency modules which are required by an installed package
     * @param {ClientPackage} pkg   The package which was installed that requested dependencies
     * @param {object} options      Options which modify dependency installation, forwarded to installPackage
     * @returns {Promise<void>}
     */
    static async installDependencies(pkg, options={}) {
      const dependencyChecks = new Map();

      // Check required Relationships
      for ( let d of pkg.relationships?.requires ?? [] ) {
        await this.#checkDependency(d, dependencyChecks);
      }
      // Check recommended Relationships
      for ( let d of pkg.relationships?.recommends ?? [] ) {
        await this.#checkDependency(d, dependencyChecks, false);
      }

      const uninstalled = Array.from(dependencyChecks.values()).filter(d => d.installNeeded);
      if ( !uninstalled.length ) return;

      // Prepare data for rendering
      const categories = uninstalled.reduce((obj, dep) => {
        if ( dep.canInstall && dep.required ) obj.canInstallRequired.push(dep);
        if ( dep.canInstall && !dep.required ) obj.canInstallOptional.push(dep);
        if ( !dep.canInstall && dep.required ) obj.cantInstallRequired.push(dep);
        if ( !dep.canInstall && !dep.required ) obj.cantInstallOptional.push(dep);
        return obj;
      }, { canInstallRequired: [], canInstallOptional: [], cantInstallRequired: [], cantInstallOptional: [] });
      const { canInstallRequired, canInstallOptional, cantInstallRequired, cantInstallOptional } = categories;
      const data = {
        title: pkg.title,
        totalDependencies: uninstalled.length,
        canInstallRequired,
        canInstallOptional,
        cantInstallRequired,
        cantInstallOptional
      };

      // Handle pluralization
      const singleDependency = data.totalDependencies === 1;
      const canInstall = data.canInstallRequired.length + data.canInstallOptional.length;
      const cantInstall = data.cantInstallRequired.length + data.cantInstallOptional.length;
      data.hasDependenciesLabel = singleDependency
        ? game.i18n.format("SETUP.PackageHasDependenciesSingular", {title: pkg.title})
        : game.i18n.format("SETUP.PackageHasDependenciesPlural", {title: pkg.title, number: data.totalDependencies});
      data.autoInstallLabel = canInstall === 1
        ? game.i18n.localize("SETUP.PackageDependenciesCouldInstallSingular")
        : game.i18n.format("SETUP.PackageDependenciesCouldInstallPlural", {number: canInstall});
      data.manualInstallLabel = cantInstall === 1
        ? game.i18n.localize("SETUP.PackageDependenciesCouldNotInstallSingular")
        : game.i18n.format("SETUP.PackageDependenciesCouldNotInstallPlural", {number: cantInstall});
      // Prompt the user to confirm installation of dependency packages
      const html = await renderTemplate("templates/setup/install-dependencies.html", data);
      new Dialog(
        {
          title: game.i18n.localize("SETUP.PackageDependenciesTitle"),
          content: html,
          buttons: {
            automatic: {
              icon: '<i class="fas fa-bolt-auto"></i>',
              label: canInstall === 1
                ? game.i18n.localize("SETUP.PackageDependenciesAutomaticSingular")
                : game.i18n.format("SETUP.PackageDependenciesAutomaticPlural"),
              disabled: canInstall === 0,
              callback: async (event) => {
                // Install selected dependency packages
                const inputs = Array.from(event[0].querySelectorAll("input"));
                let installed = 0;
                for ( let d of dependencyChecks.values() ) {
                  if ( !d.installNeeded ) continue;

                  // Only install the package if the input is checked
                  if ( !inputs.find(i => i.name === d.id)?.checked ) continue;
                  await this.installPackage({type: d.type, id: d.id, manifest: d.manifest, ...options});
                  installed++;
                }
                return ui.notifications.info(game.i18n.format("SETUP.PackageDependenciesSuccess", {
                  title: pkg.title,
                  number: installed
                }));
              }
            },
            manual: {
              icon: '<i class="fas fa-wrench"></i>',
              label: game.i18n.localize(`SETUP.PackageDependenciesManual${singleDependency ? "Singular" : "Plural"}`),
              callback: () => {
                return ui.notifications.warn(game.i18n.format("SETUP.PackageDependenciesDecline", {
                  title: pkg.title
                }));
              }
            }
          },
          default: "automatic"
        }, {
          id: "setup-install-dependencies",
          width: 600
        }).render(true);
    }


    /* -------------------------------------------- */

    /**
     * @typedef {Object} PackageDependencyCheck
     * @property {string} id                The package id
     * @property {string} type              The package type
     * @property {string} manifest          The package manifest URL
     * @property {boolean} installNeeded    Whether the package is already installed
     * @property {boolean} canInstall       Whether the package can be installed
     * @property {string} message           An error message to display to the user
     * @property {string} url               The URL to the package
     * @property {string} version           The package version
     */

    /**
     * Checks a dependency to see if it needs to be installed
     * @param {RelatedPackage} relatedPackage                                   The dependency
     * @param {Map<string, PackageDependencyCheck>} dependencyChecks            The current map of dependencies to install
     * @returns {Promise<void>}
     * @private
     */
    static async #checkDependency(relatedPackage, dependencyChecks, required = true) {
      if ( !relatedPackage.id || dependencyChecks.has(relatedPackage.id) ) return;
      relatedPackage.type = relatedPackage.type || "module";

      let dependencyCheck = {
        id: relatedPackage.id,
        type: relatedPackage.type,
        manifest: "",
        installNeeded: true,
        canInstall: false,
        message: "",
        url: "",
        version: "",
        required: required,
        note: required ? game.i18n.localize("SETUP.RequiredPackageNote") : game.i18n.localize("SETUP.RecommendedPackageNote"),
        reason: relatedPackage.reason
      };

      const installed = game.data[`${relatedPackage.type}s`].find(p => p.id === relatedPackage.id);
      if ( installed ) {
        const msg = `Dependency ${relatedPackage.type} ${relatedPackage.id} is already installed.`;
        console.debug(msg);
        dependencyCheck.installNeeded = false;
        dependencyCheck.message = msg;
        dependencyChecks.set(dependencyCheck.id, dependencyCheck);
        return;
      }

      // Manifest URL provided
      let dependency;
      if ( relatedPackage.manifest ) {
        dependencyCheck.manifest = relatedPackage.manifest;
        dependencyCheck.url = relatedPackage.manifest;
        dependency = await PACKAGE_TYPES[relatedPackage.type].fromRemoteManifest(relatedPackage.manifest);
        if ( !dependency ) {
          const msg = `Requested dependency "${relatedPackage.id}" not found at ${relatedPackage.manifest}.`;
          console.warn(msg);
          dependencyCheck.message = msg;
          dependencyChecks.set(dependencyCheck.id, dependencyCheck);
          return;
        }
      }
      else {
        // Discover from package listing
        const packages = await Setup.getPackages({type: relatedPackage.type});
        dependency = packages.get(relatedPackage.id);
        if ( !dependency ) {
          const msg = `Requested dependency "${relatedPackage.id}" not found in ${relatedPackage.type} directory.`;
          console.warn(msg);
          dependencyCheck.message = msg;
          dependencyChecks.set(dependencyCheck.id, dependencyCheck);
          return;
        }

        // Prefer linking to Readme over Project URL over Manifest
        if ( dependency.readme ) dependencyCheck.url = dependency.readme;
        else if ( dependency.url ) dependencyCheck.url = dependency.url;
        else dependencyCheck.url = dependency.manifest;
        dependencyCheck.manifest = dependency.manifest;
      }
      dependencyCheck.version = dependency.version;

      /**
       * Test whether a package dependency version matches the defined compatibility criteria of its dependant package.
       * @param {string} dependencyVersion                 The version string of the dependency package
       * @param {PackageCompatibility} compatibility       Compatibility criteria defined by the dependant package
       * @param {string} [compatibility.minimum]           A minimum version of the dependency which is required
       * @param {string} [compatibility.maximum]           A maximum version of the dependency which is allowed
       * @returns {boolean}
       */
      function isDependencyCompatible(dependencyVersion, {minimum, maximum}={}) {
        if ( minimum && foundry.utils.isNewerVersion(minimum, dependencyVersion) ) return false;
        return !( maximum && foundry.utils.isNewerVersion(dependencyVersion, maximum) );
      }

      // Validate that the dependency is compatible
      if ( !isDependencyCompatible(dependency.version, relatedPackage.compatibility) ) {
        const range = [
          relatedPackage.compatibility?.minimum ? `>= ${relatedPackage.compatibility.minimum}` : "",
          relatedPackage.compatibility?.maximum && relatedPackage.compatibility?.maximum ? " and " : "",
          relatedPackage.compatibility?.maximum ? `<= ${relatedPackage.compatibility.maximum}` : ""
        ].join("");
        const msg = `No version of dependency "${relatedPackage.id}" found matching required range of ${range}.`;
        console.warn(msg);
        dependencyCheck.message = msg;
        dependencyChecks.set(dependencyCheck.id, dependencyCheck);
        return;
      }
      dependencyCheck.canInstall = true;
      dependencyChecks.set(dependencyCheck.id, dependencyCheck);

      // If the dependency has dependencies itself, take a fun trip down recursion lane
      for ( let d of dependency.relationships?.requires ?? [] ) {
        await this.#checkDependency(d, dependencyChecks);
      }
      for ( let d of dependency.relationships?.recommends ?? [] ) {
        await this.#checkDependency(d, dependencyChecks, false);
      }
    }

    /* -------------------------------------------- */

    /**
     * Handle requests to uninstall a package.
     * @param {BasePackage} pkg       The package to uninstall
     * @returns {Promise<void>}
     */
    static async uninstallPackage(pkg) {
      const typeLabel = game.i18n.localize(`PACKAGE.Type.${pkg.type}`);
      if ( pkg.locked ) {
        return ui.notifications.error(game.i18n.format("PACKAGE.UninstallLocked", {type: typeLabel, id: pkg.id}));
      }

      // Provide a deletion confirmation warning
      // For worlds, require the user to provide a deletion code
      // Based on https://stackoverflow.com/a/8084248
      const title = pkg.title ?? pkg.id;
      let warning = `<p>${game.i18n.format("SETUP.PackageDeleteConfirm", {type: typeLabel, title})}</p>`;
      const code = (Math.random() + 1).toString(36).substring(7, 11);
      if ( pkg.type === "world" ) {
        warning += `<p class="notification warning">${game.i18n.localize("SETUP.WorldDeleteConfirmWarning")}</p>
      <p>${game.i18n.format("SETUP.WorldDeleteConfirmCode")}</p>
      <p id="confirm-code"><span class="reference">${code}</span></p>
      <input id="delete-confirm" class="dark" type="text" autocomplete="off" placeholder="${code}" required autofocus>`;
      }
      else {
        if ( pkg.hasStorage ) warning += `<p>${game.i18n.localize("SETUP.PackageDeletePersistent")}</p>`;
        warning += `<p class="notification warning">${game.i18n.localize("SETUP.PackageDeleteNoUndo")}</p>`;
      }

      // Confirm deletion request
      await Dialog.confirm({
        title: game.i18n.format("SETUP.PackageDeleteTitle", {type: typeLabel, title}),
        content: warning,
        options: {
          focus: false, // don't autofocus "yes" in this case
          width: 480
        },
        yes: async html => {

          // Confirm World deletion
          if ( pkg.type === "world" ) {
            const confirm = html.find("#delete-confirm").val();
            if ( confirm !== code ) {
              return ui.notifications.error("SETUP.PackageDeleteWorldConfirm", {localize: true});
            }
          }

          // Submit the server request
          try {
            await this.post({action: "uninstallPackage", type: pkg.type, id: pkg.id});
          } catch(err) {
            ui.notifications.error(`${game.i18n.localize("SETUP.UninstallFailure")}: ${err.message}`);
            throw err;
          }

          // Finalize the uninstallation
          PACKAGE_TYPES[pkg.type].uninstall(pkg.id);
          ui.notifications.info(`${typeLabel} ${pkg.id} ${game.i18n.localize("SETUP.UninstallSuccess")}.`);
          await this.reload();
        }
      });
    }

    /* -------------------------------------------- */
    /*  Socket Listeners and Handlers               */
    /* -------------------------------------------- */

    /**
     * Activate socket listeners related to the Setup view.
     */
    static _activateSocketListeners() {
      game.socket.on("progress", Setup._onProgress);
    }

    /* --------------------------------------------- */

    /**
     * A list of functions to call on progress events.
     * @type {Function[]}
     */
    static _progressListeners = [];

    /* --------------------------------------------- */

    /**
     * Handle a progress event from the server.
     * @param {object} data  The progress update data.
     * @private
     */
    static _onProgress(data) {
      Setup._progressListeners.forEach(l => l(data));
    }

    /* --------------------------------------------- */

    /**
     * Add a function to be called on a progress event.
     * @param {Function} listener
     * @internal
     */
    static _addProgressListener(listener) {
      Setup._progressListeners.push(listener);
    }

    /* --------------------------------------------- */

    /**
     * Stop sending progress events to a given function.
     * @param {Function} listener
     * @internal
     */
    static _removeProgressListener(listener) {
      Setup._progressListeners = Setup._progressListeners.filter(l => l !== listener);
    }

    /* --------------------------------------------- */

    /**
     * Reload package data from the server and update its display
     * @returns {Promise<Object>}
     */
    static async reload() {
      return this.getData(game.socket, game.view).then(setupData => {
        foundry.utils.mergeObject(game.data, setupData);
        game.setupPackages(setupData);
        ui.setupPackages.render();
        ui.installPackages?.render();
      });
    }

    /* -------------------------------------------- */
    /*  Helper Functions                            */
    /* -------------------------------------------- */

    /**
     * Post to the Setup endpoint.
     * @param {object} requestData    An object of data which should be included with the POST request
     * @param {object} requestOptions An object of options passed to the fetchWithTimeout method
     * @returns {Promise<object>}     A Promise resolving to the returned response data
     * @throws                        An error if the request was not successful
     */
    static async post(requestData, requestOptions={}) {
      if ( game.ready ) {
        throw new Error("You may not submit POST requests to the setup page while a game world is currently active.");
      }

      // Post the request and handle redirects
      const url = foundry.utils.getRoute(game.view);
      let responseData;
      try {
        const response = await foundry.utils.fetchWithTimeout(url, {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify(requestData)
        }, requestOptions);

        // Handle redirect
        if ( response.redirected ) return window.location.href = response.url;

        // Process response
        responseData = await response.json();
      } catch(err) {
        ui.notifications.error(err, {permanent: true});
        throw err;
      }

      // Handle server-side errors
      if ( responseData.error ) {
        const err = new Error(game.i18n.localize(responseData.error));
        err.stack = responseData.stack;
        ui.notifications.error(err, {permanent: true});
        throw err;
      }
      return responseData;
    }
  };

  var applications = /*#__PURE__*/Object.freeze({
    __proto__: null,
    EULA: EULA,
    JoinGameForm: JoinGameForm,
    SetupAuthenticationForm: SetupAuthenticationForm,
    SetupMenu: SetupMenu,
    SetupPackages: SetupPackages,
    UserManagement: UserManagement
  });

  // Add Global Exports
  globalThis.Setup = Setup$1;
  Setup$1.applications = applications;

})();
