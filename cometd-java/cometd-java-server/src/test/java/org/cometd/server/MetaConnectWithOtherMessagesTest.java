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
package org.cometd.server;

import org.cometd.bayeux.Channel;
import org.cometd.bayeux.Message;
import org.cometd.bayeux.server.ServerChannel;
import org.cometd.common.JettyJSONContextClient;
import org.eclipse.jetty.client.api.ContentResponse;
import org.eclipse.jetty.client.api.Request;
import org.junit.Assert;
import org.junit.Test;

public class MetaConnectWithOtherMessagesTest extends AbstractBayeuxClientServerTest
{
    public MetaConnectWithOtherMessagesTest(String serverTransport)
    {
        super(serverTransport);
    }

    @Test
    public void testFirstMetaConnectWithOtherMessages() throws Exception
    {
        startServer(null);

        Request handshake = newBayeuxRequest("[{" +
                "\"channel\": \"/meta/handshake\"," +
                "\"version\": \"1.0\"," +
                "\"supportedConnectionTypes\": [\"long-polling\"]" +
                "}]");
        ContentResponse response = handshake.send();
        Assert.assertEquals(200, response.getStatus());

        String clientId = extractClientId(response);

        String channelName = "/test/multi";
        Request connect1 = newBayeuxRequest("[{" +
                "\"channel\": \"/meta/connect\"," +
                "\"clientId\": \"" + clientId + "\"," +
                "\"connectionType\": \"long-polling\"" +
                "},{" +
                "\"channel\": \"/meta/subscribe\"," +
                "\"clientId\": \"" + clientId + "\"," +
                "\"subscription\": \"" + channelName + "\"" +
                "}]");
        response = connect1.send();
        Assert.assertEquals(200, response.getStatus());

        JettyJSONContextClient parser = new JettyJSONContextClient();
        Message.Mutable[] messages = parser.parse(response.getContentAsString());

        Assert.assertEquals(2, messages.length);

        Message.Mutable connectReply = messages[0];
        Assert.assertEquals(Channel.META_CONNECT, connectReply.getChannel());

        Message.Mutable subscribeReply = messages[1];
        Assert.assertEquals(Channel.META_SUBSCRIBE, subscribeReply.getChannel());

        ServerChannel channel = bayeux.getChannel(channelName);
        // Cannot be null since it has a subscriber.
        Assert.assertNotNull(channel);
        Assert.assertEquals(1, channel.getSubscribers().size());
    }
}
