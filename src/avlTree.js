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

    async rightRotate(y) {
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

    async leftRotate(x) {
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

    async insert(value) {
        if (!this.root) {
            this.root = new AVLNode(value);
            if (this.onAction) await this.onAction();
            return;
        }
        this.root = await this._insert(this.root, value);
        if (this.onAction) await this.onAction();
    }

    async _insert(node, value) {
        // Normal BST Insert
        if (!node) {
            return new AVLNode(value);
        }

        if (value < node.value) {
            node.left = await this._insert(node.left, value);
            if (this.onAction) await this.onAction();
        } else if (value > node.value) {
            node.right = await this._insert(node.right, value);
            if (this.onAction) await this.onAction();
        } else {
            return node; // Duplicate values not allowed in this simple version
        }

        return await this._rebalance(node);
    }

    async delete(value) {
        if (!this.root) return;
        this.root = await this._delete(this.root, value);
        if (this.onAction) await this.onAction();
    }

    async _delete(node, value) {
        if (!node) return node;

        if (value < node.value) {
            node.left = await this._delete(node.left, value);
            if (this.onAction) await this.onAction();
        } else if (value > node.value) {
            node.right = await this._delete(node.right, value);
            if (this.onAction) await this.onAction();
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
                if (this.onAction) await this.onAction();
            } else {
                // Node with two children: Get the inorder successor (smallest in the right subtree)
                let temp = this._minValueNode(node.right);

                // Copy the inorder successor's data to this node
                node.value = temp.value;
                if (this.onAction) await this.onAction();

                // Delete the inorder successor
                node.right = await this._delete(node.right, temp.value);
                if (this.onAction) await this.onAction();
            }
        }

        if (!node) return node;

        return await this._rebalance(node);
    }

    _minValueNode(node) {
        let current = node;
        while (current.left) {
            current = current.left;
        }
        return current;
    }

    async _rebalance(node) {
        this.updateHeight(node);
        let balance = this.getBalanceFactor(node);

        // Left Left Case
        if (balance > 1 && this.getBalanceFactor(node.left) >= 0) {
            return await this.rightRotate(node);
        }

        // Left Right Case
        if (balance > 1 && this.getBalanceFactor(node.left) < 0) {
            node.left = await this.leftRotate(node.left);
            if (this.onAction) await this.onAction();
            return await this.rightRotate(node);
        }

        // Right Right Case
        if (balance < -1 && this.getBalanceFactor(node.right) <= 0) {
            return await this.leftRotate(node);
        }

        // Right Left Case
        if (balance < -1 && this.getBalanceFactor(node.right) > 0) {
            node.right = await this.rightRotate(node.right);
            if (this.onAction) await this.onAction();
            return await this.leftRotate(node);
        }

        return node;
    }
}
