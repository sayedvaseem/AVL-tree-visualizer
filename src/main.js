document.addEventListener('DOMContentLoaded', () => {
    const tree = new AVLTree();
    
    // We pass the IDs of the elements containing our SVGs and node divs
    const containerEl = document.getElementById('tree-container');
    const SVGContainer = document.getElementById('tree-svg');
    const NodesContainer = document.getElementById('tree-nodes');
    
    // The Renderer will handle node placement and CSS animations
    const renderer = new TreeRenderer('tree-svg', 'tree-nodes');
    
    // Input elements
    const valueInput = document.getElementById('node-value');
    const btnInsert = document.getElementById('btn-insert');
    const btnDelete = document.getElementById('btn-delete');
    const btnClear = document.getElementById('btn-clear');
    const statusMsg = document.getElementById('status-message');

    // Make sure SVG viewBox matches the container dimensions exactly
    const resizeSVG = () => {
        const { width, height } = containerEl.getBoundingClientRect();
        SVGContainer.setAttribute('width', width);
        SVGContainer.setAttribute('height', height);
        updateTree();
    };

    window.addEventListener('resize', resizeSVG);
    
    const updateTree = () => {
        renderer.render(tree.root);
    };

    const showMessage = (msg, isError = false) => {
        statusMsg.textContent = msg;
        statusMsg.style.color = isError ? 'var(--accent-red)' : 'var(--accent-blue)';
        setTimeout(() => {
            statusMsg.style.color = 'var(--text-secondary)';
        }, 3000);
    };

    const handleInsert = () => {
        const val = parseInt(valueInput.value, 10);
        if (isNaN(val)) {
            showMessage('Please enter a valid number.', true);
            return;
        }
        
        // Prevent duplicate insertion logic just as safety net
        // (the core logic already ignores dupes, but good for UI text)
        tree.insert(val);
        updateTree();
        
        showMessage(`Inserted ${val} into the tree.`);
        valueInput.value = '';
        valueInput.focus();
    };

    const handleDelete = () => {
        const val = parseInt(valueInput.value, 10);
        if (isNaN(val)) {
            showMessage('Please enter a valid number to delete.', true);
            return;
        }

        tree.delete(val);
        updateTree();
        
        showMessage(`Deleted ${val} from the tree.`);
        valueInput.value = '';
        valueInput.focus();
    };

    const handleClear = () => {
        tree.root = null;
        updateTree();
        showMessage('Tree cleared.');
    };

    btnInsert.addEventListener('click', handleInsert);
    btnDelete.addEventListener('click', handleDelete);
    btnClear.addEventListener('click', handleClear);

    valueInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleInsert();
    });

    // Initial setup
    resizeSVG();
    showMessage('Ready.');
});
