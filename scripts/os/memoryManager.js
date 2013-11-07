/* ------------  
   memoryManager.js

   Requires global.js.
   
   ------------ */

function MemoryManager() {

    this.partitions = {};

    this.init = function(){

      var partitionSize = RAM_SIZE/PARTITIONS;
      for(var i = 0; i < PARTITIONS; i++){
        // Create hashes for each partition that hold some basic info
        this.partitions[i] = {pid: null, 
                              low: partitionSize * i,
                              high: partitionSize * (i+1)};
      }
        
    };

    // Allocates instructions to bytes in memory
    this.allocate = function(program){

      var partition = this.findFreePartition(); // Used to return
      var memoryPosition = partition.low; // Used to iterate

    	for(var i = 0; i < program.length; i+=2){
    		// Try to write two hex values to each memory byte,
	    	if(!_RAM.writeMemory(memoryPosition, program[i] + program[i+1])){
          //TODO: Should probably throw an exception here
	    	
	    	}
	    	else{
          // Memory write successful, increment the memory position (PC)
          this.updateDisplay();
          memoryPosition++;
	    	}
		  }
      return partition;
    };

  // Finds a free partition for a new process
  this.findFreePartition = function(){

    // Loop through the partitions and find one without a PID assigned
    for (i in this.partitions){
      if(this.partitions[i].pid === null){
        return this.partitions[i];
      }
    }

  };

  // Self explanatory
  this.clearMemory = function(base, offset){

    for (var i = base; i < base + offset; i++){
      _RAM.writeMemory(i, "00");
    }

    this.updateDisplay();
  }

  // Nice help that does base conversions
  this.readValue = function(PC){

      PC = parseInt(PC, 16);
      PC = this.validate(PC + _CpuScheduler.getRunningProcess().getBase());

      if (PC !== false){
        console.log("PC " + PC);
        console.log("Instruction " + _RAM.readMemory(PC));
        return parseInt(_RAM.readMemory(PC), 16);
      }

  };

   // Reads direct value, mostly to read instructions
  this.readMemory = function(PC){

    PC = this.validate(PC);
 
    if (PC !== false){
      console.log("PC " + PC);
      console.log("Instruction " + _RAM.readMemory(PC));
      return _RAM.readMemory(PC);
    }
  };

  // Nice help that does base conversions
  this.writeValue = function(PC, value){
    console.log("writin");

    PC = parseInt(PC, 16);
    PC = this.validate(PC + _CpuScheduler.getRunningProcess().getBase());

    if (PC !== false){
        console.log("PC " + (PC));
        // Hack fix to store single digits as 00
        if (value.toString().length){
          value = "0" + value.toString();
          console.log("WRITE VALUEEEEEEEEEEEEEEEEEEE" + value.toString(16));
        }
      _RAM.writeMemory(PC, value.toString(16));
    }
  };


  
  // Validates memory requests for errors
  this.validate = function(PC){

    // Get PCB limits
    var low = _CpuScheduler.getRunningProcess().getBase();
    var high = low + _CpuScheduler.getRunningProcess().getOffset();

    // Validate relative bounds and return absolute location
    if(PC >= low && PC < high){
      return PC;
    }
    else {
    console.log("FAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIL");
    console.log("low " + low);
    console.log("high " + high);
    console.log("PC " + PC);
      krnTrapError("Memory Acces Out Of Bounds");
    }
  };

  // Updates external display
  this.updateDisplay = function(){

      // Get the memory state
      var memory = _RAM.memory;

      // Convert the memory array to a matrix, with memory address numbas
      var matrixMemory = listToMatrix(memory, 8);

      // Remove table body rows
      $("#memory").empty(); 

      // Render HTML and push it
      for (var row in matrixMemory) {
        var data = "";
         for (var value in matrixMemory[row]){
            data += "<td> " + matrixMemory[row][value] + "</td>";
         }
         $('#memory').append('<tr>' + data + '</tr>');
      }
  }; 
}
