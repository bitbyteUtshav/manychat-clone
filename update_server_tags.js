const fs = require('fs');
const path = require('./src/config/db'); // dummy check

let serverCode = fs.readFileSync('server.js', 'utf8');

if (!serverCode.includes('tagController')) {
    // Add tag routes import and usage before app.listen
    const tagRoutesImport = `
const tagController = require('./src/controllers/tagController');
app.post('/api/tags', tagController.createTag);
app.get('/api/tags/:channelId', tagController.getTags);
app.post('/api/subscribers/tag', tagController.assignTagToSubscriber);
`;
    serverCode = serverCode.replace('app.listen', tagRoutesImport + '\napp.listen');
    fs.writeFileSync('server.js', serverCode);
    console.log('Server.js updated with Tag routes successfully!');
} else {
    console.log('Tag routes already exist in server.js');
}
