// Cache DOM elements
const fileUpload = document.getElementById('fileUpload');
const saveColorsBtn = document.getElementById('saveColorsBtn');
const itemColors = document.getElementById('itemColors');

// Store items and their colors
let items = [];
let colors = {};

// Function to handle file upload
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const content = e.target.result;
        const lines = content.split('\n').filter(line => line.trim() !== '');
        items = []; // Clear items
        colors = {}; // Clear colors

        lines.forEach(line => {
            if (line.includes('=')) {
                // Format: id=color # name
                const [idColor, name] = line.split(' #');
                const [id, color] = idColor.split('=');
                items.push({ id, name });
                colors[id] = color; // Store color for each item
            } else {
                // Format: id # name
                const [id, name] = line.split(' #');
                items.push({ id, name });
                colors[id] = '255,255,255,1'; // Default color (white)
            }
        });

        displayItems();
    };
    reader.readAsText(file);
}

// Function to display items and their colors
function displayItems() {
    itemColors.innerHTML = '';
    items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'item-color';
        const color = colors[item.id] || '255,255,255,1'; // Default color (white)
        div.innerHTML = `
            <label for="${item.id}">
                <img src="icons/${item.id}-icon.webp" alt="${item.name} Icon" class="item-icon">
                ${item.id} - ${item.name}
                <input type="color" id="${item.id}" value="${rgbaToHex(color)}">
            </label>
        `;
        itemColors.appendChild(div);
        
        // Add event listener for color input change
        const colorInput = document.getElementById(item.id);
        colorInput.addEventListener('input', function() {
            colors[item.id] = hexToRgba(colorInput.value); // Update color in the colors object
        });
    });
}

// Convert RGBA to HEX color code
function rgbaToHex(rgba) {
    const [r, g, b, a] = rgba.split(',').map(Number);
    const alpha = Math.round(a * 255); // Convert alpha to 0-255 range
    return `#${((1 << 24) + (r << 16) + (g << 8) + b + (alpha << 24)).toString(16).slice(1)}`;
}

// Convert HEX to RGBA color code
function hexToRgba(hex) {
    let r = 0, g = 0, b = 0, a = 1;
    if (hex.length === 7) {
        r = parseInt(hex.slice(1, 3), 16);
        g = parseInt(hex.slice(3, 5), 16);
        b = parseInt(hex.slice(5, 7), 16);
    } else if (hex.length === 9) {
        r = parseInt(hex.slice(1, 3), 16);
        g = parseInt(hex.slice(3, 5), 16);
        b = parseInt(hex.slice(5, 7), 16);
        a = parseInt(hex.slice(7, 9), 16) / 255;
    }
    return `${r},${g},${b},${a}`;
}

// Save colors to a file
function saveColors() {
    const content = items.map(item => {
        const color = colors[item.id] || '255,255,255,1'; // Default color (white)
        return `${item.id}=${color} # ${item.name}`;
    }).join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lootcolors.ini';
    a.click();
    URL.revokeObjectURL(url);
}

// Event listeners
fileUpload.addEventListener('change', handleFileUpload);
saveColorsBtn.addEventListener('click', saveColors);
