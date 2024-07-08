const model = require("../models/index");

const getHeaders = async (id) => {
  try {
    const aadeData = await model.aadeData.findAll({
      where: { userId: id },
    });

    if (!aadeData.length) {
      return "Aade headers not found!";
    }
    return aadeData[0].dataValues;
  } catch (error) {
    return error;
  }
};

module.exports = { getHeaders };
