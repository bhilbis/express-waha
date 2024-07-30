const Message = require('../models/Invitation');

const addMessage = async (messageData) => {
  try {
    const newMessage = await Message.create(messageData);
    console.log('New invitation added:', newMessage);
  } catch (error) {
    console.error('Error adding invitation:', error);
  }
};

const updateMessageStatus = async (id_wedding, newStatus) => {
  try {
    const invitationMessage = await Message.findByPk(id_wedding);
    if (invitationMessage) {
      invitationMessage.status = newStatus;
      await invitationMessage.save();
      console.log(`Invitation status updated to ${newStatus}`);
    } else {
      console.log('Invitation not found');
    }
  } catch (error) {
    console.error('Error updating invitation status:', error);
  }
};

const getMessage = async () => {
  try {
    const messages = await Message.findAll();
    console.log('All invitations:', messages);
  } catch (error) {
    console.error('Error fetching invitations:', error);
  }
};

module.exports = {
  addMessage,
  updateMessageStatus,
  getMessage,
};
