const fs = require('fs');
let serverCode = fs.readFileSync('server.js', 'utf8');

if (!serverCode.includes('authController')) {
    const authRouteImport = `
const authController = require('./src/controllers/authController');
app.post('/api/auth/social-login', authController.socialLogin);
`;
    serverCode = serverCode.replace('app.listen', authRouteImport + '\napp.listen');
    fs.writeFileSync('server.js', serverCode);
    console.log('Server.js updated with Auth routes!');
}
