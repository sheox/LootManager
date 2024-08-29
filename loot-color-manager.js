document.addEventListener('DOMContentLoaded', () => {
    const uploadForm = document.getElementById('uploadForm');
    const fileInput = document.getElementById('fileUpload');
    const itemColors = document.getElementById('itemColors');
    const saveButton = document.getElementById('saveButton');

    uploadForm.addEventListener('submit', (event) => {
        event.preventDefault();
        handleFileUpload(fileInput.files[0]);
    });

    saveButton.addEventListener('click', () => {
        saveColors();
    });

    function handleFileUpload(file) {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            const content = reader.result;
            displayItems(content);
            saveButton.style.display = 'inline'; // Show save button
        };
        reader.readAsText(file);
    }

    function displayItems(content) {
        itemColors.innerHTML = '';
        const lines = content.split('\n');
        lines.forEach(line => {
            if (line.trim()) {
                const [id, name] = line.split(' #');
                if (id && name) {
                    const div = document.createElement('div');
                    div.classList.add('item');
                    const rgba = 'rgba(255,255,255,1)'; // Default color

                    div.innerHTML = `
                        <div class="item-info">
                            <img src="icons/${id}-icon.webp" alt="${name} icon" class="item-icon" />
                            <span>${id} # ${name}</span>
                            <input type="color" data-id="${id}" value="${rgbaToHex(rgba)}" />
                            <input type="text" data-id="${id}" value="${rgbaToString(rgba)}" />
                        </div>
                    `;
                    itemColors.appendChild(div);
                }
            }
        });
        updateColorInputs();
    }

    function updateColorInputs() {
        const colorInputs = document.querySelectorAll('input[type="color"]');
        colorInputs.forEach(input => {
            input.addEventListener('input', (event) => {
                const color = event.target.value;
                const rgba = hexToRgba(color);
                const textInput = document.querySelector(`input[type="text"][data-id="${event.target.dataset.id}"]`);
                if (textInput) {
                    textInput.value = rgbaToString(rgba);
                }
            });
        });

        const textInputs = document.querySelectorAll('input[type="text"]');
        textInputs.forEach(input => {
            input.addEventListener('input', (event) => {
                const rgba = stringToRgba(event.target.value);
                const colorInput = document.querySelector(`input[type="color"][data-id="${event.target.dataset.id}"]`);
                if (colorInput) {
                    colorInput.value = rgbaToHex(rgba);
                }
            });
        });
    }

    function saveColors() {
        const items = Array.from(document.querySelectorAll('.item'));
        let result = '';
        items.forEach(item => {
            const id = item.querySelector('input[type="text"]').dataset.id;
            const rgba = item.querySelector('input[type="text"]').value;
            result += `${id}=${rgba} # ${item.querySelector('span').textContent.split(' #')[1]}\n`;
        });
        downloadFile('lootcolors.ini', result);
    }

    function downloadFile(filename, content) {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }

    function rgbaToHex(rgba) {
        const [r, g, b, a] = rgba.match(/\d+/g).map(Number);
        const hex = (a === 1 ? [r, g, b] : [r, g, b].map(c => Math.round(c * a))).map(c => c.toString(16).padStart(2, '0')).join('');
        return `#${hex}`;
    }

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
        return `rgba(${r},${g},${b},${a})`;
    }

    function rgbaToString(rgba) {
        const [r, g, b, a] = rgba.match(/\d+/g);
        return `${r},${g},${b},${a}`;
    }

    function stringToRgba(str) {
        const [r, g, b, a] = str.split(',').map(Number);
        return `rgba(${r},${g},${b},${a})`;
    }
});
