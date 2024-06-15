const CronJob = require("cron").CronJob;
const chatModal = require("../Models/Chat");
const archivedChatModal = require("../Models/ArcheivedChat");
const { Op } = require("sequelize");

exports.Cronjob = new CronJob("0 0 * * * ", async function () {
  //runs at midnight every day
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000); //1 day ago

  try {
    const chats = await chatModal.findAll({
      where: { createdAt: { [Op.lt]: yesterday } },
    });
    if (chats.length > 0) {
      await archivedChatModal.bulkCreate(chats);
      await chatModal.destroy({
        where: { createdAt: { [Op.lt]: yesterday } },
        
      });
    }
  } catch (error) {
    console.log("error during cron job task", error);
  }
});
