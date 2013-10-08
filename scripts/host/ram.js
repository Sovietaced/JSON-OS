/* ------------  
   ram.js

   Requires global.js.
   
   ------------ */

function Ram() {

    this.RAM_SIZE = 256;                     // 256 bytes
    this.memory = new Array(this.RAM_SIZE);      // memory array
    
    this.init = function() {
        
        // Write 0s to RAM
        this.clearMemory();
    };

    // wrtires 0s to all bytes
    this.clearMemory = function() {
       for (var i = 0; i < this.memory.length; i++){
          this.memory[i] = 0;
        }
    };

    this.writeMemory = function(PC,value) {
      // Check if memory already taken  
      if(this.memory[PC] === 0){
        this.memory[PC] = value;
        return true;
      }
      else{
        console.log("Memory space taken at PC " + PC);
        return false;
      }
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
