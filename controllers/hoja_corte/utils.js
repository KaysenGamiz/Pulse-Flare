const path = require('path');
const fs = require('fs');
const { Corte } = require(path.join(__dirname, '..', 'schemas','corte_schema.js'));

async function getLatestRCC() {

      const result = await Corte.findOne({ RCC: { $exists: true } })
        .sort({ _id: -1 }) // Ordenar en orden descendente por el campo "_id" para obtener el último documento
        .limit(1) // Limitar el resultado a un solo documento
        .select('RCC');
  
      if (result) {
        return result.RCC;
      } else {
        console.log('No se encontró ningún RCC.');
        return null;
      }
}

async function getLatestPlusOneRCC() {

  const result = await Corte.findOne({ RCC: { $exists: true } })
    .sort({ _id: -1 }) // Ordenar en orden descendente por el campo "_id" para obtener el último documento
    .limit(1) // Limitar el resultado a un solo documento
    .select('RCC');

  let rccNums = parseInt(result.RCC.replace('RCC', ''));
  rccNums += 1;

  let newRcc = 'RCC' + rccNums;

  if (newRcc) {
    return newRcc;
  } else {
    console.log('No se encontró ningún RCC.');
    return null;
  }
}

async function checkRCCinDB(rcc) {

  const existingRCC = await Corte.findOne({ RCC: rcc });

  if (existingRCC) {
    console.log(`El RCC ${rcc} ya existe en la base de datos.`);
    return true;
  } else {
    console.log(`El RCC ${rcc} no existe en la base de datos.`);
    return false;
  }

}

function isEmpty(value){
    if(value === '' || value === null || value === undefined){
        return true
    } 
    else {
        return false
    }
}

async function deleteCorteByRCC(rcc) {
  try {
      const result = await Corte.deleteOne({ RCC: rcc });

      if (result.deletedCount === 0) {
          console.log(`No se encontró ningún corte con RCC: ${rcc}`);
          return false;
      } else {
          console.log(`Corte con RCC: ${rcc} eliminado exitosamente.`);
          return true;
      }
  } catch (error) {
      console.error(`Error al intentar eliminar el corte: ${error}`);
      return false;
  }
}

module.exports = {getLatestRCC, getLatestPlusOneRCC, checkRCCinDB, isEmpty, deleteCorteByRCC};