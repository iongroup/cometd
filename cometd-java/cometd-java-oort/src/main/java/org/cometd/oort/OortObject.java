/*
 * Copyright (c) 2008-2016 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.cometd.oort;

import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.EventListener;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Queue;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicLong;

import org.cometd.bayeux.Channel;
import org.cometd.bayeux.server.BayeuxServer;
import org.cometd.bayeux.server.ConfigurableServerChannel;
import org.cometd.bayeux.server.LocalSession;
import org.cometd.bayeux.server.ServerChannel;
import org.cometd.bayeux.server.ServerMessage;
import org.cometd.bayeux.server.ServerSession;
import org.eclipse.jetty.util.component.AbstractLifeCycle;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * <p>An {@link OortObject} represents a named composite entity that is distributed in an Oort cluster.</p>
 * <p>A typical example is an oort object that stores the number of users connected to an Oort node.
 * The entity in this case is a {@code long} value representing the number of connected users.
 * Such oort object may be named 'user_count', and there will be an oort object instance with this name in each node.
 * Each oort object instance will have a different local value, along with all the values from the other nodes.</p>
 * <p>A particular {@link OortObject} has a unique name across the node and is made of N parts,
 * where N is the number of active nodes. A part is represented by {@link Info} instances.
 * Each {@link Info} instance represents the contribution of that node to the whole {@link OortObject}
 * and stores the Oort URL of the node it represents along with the entity in that node.</p>
 * <pre>
 *     +------------+
 *     | user_count |
 * +---+---+----+---+--------------------+
 * | part1 | 13 | local - http://oort1/  |
 * +-------+----+------------------------+
 * | part2 | 19 | remote - http://oort2/ |
 * +-------+----+------------------------+
 * | part3 | 29 | remote - http://oort3/ |
 * +-------+----+------------------------+
 * </pre>
 * <p>An {@link OortObject} must be created and then {@link #start() started}:</p>
 * <pre>
 * Oort oort1 = ...;
 * OortObject userCount1 = new OortObject(oort1, "user_count", OortObjectFactories.forLong());
 * userCount1.start();
 * </pre>
 * <p>Once started, it connects via Oort facilities to the other nodes and communicates with the oort object
 * instances that have the same name that live in the other nodes.
 * The communication is performed on a channel constructed from the oort object's name and returned by
 * {@link #getChannelName()}.</p>
 * <p>Oort objects work best when the entity they hold is an immutable, value-type object: {@code OortObject<Long>}
 * works better than {@code OortObject<AtomicLong>} because AtomicLong is mutable and its APIs
 * (for example, {@link AtomicLong#compareAndSet(long, long)}) are not exposed by {@link OortObject}.</p>
 * <p>Objects stored by an oort object are created using a {@link Factory}. This is necessary to recreate
 * objects that may be serialized differently when transmitted via JSON, without forcing a global JSON serializer.
 * A number of factories are available in {@link OortObjectFactories}, and applications can write their own.</p>
 * <p>Applications can change the entity value of the oort object and broadcast the change to other nodes via
 * {@link #setAndShare(Object)}. The other nodes will receive a message on the oort object's channel
 * and set the new entity value in the part that corresponds to the node that changed the entity.
 * The diagram below shows one oort object with name "user_count" in two nodes.
 * On the left of the arrow (A), the situation before calling:</p>
 * <pre>
 * userCount1.setAndShare(17);
 * </pre>
 * <p>and on the right of the arrow (A) the situation afterwards, that shows how the value is first changed
 * (1) locally on {@code node_1}, then a message (2) is broadcast on the cluster, reaches
 * {@code node_2}, where it updates (3) the part corresponding to {@code node_1} to the new value.</p>
 * <pre>
 * +-------------+  +-------------+         +-----------------+       +-----------------+
 * |   node_1    |  |   node_2    |         |     node_1      |       |     node_2      |
 * +-------------+  +-------------+         +-----------------+  (2)  +-----------------+
 * | user_count  |  | user_count  |   (A)   |   user_count    | ----&gt; |   user_count    |
 * +--------+----+  +--------+----+  ----&gt;  +--------+--------+       +--------+--------+
 * | local  | 13 |  | local  | 19 |         | local  | 17 (1) |       | local  | 19     |
 * +--------+----+  +--------+----+         +--------+--------+       +--------+--------+
 * | remote | 19 |  | remote | 13 |         | remote | 19     |       | remote | 17 (3) |
 * +--------+----+  +-------+----+          +--------+--------+       +-------+---------+
 * </pre>
 * <p>When an entity is updated, either locally or remotely, an event is fired to registered {@link Listener}s.</p>
 * <p>Oort objects can only update the entity they own; in the example above, {@code node_1} can only update
 * the "local" value 13 to 17, but cannot modify the "remote" value 19, which is owned by {@code node_2}.
 * Only update messages from {@code node_1} can update the "remote" value on {@code node_2}.
 * Every node has a part that belongs to a particular node, and only that particular node can update it.</p>
 * <p>Values of oort objects may be merged using a {@link Merger} via {@link #merge(Merger)}.
 * A number of mergers are available in {@link OortObjectMergers}, and applications can write their own.
 * For example:</p>
 * <pre>
 * long totalUsersOnAllNodes = userCount1.merge(OortObjectMergers.longSum()); // yields 17+19=36
 * </pre>
 * <p>Oort objects implement a strategy where value objects are replicated in each node, trading increased memory
 * usage for reduced latency accessing the data.
 * An alternative strategy that trades reduced memory usage for increased latency is implemented by
 * {@link OortService}.</p>
 *
 * @param <T> the type of value object stored in this oort object
 */
public class OortObject<T> extends AbstractLifeCycle implements ConfigurableServerChannel.Initializer, Oort.CometListener, Iterable<OortObject.Info<T>>
{
    public static final String OORT_OBJECTS_CHANNEL = "/oort/objects";
    private static final String ACTION_FIELD_PULL_VALUE = "oort.object.pull";

    private final Map<String, Info<T>> infos = new ConcurrentHashMap<>();
    private final List<Listener<T>> listeners = new CopyOnWriteArrayList<>();
    private final AtomicLong versions = new AtomicLong();
    private final Processor processor = new Processor();
    protected final Logger logger;
    private final Oort oort;
    private final String name;
    private final Factory<T> factory;
    private final LocalSession sender;
    private final String broadcastChannel;
    private final ServerChannel.MessageListener broadcastListener;
    private final String serviceChannel;
    private final ServerChannel.MessageListener serviceListener;

    public OortObject(Oort oort, String name, Factory<T> factory)
    {
        this.oort = oort;
        this.name = name;
        this.factory = factory;
        this.logger = LoggerFactory.getLogger(getClass().getName() + "." + Oort.replacePunctuation(oort.getURL(), '_') + "." + name);
        this.sender = oort.getBayeuxServer().newLocalSession(getClass().getSimpleName() + "." + name);
        this.broadcastChannel = OORT_OBJECTS_CHANNEL + "/" + name;
        this.broadcastListener = new BroadcastListener();
        this.serviceChannel = Channel.SERVICE + broadcastChannel;
        this.serviceListener = new ServiceListener();
    }

    @Override
    protected void doStart() throws Exception
    {
        Info<T> info = newInfo(factory.newObject(null));
        infos.put(oort.getURL(), info);
        if (logger.isDebugEnabled())
            logger.debug("Set local {}", info);

        sender.handshake();
        oort.addCometListener(this);
        BayeuxServer bayeuxServer = oort.getBayeuxServer();
        ServerChannel channel = bayeuxServer.createChannelIfAbsent(broadcastChannel, this).getReference();
        channel.addListener(broadcastListener);
        oort.observeChannel(broadcastChannel);
        bayeuxServer.createChannelIfAbsent(serviceChannel, this).getReference().addListener(serviceListener);

        // Notify other nodes of our initial value.
        // Must be done after registering listeners,
        // to avoid missing responses from other nodes.
        channel.publish(getLocalSession(), info);

        if (logger.isDebugEnabled())
            logger.debug("{} started", this);
    }

    @Override
    protected void doStop() throws Exception
    {
        oort.deobserveChannel(broadcastChannel);
        BayeuxServer bayeuxServer = oort.getBayeuxServer();
        ServerChannel channel = bayeuxServer.getChannel(broadcastChannel);
        if (channel != null)
            channel.removeListener(broadcastListener);
        channel = bayeuxServer.getChannel(serviceChannel);
        if (channel != null)
            channel.removeListener(serviceListener);
        oort.removeCometListener(this);
        sender.disconnect();
        infos.clear();
        if (logger.isDebugEnabled())
            logger.debug("{} stopped", this);
    }

    /**
     * Configures the channel used by this oort object.
     * By default does nothing, but subclasses may override this method to make the channel lazy, for example.
     *
     * @param channel the channel to configure
     * @see #getChannelName()
     */
    public void configureChannel(ConfigurableServerChannel channel)
    {
        // Allow subclasses to override
    }

    /**
     * @return the {@link Oort} instance associated with this oort object
     */
    public Oort getOort()
    {
        return oort;
    }

    /**
     * @return the name of this oort object, that must be unique across the node.
     */
    public String getName()
    {
        return name;
    }

    /**
     * @return the factory to create objects contained in this oort object
     */
    public Factory<T> getFactory()
    {
        return factory;
    }

    /**
     * @return the local session that sends messages to other nodes
     */
    public LocalSession getLocalSession()
    {
        return sender;
    }

    /**
     * Returns the channel name used by this oort object for communication with other oort objects in other nodes.
     * The channel is of the form "/oort/objects/&lt;name&gt;" where &lt;name&gt; is this oort object's
     * {@link #getName() name}.
     *
     * @return the channel name used by this oort object
     * @see #configureChannel(ConfigurableServerChannel)
     */
    public String getChannelName()
    {
        return broadcastChannel;
    }

    /**
     * <p>Sets the given new object on this oort object, and then broadcast the new object to all nodes in the cluster.</p>
     * <p>Setting an object triggers notification of {@link Listener}s, both on this node and on remote nodes.</p>
     *
     * @param newObject the new object to set
     * @return the old object
     */
    public T setAndShare(T newObject)
    {
        if (newObject == null)
            throw new NullPointerException();

        Data<T> data = new Data<>(4);
        data.put(Info.VERSION_FIELD, nextVersion());
        data.put(Info.OORT_URL_FIELD, getOort().getURL());
        data.put(Info.NAME_FIELD, getName());
        data.put(Info.OBJECT_FIELD, serialize(newObject));

        if (logger.isDebugEnabled())
            logger.debug("Sharing {}", data);
        BayeuxServer bayeuxServer = oort.getBayeuxServer();
        bayeuxServer.getChannel(getChannelName()).publish(getLocalSession(), data);

        return data.getResult();
    }

    protected Object serialize(T object)
    {
        return object;
    }

    protected Object deserialize(Object object)
    {
        return object;
    }

    protected Info<T> newInfo(T local)
    {
        if (local == null)
            throw new NullPointerException();
        Info<T> info = new Info<>(nextVersion(), oort.getURL());
        info.put(Info.OORT_URL_FIELD, oort.getURL());
        info.put(Info.NAME_FIELD, getName());
        info.put(Info.OBJECT_FIELD, local);
        return info;
    }

    protected long nextVersion()
    {
        return versions.getAndIncrement();
    }

    public void cometJoined(Event event)
    {
        String remoteOortURL = event.getCometURL();
        if (logger.isDebugEnabled())
            logger.debug("Oort {} joined", remoteOortURL);
        pushInfo(remoteOortURL, null);
    }

    public void cometLeft(Event event)
    {
        String remoteOortURL = event.getCometURL();
        if (logger.isDebugEnabled())
            logger.debug("Oort {} left", remoteOortURL);
        Info<T> info = removeInfo(remoteOortURL);
        if (info != null)
        {
            if (logger.isDebugEnabled())
                logger.debug("Removed remote {}", info);
            notifyRemoved(info);
        }
    }

    /**
     * @return an iterator over the {@link Info} known to this oort object
     */
    public Iterator<Info<T>> iterator()
    {
        return getInfos().iterator();
    }

    /**
     * @param oortURL the oort URL used to search the corresponding {@link Info}
     * @return the {@link Info} with the given oort URL, or null if no such {@link Info} exists
     */
    public Info<T> getInfo(String oortURL)
    {
        return infos.get(oortURL);
    }

    Info<T> removeInfo(String oortURL)
    {
        return infos.remove(oortURL);
    }

    /**
     * @param object the object used to search the corresponding {@link Info}
     * @return the first {@link Info} whose object equals (via a possibly overridden {@link Object#equals(Object)})
     *         the given {@code object}
     */
    public Info<T> getInfoByObject(T object)
    {
        for (Info<T> info : this)
        {
            if (info.getObject().equals(object))
                return info;
        }
        return null;
    }

    /**
     * Merges the objects of all the {@link Info}s known to this oort object using the given {@code strategy}.
     *
     * @param strategy the strategy to merge the objects
     * @param <R>      the merge result type
     * @return the merged result
     */
    public <R> R merge(Merger<T, R> strategy)
    {
        return strategy.merge(getInfos());
    }

    /**
     * @param listener the listener to add
     */
    public void addListener(Listener<T> listener)
    {
        listeners.add(listener);
    }

    /**
     * @param listener the listener to remove
     */
    public void removeListener(Listener<T> listener)
    {
        listeners.remove(listener);
    }

    protected void notifyUpdated(Info<T> oldInfo, Info<T> newInfo)
    {
        for (Listener<T> listener : listeners)
        {
            try
            {
                listener.onUpdated(oldInfo, newInfo);
            }
            catch (Throwable x)
            {
                logger.info("Exception while invoking listener " + listener, x);
            }
        }
    }

    protected void notifyRemoved(Info<T> info)
    {
        for (Listener<T> listener : listeners)
        {
            try
            {
                listener.onRemoved(info);
            }
            catch (Throwable x)
            {
                logger.info("Exception while invoking listener " + listener, x);
            }
        }
    }

    protected void onObject(Map<String, Object> data)
    {
        String oortURL = (String)data.get(Info.OORT_URL_FIELD);
        boolean isLocal = oort.getURL().equals(oortURL);
        Object object = data.get(Info.OBJECT_FIELD);
        if (!isLocal)
        {
            object = deserialize(object);
            // Convert the object, for example from a JSON serialized Map to a ConcurrentMap.
            object = getFactory().newObject(object);
        }

        Info<T> oldInfo = getInfo(oortURL);
        Info<T> newInfo = new Info<>(oort.getURL(), data);
        newInfo.put(Info.OBJECT_FIELD, object);

        boolean updated = oldInfo == null || oldInfo.getVersion() < newInfo.getVersion();
        if (updated)
            infos.put(oortURL, newInfo);

        if (logger.isDebugEnabled())
            logger.debug("{} {} update of {} with {}",
                updated ? "Performed" : "Skipped",
                newInfo.isLocal() ? "local" : "remote",
                oldInfo, newInfo);

        // Notify only if we could replace.
        if (updated)
            notifyUpdated(oldInfo, newInfo);

        // If we did not have an info for the new Oort, then it's a
        // new OortObject and we need to push our own data to it.
        if (oldInfo == null)
        {
            // We want to avoid an additional message at initialization.
            // We are A, we just received infoB from B, which we did not have,
            // so we push infoA to B. Very likely, B will receive infoA, find
            // that it does not have info for A and push infoB to A, again.
            // Therefore we add a "peer" field, that tells whether the push
            // of the info comes from, and we skip the extra push.
            if (!oort.getURL().equals(data.get(Info.PEER_FIELD)))
            {
                Map<String, Object> fields = new HashMap<>();
                fields.put(Info.PEER_FIELD, oortURL);
                pushInfo(oortURL, fields);
            }
        }

        // Set the result
        if (data instanceof Data)
            ((Data<T>)data).setResult(oldInfo == null ? null : oldInfo.getObject());
    }

    protected void pushInfo(String oortURL, Map<String, Object> fields)
    {
        OortComet oortComet = oort.getComet(oortURL);
        if (oortComet != null)
        {
            Map<String, Object> message = fields;
            if (message == null)
                message = new HashMap<>();
            message.putAll(getInfo(oort.getURL()));
            if (logger.isDebugEnabled())
                logger.debug("Pushing (to {}): {}", oortURL, message);
            oortComet.getChannel(serviceChannel).publish(message);
        }
    }

    protected void pullInfo(String oortURL)
    {
        OortComet oortComet = oort.getComet(oortURL);
        if (oortComet != null)
        {
            Map<String, Object> message = new HashMap<>();
            message.put(Info.OORT_URL_FIELD, getOort().getURL());
            message.put(Info.NAME_FIELD, getName());
            message.put(Info.ACTION_FIELD, ACTION_FIELD_PULL_VALUE);
            if (logger.isDebugEnabled())
                logger.debug("Pulling (from {}): {}", oortURL, message);
            oortComet.getChannel(serviceChannel).publish(message);
        }
    }

    protected Collection<Info<T>> getInfos()
    {
        return new ArrayList<>(infos.values());
    }

    @Override
    public String toString()
    {
        return String.format("%s[%s]@%s", getClass().getSimpleName(), getName(), getOort().getURL());
    }

    /**
     * The oort object part holding the object and the metadata associated with it.
     *
     * @param <T> the type of the object
     */
    public static class Info<T> extends HashMap<String, Object>
    {
        public static final String VERSION_FIELD = "oort.info.version";
        public static final String OORT_URL_FIELD = "oort.info.url";
        public static final String NAME_FIELD = "oort.info.name";
        public static final String OBJECT_FIELD = "oort.info.object";
        public static final String TYPE_FIELD = "oort.info.type";
        public static final String ACTION_FIELD = "oort.info.action";
        public static final String PEER_FIELD = "oort.info.peer";

        // The local Oort URL
        private final String oortURL;

        protected Info(long version, String oortURL)
        {
            super(4);
            this.oortURL = oortURL;
            put(VERSION_FIELD, version);
        }

        protected Info(String oortURL, Map<? extends String, ?> map)
        {
            this(((Number)map.get(VERSION_FIELD)).longValue(), oortURL);
            putAll(map);
        }

        protected long getVersion()
        {
            return ((Number)get(VERSION_FIELD)).longValue();
        }

        /**
         * @return the oort URL of this part
         */
        public String getOortURL()
        {
            return (String)get(OORT_URL_FIELD);
        }

        /**
         * @return the name of the oort object
         */
        public String getName()
        {
            return (String)get(NAME_FIELD);
        }

        /**
         * @return the object value
         */
        @SuppressWarnings("unchecked")
        public T getObject()
        {
            return (T)get(OBJECT_FIELD);
        }

        /**
         * @return whether this Info is local to this node
         */
        public boolean isLocal()
        {
            return oortURL.equals(getOortURL());
        }

        @Override
        public String toString()
        {
            T object = getObject();
            String objectString = object instanceof Object[] ? Arrays.toString((Object[])object) : String.valueOf(object);
            return String.format("%s[%s/%d] (from %s): %s", getClass().getSimpleName(), getName(), getVersion(), getOortURL(), objectString);
        }
    }

    protected static class Data<T> extends HashMap<String, Object>
    {
        private T result;

        public Data(int initialCapacity)
        {
            super(initialCapacity);
        }

        protected T getResult()
        {
            return result;
        }

        protected void setResult(T result)
        {
            this.result = result;
        }
    }

    /**
     * Factory that creates objects stored by {@link OortObject}s.
     *
     * @param <T> the type of the objects created
     */
    public interface Factory<T>
    {
        /**
         * Creates a new non-null object from the given {@code representation}.
         * The {@code representation} may be the result of JSON serialization,
         * and this factory may convert it to a more appropriate object, for
         * example from a JSON serialized {@link Map} to a {@link ConcurrentMap}.
         *
         * @param representation the representation of the object, may be null
         *                       to indicate to return a default, non-null object
         * @return the new, non-null, object from the representation
         */
        public T newObject(Object representation);
    }

    /**
     * A merge strategy for object values.
     *
     * @param <T> the oort object type
     * @param <R> the merge result type
     */
    public interface Merger<T, R>
    {
        /**
         * Merges the given {@link Info}s.
         *
         * @param infos the {@link Info}s to merge
         * @return the merge result
         */
        public R merge(Collection<Info<T>> infos);
    }

    /**
     * Listener for events that update the value of a {@link Info}, either local or remote.
     * Implementers may detect whether the value has been changed locally or remotely using {@link Info#isLocal()}.
     *
     * @param <T> the object type
     */
    public interface Listener<T> extends EventListener
    {
        /**
         * Callback method invoked when the object value is updated.
         *
         * @param oldInfo the {@link Info} before the change, may be null
         * @param newInfo the {@link Info} after the change
         */
        public void onUpdated(Info<T> oldInfo, Info<T> newInfo);

        /**
         * Callback method invoked when the object value is removed, for example
         * because the correspondent node has been shut down or crashed.
         *
         * @param info the {@link Info} before the removal
         */
        public void onRemoved(Info<T> info);

        /**
         * An empty implementation of {@link Listener}.
         *
         * @param <T> the object type
         */
        public static class Adapter<T> implements Listener<T>
        {
            public void onUpdated(Info<T> oldInfo, Info<T> newInfo)
            {
            }

            public void onRemoved(Info<T> info)
            {
            }
        }
    }

    private class BroadcastListener implements ServerChannel.MessageListener
    {
        public boolean onMessage(ServerSession from, ServerChannel channel, ServerMessage.Mutable message)
        {
            if (logger.isDebugEnabled())
                logger.debug("Received broadcast {}", message);
            boolean local = from == getLocalSession().getServerSession();
            processor.process(local, message);
            return true;
        }
    }

    private class ServiceListener implements ServerChannel.MessageListener
    {
        @Override
        public boolean onMessage(ServerSession from, ServerChannel channel, ServerMessage.Mutable message)
        {
            if (logger.isDebugEnabled())
                logger.debug("Received service {}", message);
            boolean local = from == getLocalSession().getServerSession();
            processor.process(local, message);
            return true;
        }
    }

    /**
     * Messages are processed one after the other
     * so that implementations of {@link #onObject(Map)}
     * do not need to worry about concurrency.
     */
    private class Processor
    {
        private final Queue<ServerMessage> messages = new ArrayDeque<>();
        private boolean active;

        private void process(boolean local, ServerMessage msg)
        {
            synchronized (this)
            {
                messages.offer(msg);
                if (local)
                {
                    while (active)
                    {
                        if (!await())
                            return;
                    }
                }
                else
                {
                    if (active)
                        return;
                }
                active = true;
            }

            while (true)
            {
                ServerMessage message;
                synchronized (this)
                {
                    message = messages.poll();
                    if (message == null)
                    {
                        active = false;
                        notifyAll();
                        return;
                    }
                }

                Map<String, Object> data = message.getDataAsMap();
                boolean sameName = getName().equals(data.get(Info.NAME_FIELD));
                if (sameName)
                {
                    if (ACTION_FIELD_PULL_VALUE.equals(data.get(Info.ACTION_FIELD)))
                    {
                        String oortURL = (String)data.get(Info.OORT_URL_FIELD);
                        pushInfo(oortURL, null);
                    }
                    else
                    {
                        onObject(data);
                    }
                }
            }
        }

        private boolean await()
        {
            try
            {
                wait();
                return true;
            }
            catch (InterruptedException x)
            {
                return false;
            }
        }
    }
}
