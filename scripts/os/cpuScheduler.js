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
        pcb.loadState();
        _CPU.isExecuting = true;
        console.log("Turning the CPU on");
      }

      console.log("Process " + pcb.getPid() + " scheduled.");
    };

    this.run = function(){

        if (this.readyQueue.getSize() > 0){

          if(_runningProcess == null){
            _KernelInterruptQueue.enqueue(new Interrupt(SCHEDULER_IRQ, new Array("switch"))); 
          }
          else{

            // Switch processes if we've reached the quantum value, increment clock ticks counter
            if(++this.clock % this.quantum === 0 && this.readyQueue.getSize() > 1){
              _KernelInterruptQueue.enqueue(new Interrupt(SCHEDULER_IRQ, new Array("switch"))); 
            }
          }
        }
        else{
          console.log("Stopping execution");
          // We have nothing left to process
         _CPU.isExecuting = false;
        }

    };

    // Load next in round robin 
    this.rotate = function(){
      
      // Handles normal  when we have a running process
      if (_runningProcess != null){
        // Remove the head
        var pcb = this.readyQueue.dequeue();
        // Capture the CPU state
        pcb.captureState();
        // Add the head to the tail
        this.readyQueue.enqueue(pcb);
      }

      // This will handle killed + normal switching switching
      var pcb = this.readyQueue.peek();

      pcb.loadState();

      console.log("Just switched processes");

    };

    this.kill = function() {
      
      var process = this.readyQueue.dequeue();
      krnTrace("Scheduler :: Killing process " + process.getPid());

    };

    this.setQuantum = function(quantum){
      this.quantum = quantum;
    };

    this.updateDisplay = function(){

    };
}
