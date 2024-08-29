// Cache DOM elements
const fetchItemsBtn = document.getElementById('fetchItemsBtn');
const saveItemsBtn = document.getElementById('saveItemsBtn');
const searchBox = document.getElementById('searchBox');
const itemList = document.getElementById('itemList');
const fileUpload = document.getElementById('fileUpload');

// Initial state
let items = [];
let isItemsFetched = false;

// Function to fetch items
async function fetchItems() {
    if (isItemsFetched) {
        alert('Items have already been fetched.');
        return;
    }

    try {
        fetchItemsBtn.disabled = true;
        const response = await fetch('items.json');
        items = await response.json();
        displayItems(items);
        isItemsFetched = true;
        fetchItemsBtn.disabled = true; // Disable button after fetching
        fileUpload.disabled = false;  // Enable file upload after fetching
    } catch (error) {
        console.error('Error fetching items:', error);
        alert('Failed to fetch items.');
    } finally {
        fetchItemsBtn.disabled = false;
    }
}

// Function to display items
function displayItems(items) {
    itemList.innerHTML = '';
    items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'item';
        div.innerHTML = `
            <input type="checkbox" id="${item.id}" ${item.checked ? 'checked' : ''}>
            <label for="${item.id}">
                <img src="icons/${item.id}-icon.webp" alt="${item.name} Icon" class="item-icon">
                ${item.id} - ${item.name}
            </label>
        `;
        itemList.appendChild(div);
    });
}

// Function to save selected items
function saveItems() {
    const selectedItems = Array.from(document.querySelectorAll('#itemList input:checked'))
        .map(input => input.id)
        .map(id => items.find(item => item.id === id));

    if (selectedItems.length === 0) {
        alert('No items selected.');
        return;
    }

    const content = selectedItems.map(item => `${item.id} # ${item.name}`).join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'selected-items.ini';
    a.click();
    URL.revokeObjectURL(url);
}

// Function to handle file upload
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const content = e.target.result;
        const lines = content.split('\n').filter(line => line.trim() !== '');
        items.forEach(item => item.checked = false); // Reset all items to unchecked
        
        lines.forEach(line => {
            const [id] = line.split(' #');
            const item = items.find(item => item.id === id);
            if (item) {
                item.checked = true;
            }
        });
        
        displayItems(items);
    };
    reader.readAsText(file);
}

// Event listeners
fetchItemsBtn.addEventListener('click', fetchItems);
saveItemsBtn.addEventListener('click', saveItems);
fileUpload.addEventListener('change', handleFileUpload);

// Search functionality
searchBox.addEventListener('input', function () {
    const query = searchBox.value.toLowerCase();
    itemList.querySelectorAll('.item').forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(query) ? 'flex' : 'none';
    });
});
