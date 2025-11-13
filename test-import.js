const fs = require('fs');
const FormData = require('form-data');
const { default: fetch } = require('node-fetch');

async function testImport() {
  try {
    console.log('🔍 Probando importación de CSV...');
    
    const form = new FormData();
    const fileStream = fs.createReadStream('./estudiantes_expandido.csv');
    form.append('archivo', fileStream);
    
    console.log('📤 Enviando archivo a https://registromicroservicio-production.up.railway.app/alumnos/cargar-csv...');
    
    const response = await fetch('https://registromicroservicio-production.up.railway.app/alumnos/cargar-csv', {
      method: 'POST',
      body: form
    });
    
    const result = await response.json();
    
    console.log('📊 Resultado de la importación:');
    console.log(JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error);
  }
}

testImport();
