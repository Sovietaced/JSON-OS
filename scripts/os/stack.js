/* ------------
   Stack.js
   
   A simple Stack
   
   ------------ */

function Node()
{
    var data;
    var next = null;
}
 
function Stack()
{
    this.top = null;
 
    this.push = function(data) {
        if (this.top == null) {
            this.top = new Node();
            this.top.data = data;
        } else {
            var temp = new Node();
            temp.data = data;
            temp.next = this.top;
            this.top = temp;
        }
    }
 
    this.pop = function() {
        var temp = this.top;
        var data = this.top.data;
        this.top = this.top.next;
        temp = null;
        return data;
    }
 
    this.print = function() {
        var node = this.top;
        while (node != null) {
            console.log(node.data);
            node = node.next;
        }
    }

    this.peek = function() {
        return this.top;
    }
}