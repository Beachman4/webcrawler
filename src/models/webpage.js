'use strict';
module.exports = (sequelize, DataTypes) => {
  var Webpage = sequelize.define('Webpage', {
    url: DataTypes.STRING,
    body: DataTypes.TEXT
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return Webpage;
};