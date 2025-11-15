const textInput = document.getElementById('textInput');
const charCount = document.getElementById('charCount');
const generateBtn = document.getElementById('generateBtn');
const qrPreview = document.getElementById('qrPreview');
const exportOptions = document.getElementById('exportOptions');
const fgColorInput = document.getElementById('fgColor');
const bgColorInput = document.getElementById('bgColor');

let currentQRCode = null;

// Update character count
textInput.addEventListener('input', () => {
    charCount.textContent = `${textInput.value.length}/300`;
});

// Generate QR code
generateBtn.addEventListener('click', async () => {
    const text = textInput.value.trim();
    
    if (!text) {
        alert('Please enter some text');
        return;
    }
    
    if (text.length > 300) {
        alert('Text exceeds 300 characters');
        return;
    }
    
    try {
        generateBtn.disabled = true;
        generateBtn.textContent = 'Generating...';
        
        const qrData = {
            text: text,
            fgColor: fgColorInput.value,
            bgColor: bgColorInput.value,
            logoUrl: document.getElementById('logoUrl').value
        };
        
        const response = await fetch('/api/generate-qr', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(qrData)
        });
        
        if (!response.ok) throw new Error('Failed to generate QR code');
        
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        
        qrPreview.innerHTML = `<img src="${url}" alt="Generated QR Code">`;
        exportOptions.style.display = 'grid';
        currentQRCode = url;
        
    } catch (error) {
        alert(`Error: ${error.message}`);
    } finally {
        generateBtn.disabled = false;
        generateBtn.textContent = 'Generate QR Code';
    }
});

// Export QR code
async function exportQR(format) {
    if (!currentQRCode) return;
    
    try {
        const response = await fetch('/api/export-qr', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text: textInput.value,
                format: format,
                fgColor: fgColorInput.value,
                bgColor: bgColorInput.value
            })
        });
        
        if (!response.ok) throw new Error('Export failed');
        
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `qrcode.${format}`;
        a.click();
        
    } catch (error) {
        alert(`Export error: ${error.message}`);
    }
}
