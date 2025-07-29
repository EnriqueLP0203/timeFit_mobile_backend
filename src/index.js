import app from './app.js';

const port = process.env.PORT || 3000;

console.log('🚀 Iniciando servidor...');
console.log('📡 Puerto:', port);

app.listen(port, ()=> {
    console.log('✅ Server running on port:', port);
    console.log('🌐 URL: http://localhost:' + port);
    console.log('📱 API disponible en: http://192.168.137.1:' + port);
})