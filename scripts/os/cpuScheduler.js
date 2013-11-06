/* ------------  
   cpuScheduler.js

   Requires global.js.
   
   ------------ */

function CpuScheduler() {

  this.quantum = 6;     // Quantum value in clock ticks
  this.clock = 0;
  this.readyQueue = new Queue();

    this.init = function(){
      this.quantum = 6;     // Quantum value in clock ticks
      this.clock = 0;
      this.readyQueue = new Queue();
    };

    this.schedule = function(pcb){
      this.readyQueue.enqueue(pcb);

      // If this is the first process set it up so it can begin executing
      if(this.readyQueue.getSize() === 1){
        this.loadPCB(pcb);
        _CPU.isExecuting = true;
        console.log("Turning the CPU on");
      }

      console.log("Process " + pcb.getPid() + " scheduled.");
    };

    this.run = function(){

      // Handle finished program
      if (!_CPU.isExecuting){
        console.log("we here now");
        this.readyQueue.dequeue();
      }
      
      if (this.readyQueue.getSize() > 0){

          // Make sure we're executing
          _CPU.isExecuting = true;

          // Switch processes if we've reached the quantum value, increment clock ticks counter
          if(++this.clock % this.quantum === 0 && this.readyQueue.getSize() > 1){
            this.rotate();
          }

          // Get the head
          var pcb = this.readyQueue.peek();
          // Let the kernel know what process we're currently running
          if(_runningProcess != pcb){
            _runningProcess = pcb;
            this.loadPCB(pcb);
          }
          // Process hasn't changed so carry on
          else{

          }
        }
        else{
         _runningProcess = null;
          console.log("WE STOPPING!");
        }


    };

    // Rotate the queue so that the head is moved to the back (Round Robin)
    this.rotate = function(){
      
      // Remove the head
      var pcb = this.readyQueue.dequeue();
      // Capture the CPU state
      pcb.captureState();
      // Add the head to the tail
      this.readyQueue.enqueue(pcb);

      console.log("Just switched processes");

    };

    this.loadPCB = function(pcb){
      // This loads PCB state into CPU
      pcb.loadState();
    };

    this.setQuantum = function(quantum){
      this.quantum = quantum;
    };

    this.updateDisplay = function(){

    };
}
