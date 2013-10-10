/* ------------  
   ram.js

   Requires global.js.
   
   ------------ */

function Ram() {
    this.memory = new Array(RAM_SIZE);      // memory array
    
    this.init = function() {
        
        // Write 0s to RAM
        this.clearMemory();
    };

    // wrtires 0s to all bytes
    this.clearMemory = function() {
       for (var i = 0; i < this.memory.length; i++){
          this.memory[i] = "00" ;
        }
    };

    this.writeMemory = function(PC,value) {
        this.memory[PC] = value;
        return true;
    };

    this.readMemory = function(PC) {
      return this.memory[PC];
    }

    //Debugging
    this.dumpMemory = function() {
      for (var i = 0; i < this.memory.length; i++){
          console.log(this.memory[i]);
        }
    }
}
