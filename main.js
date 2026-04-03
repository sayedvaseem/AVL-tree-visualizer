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

    let isAnimating = false;

    const setAnimating = (state) => {
        isAnimating = state;
        btnInsert.disabled = state;
        btnDelete.disabled = state;
        btnClear.disabled = state;
        valueInput.disabled = state;
    };

    const sleep = (ms) => new Promise(r => setTimeout(r, ms));

    tree.onAction = async () => {
        updateTree();
        await sleep(1200); // Wait for transition
    };

    const handleInsert = async () => {
        if (isAnimating) return;
        const val = parseInt(valueInput.value, 10);
        if (isNaN(val)) {
            showMessage('Please enter a valid number.', true);
            return;
        }
        
        setAnimating(true);
        valueInput.value = '';
        showMessage(`Inserting ${val}...`);
        
        await tree.insert(val);
        updateTree();
        
        showMessage(`Inserted ${val} into the tree.`);
        setAnimating(false);
        valueInput.focus();
    };

    const handleDelete = async () => {
        if (isAnimating) return;
        const val = parseInt(valueInput.value, 10);
        if (isNaN(val)) {
            showMessage('Please enter a valid number to delete.', true);
            return;
        }

        setAnimating(true);
        valueInput.value = '';
        showMessage(`Deleting ${val}...`);

        await tree.delete(val);
        updateTree();
        
        showMessage(`Deleted ${val} from the tree.`);
        setAnimating(false);
        valueInput.focus();
    };

    const handleClear = () => {
        if (isAnimating) return;
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
