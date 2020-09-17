const axiosinstance = require('../services/axiosinstance');
const logger = require('../services/logger');
const MODULE = 'common/gensysApi';

const ctrl = {

    createConversation: async function(userInfo, log=logger) {
        const _log = log.child({ module: MODULE, method: 'createConversation' });
        const data = {
            "organizationId": "b7e136ce-2f5b-443c-9db4-9863b0a68cf1",
            "deploymentId" : "15db3528-5bd1-4f26-9f01-2014fdbc4dfb",
            "routingTarget" : {
                "targetType" : "QUEUE",
                "targetAddress": "test-chat-queue",
                "priority": 2
            },
            "memberInfo" : {
                "displayName" : userInfo.nickname,
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
            _log.error('failed create conversation: ', e);
            throw e;
        }
    },

    clientSendMessage: async function(msg, conversationId, memberId, jwt, log=logger) {
        const _log = log.child({ module: MODULE, method: 'clientSendMessage' });
        const data = {
            body : msg,
            bodyType : 'standard | notice'}
        try {
            const result = await axiosinstance({
                method: 'post',
                url:'https://api.mypurecloud.jp/api/v2/webchat/guest/conversations/'+conversationId+'/members/'+memberId+'/messages',
                data: data,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ` + jwt,
                },
            })
            return result;
        }catch (e) {
            _log.error('failed send message: ', e);
            throw e;
        }
    },

    getMemberInfo: async function(conversationId, memberId, jwt,  log=logger) {
        const _log = log.child({ module: MODULE, method: 'getMemberInfo' });
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
            _log.error('failed get member information: ', e);
            throw e;
        }
    },

    endConversation: async function(conversationId, memberId, jwt, log=logger) {
        const _log = log.child({ module: MODULE, method: 'endConversation' });
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
            _log.error('failed end conversation: ', e);
            throw e;
        }
    }

}

module.exports = ctrl;
