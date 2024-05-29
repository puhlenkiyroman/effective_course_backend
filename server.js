import path from 'path';
import express from 'express';
import webPush from 'web-push';

const app = express();
const PORT = 3000;

// Vapid keys
const publicKey = 'BJXtHJEgXMd9P2p-X-HxbF4t7-xJnqy6EuyXeM1YN39911MlqG_UMnHJYaI695VG0FarpabdAIocgHBw-m_OYWs';
const privateKey = '0h0uh89LT5hw-MqgpKQQ8fg4IfnzYEcCFOJwcNQSgQ8';

const subscriptions = [];

webPush.setVapidDetails(
    'mailto:romantolstyaklitvinenko@gmail.com',
    publicKey,
    privateKey
);

app.use(express.json());

app.use((req, res, next) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

app.use(express.static(path.join(process.cwd(), 'client')));

app.post('/subscribe', (req, res) => {
    const subscription = req.body;

    if (!subscriptions.some(s => s.endpoint === subscription.endpoint)) {
        console.log('Add subscription');
        subscriptions.push(subscription);
    }

    res.status(201).end();
});

app.post('/send-notification', async (req, res) => {
    const payload = JSON.stringify(req.body);

    subscriptions.forEach(async (subscription) => {
        try {
            await webPush.sendNotification(subscription, payload);
        } catch (error) {
            console.error('Error sending notification:', error);
        }
    });

    res.status(200).end();
});

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
