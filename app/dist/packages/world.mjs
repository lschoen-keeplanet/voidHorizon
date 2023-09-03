import fs from"fs";import path from"path";import{USER_ROLES,PACKAGE_AVAILABILITY_CODES,BASE_DOCUMENT_TYPE}from"../../common/constants.mjs";import{getRoute,isNewerVersion,isEmpty,randomID,deepClone}from"../../common/utils/helpers.mjs";import{BaseWorld}from"../../common/packages/module.mjs";import{PackageAssetField,ServerPackageMixin}from"./package.mjs";import Activity from"../components/activity.mjs";import migrations from"../migrations.mjs";import Files from"../files/files.mjs";import*as documents from"../../common/documents/module.mjs";import{HotReload}from"./_module.mjs";import DocumentCache from"../components/document-cache.mjs";export default class World extends(ServerPackageMixin(BaseWorld)){static defineSchema(){const e=super.defineSchema();return e.background=new PackageAssetField({relativeToPackage:!1,mustExist:!1,...e.background.options}),e}#e=null;updatingPacks=Promise.resolve();_initialize(e){super._initialize(e),this.system=packages.System.get(this._source.system),this.modules=packages.Module.getPackages({system:this.system,enforceCompatibility:!0}),this.compatibility.maximum=this.compatibility.maximum||this.system?.compatibility.maximum,this.background=this.background||this.system?.background}_testAvailability(e){const t=PACKAGE_AVAILABILITY_CODES;let s=super._testAvailability(e);if(this.incompatibleWithCoreVersion)return s;if(!this.system)return t.MISSING_SYSTEM;const a=this.system.availability;if(this.system.incompatibleWithCoreVersion||a===t.UNKNOWN)return a;const i=new Set,o=[...this.relationships.requires.values(),...this.system.relationships.requires.values()];for(const e of o){if("module"!==e.type||i.has(e.id))continue;const s=packages.Module.get(e.id);if(!s)return t.MISSING_DEPENDENCY;if(s.incompatibleWithCoreVersion)return t.REQUIRES_DEPENDENCY_UPDATE;i.add(e.id)}return s===t.UNKNOWN?a:s}vend(){const e=super.vend();return e.system=this._source.system,e}static loadLocalManifest(e){const{manifestData:t}=super.loadLocalManifest(e);return this.schema.get("id").validate(t.id)&&(e=World.#t(t)),{manifestPath:e,manifestData:t}}static#t(e){const t=e.id.slugify({strict:!0});let s=t,a=path.join(this.baseDir,s),i=0;for(;fs.existsSync(a);)s=`${t}-${++i}`,a=path.join(this.baseDir,s);const o=path.join(this.baseDir,e.id);fs.renameSync(o,a),e.id=s,delete e.name;const r=path.join(a,this.manifestFile);return Files.writeFileSyncSafe(r,JSON.stringify(e,null,2)),r}get active(){const{game:e}=global;return e.world&&this.id===e.world.id}get canAutoLaunch(){const e=this.availability,t=globalThis.release;if(e===PACKAGE_AVAILABILITY_CODES.MISSING_SYSTEM)return!1;if(this.incompatibleWithCoreVersion)return!1;const s=this.compatibility.verified;return!!s&&(Number.isInteger(Number(s))?s>=t.generation:!isNewerVersion(t.version,s))}static create(e){if(e.id||(e.id=e.name),!e.id)throw new Error("You must provide a unique id that names this World.");if(e.id=e.id.slugify(),e.id.startsWith(".."))throw new Error("You are not allowed to install packages outside of the designated directory path");const t=path.join(this.baseDir,e.id);if(fs.existsSync(t))throw new Error(`A World already exists in the requested directory ${e.id}.`);const s=packages.System.get(e.system);if(!s)throw new Error(`The requested system ${config.system} does not seem to exist!`);e.coreVersion=global.release.version,e.compatibility={minimum:global.release.generation,verified:global.release.generation,maximum:void 0},e.systemVersion=s.version,e.lastPlayed=(new Date).toString();const a=new this(e,{strict:!0});return fs.mkdirSync(t),fs.mkdirSync(path.join(t,"data")),fs.mkdirSync(path.join(t,"scenes")),a.save(),globalThis.logger.info(`${vtt} | Created World "${a.id}"`),this.packages&&this.packages.set(a.id,a),a.vend()}static update(e){delete e.action;const t=this.get(e.id,{strict:!0});return t.updateSource(e),game.world&&(game.world=t),t.save(),t.vend()}static async install(e,t,s,a,i){const o=path.join(this.baseDir,e);if(fs.existsSync(o))throw new Error("You may not install a World on top of a directory that already exists.");return super.install(e,t,s,a,i)}static launch(e){const{express:t,logger:s}=global,a=CONST.SETUP_PACKAGE_PROGRESS,i=this.get(e,{strict:!0});return i.setup().catch((e=>{s.error(e),t.io.emit("progress",{action:a.ACTIONS.LAUNCH_WORLD,step:a.STEPS.ERROR,message:e.message,stack:e.stack}),i.deactivate(null,{asAdmin:!0})})),{}}static _convertRepositoryDataToPackageData(e,t){let s=super._convertRepositoryDataToPackageData(e,t);return s.system=e.requires.length>0?e.requires[0]:"unknown",s.coreVersion=e.version.required_core_version,s}_createPack(e){const t=path.join(this.path,"packs");fs.existsSync(t)||fs.mkdirSync(t),this._source.packs.push(e),this.reset(),this.save()}getActivePacks(e={}){const t=[],s=new Set,a=e=>{if(s.has(e.absPath))return globalThis.logger.error(`More than one package definition was pointing to the same file "${e.absPath}" Only the first one will be loaded.`);t.push(e)};this.packs.forEach(a),this.system.packs.forEach(a);for(const t of this.modules)if(!0===e[t.id])for(const e of t.packs)e.system&&e.system!==this.system.id||a(e);return t}getBaseDocumentTypes(){const e=this.system.loadDataTemplate();return Object.values(documents).reduce(((t,s)=>{const a=[];if(s.schema.has("type")){const t=s.metadata.coreTypes||[],i=s.hasTypeData?e[s.documentName]?.types:[],o=new Set(t.concat(i||[]));o.size&&a.push(...o)}return a.unshift(BASE_DOCUMENT_TYPE),t[s.documentName]=a,t}),{})}async updateActivePacks(e,{onProgress:t}={}){const s=new Set;for(const a of this.getActivePacks(e)){if(!db.packs.has(a.id)){const e=db.defineCompendium(a);await e.connect({strict:!1}),t instanceof Function&&t(e)}s.add(a.id)}for(const e of db.packs.values())s.has(e.collectionName)||(e._connectionFailed||await e.db.close(),db.packs.delete(e.collectionName))}async#s(e){const t=Array.from(await db.Folder.sublevel.values().all()).reduce(((e,t)=>{if("Compendium"!==t.type)return e;const s={_id:t._id,name:t.name,folder:t.folder};return e.set(t._id,s),e}),new Map);for(const e of t.values())e.hierarchyName=this.#a(t,e);const{desiredFolders:s,configUpdate:a}=await this.#i(t,e),i=this.#o(s,a,t);await db.Folder.createDocuments(i,{keepId:!0}),await db.Setting.set("core.compendiumConfiguration",a)}#a(e,t){const s=[];for(;t;)s.unshift(t.name),t=e.get(t.folder);return s.join(".")}async#i(e,t){const{db:s}=global,a=[],i=await s.Setting.getValue("core.compendiumConfiguration")??{},o=[this,this.system,...this.modules];let r=1;const n=async(t,o,c)=>{o.folder=c?._id;const d=this.#a(e,o),m=Array.from(e.values()).find((e=>e.hierarchyName===d));m?o._id=m._id:(o._id=randomID(),a.push({_id:o._id,name:o.name,type:"Compendium",sorting:o.sorting,sort:CONST.SORT_INTEGER_DENSITY*r++,color:o.color,folder:c?c._id:null}),e.set(o._id,{_id:o._id,name:o.name,folder:o.folder,hierarchyName:d}));for(const e of o.packs){const a=`${t.id}.${e}`;if(!s.packs.has(a))continue;const r=i[a]??{};r.folder||(r.folder=o._id),i[a]=r}for(const e of o.folders)await n(t,e,o)};for(const e of o)if(("module"!==e.type||t[e.id])&&e.packs.size&&e.packFolders.size)for(const t of e.packFolders)await n(e,t);return{desiredFolders:a,configUpdate:i}}#o(e,t,s){const a=[];for(const i of e){const o=i._id,r=Object.values(t).find((e=>e.folder===o)),n=Object.values(s).find((e=>e.folder===o)),c=e.find((e=>e.folder===o));r||n||c?a.push(i):delete s[o]}return a}updateDocumentTypes(e){game.documentTypes=this.getBaseDocumentTypes();for(const t of this.modules)if(!0===e[t.id]&&t.documentTypes)for(const[e,s]of Object.entries(t.documentTypes))game.documentTypes[e].push(...Object.keys(s).map((e=>`${t.id}.${e}`)))}async onUpdateModuleConfiguration(e){this.updatingPacks=this.updatingPacks.then((()=>this.updateActivePacks(e))),await this.updatingPacks,this.updateDocumentTypes(e),await this.#s(e)}async setup(){const{game:e,db:t,release:s,logger:a,options:i,express:o}=global;this.#r(),e.world=this,e.system=this.system,e.template=e.system.loadDataTemplate(),e.model=e.system.getDataModel(this.getBaseDocumentTypes()),e.active=!0,this.reset();const r=CONST.SETUP_PACKAGE_PROGRESS.STEPS;let n=t.documents.length,c=0;const d=(e,t)=>{c++;const s=Math.round(c/n*100);o.io.emit("progress",{step:e,message:t,pct:s,action:CONST.SETUP_PACKAGE_PROGRESS.ACTIONS.LAUNCH_WORLD})};await t.connect({onProgress:()=>d(r.CONNECT_WORLD,"SETUP.WorldLaunchConnect")}),e.activity=new Activity(this),e.permissions=await t.Setting.getPermissions(),e.compendiumConfiguration=await t.Setting.getValue("core.compendiumConfiguration"),e.users=await t.User.getUsers(),await this.#n();const m={lastPlayed:(new Date).toString()};if(config.release.isGenerationalChange(this.compatibility.verified)||this.safeMode){a.info(`Launching World ${this.id} in Safe Mode`),await t.Setting.sublevel.findDelete({key:"core.moduleConfiguration"}),await t.Scene.sublevel.findUpdate({active:!0},{active:!1});const e=await t.Playlist.find({playing:!0});for(let t of e){const e=t.sounds.map((e=>({_id:e.id,playing:!1})));t.updateSource({playing:!1,sounds:e}),await t.save()}m.safeMode=!1}if(this.resetKeys){a.info(`Resetting all user access keys in World ${this.id}`);for(let t of e.users)await t.update({password:""});m.resetKeys=!1}this.updateSource(m),this.save();const l=await t.Setting.getValue("core.moduleConfiguration")||{},u=Array.from(this.relationships.requires).concat(Array.from(this.system.relationships.requires));for(const e of this.modules){const t=e.isCompatibleWithSystem(this.system),s=u.find((t=>t.id===e.id)),a=e.relationships.requires.some((e=>!this.modules.get(e.id)));t&&s&&!a?l[e.id]=!0:t&&!a||(l[e.id]=!1)}await global.db.Setting.set("core.moduleConfiguration",l),c=0,n=this.getActivePacks(l).length,await this.updateActivePacks(l,{onProgress:()=>{d(r.CONNECT_PKG,"SETUP.WorldLaunchConnectPackage")}}),isNewerVersion(s.version,this.coreVersion)&&(c=0,n=this.#c().length,await this.migrateCore({onProgress:()=>d(r.MIGRATE_CORE,"SETUP.WorldLaunchMigrateCore")})),isNewerVersion(this.system.version,this.systemVersion)&&(c=0,n=Array.from(t.packs.values()).filter((e=>"world"===e.metadata.package)).length,await this.migrateSystem({onProgress:()=>{d(r.MIGRATE_SYSTEM,"SETUP.WorldLaunchMigrateSystem")}})),await HotReload.watchForHotReload(this,l),e.ready=!0,e.paused=!i.demoMode,d(r.COMPLETE)}async#n(){if(!game.users.filter((e=>e.role===USER_ROLES.GAMEMASTER)).length){let e=game.users.find((e=>"Gamemaster"===e.name));if(e)e.updateSource({role:USER_ROLES.GAMEMASTER}),await e.save(),e=await db.User.get(e.id),game.users.findSplice((t=>t.id===e.id),e);else{let e="";for(;game.users.find((t=>t.name===`Gamemaster${e}`));)e=String((parseInt(e)||0)+1);await db.User.create({name:`Gamemaster${e}`,role:USER_ROLES.GAMEMASTER})}}}async deactivate(e,{asAdmin:t=!1}={}){const{config:s,db:a,game:i,express:o}=global;let r=null;const n={};if(!t){if(!e.user)return{redirect:getRoute("join",{prefix:o.routePrefix})};r=await a.User.get(e.user);if(!(r&&r.hasRole("GAMEMASTER")||e.session&&e.session.admin))return{redirect:getRoute("join",{prefix:o.routePrefix})}}for(let e of Object.keys(i))delete i[e];if(i.ready=!1,i.paused=!0,i.activity&&clearInterval(i.activity._heartbeat),i.documentCache=new DocumentCache,await HotReload.stopWatching(),a.disconnect(),o.io.emit("shutdown",{world:this.id,userId:r?._id??null}),n.lastPlayed=(new Date).toString(),this.#e){const e=Math.round((Date.now()-this.#e)/1e3);n.playtime=this.playtime+e,this.#e=null}return this.updateSource(n),this.save(),this.#r(),{redirect:getRoute("setup",{prefix:s.options.routePrefix})}}async migrateCore({onProgress:e}={}){const{release:t,logger:s}=global;s.info(`Migrating World ${this.id} to updated core platform ${t.version}`);const a=this.#c();for(let t of a)t instanceof Function&&(await t(this).catch((e=>s.error(e))),e instanceof Function&&e());this.updateSource({coreVersion:t.version,compatibility:{minimum:t.generation,verified:t.version}}),await this.save(),s.info(`Core platform migrations for World ${this.id} to version ${t.version} completed successfully`)}async migrateSystem({onProgress:e}={}){const{db:t,logger:s}=global,a=this.system;s.info(`Migrating World ${this.id} to upgraded ${a.id} System version ${a.version}`);for(let e of t.documents)e.hasTypeData&&await e.migrateSystem();await t.Scene.migrateSystem();for(let s of Array.from(t.packs.values()).filter((e=>"world"===e.metadata.package)))await s.migrate(),e instanceof Function&&e(s);this.updateSource({systemVersion:a.version}),await this.save(),s.info(`Migration of World ${this.id} was successful to ${a.id} System version ${a.version}`)}#r(){packages.System.resetPackages(),packages.Module.resetPackages(),packages.World.resetPackages()}static socketListeners(e,t){e.on("world",(t=>this.requestWorldData(e.session,t))),e.on("manageCompendium",t.bind(e,"manageCompendium",this._onManageCompendium.bind(this))),e.on("refreshAddresses",(async e=>{await config.express.refreshAddresses(),e(config.express.getInvitationLinks())}));const s=game.world;s.registerCustomSocket(e),s.system.registerCustomSocket(e);for(const t of s.modules)t.registerCustomSocket(e)}static async requestWorldData(e,t){const{game:s,logger:a}=global;if(!s.world)return t({});const i=e.worlds[s.world.id];if(!i)return t({});try{const e=Date.now();t(await this.#d(i));const s=Date.now()-e;a.info(`Vended World data to User [${i}] in ${Math.round(s)}ms`)}catch(e){a.error(e),t({})}}static async#d(e){const{config:t,db:s,game:a,release:i,logger:o,packages:r}=global,{documentTypes:n,model:c,paused:d,template:m}=a,l=a.world,u=a.users.find((t=>t.id===e));if(!u)throw new Error(`The requested user ID ${e} does not exist`);const p=await global.db.Setting.getValue("core.moduleConfiguration")||{},h=l.modules.map((e=>((e=e.vend()).active=p[e.id]??!1,e))),g=r.warnings.toJSON(),f={};for(const e of l.modules)e.id in g&&(f[e.id]=g[e.id]);const y={userId:e,release:i,world:l.vend(),system:l.system.vend(),modules:h,demoMode:t.options.demoMode,addresses:t.express.getInvitationLinks(),files:t.files.getClientConfig(u),options:{language:t.options.language,port:t.options.port,routePrefix:t.options.routePrefix,updateChannel:t.options.updateChannel,debug:t.options.debug},activeUsers:Array.from(Object.keys(a.activity.users)),documentTypes:n,template:m,model:c,paused:d,packageWarnings:f},w=[];w.push(s.User.dump().then((e=>y.users=e))),w.push(s.Actor.dump({sort:"name"}).then((e=>y.actors=e))),w.push(s.Cards.dump({sort:"name"}).then((e=>y.cards=e))),w.push(s.ChatMessage.dump({sort:"timestamp"}).then((e=>y.messages=e))),w.push(s.Combat.dump().then((e=>y.combats=e))),w.push(s.Folder.dump({sort:"name"}).then((e=>y.folders=e))),w.push(s.Item.dump({sort:"name"}).then((e=>y.items=e))),w.push(s.JournalEntry.dump().then((e=>y.journal=e))),w.push(s.Macro.dump().then((e=>y.macros=e))),w.push(s.Playlist.dump({sort:"name"}).then((e=>y.playlists=e))),w.push(s.RollTable.dump({sort:"name"}).then((e=>y.tables=e))),w.push(s.Scene.dump({sort:"name"}).then((e=>y.scenes=e))),w.push(s.Setting.dump().then((e=>y.settings=e))),await l.updatingPacks,y.packs=[];for(let e of l.getActivePacks(p)){const t=s.packs.get(e.id);if(t&&!t._connectionFailed){e=deepClone(e),delete e.absPath;try{e.index=await t.getIndex(t.metadata.compendiumIndexFields),e.folders=await t.getFolders(),y.packs.push(e)}catch(e){o.error(`Unable to load pack '${t.filename}': ${e.message}`)}}}return w.push(t.updater.checkCoreUpdateAvailability().then((e=>y.coreUpdate=e))),w.push(l.system.getUpdateNotification().then((e=>y.systemUpdate=e))),await Promise.all(w),y}onUserLogin(e){null===this.#e&&(this.#e=Date.now())}onUserLogout(e){if(this.#e&&isEmpty(game.activity.users)){const e=Math.round((Date.now()-this.#e)/1e3);this.updateSource({playtime:this.playtime+e}),this.save(),this.#e=null}}static async _onManageCompendium(e,{action:t,type:s,data:a,options:i}={}){switch(t){case"create":return this._onCreateCompendium(e,a,i);case"delete":return this._onDeleteCompendium(e,a,i);case"migrate":return this._onMigrateCompendium(e,a,i);default:throw new Error(`Invalid Compendium management action ${t} requested`)}}static async _onCreateCompendium(e,t,s={}){if(!e.isGM)throw new Error(`User ${e.name} cannot create a new Compendium pack`);const a=game.world,i=BaseWorld.schema.fields.packs.element;if(t.name=t.name||t.label.slugify({strict:!0}),t.name||(t.name=`${t.type}-${randomID()}`),t.path=`packs/${t.name}`,t.system=a.system.id,(t=i.clean(t)).package="world",db.packs.has(`${t.package}.${t.name}`))throw new Error(`The Compendium pack ${t.name} already exists in the World and cannot be created`);const o=i.validate(t);if(!isEmpty(o)){const e=this.formatValidationErrors(o,{label:"Invalid Compendium Pack Data:"});throw new Error(e)}game.world._createPack(t);const r=a.packs.find((e=>e.name===t.name)),n=global.db.defineCompendium(r);await n.connect(),logger.info(`Created World Compendium Pack ${n.collectionName}`);const c=s.source?db.packs.get(s.source):null;if(c){const e=(await c.connect()).iterator(),t=n.db.batch();for await(const[s,a]of e)t.put(s,a);await e.close(),await t.write()}return t.id=`world.${t.name}`,t.packageType="world",t.packageName=a.id,t.index=await n.getIndex(n.metadata.compendiumIndexFields),t.folders=await n.getFolders(),t}static async _onDeleteCompendium(e,t,s={}){if(!e.isGM)throw new Error(`User ${e.name} cannot delete a Compendium pack`);const a=`world.${t}`;if(!db.packs.has(a))throw new Error(`The requested World pack name ${t} does not exist`);const i=db.packs.get(a);return await i.deleteCompendium(),game.world._source.packs.findSplice((e=>e.name===i.packData.name)),game.world.reset(),game.world.save(),a}static async _onMigrateCompendium(e,t,s={}){if(!e.isGM)throw new Error(`User ${e.name} cannot migrate a Compendium Pack`);const a=db.packs.get(t);if(!a)throw new Error(`The Compendium Pack ${t} does not exist!`);return a.connected||await a.connect(),await a.migrate({user:e,...s}),a.packData}#c(){const e=this.coreVersion;return Object.entries(migrations).reduce(((t,s)=>(isNewerVersion(s[0],e)&&(t=t.concat(s[1])),t)),[])}}