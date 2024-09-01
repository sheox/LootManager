// Cache DOM elements
const saveItemsBtn = document.getElementById('saveItemsBtn');
const fileUpload = document.getElementById('fileUpload');
const itemList = document.getElementById('itemList');
const searchBox = document.getElementById('searchBox');

// Initial state
let items = [];

// Function to display items in a table format
function displayItems(items) {
    itemList.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Select</th>
                    <th>Icon</th>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Color</th>
                    <th>Preview</th>
                </tr>
            </thead>
            <tbody>
                ${items.map(item => `
                    <tr>
                        <td><input type="checkbox" id="${item.id}" ${item.checked ? 'checked' : ''}></td>
                        <td><img src="icons/${item.id}-icon.webp" alt="${item.name}" class="item-icon"></td>
                        <td>${item.id}</td>
                        <td>${item.name}</td>
                        <td>
                            <input type="color" value="${item.color ? rgbToHex(item.color) : '#ffffff'}" data-id="${item.id}">
                        </td>
                        <td>
                            <div class="color-preview" style="background-color: ${item.color ? `rgba(${item.color})` : '#ffffff'};"></div>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    // Add event listeners to color pickers
    document.querySelectorAll('input[type="color"]').forEach(input => {
        input.addEventListener('input', function () {
            const id = this.dataset.id;
            const item = items.find(item => item.id === id);
            item.color = hexToRgba(this.value);
            this.parentElement.nextElementSibling.firstElementChild.style.backgroundColor = `rgba(${item.color})`;
        });
    });
}

// Function to save all items with colors
function saveItems() {
    const allItems = items.map(item => `${item.id}=${item.color.join(',')} # ${item.name}`).join('\n');
    const blob = new Blob([allItems], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lootcolors.ini';
    a.click();
    URL.revokeObjectURL(url);
}

// Function to handle file upload and parse its content
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const content = e.target.result;
        const lines = content.split('\n').filter(line => line.trim() !== '');
        items = []; // Clear current items

        lines.forEach(line => {
            let [idColor, name] = line.split(' # ');
            const [id, color] = idColor.includes('=') ? idColor.split('=') : [idColor, '255,255,255,1'];
            items.push({
                id: id,
                name: name || 'Unknown',
                color: color.split(',').map(Number),
                checked: true
            });
        });

        displayItems(items);
    };
    reader.readAsText(file);
}

// Function to convert hex color to rgba
function hexToRgba(hex) {
    let r = 0, g = 0, b = 0, a = 1;
    if (hex.length == 7) {
        r = parseInt(hex.slice(1, 3), 16);
        g = parseInt(hex.slice(3, 5), 16);
        b = parseInt(hex.slice(5, 7), 16);
    }
    return [r, g, b, a];
}

// Function to convert rgba to hex
function rgbToHex(rgba) {
    const [r, g, b] = rgba;
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
}

// Event listeners
saveItemsBtn.addEventListener('click', saveItems);
fileUpload.addEventListener('change', handleFileUpload);

// Search functionality
searchBox.addEventListener('input', function () {
    const query = searchBox.value.toLowerCase();
    itemList.querySelectorAll('tbody tr').forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(query) ? '' : 'none';
    });
});
