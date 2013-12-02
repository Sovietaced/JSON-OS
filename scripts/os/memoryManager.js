/* ------------  
   memoryManager.js

   Requires global.js.
   
   ------------ */

function MemoryManager() {

    this.partitions = {};

    // Generate partitions
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
    this.allocate = function(program, pid){

      var partition = this.findFreePartition(pid); 

      if (partition){
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
      }
    };

  // Finds a free partition for a new process
  this.findFreePartition = function(pid){

    // Loop through the partitions and find one without a PID assigned
    for (i in this.partitions){
      if(this.partitions[i].pid === null){
        // Mark this partition as taken by the PID
        this.partitions[i].pid = pid;
        return this.partitions[i];
      }
    }

  };

  // Wrapper for creating files for PCBs
this.allocateVirtualMemory = function(program, pid){
  
  // Create the file
  var fileName = "pid" + pid;
  var result = krnCreateFile(fileName, program);

  // Get the TSB of the file and return it
  if (result){
      var tsb = findFile(fileName);
      return tsb;
  }
};

  // Wrapper for creating files for PCBs
this.readVirtualMemory = function(pid){
  
  // Create the file
  var fileName = "pid" + pid;

  return krnReadFile(fileName);
};

  // Self explanatory
  this.clearMemory = function(base, offset){

    for (var i = base; i < base + offset; i++){
      _RAM.writeMemory(i, "00");
    }

    this.updateDisplay();
  }

  // Self explanatory
  this.clearPartition = function(pid){
    console.log(this.partitions);
     // Loop through the partitions and find one with the PID assigned
    for (i in this.partitions){
      var partition = this.partitions[i];
      if(partition.pid === pid){
        this.clearMemory(partition.low, partition.high);
        this.partitions[i].pid = null;
      }
    }

    console.log(this.partitions);
  }

  // Nice help that does base conversions
  this.readValue = function(PC){

      PC = parseInt(PC, 16);
      PC = this.validate(PC + _CpuScheduler.getRunningProcess().getBase());

      if (PC !== false){
        return parseInt(_RAM.readMemory(PC), 16);
      }

  };

   // Reads direct value, mostly to read instructions
  this.readMemory = function(PC){

    PC = this.validate(PC);
 
    if (PC !== false){
      return _RAM.readMemory(PC);
    }
  };

  // Nice help that does base conversions
  this.writeValue = function(PC, value){

    PC = parseInt(PC, 16);
    PC = this.validate(PC + _CpuScheduler.getRunningProcess().getBase());

    if (PC !== false){
        // Hack fix to store single digits as 00
        if (value.toString().length){
          value = "0" + value.toString();
        }
      _RAM.writeMemory(PC, value.toString(16));
    }
  };
  
  // Validates memory requests for errors
  this.validate = function(PC){

    // Get PCB limits
    if(_CpuScheduler.getRunningProcess() != null){
      var low = _CpuScheduler.getRunningProcess().getBase();
      var high = low + _CpuScheduler.getRunningProcess().getOffset();

      // Validate relative bounds and return absolute location
      if(PC >= low && PC < high){
        return PC;
      }
      else {
         krnTrace("Memory out of bounds exception. Killing the process.");
        _KernelInterruptQueue.enqueue(new Interrupt(MEMORY_OUT_OF_BOUNDS_IRQ)); 
      }
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
