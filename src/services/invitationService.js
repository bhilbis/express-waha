const sequelize = require('../config/database')

const addMessage = async ({ message, date_sent, date_read, date_receive, status, receiver_number, sender_number }) => {
  try {
    await sequelize.query(
      'INSERT INTO message (message, date_sent, date_read, date_receive, status, receiver_number, sender_number) VALUES (?, ?, ?, ?, ?, ?, ?)',
      {
        replacements: [message, date_sent, date_read, date_receive, status, receiver_number, sender_number],
      }
    );
    console.log('New invitation added:', newMessage);
  } catch (error) {
    console.error('Error adding invitation:', error);
  }
};

const updateMessageStatus = async (id_wedding, newStatus) => {
  try {
      await sequelize.query(
        'UPDATE message SET status = ? WHERE id = ?',
        {
          replacements: [newStatus, id],
        }
      )
      console.log(`Invitation status updated to ${newStatus}`);
  } catch (error) {
    console.error('Error updating invitation status:', error);
  }
};

const getMessage = async () => {
  try {
    const [results] = await sequelize.query('SELECT * FROM message', {
      type: sequelize.QueryTypes.SELECT,
    })
    console.log('All invitations:', results);
  } catch (error) {
    console.error('Error fetching invitations:', error);
  }
};


const deleteConfirmation = async (receiver_number) => {
  try {
    const query = `DELETE FROM message WHERE receiver_number = $6`
    const values = [receiver_number];
    await sequelize.query(query, values);
  } catch (error) {
    console.error('Error deleting confirmation from database:', error.message);
    throw error;
  };
}

module.exports = {
  addMessage,
  updateMessageStatus,
  getMessage,
  deleteConfirmation,
};
