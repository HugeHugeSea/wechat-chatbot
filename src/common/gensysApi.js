const axiosinstance = require('../services/axiosinstance');

const ctrl = {

    createConversation: async function() {
        const data = {
            "organizationId": "b7e136ce-2f5b-443c-9db4-9863b0a68cf1",
            "deploymentId" : "15db3528-5bd1-4f26-9f01-2014fdbc4dfb",
            "routingTarget" : {
                "targetType" : "QUEUE",
                "targetAddress": "test-chat-queue",
                "priority": 2
            },
            "memberInfo" : {
                "displayName" : "Joe Dirt",
                "avatarImageUrl": "http://some-url.com/JoeDirtsFace",
                "lastName" : "Joe",
                "firstName" : "Dirt",
                "email" : "joe.dirt@example.com",
                "phoneNumber" : "+12223334444",
                "role": "CUSTOMER",
                "customFields" : {
                    "some_field" : "arbitrary data",
                    "another_field" : "more arbitrary data"
                }
            }
        }
        try {
            const result = await axiosinstance({
                method: 'post',
                url:'https://api.mypurecloud.jp/api/v2/webchat/guest/conversations',
                data: data,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${process.env.FOUNDATION_SERVICE_VALIDATION_JWT_TOKEN}`,
                },
            })
            return result.data;
        }catch (e) {
            console.log(e);
            throw e;
        }
    },

    clientSendMessage: async function(msg, conversationId, memberId, jwt) {
        try {
            const result = await axiosinstance({
                method: 'post',
                url:'https://api.mypurecloud.jp/api/v2/webchat/guest/conversations/'+conversationId+'/members/'+memberId+'/messages',
                data: msg,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ` + jwt,
                },
            })
            return result;
        }catch (e) {
            console.log(e);
            throw e;
        }
    },

    getMemberInfo: async function(conversationId, memberId, jwt) {
        try {
            const result = await axiosinstance({
                method: 'get',
                url:'https://api.mypurecloud.jp/api/v2/webchat/guest/conversations/'+conversationId+'/members/'+memberId,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ` + jwt,
                },
            })
            return result;
        }catch (e) {
            console.log(e);
            throw e;
        }
    },

    endConversation: async function(conversationId, memberId, jwt) {
        try {
            const result = await axiosinstance({
                method: 'delete',
                url:'https://api.mypurecloud.jp/api/v2/webchat/guest/conversations/'+conversationId+'/members/'+memberId,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ` + jwt,
                },
            })
            return result;
        }catch (e) {
            console.log(e);
            throw e;
        }
    }

}

module.exports = ctrl;
