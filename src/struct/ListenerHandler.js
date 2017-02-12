const AkairoHandler = require('./AkairoHandler');
const Listener = require('./Listener');
const { Collection } = require('discord.js');
const EventEmitter = require('events');

/** @extends AkairoHandler */
class ListenerHandler extends AkairoHandler {
    /**
     * Loads listeners and registers them with EventEmitters.
     * @param {AkairoClient} client - The Akairo client.
     * @param {Object} options - Options from client.
     */
    constructor(client, options){
        super(client, options.listenerDirectory, Listener);

        /**
         * EventEmitters for use, mapped by name to EventEmitter. 'client', 'commandHandler', 'inhibitorHandler', 'listenerHandler' are set by default.
         * @type {Collection.<string, EventEmitter>}
         */
        this.emitters = new Collection();
        this.emitters.set('client', this.client);
        this.emitters.set('commandHandler', this.client.commandHandler);
        this.emitters.set('inhibitorHandler', this.client.inhibitorHandler);
        this.emitters.set('listenerHandler', this.client.listenerHandler);

        if (options.emitters) Object.keys(options.emitters).forEach(key => {
            if (this.emitters.has(key)) return;
            this.emitters.set(key, options.emitters[key]);
        });

        this.modules.forEach(m => this.register(m.id));

        // The properties below are from AkairoHandler.
        // They are only here for documentation purposes.

        /**
         * Directory to listeners.
         * @readonly
         * @type {string}
         */
        this.directory;

        /**
         * Listeners loaded, mapped by ID to Listener.
         * @type {Collection.<string, Listener>}
         */
        this.modules;
    }

    /**
     * Collection of listeners. Alias to this.modules.
     * @type {Collection.<string, Listener>}
     */
    get listeners(){
        return this.modules;
    }

    /**
     * Loads a listener.
     * @param {string} filepath - Path to file.
     * @returns {Listener}
     */
    load(filepath){
        const listener = super.load(filepath);
        return listener;
    }

    /**
     * Removes a listener.
     * @param {string} id - ID of the listener.
     * @returns {Listener}
     */
    remove(id){
        this.deregister(id);
        return super.remove(id);
    }

    /**
     * Reloads a listener.
     * @param {string} id - ID of the listener.
     * @returns {Listener}
     */
    reload(id){
        this.deregister(id);

        const listener = super.reload(id);
        this.register(listener.id);
        
        return listener;
    }
    
    /**
     * Registers a listener with the EventEmitter.
     * @param {string} id - ID of the listener.
     */
    register(id){
        const listener = this.listeners.get(id);
        if (!listener) throw new Error(`Listener ${id} does not exist.`);

        const emitter = listener.emitter instanceof EventEmitter ? listener.emitter : this.emitters.get(listener.emitter);
        if (!(emitter instanceof EventEmitter)) throw new Error('Listener\'s emitter is not an EventEmitter');

        if (listener.type === 'once'){
            return emitter.once(listener.eventName, listener.exec);
        }

        emitter.on(listener.eventName, listener.exec);
    }

    /**
     * Removes a listener from the EventEmitter.
     * @param {string} id - ID of the listener.
     */
    deregister(id){
        const listener = this.listeners.get(id);
        if (!listener) throw new Error(`Listener ${id} does not exist.`);

        const emitter = listener.emitter instanceof EventEmitter ? listener.emitter : this.emitters.get(listener.emitter);
        if (!(emitter instanceof EventEmitter)) throw new Error('Listener\'s emitter is not an EventEmitter');

        emitter.removeListener(listener.eventName, listener.exec);
    }

     // Only here for documentation.

    /**
     * Adds an inhibitor.
     * @param {string} filename - Filename to lookup in the directory. A .js extension is assumed.
     * @returns {Inhibitor}
     */
    add(...args){ super.add(...args); }

    /**
     * Reloads all inhibitors.
     */
    reloadAll(...args){ super.reloadAll(...args); }
}

module.exports = ListenerHandler;

/**
 * Emitted when a listener is added.
 * @event ListenerHandler#add
 * @param {Listener} listener - Listener added.
 */

/**
 * Emitted when a listener is removed.
 * @event ListenerHandler#remove
 * @param {Listener} listener - Listener removed.
 */

/**
 * Emitted when a listener is reloaded.
 * @event ListenerHandler#reload
 * @param {Listener} listener - Listener reloaded.
 */

/**
 * Emitted when a listener is enabled.
 * @event ListenerHandler#enable
 * @param {Listener} listener - Listener enabled.
 */

/**
 * Emitted when a listener is disabled.
 * @event ListenerHandler#disable
 * @param {Listener} listener - Listener disabled.
 */
