const WeddingInvitation = require("../models/weddingInvitation");

const addWeddingInvitation = async (invitationData) => {
    try {
        const newInvitation = await WeddingInvitation.create(invitationData);
        console.log("New wedding invitation added:", newInvitation);
    } catch (error) {
        console.error("Error adding wedding invitation:", error);
    }
};

const getWeddingInvitation = async (chatId) => {
    try {
        const invitation = await WeddingInvitation.findOne({ where: { chatId } });
        console.log("Wedding invitation:", invitation);
        return invitation;
    } catch (error) {
        console.error("Error fetching wedding invitation:", error);
    }
};

module.exports = {
    addWeddingInvitation,
    getWeddingInvitation,
};
