// Test script to verify socket.io-client import
const fs = require('fs');
const path = require('path');

console.log('🔍 Checking socket.io-client import syntax...');

// Read the client socketService file
const socketServicePath = path.join(__dirname, '../client/src/services/socketService.ts');
const content = fs.readFileSync(socketServicePath, 'utf8');

// Check if import is correct
if (content.includes('import io, { Socket } from \'socket.io-client\'')) {
  console.log('✅ Socket.io import syntax is correct!');
  console.log('📝 Import line: import io, { Socket } from \'socket.io-client\';');
} else if (content.includes('import { io, Socket } from \'socket.io-client\'')) {
  console.log('❌ Old import syntax found - needs fixing');
  console.log('📝 Found: import { io, Socket } from \'socket.io-client\';');
  console.log('🔧 Should be: import io, { Socket } from \'socket.io-client\';');
} else {
  console.log('⚠️  Could not determine import syntax');
}

// Check package.json for socket.io-client version
const packageJsonPath = path.join(__dirname, '../client/package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

console.log(`📦 socket.io-client version: ${packageJson.dependencies['socket.io-client']}`);

// Check if deprecated types package is still present
if (packageJson.devDependencies && packageJson.devDependencies['@types/socket.io-client']) {
  console.log('⚠️  Deprecated @types/socket.io-client found - should be removed');
} else {
  console.log('✅ No deprecated @types/socket.io-client package found');
}

console.log('\n🎯 Socket.io import check completed!'); 