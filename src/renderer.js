class TreeRenderer {
    constructor(svgContainerId, nodesContainerId) {
        this.svgContainer = document.getElementById(svgContainerId);
        this.nodesContainer = document.getElementById(nodesContainerId);
        
        // Configuration
        this.nodeRadius = 25;
        this.verticalSpacing = 80;
        this.horizontalSpacing = 40;
        
        // Track existing nodes to apply transitions smoothly
        this.existingDOMNodes = new Map();
        
        // Handle window resize dynamically later if needed
    }

    clear() {
        this.svgContainer.innerHTML = '';
        this.nodesContainer.innerHTML = '';
        this.existingDOMNodes.clear();
    }

    render(treeRoot) {
        if (!treeRoot) {
            this.clear();
            return;
        }

        const { width, height } = this.nodesContainer.getBoundingClientRect();
        
        // First, calculate properties for each node
        const nodePositions = new Map();
        
        // Recursively calculate X and Y coordinates
        // Using a modified algorithm to give nice spacing
        this._calculatePositions(treeRoot, width / 2, 50, width / 4, nodePositions);

        // Draw edges connecting parent to child
        this._drawEdges(treeRoot, nodePositions);

        // Draw or update nodes
        this._drawNodes(treeRoot, nodePositions);
        
        // Cleanup nodes that no longer exist in the tree
        this._cleanupObsoleteNodes(nodePositions);
    }

    _calculatePositions(node, x, y, dx, positions) {
        if (!node) return;
        
        positions.set(node.id, { x, y, value: node.value, height: node.height });
        
        if (node.left) {
            this._calculatePositions(node.left, x - dx, y + this.verticalSpacing, dx / 2, positions);
        }
        if (node.right) {
            this._calculatePositions(node.right, x + dx, y + this.verticalSpacing, dx / 2, positions);
        }
    }

    _drawEdges(root, positions) {
        // Clear SVG completely on each render for clean edge drawing
        this.svgContainer.innerHTML = '';
        
        const drawEdgeRecursive = (node) => {
            if (!node) return;
            
            const pos = positions.get(node.id);
            
            if (node.left) {
                const leftPos = positions.get(node.left.id);
                this._createLine(pos.x, pos.y, leftPos.x, leftPos.y);
                drawEdgeRecursive(node.left);
            }
            if (node.right) {
                const rightPos = positions.get(node.right.id);
                this._createLine(pos.x, pos.y, rightPos.x, rightPos.y);
                drawEdgeRecursive(node.right);
            }
        };
        
        drawEdgeRecursive(root);
    }

    _createLine(x1, y1, x2, y2) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        line.classList.add('tree-edge');
        this.svgContainer.appendChild(line);
    }

    _drawNodes(root, positions) {
        const processedIds = new Set();
        
        const drawNodeRecursive = (node) => {
            if (!node) return;
            
            const pos = positions.get(node.id);
            processedIds.add(node.id);
            
            let domNode = this.existingDOMNodes.get(node.id);
            
            if (!domNode) {
                // Create new node element
                domNode = document.createElement('div');
                domNode.classList.add('tree-node', 'new-node');
                domNode.id = node.id;
                domNode.innerText = node.value;
                domNode.title = `Value: ${node.value} | Height: ${node.height}`;
                
                // Initialize at default or 0,0 for animation effect
                domNode.style.left = `${pos.x}px`;
                domNode.style.top = `${pos.y - 30}px`; // animate drop down
                
                this.nodesContainer.appendChild(domNode);
                this.existingDOMNodes.set(node.id, domNode);
                
                // Force reflow for animation
                void domNode.offsetWidth;
            }
            
            // Move node to new designated position smoothly via CSS transitions
            domNode.style.left = `${pos.x}px`;
            domNode.style.top = `${pos.y}px`;
            domNode.innerText = node.value;
            domNode.title = `Value: ${node.value} | Height: ${node.height}`;
            
            // Remove 'new-node' class after animation
            setTimeout(() => domNode.classList.remove('new-node'), 500);
            
            drawNodeRecursive(node.left);
            drawNodeRecursive(node.right);
        };
        
        drawNodeRecursive(root);
    }

    _cleanupObsoleteNodes(currentPositions) {
        for (const [id, domNode] of this.existingDOMNodes.entries()) {
            if (!currentPositions.has(id)) {
                // Style for deletion
                domNode.style.transform = 'translate(-50%, -50%) scale(0)';
                domNode.style.opacity = '0';
                
                // Remove from DOM and Map after transition
                setTimeout(() => {
                    domNode.remove();
                    this.existingDOMNodes.delete(id);
                }, 500);
            }
        }
    }
}
