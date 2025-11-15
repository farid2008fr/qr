const express = require('express');
const QRCode = require('qrcode');
const sharp = require('sharp');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(__dirname));

const PORT = 3000;

// Generate QR code endpoint
app.post('/api/generate-qr', async (req, res) => {
    try {
        const { text, fgColor, bgColor, logoUrl } = req.body;
        
        if (!text || text.length > 300) {
            return res.status(400).json({ error: 'Invalid text' });
        }
        
        const qrOptions = {
            color: {
                dark: fgColor,
                light: bgColor
            },
            width: 300,
            margin: 2,
            errorCorrectionLevel: 'H'
        };
        
        const qrImage = await QRCode.toDataURL(text, qrOptions);
        const base64Data = qrImage.replace(/^data:image\/png;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        
        res.setHeader('Content-Type', 'image/png');
        res.send(buffer);
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Export QR code in different formats
app.post('/api/export-qr', async (req, res) => {
    try {
        const { text, format, fgColor, bgColor } = req.body;
        
        const qrOptions = {
            color: { dark: fgColor, light: bgColor },
            width: 500,
            margin: 2,
            errorCorrectionLevel: 'H'
        };
        
        let buffer = await QRCode.toBuffer(text, qrOptions);
        
        switch(format) {
            case 'jpg':
                buffer = await sharp(buffer).jpeg({ quality: 95 }).toBuffer();
                res.setHeader('Content-Type', 'image/jpeg');
                break;
            case 'png':
                res.setHeader('Content-Type', 'image/png');
                break;
            case 'svg':
                buffer = await QRCode.toString(text, { type: 'image/svg+xml', ...qrOptions });
                res.setHeader('Content-Type', 'image/svg+xml');
                break;
            case 'eps':
                return res.status(501).json({ error: 'EPS format not yet implemented' });
            default:
                return res.status(400).json({ error: 'Invalid format' });
        }
        
        res.send(buffer);
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`QR Code Generator running on http://localhost:${PORT}`);
});
