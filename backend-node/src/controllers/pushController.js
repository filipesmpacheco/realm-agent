const admin = require('../firebase');

/**
 * Envia uma notificação para um tópico FCM.
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
async function sendToTopic(req, res) {
  try {
    const { topic, notification, data } = req.body;

    // Validação básica
    if (!topic || !notification) {
      return res.status(400).json({
        error: 'Missing required fields: topic and notification are required'
      });
    }

    if (!notification.title || !notification.body) {
      return res.status(400).json({
        error: 'Notification must include title and body'
      });
    }

    // Construir mensagem FCM
    const message = {
      topic: topic,
      notification: {
        title: notification.title,
        body: notification.body
      },
      data: data || {},
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'realm_status'
        }
      }
    };

    // Enviar via FCM
    const response = await admin.messaging().send(message);

    console.log(`✅ Notificação enviada para tópico "${topic}":`, response);

    res.status(200).json({
      success: true,
      messageId: response,
      topic: topic
    });

  } catch (error) {
    console.error('❌ Erro ao enviar notificação:', error);

    res.status(500).json({
      error: 'Failed to send notification',
      details: error.message
    });
  }
}

module.exports = {
  sendToTopic
};
