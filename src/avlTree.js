class AVLNode {
    constructor(value) {
        this.value = value;
        this.left = null;
        this.right = null;
        this.height = 1;
        this.id = 'node-' + Math.random().toString(36).substr(2, 9); // For DOM tracking
    }
}

class AVLTree {
    constructor() {
        this.root = null;
        this.onAction = null; // Callback for animations
    }

    height(node) {
        return node ? node.height : 0;
    }

    getBalanceFactor(node) {
        return node ? this.height(node.left) - this.height(node.right) : 0;
    }

    updateHeight(node) {
        if (node) {
            node.height = Math.max(this.height(node.left), this.height(node.right)) + 1;
        }
    }

    rightRotate(y) {
        let x = y.left;
        let T2 = x.right;

        // Perform rotation
        x.right = y;
        y.left = T2;

        // Update heights
        this.updateHeight(y);
        this.updateHeight(x);

        return x; // New root
    }

    leftRotate(x) {
        let y = x.right;
        let T2 = y.left;

        // Perform rotation
        y.left = x;
        x.right = T2;

        // Update heights
        this.updateHeight(x);
        this.updateHeight(y);

        return y; // New root
    }

    insert(value) {
        this.root = this._insert(this.root, value);
    }

    _insert(node, value) {
        // Normal BST Insert
        if (!node) {
            return new AVLNode(value);
        }

        if (value < node.value) {
            node.left = this._insert(node.left, value);
        } else if (value > node.value) {
            node.right = this._insert(node.right, value);
        } else {
            return node; // Duplicate values not allowed in this simple version
        }

        return this._rebalance(node);
    }

    delete(value) {
        this.root = this._delete(this.root, value);
    }

    _delete(node, value) {
        if (!node) return node;

        if (value < node.value) {
            node.left = this._delete(node.left, value);
        } else if (value > node.value) {
            node.right = this._delete(node.right, value);
        } else {
            // Node to delete found

            // Node with only one child or no child
            if (!node.left || !node.right) {
                let temp = node.left ? node.left : node.right;

                if (!temp) {
                    // No child case
                    temp = node;
                    node = null;
                } else {
                    // One child case
                    node = temp;
                }
            } else {
                // Node with two children: Get the inorder successor (smallest in the right subtree)
                let temp = this._minValueNode(node.right);

                // Copy the inorder successor's data to this node
                node.value = temp.value;

                // Delete the inorder successor
                node.right = this._delete(node.right, temp.value);
            }
        }

        // If the tree had only one node then return
        if (!node) return node;

        return this._rebalance(node);
    }

    _minValueNode(node) {
        let current = node;
        while (current.left) {
            current = current.left;
        }
        return current;
    }

    _rebalance(node) {
        this.updateHeight(node);
        let balance = this.getBalanceFactor(node);

        // Left Left Case
        if (balance > 1 && this.getBalanceFactor(node.left) >= 0) {
            return this.rightRotate(node);
        }

        // Left Right Case
        if (balance > 1 && this.getBalanceFactor(node.left) < 0) {
            node.left = this.leftRotate(node.left);
            return this.rightRotate(node);
        }

        // Right Right Case
        if (balance < -1 && this.getBalanceFactor(node.right) <= 0) {
            return this.leftRotate(node);
        }

        // Right Left Case
        if (balance < -1 && this.getBalanceFactor(node.right) > 0) {
            node.right = this.rightRotate(node.right);
            return this.leftRotate(node);
        }

        return node;
    }
}
