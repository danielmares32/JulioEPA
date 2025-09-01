#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🎓 Iniciando Aula Virtual 2.0 - Aplicación Demo');
console.log('===============================================\n');

console.log('📋 Funcionalidades demostradas:');
console.log('  ✅ 10 cursos realistas con datos de la UAA');
console.log('  ✅ Dashboard interactivo con estadísticas');
console.log('  ✅ Sistema de autenticación (cualquier email/contraseña)');
console.log('  ✅ Catálogo de cursos con filtros y búsqueda');
console.log('  ✅ Carrito de compras funcional (3 cursos pre-agregados)');
console.log('  ✅ Indicadores de progreso y cursos descargados');
console.log('  ✅ Actividades recientes y notificaciones');
console.log('  ✅ Modo offline completo');
console.log('  ✅ Interfaz nativa con controles de ventana');
console.log('\n🔑 Credenciales de demo:');
console.log('  Email: cualquier-email@edu.uaa.mx');
console.log('  Contraseña: cualquier-contraseña');
console.log('\n🚀 Iniciando aplicación...\n');

// Start the renderer dev server first
const viteProcess = spawn('npm', ['run', 'dev:renderer'], {
  cwd: __dirname,
  stdio: 'pipe'
});

viteProcess.stdout.on('data', (data) => {
  const output = data.toString();
  if (output.includes('ready in')) {
    console.log('✅ Servidor de desarrollo iniciado');
    
    // Start Electron after a short delay
    setTimeout(() => {
      console.log('🖥️  Abriendo aplicación Electron...\n');
      
      const electronProcess = spawn('npm', ['run', 'electron'], {
        cwd: __dirname,
        stdio: 'inherit',
        env: { ...process.env, NODE_ENV: 'development' }
      });
      
      electronProcess.on('close', (code) => {
        console.log('\n👋 Aplicación cerrada');
        viteProcess.kill();
        process.exit(code);
      });
      
    }, 2000);
  }
});

viteProcess.stderr.on('data', (data) => {
  console.error(`Error en servidor: ${data}`);
});

process.on('SIGINT', () => {
  console.log('\n🛑 Cerrando aplicación demo...');
  viteProcess.kill();
  process.exit();
});