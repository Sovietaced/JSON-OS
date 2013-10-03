/* ------------  
   ram.js

   Requires global.js.
   
   ------------ */

function Ram() {

    var RAM_SIZE = 256;                     // 256 bytes
    this.memory = new Array(RAM_SIZE);      // memory array
    
    this.init = function() {
        
        // Write 0s to RAM
        for (var i = 0; i < this.memory.length; i++){
          this.memory[i] = 0;
        }
    };

    this.clearMemory = function() {
      return [] ;
    };
}
