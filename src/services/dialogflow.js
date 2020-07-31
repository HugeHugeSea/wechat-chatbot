const dialogflow = require('dialogflow');

const MODULE = 'services/dialogflow';
const logger = require('./logger');

class Dialogflow {
  constructor(config) {
    this._projectId = config.project_id;
    this._sessionsClient = new dialogflow.SessionsClient({
      credentials: {
        client_email: config.client_email,
        private_key: config.private_key,
      },
    });
  }

  async detectIntent(sessionId, input) {
    const log = logger.child({ module: MODULE, method: 'detectIntent' });
    log.trace('Detecting intent (input: %j)', input);

    const sessionPath = this._sessionsClient.sessionPath(this._projectId, sessionId);

    try {
      const payload = { languageCode: input.languageCode || 'zh-CN' };
      Object.assign(payload, {
        text: input.Content,
      });

      const request = {
        session: sessionPath,
        queryInput: {
          text: payload,
        },
      };

      log.trace('Sending DetectIntent request to Dialogflow (request: %j)', request);
      const [response] = await this._sessionsClient.detectIntent(request);
      log.trace('Received response from DetectIntent (response: %j)', response);

      const queryResult = response.queryResult.fulfillmentText;
      return queryResult;
    } catch (e) {
      log.warn(`Failed to detect intent: ${e.message}`);
      throw e;
    }
  }
}

module.exports = Dialogflow;
