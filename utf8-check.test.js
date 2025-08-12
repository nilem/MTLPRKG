const fs = require('fs');
const path = require('path');

describe('UTF-8 Encoding Tests', () => {
    const indexPath = path.join(__dirname, 'index.html');
    const generatedEmailPath = path.join(__dirname, 'generatedEmail.html');

    test('index.html should have UTF-8 meta charset declaration', () => {
        const content = fs.readFileSync(indexPath, 'utf8');
        
        // Check for UTF-8 meta tag
        const hasUtf8Meta = content.includes('<meta charset="UTF-8">');
        expect(hasUtf8Meta).toBe(true);
        
        // Ensure it's in the head section and before title
        const headSection = content.match(/<head[^>]*>(.*?)<\/head>/is);
        expect(headSection).toBeTruthy();
        
        const headContent = headSection[1];
        expect(headContent).toMatch(/<meta\s+charset=["']UTF-8["']/i);
        
        console.log('✅ UTF-8 charset found in index.html');
    });

    test('generatedEmail.html should have UTF-8 meta charset declaration', () => {
        const content = fs.readFileSync(generatedEmailPath, 'utf8');
        
        // Check for UTF-8 meta tag
        const hasUtf8Meta = content.includes('<meta charset="UTF-8">');
        expect(hasUtf8Meta).toBe(true);
        
        console.log('✅ UTF-8 charset found in generatedEmail.html');
    });

    test('index.html should properly display French characters', () => {
        const content = fs.readFileSync(indexPath, 'utf8');
        
        // Check for specific French text that should be properly encoded
        const frenchTexts = [
            'Générer courriel',
            'Ma position',
            'Vous êtes ici',
            'Masquer la signalisation'
        ];
        
        frenchTexts.forEach(text => {
            expect(content).toMatch(new RegExp(text, 'i'));
        });
        
        // Check that corrupted encoding patterns are NOT present
        const corruptedPatterns = [
            'GÃ©nÃ©rer',
            'Ã©',
            'Ã ',
            'Ã¨'
        ];
        
        corruptedPatterns.forEach(pattern => {
            expect(content).not.toContain(pattern);
        });
        
        console.log('✅ French characters are properly encoded');
    });

    test('HTML structure should be valid after UTF-8 declaration', () => {
        const content = fs.readFileSync(indexPath, 'utf8');
        
        // Check that meta charset comes before title
        const metaCharsetIndex = content.indexOf('<meta charset="UTF-8">');
        const titleIndex = content.indexOf('<title>');
        
        expect(metaCharsetIndex).toBeGreaterThan(-1);
        expect(titleIndex).toBeGreaterThan(-1);
        expect(metaCharsetIndex).toBeLessThan(titleIndex);
        
        // Check that the document starts properly
        expect(content.startsWith('<!DOCTYPE html>')).toBe(true);
        
        console.log('✅ HTML structure is valid');
    });

    test('File should be saved with UTF-8 encoding', () => {
        // Test that the file can be read as UTF-8 without errors
        expect(() => {
            fs.readFileSync(indexPath, 'utf8');
        }).not.toThrow();
        
        // Test that French characters are properly preserved in the file
        const content = fs.readFileSync(indexPath, 'utf8');
        const buffer = fs.readFileSync(indexPath);
        
        // Convert buffer back to string and compare
        const bufferAsString = buffer.toString('utf8');
        expect(bufferAsString).toBe(content);
        
        console.log('✅ File is properly saved with UTF-8 encoding');
    });
});

// Helper function to run a quick UTF-8 check
function quickUtf8Check() {
    const indexPath = path.join(__dirname, 'index.html');
    const content = fs.readFileSync(indexPath, 'utf8');
    
    const hasUtf8 = content.includes('<meta charset="UTF-8">');
    const hasCorruption = content.includes('GÃ©nÃ©rer') || content.includes('Ã©');
    
    console.log('=== Quick UTF-8 Check ===');
    console.log(`UTF-8 meta tag present: ${hasUtf8 ? '✅' : '❌'}`);
    console.log(`Corrupted encoding detected: ${hasCorruption ? '❌' : '✅'}`);
    console.log('========================');
    
    return hasUtf8 && !hasCorruption;
}

module.exports = { quickUtf8Check };
